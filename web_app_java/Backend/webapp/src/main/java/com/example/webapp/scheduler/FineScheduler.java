package com.example.webapp.scheduler;

import com.example.webapp.services.PhatDocGiaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class FineScheduler {

    @Autowired
    private PhatDocGiaService phatDocGiaService;

    /**
     * Chạy mỗi ngày lúc 1:00 AM để kiểm tra và tạo phạt cho sách quá hạn
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void checkOverdueBooksDaily() {
        try {
            phatDocGiaService.checkAndCreateFinesForOverdueBooks();
            System.out.println("Đã kiểm tra và tạo phạt cho sách quá hạn: " + java.time.LocalDateTime.now());
        } catch (Exception e) {
            System.err.println("Lỗi khi kiểm tra phạt quá hạn: " + e.getMessage());
            e.printStackTrace();
        }
    }
}