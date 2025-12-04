package com.example.webapp.services;

import com.example.webapp.models.*;
import com.example.webapp.dto.DonHangDTO;
import com.example.webapp.dto.ThanhToanRequestDTO;
import com.example.webapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Set;
import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;
import java.util.stream.Collectors;

@Service
public class DonHangService {

    @Autowired
    private DonHangRepository donHangRepository;
    @Autowired
    private DocGiaRepository docGiaRepository;
    @Autowired
    private UuDaiRepository uuDaiRepository;
    @Autowired
    private ChiTietDonHangRepository chiTietDonHangRepository;
    @Autowired
    private GioHangRepository gioHangRepository;

    public List<DonHangDTO> getAllDonHang() {
        return donHangRepository.findAllActive() // Thay vì findAll()
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public Optional<DonHangDTO> getDonHangById(String maDonHang) {
        return donHangRepository.findById(maDonHang).map(this::toDTO);
    }

    public List<DonHangDTO> getDonHangByMaDocGia(String maDocGia) {
        return donHangRepository.findActiveByDocGia_MaDocGia(maDocGia) // Thay vì findByDocGia_MaDocGia
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public Page<DonHangDTO> getDonHangByMaDocGiaPaginated(String maDocGia, Pageable pageable) {
        Page<DonHang> donHangPage = donHangRepository.findActiveByDocGia_MaDocGia(maDocGia, pageable);
        return donHangPage.map(this::toDTO);
    }

    public List<DonHangDTO> getDonHangByTenDocGia(String hoLot, String ten) {
        return donHangRepository.findByDocGia_HoLotIgnoreCaseContainingAndDocGia_TenIgnoreCaseContaining(hoLot,ten).stream().map(this::toDTO).toList();
    }

     public List<DonHangDTO> getDonHangByDienThoai(String dienThoai) {
        return donHangRepository.findByDocGia_DienThoai(dienThoai).stream().map(this::toDTO).toList();
    }

    public DonHang saveDonHang(DonHang donHang, String maDocGia, List<String> maUuDaiList) {
        if (donHang.getMaDonHang() == null || donHang.getMaDonHang().isBlank()) {
            // Lấy ngày hiện tại định dạng yyyyMMdd
            java.time.LocalDate today = java.time.LocalDate.now();
            String datePart = today.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));

            // Đếm số đơn hàng đã tạo hôm nay (tùy theo DB, ở đây ta đếm tổng rồi +1)
            long count = donHangRepository.count() + 1;

            // Tạo mã dạng DH20251010-001
            String newId = String.format("DH%s-%03d", datePart, count);
            donHang.setMaDonHang(newId);
        }

        DocGia docGia = docGiaRepository.findById(maDocGia)
            .orElseThrow(() -> new RuntimeException("Độc giả không tồn tại"));
        donHang.setDocGia(docGia);

        Set<UuDai> uuDais = new HashSet<>();
        if (maUuDaiList != null && !maUuDaiList.isEmpty()) {
            for (String maUuDai : maUuDaiList) {
                UuDai uuDai = uuDaiRepository.findById(maUuDai)
                    .orElseThrow(() -> new RuntimeException("Ưu đãi không tồn tại: " + maUuDai));
                uuDais.add(uuDai);
            }
        }
        donHang.setUuDais(uuDais);

        return donHangRepository.save(donHang);
    }

