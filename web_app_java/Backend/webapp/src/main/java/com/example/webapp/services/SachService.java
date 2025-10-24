package com.example.webapp.services;

import com.example.webapp.models.*;
import com.example.webapp.dto.SachDTO;
import com.example.webapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Optional;

@Service
public class SachService {

    @Autowired
    private SachRepository sachRepository;
    @Autowired
    private NhaXuatBanRepository nhaXuatBanRepository;
    @Autowired
    private TheLoaiRepository theLoaiRepository;

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

    public List<SachDTO> getSachByNhaXuatBan(String tenNhaXuatBan) {
        return sachRepository.findByNhaXuatBan_TenNhaXuatBan(tenNhaXuatBan).stream().map(this::toDTO).toList();
    }

    public List<SachDTO> getSachUuDai() {
        return sachRepository.findAll().stream()
            .filter(sach -> sach.getGiamGia() != null && sach.getGiamGia() > 0)
            .map(this::toDTO)
            .limit(7)
            .collect(Collectors.toList());
    }

    public SachDTO createSach(String maSach, String tenSach, int soQuyen, String donGia,
                             int soLuong, String namXuatBan, String tacGia, String moTa,
                             String nhaXuatBan, String[] theLoaiIds, MultipartFile anhBia) {
        
        try {
            // Kiểm tra mã sách đã tồn tại
            if (sachRepository.existsById(maSach)) {
                throw new RuntimeException("Mã sách đã tồn tại");
            }

            // Tạo đối tượng Sach
            Sach sach = new Sach();
            sach.setMaSach(maSach);
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

    public boolean deleteSach(String id) {
        try {
            Optional<Sach> optionalSach = sachRepository.findById(id);
            if (optionalSach.isPresent()) {
                Sach sach = optionalSach.get();
                
                // Xóa ảnh
                deleteImage(sach.getAnhBia());
                
                // Xóa sách
                sachRepository.deleteById(id);
                return true;
            }
            return false;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xóa sách: " + e.getMessage());
        }
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
                .replaceAll("\\s+", "");
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