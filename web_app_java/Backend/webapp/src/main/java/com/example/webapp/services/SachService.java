package com.example.webapp.services;

import com.example.webapp.models.*;
import com.example.webapp.models.TheoDoiMuonSach.TrangThaiMuon;
import com.example.webapp.dto.SachDTO;
import com.example.webapp.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.*;

import java.io.IOException;

import java.time.LocalDate;

import java.math.BigDecimal;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Optional;
import java.util.Objects;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;



@Service
public class SachService {

    @Autowired
    private SachRepository sachRepository;
    @Autowired
    private NhaXuatBanRepository nhaXuatBanRepository;
    @Autowired
    private TheLoaiRepository theLoaiRepository;
    @Autowired
    private TheoDoiMuonSachRepository theoDoiMuonSachRepository;
    @Autowired
    private ChiTietDonHangRepository chiTietDonHangRepository;

    private static final String UPLOAD_DIR = "uploads";

    public List<SachDTO> getAllSach() {
        return sachRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public Optional<SachDTO> getSachById(String maSach) {
        return sachRepository.findByMaSach(maSach).map(this::toDTO);
    }

    public List<SachDTO> getSachByTheLoai(String tenTheLoai) {
        return sachRepository.findAll().stream()
            .filter(sach -> sach.getTheLoais() != null &&
                            sach.getTheLoais().stream()
                                .anyMatch(tl -> tl.getTenTheLoai().equalsIgnoreCase(tenTheLoai)))
            .map(this::toDTO)
            .toList();
    }

    public List<SachDTO> searchSachByTen(String tenSach) {
        return sachRepository.findByTenSachContainingIgnoreCase(tenSach)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<SachDTO> searchSachByTheLoai(String theLoai) {
        return sachRepository.findSachByTheLoaiContaining(theLoai)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<SachDTO> searchSachGlobal(String query) {
        Set<SachDTO> resultSet = new HashSet<>();
        
        // Tìm theo tên sách
        resultSet.addAll(searchSachByTen(query));
        
        // Tìm theo tác giả
        resultSet.addAll(getSachByTacGia(query));
        
        // Tìm theo nhà xuất bản
        resultSet.addAll(getSachByNhaXuatBan(query));
        
        return new ArrayList<>(resultSet);
    }

    public List<String> getAuthorSuggestions(String query, int limit) {
        return sachRepository.findDistinctTacGiaContaining(query, PageRequest.of(0, limit));
    }

    public List<String> getPublisherSuggestions(String query, int limit) {
        return nhaXuatBanRepository.findTenNhaXuatBanContaining(query, PageRequest.of(0, limit));
    }

    public List<SachDTO> getSachByMaTheLoai(String maTheLoai) {
        return sachRepository.findByTheLoais_MaTheLoai(maTheLoai)
            .stream()
            .map(this::toDTO)
            .toList();
    }


    public Optional<SachDTO> getSachByTen(String tenSach) {
        return sachRepository.findByTenSach(tenSach).map(this::toDTO);
    }

    public List<SachDTO> getSachByTacGia(String tacGia) {
        return sachRepository.findByTacGia(tacGia).stream().map(this::toDTO).toList();
    }

    public List<SachDTO> getSachByNhaXuatBan(String maNhaXuatBan) {
        try {
            // Lấy tất cả sách theo nhà xuất bản
            return sachRepository.findByNhaXuatBan_MaNhaXuatBan(maNhaXuatBan)
                    .stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy sách theo nhà xuất bản: " + e.getMessage());
        }
    }

    public int getAvailableBooksCount(String maSach) {
        // 1. Lấy thông tin sách
        Optional<Sach> sachOpt = sachRepository.findById(maSach);
        if (sachOpt.isEmpty()) {
            throw new RuntimeException("Sách không tồn tại");
        }
        
        Sach sach = sachOpt.get();
        int soQuyenBan = sach.getSoLuong(); // Số quyển bán
        int tongSoQuyen = sach.getSoQuyen(); // Tổng số quyển
        
        // 2. Tính số sách có thể mượn = Tổng số quyển - Số quyển bán
        int soSachCoTheMuon = tongSoQuyen - soQuyenBan;
        
        // 3. Đếm số phiếu mượn đang hoạt động (CHODUYET, DADUYET, DANGMUON)
        List<TheoDoiMuonSach.TrangThaiMuon> activeStates = List.of(
            TheoDoiMuonSach.TrangThaiMuon.CHODUYET,
            TheoDoiMuonSach.TrangThaiMuon.DADUYET,
            TheoDoiMuonSach.TrangThaiMuon.DANGMUON
        );
        
        long soPhieuMuonDangHoatDong = theoDoiMuonSachRepository
            .countBySach_MaSachAndTrangThaiMuonIn(maSach, activeStates);
        
        // 4. Số sách mượn còn lại = Số sách có thể mượn - Số phiếu mượn đang hoạt động
        int soSachMuonConLai = soSachCoTheMuon - (int) soPhieuMuonDangHoatDong;
        
        return Math.max(0, soSachMuonConLai); // Đảm bảo không âm
    }

    public List<SachDTO> getSachGoiY(String maSach) {
        return getAllSach();
    }

    public List<SachDTO> getSachUuDai() {
        return sachRepository.findAll().stream()
            .filter(sach -> sach.getGiamGia() != null && sach.getGiamGia() > 0)
            .map(this::toDTO)
            .limit(7)
            .collect(Collectors.toList());
    }

    public String generateNextMaSach() {
        List<Sach> all = sachRepository.findAll();
        int maxNum = all.stream()
                .map(Sach::getMaSach)
                .filter(Objects::nonNull)
                .mapToInt(s -> {
                    String digits = s.replaceAll("[^0-9]", "");
                    return digits.isEmpty() ? 0 : Integer.parseInt(digits);
                })
                .max()
                .orElse(0);
        int next = maxNum + 1;
        return String.format("S%03d", next);
    }

    public boolean existsByTenSach(String tenSach) {
        if (tenSach == null || tenSach.trim().isEmpty()) return false;
        String normalized = tenSach.trim().toLowerCase();
        return sachRepository.findAll().stream()
                .anyMatch(s -> s.getTenSach() != null && s.getTenSach().trim().toLowerCase().equals(normalized));
    }

    public SachDTO createSach(String maSachIgnored, String tenSach, int soQuyen, String donGia,
                             int soLuong, String namXuatBan, String tacGia, String moTa,
                             String nhaXuatBan, String[] theLoaiIds, MultipartFile anhBia) {
        
        try {
            // Kiểm tra mã sách đã tồn tại
            if (sachRepository.existsByTenSach(tenSach)) {
                throw new RuntimeException("Mã sách đã tồn tại");
            }

            // Tạo đối tượng Sach
            Sach sach = new Sach();
            sach.setMaSach(generateNextMaSach());
            sach.setTenSach(tenSach);
            sach.setSoQuyen(soQuyen);
            sach.setDonGia(new BigDecimal(donGia));
            sach.setSoLuong(soLuong);
            sach.setNamXuatBan(LocalDate.parse(namXuatBan));
            sach.setTacGia(tacGia);
            sach.setMoTa(moTa);

            // Set nhà xuất bản
            NhaXuatBan nxb = nhaXuatBanRepository.findById(nhaXuatBan).orElse(null);
            sach.setNhaXuatBan(nxb);

            // Set thể loại
            Set<TheLoai> theLoais = new HashSet<>();
            for (String theLoaiId : theLoaiIds) {
                TheLoai theLoai = theLoaiRepository.findById(theLoaiId).orElse(null);
                if (theLoai != null) {
                    theLoais.add(theLoai);
                }
            }
            sach.setTheLoais(theLoais);

            // Xử lý upload ảnh
            String imagePath = saveImage(anhBia, theLoaiIds[0]);
            sach.setAnhBia(imagePath);

            // Lưu sách
            Sach savedSach = sachRepository.save(sach);
            return toDTO(savedSach);

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo sách: " + e.getMessage());
        }
    }

    public SachDTO updateSach(String maSach, String tenSach, int soQuyen, String donGia,
                             int soLuong, String namXuatBan, String tacGia, String moTa,
                             String nhaXuatBan, String[] theLoaiIds, MultipartFile anhBia) {
        
        try {
            Optional<Sach> optionalSach = sachRepository.findById(maSach);
            if (!optionalSach.isPresent()) {
                return null;
            }

            Sach sach = optionalSach.get();
            String oldImagePath = sach.getAnhBia();

            // Cập nhật thông tin
            sach.setTenSach(tenSach);
            sach.setSoQuyen(soQuyen);
            sach.setDonGia(new BigDecimal(donGia));
            sach.setSoLuong(soLuong);
            sach.setNamXuatBan(LocalDate.parse(namXuatBan));
            sach.setTacGia(tacGia);
            sach.setMoTa(moTa);

            // Update nhà xuất bản
            NhaXuatBan nxb = nhaXuatBanRepository.findById(nhaXuatBan).orElse(null);
            sach.setNhaXuatBan(nxb);

            // Update thể loại
            Set<TheLoai> theLoais = new HashSet<>();
            for (String theLoaiId : theLoaiIds) {
                TheLoai theLoai = theLoaiRepository.findById(theLoaiId).orElse(null);
                if (theLoai != null) {
                    theLoais.add(theLoai);
                }
            }
            sach.setTheLoais(theLoais);

            // Xử lý ảnh mới (nếu có)
            if (anhBia != null && !anhBia.isEmpty()) {
                System.out.println("Đang lưu ảnh mới cho sách: " + maSach); // Debug log
                
                // Xóa ảnh cũ nếu có
                if (oldImagePath != null && !oldImagePath.isEmpty()) {
                    deleteImage(oldImagePath);
                }
                
                // Lưu ảnh mới với theLoaiId đầu tiên
                String newImagePath = saveImage(anhBia, theLoaiIds.length > 0 ? theLoaiIds[0] : "general");
                sach.setAnhBia(newImagePath);
                
                System.out.println("Đường dẫn ảnh mới: " + newImagePath); // Debug log
            }

            Sach savedSach = sachRepository.save(sach);
            return toDTO(savedSach);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi cập nhật sách: " + e.getMessage());
        }
    }


    @Transactional 
    public boolean deleteSach(String maSach) {
        //  Tải Entity Sach
        Optional<Sach> sachOpt = sachRepository.findById(maSach);
        
        if (sachOpt.isEmpty()) {
            return false; 
        }

        boolean hasActiveLoan = theoDoiMuonSachRepository.existsBySach_MaSachAndTrangThaiMuonIn(
            maSach,
            List.of(TrangThaiMuon.DANGMUON, TrangThaiMuon.DADUYET, TrangThaiMuon.CHODUYET)
        );
        if (hasActiveLoan) {
            throw new IllegalStateException("Sách đang được mượn, Vui lòng thu hồi sách sau đó thực hiện thao tác xóa");
        }
        
        Sach sach = sachOpt.get();
        
        // 2. Loại bỏ tham chiếu hai chiều (Many-to-Many)
        for (TheLoai theLoai : sach.getTheLoais()) {
            theLoai.getSachs().remove(sach);
        }
        sach.getTheLoais().clear(); 

        // 3. Thực hiện xóa trong DB trước
        try {
            sachRepository.delete(sach); // nếu ném lỗi FK thì sẽ rơi vào catch, file chưa bị xóa
        } catch (DataIntegrityViolationException ex) {
            // Không xóa file — để controller trả lỗi rõ ràng
            throw ex;
        }

        // 4. Nếu tới đây thì DB đã xóa thành công -> xóa file ảnh
        try {
            deleteImage(sach.getAnhBia());
        } catch (Exception e) {
            // Ghi log nhưng không rollback DB vì DB đã xóa; nếu muốn cân nhắc rollback, cần xử lý khác
            e.printStackTrace();
        }
        
        return true;
    }

    private String saveImage(MultipartFile file, String theLoaiId) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("File ảnh trống");
        }

        // Lấy tên thể loại để tạo thư mục
        TheLoai theLoai = theLoaiRepository.findById(theLoaiId).orElse(null);
        String folderName = "general";
        
        if (theLoai != null) {
            // Chuyển tên thể loại thành tên thư mục (loại bỏ dấu, chuyển thành chữ thường)
            folderName = removeDiacritics(theLoai.getTenTheLoai())
                .toLowerCase()
                .replaceAll("\s+", "");
        }

        // Tạo thư mục nếu chưa tồn tại
        Path uploadPath = Paths.get(UPLOAD_DIR, folderName);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Tạo tên file unique với null safety
        String originalFilename = file.getOriginalFilename();
        String extension = ".jpg"; // Default extension
        
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        String filename = System.currentTimeMillis() + "_" + UUID.randomUUID().toString() + extension;

        // Lưu file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return folderName + "/" + filename;
    }

    private void deleteImage(String imagePath) {
        if (imagePath != null && !imagePath.isEmpty()) {
            try {
                Path path = Paths.get(UPLOAD_DIR, imagePath);
                Files.deleteIfExists(path);
            } catch (IOException e) {
                System.err.println("Không thể xóa file ảnh: " + imagePath);
            }
        }
    }

    private String removeDiacritics(String str) {
        return str.replaceAll("[áàãảạăắằẵẳặâấầẫẩậ]", "a")
                .replaceAll("[éèẽẻẹêếềễểệ]", "e")
                .replaceAll("[íìĩỉị]", "i")
                .replaceAll("[óòõỏọôốồỗổộơớờỡở]", "o")
                .replaceAll("[úùũủụưứừữửự]", "u")
                .replaceAll("[ýỳỹỷỵ]", "y")
                .replaceAll("[đ]", "d")
                .replaceAll("[ÁÀÃẢẠĂẮẰẴẲẶÂẤẦẪẨẬ]", "A")
                .replaceAll("[ÉÈẼẺẸÊẾỀỄỂỆ]", "E")
                .replaceAll("[ÍÌĨỈỊ]", "I")
                .replaceAll("[ÓÒÕỎỌÔỐỒỖỔỘƠỚỜỠỞỢ]", "O")
                .replaceAll("[ÚÙŨỦỤƯỨỪỮỬỰ]", "U")
                .replaceAll("[ÝỲỸỶỴ]", "Y")
                .replaceAll("[Đ]", "D");
    }

    public int getAvailableStockCount(String maSach) {
        // 1. Lấy thông tin sách
        Optional<Sach> sachOpt = sachRepository.findById(maSach);
        if (sachOpt.isEmpty()) {
            throw new RuntimeException("Sách không tồn tại");
        }
        
        Sach sach = sachOpt.get();
        int soLuongGoc = sach.getSoLuong(); // Số lượng gốc của sách
        
        // 2. Tính tổng số lượng sách đã bán (thuộc đơn hàng DAGIAO, DANGXULY)
        List<DonHang.TrangThaiDonHang> soldStates = List.of(
            DonHang.TrangThaiDonHang.DAGIAO,
            DonHang.TrangThaiDonHang.DANGXULY
        );
        
        int soLuongDaBan = chiTietDonHangRepository
            .sumSoLuongBySachAndDonHangTrangThaiIn(maSach, soldStates);
        
        // 3. Số lượng có thể mua = Số lượng gốc - Số lượng đã bán
        int soLuongCoTheMua = soLuongGoc - soLuongDaBan;
        
        return Math.max(0, soLuongCoTheMua); // Đảm bảo không âm
    }

    public SachDTO toDTO(Sach sach) {
        SachDTO dto = new SachDTO();
        dto.setMaSach(sach.getMaSach());
        dto.setTenSach(sach.getTenSach());
        dto.setSoQuyen(sach.getSoQuyen());
        dto.setDonGia(sach.getDonGia());
        dto.setSoLuong(sach.getSoLuong());
        dto.setNamXuatBan(sach.getNamXuatBan());
        dto.setTacGia(sach.getTacGia());
        dto.setMoTa(sach.getMoTa());
        dto.setAnhBia(sach.getAnhBia());
        dto.setDiemDanhGia(sach.getDiemDanhGia());
        dto.setGiamGia(sach.getGiamGia());

        dto.setSoSachMuonConLai(getAvailableBooksCount(sach.getMaSach()));
        dto.setSoLuongCoTheMua(getAvailableStockCount(sach.getMaSach()));
        
        if (sach.getNhaXuatBan() != null) {
            dto.setNhaXuatBan(sach.getNhaXuatBan().getTenNhaXuatBan());
        }
        
        if (sach.getTheLoais() != null) {
            List<String> theLoaiNames = sach.getTheLoais().stream()
                .map(TheLoai::getTenTheLoai)
                .collect(Collectors.toList());
            dto.setTheLoais(theLoaiNames);
        }
        
        return dto;
    }

    public Sach toEntity(SachDTO dto) {
        Sach sach = new Sach();
        sach.setMaSach(dto.getMaSach());
        sach.setTenSach(dto.getTenSach());
        sach.setSoQuyen(dto.getSoQuyen());
        sach.setDonGia(dto.getDonGia());
        sach.setSoLuong(dto.getSoLuong());
        sach.setNamXuatBan(dto.getNamXuatBan());
        sach.setTacGia(dto.getTacGia());
        sach.setMoTa(dto.getMoTa());
        sach.setAnhBia(dto.getAnhBia());
        sach.setDiemDanhGia(dto.getDiemDanhGia());
        sach.setGiamGia(dto.getGiamGia());
        return sach;
    }
}