    public DonHangDTO thanhToan(Principal principal, ThanhToanRequestDTO request) {
        try {
            // Giả lập delay xử lý thanh toán
            Thread.sleep(2000); // 2 giây
            
            String username = principal.getName();
            
            // Tìm độc giả
            DocGia docGia = docGiaRepository.findByEmail(username);
            if (docGia == null) {
                throw new RuntimeException("Không tìm thấy thông tin độc giả");
            }
            
            String maDocGiaThucTe = docGia.getMaDocGia();
            
            // Tạo đơn hàng mới
            DonHang donHang = new DonHang();
            
            // Tạo mã đơn hàng tự động
            LocalDate today = LocalDate.now();
            String datePart = today.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
            long count = donHangRepository.count() + 1;
            String newId = String.format("DH%s-%03d", datePart, count);
            
            donHang.setMaDonHang(newId);
            donHang.setNgayDat(today);
            donHang.setTongTien(request.getTongTien());
            donHang.setTrangThai(DonHang.TrangThaiDonHang.DANGXULY);
            donHang.setDocGia(docGia);
            
            // Lưu đơn hàng
            DonHang savedDonHang = donHangRepository.save(donHang);
            
            // Tạo chi tiết đơn hàng từ giỏ hàng
            for (String maSach : request.getMaSachList()) {
                // Lấy thông tin từ giỏ hàng
                GioHangId gioHangId = new GioHangId(maDocGiaThucTe, maSach);
                Optional<GioHang> gioHangOpt = gioHangRepository.findById(gioHangId);
                
                if (gioHangOpt.isPresent()) {
                    GioHang gioHang = gioHangOpt.get();
                    
                    // Tạo ID cho chi tiết đơn hàng
                    ChiTietDonHangId chiTietId = new ChiTietDonHangId(savedDonHang.getMaDonHang(), maSach);
                    
                    // Tạo chi tiết đơn hàng
                    ChiTietDonHang chiTiet = new ChiTietDonHang();
                    chiTiet.setId(chiTietId);
                    chiTiet.setDonHang(savedDonHang);
                    chiTiet.setSach(gioHang.getSach());
                    chiTiet.setSoLuong(gioHang.getSoLuong());
                    
                    // Tính giá (sửa lại để convert đúng kiểu)
                    BigDecimal giaGoc = gioHang.getSach().getDonGia(); // BigDecimal
                    Double giamGia = gioHang.getSach().getGiamGia(); // Integer
                    
                    // Convert và tính giá thực tế
                    double giaGocDouble = giaGoc.doubleValue();
                    double giamGiaPercent = giamGia != null ? giamGia.doubleValue() / 100.0 : 0.0;
                    double giaThucTe = giaGocDouble * (1.0 - giamGiaPercent);
                    
                    chiTiet.setDonGia(BigDecimal.valueOf(giaThucTe));
                    
                    // Sử dụng repository có sẵn
                    chiTietDonHangRepository.save(chiTiet);
                    
                    // Xóa khỏi giỏ hàng
                    gioHangRepository.deleteById(gioHangId);
                }
            }
            
            return toDTO(savedDonHang);
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Xử lý thanh toán bị gián đoạn");
        } catch (Exception e) {
            e.printStackTrace(); // Debug log
            throw new RuntimeException("Lỗi xử lý thanh toán: " + e.getMessage());
        }
    }

    public DonHang updateDonHang(String maDonHang, DonHang donHang) {
        DonHang existing = donHangRepository.findById(maDonHang)
            .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));

        
        existing.setNgayDat(donHang.getNgayDat());
        existing.setTongTien(donHang.getTongTien());
        existing.setTrangThai(donHang.getTrangThai());

        return donHangRepository.save(existing);     
    }

    @Transactional
    public void deleteDonHang(String maDonHang) {
        DonHang donHang = donHangRepository.findById(maDonHang)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + maDonHang));
        
        // Kiểm tra điều kiện có thể hủy không
        if (donHang.getTrangThai() == DonHang.TrangThaiDonHang.DAGIAO) {
            throw new RuntimeException("Không thể xóa đơn hàng đã giao thành công");
        }
        
        // Soft delete: chuyển sang trạng thái DAHUY
        donHang.setTrangThai(DonHang.TrangThaiDonHang.DAHUY);
        donHangRepository.save(donHang);
    }

    public DonHangDTO toDTO(DonHang donHang) {
        DonHangDTO dto = new DonHangDTO();
        dto.setMaDonHang(donHang.getMaDonHang());
        dto.setMaDocGia(donHang.getDocGia().getMaDocGia());
        dto.setNgayDat(donHang.getNgayDat());
        dto.setTongTien(donHang.getTongTien());
        
        // SỬA: Sử dụng method set enum
        dto.setTrangThaiEnum(donHang.getTrangThai());
        
        // Debug log
        System.out.println("Mapping DonHang " + donHang.getMaDonHang() + 
                          " with status enum: " + donHang.getTrangThai() + 
                          " -> string: " + dto.getTrangThai());
        
        return dto;
    }

    public DonHang toEntity(DonHangDTO donHangDTO) {
        DonHang donHang = new DonHang();
        donHang.setMaDonHang(donHangDTO.getMaDonHang());
        donHang.setNgayDat(donHangDTO.getNgayDat());
        donHang.setTongTien(donHangDTO.getTongTien());
        
        // SỬA: Convert string -> enum
        String trangThaiStr = donHangDTO.getTrangThaiDonHang();
        if (trangThaiStr != null && !trangThaiStr.isEmpty()) {
            try {
                DonHang.TrangThaiDonHang trangThaiEnum = DonHang.TrangThaiDonHang.valueOf(trangThaiStr);
                donHang.setTrangThai(trangThaiEnum);
            } catch (IllegalArgumentException e) {
                // Nếu string không hợp lệ, set default
                donHang.setTrangThai(DonHang.TrangThaiDonHang.DANGXULY);
                System.err.println("Invalid status: " + trangThaiStr + ", setting to DANGXULY");
            }
        } else {
            // Nếu null hoặc empty, set default
            donHang.setTrangThai(DonHang.TrangThaiDonHang.DANGXULY);
        }
        
        return donHang;
    }

}