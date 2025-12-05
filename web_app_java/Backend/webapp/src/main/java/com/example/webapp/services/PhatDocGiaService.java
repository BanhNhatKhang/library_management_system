package com.example.webapp.services;

import com.example.webapp.dto.PhatDocGiaDTO;
import com.example.webapp.models.*;
import com.example.webapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
// import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PhatDocGiaService {

    @Autowired
    private PhatDocGiaRepository phatDocGiaRepository;
    
    @Autowired
    private TheoDoiMuonSachRepository theoDoiMuonSachRepository;
    
    @Autowired
    private DocGiaRepository docGiaRepository;
    
    @Autowired
    private ThongBaoMuonSachService thongBaoMuonSachService;

    public List<PhatDocGia> getAllFines() {
        return phatDocGiaRepository.findAll();
    }

    public List<PhatDocGia> getUnpaidFines() {
        return phatDocGiaRepository.findByTrangThaiPhat(PhatDocGia.TrangThaiPhat.CHUATHANHTOAN);
    }


    /**
     * Kiểm tra và tạo phạt cho các độc giả quá hạn trả sách
     */
    @Transactional
    public void checkAndCreateFinesForOverdueBooks() {
        LocalDate today = LocalDate.now();
        System.out.println("=== KIỂM TRA PHẠT NGÀY: " + today + " ===");
        
        // Lấy tất cả phiếu mượn đang trong trạng thái DANGMUON
        List<TheoDoiMuonSach> dangMuonRecords = theoDoiMuonSachRepository
            .findByTrangThaiMuon(TheoDoiMuonSach.TrangThaiMuon.DANGMUON);
        
        System.out.println("Tìm thấy " + dangMuonRecords.size() + " sách đang mượn");
        
        for (TheoDoiMuonSach record : dangMuonRecords) {
            LocalDate ngayTra = record.getNgayTra();
            LocalDate ngayMuon = record.getId().getNgayMuon();
            String maDocGia = record.getId().getMaDocGia();
            String maSach = record.getId().getMaSach();
            
            System.out.println("Kiểm tra: " + maDocGia + "/" + maSach + 
                             " - Ngày mượn: " + ngayMuon + 
                             " - Hạn trả: " + ngayTra);
            
            // Kiểm tra nếu đã quá hạn
            if (today.isAfter(ngayTra)) {
                int soNgayQuaHan = (int) ChronoUnit.DAYS.between(ngayTra, today);
                System.out.println("  --> QUÁ HẠN " + soNgayQuaHan + " ngày");
                
                // SỬA: Sử dụng method an toàn hơn
                boolean existsFine = checkIfFineExists(maDocGia, maSach, ngayMuon);
                System.out.println("  --> Đã có phạt: " + existsFine);
                
                if (!existsFine) {
                    try {
                        // Tính số tiền phạt
                        BigDecimal soTienPhat = calculateFine(
                            record.getSach().getDonGia(), 
                            ngayMuon, 
                            ngayTra, 
                            today
                        );
                        
                        System.out.println("  --> Tạo phạt: " + soTienPhat + " VND cho " + soNgayQuaHan + " ngày");
                        
                        // Tạo phạt mới
                        PhatDocGia phatDocGia = new PhatDocGia();
                        phatDocGia.setTheoDoiMuonSach(record);
                        phatDocGia.setSoTienPhat(soTienPhat);
                        phatDocGia.setSoNgayQuaHan(soNgayQuaHan);
                        phatDocGia.setNgayTaoPhat(LocalDateTime.now());
                        phatDocGia.setTrangThaiPhat(PhatDocGia.TrangThaiPhat.CHUATHANHTOAN);
                        phatDocGia.setGhiChu("Phạt quá hạn trả sách " + soNgayQuaHan + " ngày");
                        
                        PhatDocGia savedPhat = phatDocGiaRepository.save(phatDocGia);
                        System.out.println("  --> ĐÃ LƯU PHẠT THÀNH CÔNG: ID = " + savedPhat.getMaPhat());
                        
                        // Kiểm tra khóa tài khoản nếu quá hạn >= 7 ngày
                        if (soNgayQuaHan >= 7) {
                            lockDocGiaAccount(maDocGia, soNgayQuaHan);
                        }
                    } catch (Exception e) {
                        System.err.println("  --> LỖI KHI LƯU PHẠT: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
            } else {
                System.out.println("  --> CHƯA QUÁ HẠN");
            }
        }
        
        System.out.println("=== KẾT THÚC KIỂM TRA PHẠT ===");
    }

    // Thêm method helper để kiểm tra phạt có tồn tại không
    private boolean checkIfFineExists(String maDocGia, String maSach, LocalDate ngayMuon) {
        List<PhatDocGia> existingFines = phatDocGiaRepository
            .findByTheoDoiMuonSach_Id_MaDocGiaAndTheoDoiMuonSach_Id_MaSachAndTheoDoiMuonSach_Id_NgayMuon(
                maDocGia, maSach, ngayMuon);
        return !existingFines.isEmpty();
    }

    /**
     * Tính số tiền phạt dựa trên số ngày quá hạn
     */
    private BigDecimal calculateFine(BigDecimal donGiaSach, LocalDate ngayMuon, LocalDate ngayTra, LocalDate ngayHienTai) {
        int soNgayQuaHan = (int) ChronoUnit.DAYS.between(ngayTra, ngayHienTai);
        
        // Quy định phạt: 2000 VND/ngày cho sách thường, 5000 VND/ngày cho sách đắt tiền
        BigDecimal phatPerDay;
        if (donGiaSach.compareTo(new BigDecimal("500000")) > 0) {
            phatPerDay = new BigDecimal("5000"); // Sách đắt
        } else {
            phatPerDay = new BigDecimal("2000"); // Sách thường
        }
        
        BigDecimal totalFine = phatPerDay.multiply(new BigDecimal(soNgayQuaHan));
        
        System.out.println("Tính phạt: " + soNgayQuaHan + " ngày x " + phatPerDay + " = " + totalFine);
        
        return totalFine;
    }

    /**
     * Khóa tài khoản độc giả khi quá hạn >= 7 ngày
     */
    @Transactional
    private void lockDocGiaAccount(String maDocGia, int soNgayQuaHan) {
        DocGia docGia = docGiaRepository.findById(maDocGia).orElse(null);
        if (docGia != null && docGia.getTrangThai() == DocGia.TrangThaiDocGia.HOATDONG) {
            docGia.setTrangThai(DocGia.TrangThaiDocGia.TAMKHOA);
            docGiaRepository.save(docGia);
            
            // Tìm phiếu mượn để gửi thông báo khóa tài khoản
            List<TheoDoiMuonSach> records = theoDoiMuonSachRepository.findByDocGia_MaDocGia(maDocGia);
            if (!records.isEmpty()) {
                // Lấy phiếu mượn gần nhất
                TheoDoiMuonSach latestRecord = records.get(0);
                thongBaoMuonSachService.createAccountLockNotification(latestRecord, soNgayQuaHan);
            }
        }
    }

    /**
     * Thanh toán phạt
     */
    @Transactional
    public void payFine(Long maPhat) {
        PhatDocGia phatDocGia = phatDocGiaRepository.findById(maPhat)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin phạt"));
        
        if (phatDocGia.getTrangThaiPhat() == PhatDocGia.TrangThaiPhat.CHUATHANHTOAN) {
            phatDocGia.setTrangThaiPhat(PhatDocGia.TrangThaiPhat.DATHANHTOAN);
            phatDocGia.setNgayThanhToan(LocalDateTime.now());
            phatDocGiaRepository.save(phatDocGia);
            
            // Kiểm tra xem có thể mở khóa tài khoản không (nếu đã thanh toán hết phạt)
            checkAndUnlockAccount(phatDocGia.getTheoDoiMuonSach().getDocGia().getMaDocGia());
        }
    }

    /**
     * Kiểm tra và mở khóa tài khoản nếu đã thanh toán hết phạt
     */
    private void checkAndUnlockAccount(String maDocGia) {
        long unpaidFinesCount = phatDocGiaRepository.countUnpaidFinesByDocGia(maDocGia);
        
        if (unpaidFinesCount == 0) {
            DocGia docGia = docGiaRepository.findById(maDocGia).orElse(null);
            if (docGia != null && docGia.getTrangThai() == DocGia.TrangThaiDocGia.TAMKHOA) {
                docGia.setTrangThai(DocGia.TrangThaiDocGia.HOATDONG);
                docGiaRepository.save(docGia);
            }
        }
    }

    /**
     * Lấy danh sách phạt của độc giả
     */
    public List<PhatDocGia> getFinesByDocGia(String maDocGia) {
        return phatDocGiaRepository.findByTheoDoiMuonSach_DocGia_MaDocGia(maDocGia);
    }

    /**
     * Lấy danh sách phạt chưa thanh toán của độc giả cụ thể
     */
    public List<PhatDocGia> getUnpaidFinesByDocGia(String maDocGia) {
        return phatDocGiaRepository.findByTheoDoiMuonSach_DocGia_MaDocGia(maDocGia).stream()
            .filter(p -> p.getTrangThaiPhat() == PhatDocGia.TrangThaiPhat.CHUATHANHTOAN)
            .collect(Collectors.toList());
    }

    /**
     * Kiểm tra xem độc giả có phạt chưa thanh toán không
     */
    public boolean hasUnpaidFines(String maDocGia) {
        BigDecimal total = getTotalUnpaidFines(maDocGia);
        return total != null && total.compareTo(BigDecimal.ZERO) > 0;
    }

    /**
     * Lấy tổng tiền phạt chưa thanh toán của độc giả
     */
    public BigDecimal getTotalUnpaidFines(String maDocGia) {
        BigDecimal total = phatDocGiaRepository.getTotalUnpaidFinesByDocGia(maDocGia);
        return total != null ? total : BigDecimal.ZERO;
    }

    /**
     * Miễn giảm phạt (chỉ admin có thể thực hiện)
     */
    @Transactional
    public void exemptFine(Long maPhat, String reason) {
        PhatDocGia phatDocGia = phatDocGiaRepository.findById(maPhat)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin phạt"));
        
        phatDocGia.setTrangThaiPhat(PhatDocGia.TrangThaiPhat.MIENGIAM);
        phatDocGia.setNgayThanhToan(LocalDateTime.now());
        phatDocGia.setGhiChu(phatDocGia.getGhiChu() + ". Miễn giảm: " + reason);
        phatDocGiaRepository.save(phatDocGia);
        
        // Kiểm tra mở khóa tài khoản
        checkAndUnlockAccount(phatDocGia.getTheoDoiMuonSach().getDocGia().getMaDocGia());
    }

    public PhatDocGia save(PhatDocGia phatDocGia) {
        return phatDocGiaRepository.save(phatDocGia);
    }

    /**
     * Lấy danh sách phạt của độc giả dưới dạng DTO
     */
    public List<PhatDocGiaDTO> getFineDTOsByDocGia(String maDocGia) {
        List<PhatDocGia> fines = phatDocGiaRepository.findByTheoDoiMuonSach_DocGia_MaDocGia(maDocGia);
        return fines.stream().map(f -> {
            PhatDocGiaDTO dto = new PhatDocGiaDTO();
            dto.setMaPhat(f.getMaPhat());
            dto.setMaDocGia(f.getTheoDoiMuonSach().getDocGia().getMaDocGia());
            dto.setMaSach(f.getTheoDoiMuonSach().getSach().getMaSach());
            dto.setTenSach(f.getTheoDoiMuonSach().getSach().getTenSach());
            dto.setSoNgayQuaHan(f.getSoNgayQuaHan());
            dto.setSoTienPhat(f.getSoTienPhat());
            dto.setTrangThaiPhat(f.getTrangThaiPhat().name());
            dto.setNgayTaoPhat(f.getNgayTaoPhat());
            dto.setNgayThanhToan(f.getNgayThanhToan());
            dto.setGhiChu(f.getGhiChu());
            return dto;
        }).collect(Collectors.toList());
    }
}