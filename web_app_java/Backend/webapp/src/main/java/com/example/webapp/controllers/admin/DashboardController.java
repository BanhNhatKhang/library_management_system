package com.example.webapp.controllers.admin;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;

import com.example.webapp.services.DashboardService;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
@PreAuthorize("hasAnyAuthority('ADMIN', 'NHANVIEN', 'THUTHU', 'QUANLY')")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    // Lấy thống kê tổng quan
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = dashboardService.getOverviewStats();
        return ResponseEntity.ok(stats);
    }

    // Lấy phân bố sách theo thể loại
    @GetMapping("/books-by-category")
    public ResponseEntity<List<Map<String, Object>>> getBooksByCategory() {
        List<Map<String, Object>> data = dashboardService.getBooksByCategory();
        return ResponseEntity.ok(data);
    }

    // Lấy thống kê mượn sách theo tháng
    @GetMapping("/borrow-by-month")
    public ResponseEntity<List<Map<String, Object>>> getBorrowByMonth() {
        List<Map<String, Object>> data = dashboardService.getBorrowByMonth();
        return ResponseEntity.ok(data);
    }

    // Lấy hoạt động gần đây
    @GetMapping("/recent-activities")
    public ResponseEntity<List<Map<String, Object>>> getRecentActivities() {
        List<Map<String, Object>> activities = dashboardService.getRecentActivities();
        return ResponseEntity.ok(activities);
    }

    // Lấy thống kê đơn hàng theo trạng thái
    @GetMapping("/orders-by-status")
    public ResponseEntity<List<Map<String, Object>>> getOrdersByStatus() {
        List<Map<String, Object>> data = dashboardService.getOrdersByStatus();
        return ResponseEntity.ok(data);
    }
}