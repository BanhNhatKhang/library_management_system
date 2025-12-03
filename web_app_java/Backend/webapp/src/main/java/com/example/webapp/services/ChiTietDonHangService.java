package com.example.webapp.services;

import com.example.webapp.models.ChiTietDonHang;
import com.example.webapp.models.ChiTietDonHangId;
import com.example.webapp.dto.ChiTietDonHangDTO;
import com.example.webapp.repository.ChiTietDonHangRepository;
// import com.example.webapp.repository.DonHangRepository;
// import com.example.webapp.repository.SachRepository;
// import com.example.webapp.models.DonHang;
// import com.example.webapp.models.Sach;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ChiTietDonHangService {

    @Autowired
    private ChiTietDonHangRepository chiTietDonHangRepository;

    // @Autowired
    // private DonHangRepository donHangRepository;

    // @Autowired
    // private SachRepository sachRepository;

    // Method để lấy chi tiết đơn hàng theo mã đơn hàng
    public List<ChiTietDonHangDTO> getChiTietByMaDonHang(String maDonHang) {
        List<ChiTietDonHang> chiTietList = chiTietDonHangRepository.findByDonHang_MaDonHang(maDonHang);
        
        return chiTietList.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Method chuyển đổi ChiTietDonHang entity sang DTO
    private ChiTietDonHangDTO convertToDTO(ChiTietDonHang chiTiet) {
        ChiTietDonHangDTO dto = new ChiTietDonHangDTO();
        
        dto.setMaDonHang(chiTiet.getDonHang().getMaDonHang());
        dto.setMaSach(chiTiet.getSach().getMaSach());
        dto.setTenSach(chiTiet.getSach().getTenSach());
        dto.setTacGia(chiTiet.getSach().getTacGia());
        dto.setAnhBia(chiTiet.getSach().getAnhBia());
        dto.setSoLuong(chiTiet.getSoLuong());
        dto.setDonGia(chiTiet.getDonGia());
        
        // thanhTien sẽ được tự động tính trong setter của DTO
        
        return dto;
    }

    // Method lấy tất cả chi tiết đơn hàng (nếu cần)
    public List<ChiTietDonHangDTO> getAllChiTietDonHang() {
        List<ChiTietDonHang> chiTietList = chiTietDonHangRepository.findAll();
        return chiTietList.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Method lấy chi tiết đơn hàng theo ID
    public ChiTietDonHangDTO getChiTietById(ChiTietDonHangId id) {
        Optional<ChiTietDonHang> chiTiet = chiTietDonHangRepository.findById(id);
        
        if (chiTiet.isPresent()) {
            return convertToDTO(chiTiet.get());
        } else {
            throw new RuntimeException("Không tìm thấy chi tiết đơn hàng với ID: " + id);
        }
    }

    // Method tính tổng tiền của đơn hàng
    public BigDecimal getTongTienByMaDonHang(String maDonHang) {
        List<ChiTietDonHang> chiTietList = chiTietDonHangRepository.findByDonHang_MaDonHang(maDonHang);
        
        return chiTietList.stream()
                .map(chiTiet -> chiTiet.getDonGia().multiply(BigDecimal.valueOf(chiTiet.getSoLuong())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Method đếm tổng số lượng sản phẩm trong đơn hàng
    public long getTongSoLuongByMaDonHang(String maDonHang) {
        List<ChiTietDonHang> chiTietList = chiTietDonHangRepository.findByDonHang_MaDonHang(maDonHang);
        
        return chiTietList.stream()
                .mapToLong(ChiTietDonHang::getSoLuong)
                .sum();
    }

    // Method thêm chi tiết đơn hàng
    public ChiTietDonHangDTO addChiTietDonHang(ChiTietDonHang chiTiet) {
        ChiTietDonHang saved = chiTietDonHangRepository.save(chiTiet);
        return convertToDTO(saved);
    }

    // Method cập nhật chi tiết đơn hàng
    public ChiTietDonHangDTO updateChiTietDonHang(ChiTietDonHang chiTiet) {
        ChiTietDonHang updated = chiTietDonHangRepository.save(chiTiet);
        return convertToDTO(updated);
    }

    // Method xóa chi tiết đơn hàng
    public void deleteChiTietDonHang(ChiTietDonHangId id) {
        chiTietDonHangRepository.deleteById(id);
    }
}
