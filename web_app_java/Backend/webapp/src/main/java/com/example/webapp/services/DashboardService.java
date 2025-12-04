package com.example.webapp.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.webapp.repository.*;
import com.example.webapp.models.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private SachRepository sachRepository;

    @Autowired
    private DocGiaRepository docGiaRepository;

    @Autowired
    private NhanVienRepository nhanVienRepository;

    @Autowired
    private NhaXuatBanRepository nhaXuatBanRepository;

    @Autowired
    private TheLoaiRepository theLoaiRepository;

    @Autowired
    private UuDaiRepository uuDaiRepository;

    @Autowired
    private DonHangRepository donHangRepository;

    @Autowired
    private ThongBaoMuonSachRepository thongBaoRepository;

    @Autowired
    private TheoDoiMuonSachRepository theoDoiMuonSachRepository;

    // Thống kê tổng quan
    public Map<String, Object> getOverviewStats() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("sach", sachRepository.count());
        stats.put("docgia", docGiaRepository.count());
        stats.put("nhanvien", nhanVienRepository.count());
        stats.put("nxb", nhaXuatBanRepository.count());
        stats.put("theloai", theLoaiRepository.count());
        stats.put("uudai", uuDaiRepository.count());
        stats.put("donhang", donHangRepository.count());
        stats.put("thongbao", thongBaoRepository.count());

        return stats;
    }

    // Phân bố sách theo thể loại
    public List<Map<String, Object>> getBooksByCategory() {
        List<Map<String, Object>> result = new ArrayList<>();
        
        List<TheLoai> theLoais = theLoaiRepository.findAll();
        
        for (TheLoai theLoai : theLoais) {
            Map<String, Object> item = new HashMap<>();
            item.put("name", theLoai.getTenTheLoai());
            item.put("value", theLoai.getSachs().size());
            result.add(item);
        }
        
        // Sắp xếp theo giá trị giảm dần
        result.sort((a, b) -> Integer.compare((Integer) b.get("value"), (Integer) a.get("value")));
        
        return result;
    }

    // Thống kê mượn sách theo tháng (6 tháng gần nhất)
    public List<Map<String, Object>> getBorrowByMonth() {
        List<Map<String, Object>> result = new ArrayList<>();
        
        LocalDate now = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy", Locale.ENGLISH);
        
        for (int i = 5; i >= 0; i--) {
            LocalDate date = now.minusMonths(i);
            LocalDate startOfMonth = date.withDayOfMonth(1);
            LocalDate endOfMonth = date.withDayOfMonth(date.lengthOfMonth());
            
            // Đếm số lượt mượn trong tháng
            List<TheoDoiMuonSach> borrowsInMonth = theoDoiMuonSachRepository
                .findByIdNgayMuonBetween(startOfMonth, endOfMonth);
            
            Map<String, Object> item = new HashMap<>();
            item.put("month", date.format(formatter));
            item.put("muon", borrowsInMonth.size());
            result.add(item);
        }
        
        return result;
    }

    // Hoạt động gần đây
    public List<Map<String, Object>> getRecentActivities() {
        List<Map<String, Object>> activities = new ArrayList<>();
        
        // Lấy 5 đơn hàng mới nhất
        List<DonHang> recentOrders = donHangRepository.findTop5ByOrderByNgayDatDesc();
        for (DonHang order : recentOrders) {
            Map<String, Object> activity = new HashMap<>();
            activity.put("type", "ORDER");
            activity.put("message", "Đơn hàng " + order.getMaDonHang() + " vừa được tạo bởi " + 
                                  order.getDocGia().getHoLot() + " " + order.getDocGia().getTen());
            activity.put("time", order.getNgayDat());
            activities.add(activity);
        }
        
        // Lấy 5 độc giả đăng ký mới nhất
        List<DocGia> recentReaders = docGiaRepository.findTop5ByOrderByMaDocGiaDesc();
        for (DocGia reader : recentReaders) {
            Map<String, Object> activity = new HashMap<>();
            activity.put("type", "REGISTER");
            activity.put("message", "Độc giả " + reader.getHoLot() + " " + reader.getTen() + " vừa đăng ký tài khoản");
            activity.put("time", LocalDate.now()); // Có thể thêm trường ngayDangKy vào DocGia
            activities.add(activity);
        }
        
        // Sắp xếp theo thời gian và lấy 10 hoạt động mới nhất
        activities.sort((a, b) -> {
            LocalDate timeA = (LocalDate) a.get("time");
            LocalDate timeB = (LocalDate) b.get("time");
            return timeB.compareTo(timeA);
        });
        
        return activities.stream().limit(10).collect(Collectors.toList());
    }

    // Thống kê đơn hàng theo trạng thái
    public List<Map<String, Object>> getOrdersByStatus() {
        List<Map<String, Object>> result = new ArrayList<>();
        
        Map<DonHang.TrangThaiDonHang, Long> statusCounts = donHangRepository.findAll()
            .stream()
            .collect(Collectors.groupingBy(
                DonHang::getTrangThai, 
                Collectors.counting()
            ));
        
        for (Map.Entry<DonHang.TrangThaiDonHang, Long> entry : statusCounts.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            
            String statusName = switch (entry.getKey()) {
                case DANGXULY -> "Đang xử lý";
                case DAGIAO -> "Đã giao";
                case DAHUY -> "Đã hủy";
                case GIAOTHATBAI -> "Giao thất bại";
            };
            
            item.put("name", statusName);
            item.put("value", entry.getValue().intValue());
            result.add(item);
        }
        
        return result;
    }
}