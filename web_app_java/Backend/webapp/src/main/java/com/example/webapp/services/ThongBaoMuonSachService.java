package com.example.webapp.services;

import com.example.webapp.models.*;
import com.example.webapp.dto.ThongBaoMuonSachDTO;
import com.example.webapp.repository.ThongBaoMuonSachRepository;
import com.example.webapp.repository.TheoDoiMuonSachRepository;
import com.example.webapp.repository.DocGiaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class ThongBaoMuonSachService {

    @Autowired
    private ThongBaoMuonSachRepository thongBaoMuonSachRepository;

    @Autowired
    private TheoDoiMuonSachRepository theoDoiMuonSachRepository;

    @Autowired
    private SimpMessagingTemplate tinNhanMau;

    @Autowired
    private DocGiaRepository docGiaRepository;

    public List<ThongBaoMuonSachDTO> getAll() {
        return thongBaoMuonSachRepository.findAll().stream().map(this::toDTO).toList();
    }

    public Optional<ThongBaoMuonSachDTO> getById(Long id) {
        return thongBaoMuonSachRepository.findById(id).map(this::toDTO);
    }

    public List<ThongBaoMuonSachDTO> getByMaDocGia(String maDocGia) {
        return thongBaoMuonSachRepository.findByTheoDoiMuonSach_Id_MaDocGia(maDocGia).stream().map(this::toDTO).toList();
    }

    public List<ThongBaoMuonSachDTO> getByTrangThaiDaDoc(Boolean trangThaiDaDoc) {
        return thongBaoMuonSachRepository.findByTrangThaiDaDoc(trangThaiDaDoc).stream().map(this::toDTO).toList();
    }

    public List<ThongBaoMuonSachDTO> getByLoaiThongBao(String loaiThongBao) {
        return thongBaoMuonSachRepository.findByLoaiThongBao(
            ThongBaoMuonSach.LoaiThongBao.valueOf(loaiThongBao)
        ).stream().map(this::toDTO).toList();
    }

    public void deleteById(Long id) {
        thongBaoMuonSachRepository.deleteById(id);
    }

    public ThongBaoMuonSachDTO toDTO(ThongBaoMuonSach thongBaoMuonSach) {
        ThongBaoMuonSachDTO thongBaoMuonSachDTO = new ThongBaoMuonSachDTO();
        thongBaoMuonSachDTO.setId(thongBaoMuonSach.getId());
        if (thongBaoMuonSach.getTheoDoiMuonSach() != null) {
            thongBaoMuonSachDTO.setMaDocGia(thongBaoMuonSach.getTheoDoiMuonSach().getId().getMaDocGia());
            thongBaoMuonSachDTO.setMaSach(thongBaoMuonSach.getTheoDoiMuonSach().getId().getMaSach());
            thongBaoMuonSachDTO.setNgayMuon(thongBaoMuonSach.getTheoDoiMuonSach().getId().getNgayMuon().toString());
        }
        thongBaoMuonSachDTO.setNoiDung(thongBaoMuonSach.getNoiDung());
        thongBaoMuonSachDTO.setThoiGianGui(thongBaoMuonSach.getThoiGianGui());
        thongBaoMuonSachDTO.setLoaiThongBao(thongBaoMuonSach.getLoaiThongBao().name());
        thongBaoMuonSachDTO.setTrangThaiDaDoc(thongBaoMuonSach.getTrangThaiDaDoc());
        return thongBaoMuonSachDTO;
    }

    public ThongBaoMuonSach toEntity(ThongBaoMuonSachDTO thongBaoMuonSachDTO) {
        ThongBaoMuonSach thongBaoMuonSach = new ThongBaoMuonSach();
        thongBaoMuonSach.setNoiDung(thongBaoMuonSachDTO.getNoiDung());
        
        // Đảm bảo thoiGianGui luôn có giá trị
        thongBaoMuonSach.setThoiGianGui(
            thongBaoMuonSachDTO.getThoiGianGui() != null 
                ? thongBaoMuonSachDTO.getThoiGianGui() 
                : LocalDateTime.now()
        );
        
        thongBaoMuonSach.setLoaiThongBao(ThongBaoMuonSach.LoaiThongBao.valueOf(thongBaoMuonSachDTO.getLoaiThongBao()));
        thongBaoMuonSach.setTrangThaiDaDoc(thongBaoMuonSachDTO.getTrangThaiDaDoc());

        if (thongBaoMuonSachDTO.getMaDocGia() != null && thongBaoMuonSachDTO.getMaSach() != null && thongBaoMuonSachDTO.getNgayMuon() != null) {
            TheoDoiMuonSach theoDoi = theoDoiMuonSachRepository.findById(
                new com.example.webapp.models.TheoDoiMuonSachId(
                    thongBaoMuonSachDTO.getMaDocGia(),
                    thongBaoMuonSachDTO.getMaSach(),
                    java.time.LocalDate.parse(thongBaoMuonSachDTO.getNgayMuon())
                )
            ).orElse(null);
            thongBaoMuonSach.setTheoDoiMuonSach(theoDoi);
        }
        return thongBaoMuonSach;
    }

    public ThongBaoMuonSachDTO save(ThongBaoMuonSachDTO thongBaoMuonSachDTO) {
        ThongBaoMuonSach thongBaoMuonSach = toEntity(thongBaoMuonSachDTO);
        ThongBaoMuonSach saved = thongBaoMuonSachRepository.save(thongBaoMuonSach);

        // Gửi realtime đến client
        tinNhanMau.convertAndSend(
            "/topic/thongbao",   // channel để client subscribe
            toDTO(saved)         // dữ liệu trả về
        );

        return toDTO(saved);
    }
    

    @Scheduled(cron = "0 0 8,16 * * *") // Chạy 2 lần/ngày lúc 8h và 16h
    public void guiThongBaoTuDong() {
        LocalDate now = LocalDate.now();
        
        // Lấy danh sách sách đang được mượn
        List<TheoDoiMuonSach> muonSachList = theoDoiMuonSachRepository.findByTrangThaiMuon(
            TheoDoiMuonSach.TrangThaiMuon.DANGMUON
        );

        for (TheoDoiMuonSach muonSach : muonSachList) {
            String tenSach = muonSach.getSach() != null ? muonSach.getSach().getTenSach() : muonSach.getId().getMaSach();
            
            // 1. Kiểm tra sắp tới hạn (2-3 ngày)
            if (muonSach.getNgayTra() != null) {
                long soNgayConLai = ChronoUnit.DAYS.between(now, muonSach.getNgayTra());
                
                if (soNgayConLai == 2 || soNgayConLai == 3) {
                    // Kiểm tra đã gửi thông báo SAPTOIHAN chưa
                    if (!daGuiThongBao(muonSach, ThongBaoMuonSach.LoaiThongBao.SAPTOIHAN)) {
                        ThongBaoMuonSachDTO thongBao = taoThongBao(muonSach);
                        thongBao.setNoiDung("Sách \"" + tenSach + "\" sẽ tới hạn trả vào ngày " + muonSach.getNgayTra() + ". Vui lòng chuẩn bị trả sách đúng hạn.");
                        thongBao.setLoaiThongBao("SAPTOIHAN");
                        
                        this.save(thongBao);
                        tinNhanMau.convertAndSendToUser(muonSach.getId().getMaDocGia(), "/queue/thongbao", thongBao);
                    }
                }
                
                // 2. Kiểm tra quá hạn
                if (now.isAfter(muonSach.getNgayTra())) {
                    // Kiểm tra đã gửi thông báo QUAHAN chưa (gửi 1 lần/tuần)
                    if (!daGuiThongBaoTrongTuan(muonSach, ThongBaoMuonSach.LoaiThongBao.QUAHAN)) {
                        long soNgayQuaHan = ChronoUnit.DAYS.between(muonSach.getNgayTra(), now);
                        ThongBaoMuonSachDTO thongBao = taoThongBao(muonSach);
                        thongBao.setNoiDung("Sách \"" + tenSach + "\" đã quá hạn trả " + soNgayQuaHan + " ngày (hạn cuối: " + muonSach.getNgayTra() + "). Vui lòng trả sách ngay và nộp phí phạt.");
                        thongBao.setLoaiThongBao("QUAHAN");
                        
                        this.save(thongBao);
                        tinNhanMau.convertAndSendToUser(muonSach.getId().getMaDocGia(), "/queue/thongbao", thongBao);
                    }
                }
            }
        }
        
        // 3. Kiểm tra sách vừa được duyệt
        List<TheoDoiMuonSach> sachDaDuyet = theoDoiMuonSachRepository.findByTrangThaiMuon(
            TheoDoiMuonSach.TrangThaiMuon.DADUYET
        );
        
        for (TheoDoiMuonSach muonSach : sachDaDuyet) {
            if (!daGuiThongBao(muonSach, ThongBaoMuonSach.LoaiThongBao.DADUYET)) {
                String tenSach = muonSach.getSach() != null ? muonSach.getSach().getTenSach() : muonSach.getId().getMaSach();
                ThongBaoMuonSachDTO thongBao = taoThongBao(muonSach);
                thongBao.setNoiDung("Yêu cầu mượn sách \"" + tenSach + "\" đã được phê duyệt. Vui lòng đến thư viện để nhận sách trong vòng 3 ngày làm việc.");
                thongBao.setLoaiThongBao("DADUYET");
                
                this.save(thongBao);
                tinNhanMau.convertAndSendToUser(muonSach.getId().getMaDocGia(), "/queue/thongbao", thongBao);
            }
        }
    }

    // Phương thức kiểm tra đã gửi thông báo chưa
    private boolean daGuiThongBao(TheoDoiMuonSach muonSach, ThongBaoMuonSach.LoaiThongBao loaiThongBao) {
        List<ThongBaoMuonSach> danhSach = thongBaoMuonSachRepository.findByTheoDoiMuonSach_Id_MaDocGiaAndTheoDoiMuonSach_Id_MaSachAndLoaiThongBao(
            muonSach.getId().getMaDocGia(),
            muonSach.getId().getMaSach(),
            loaiThongBao
        );
        return !danhSach.isEmpty();
    }

    // Kiểm tra đã gửi thông báo trong tuần (cho thông báo quá hạn)
    private boolean daGuiThongBaoTrongTuan(TheoDoiMuonSach muonSach, ThongBaoMuonSach.LoaiThongBao loaiThongBao) {
        LocalDate tuanTruoc = LocalDate.now().minusDays(7);
        List<ThongBaoMuonSach> danhSach = thongBaoMuonSachRepository.findByTheoDoiMuonSach_Id_MaDocGiaAndTheoDoiMuonSach_Id_MaSachAndLoaiThongBaoAndThoiGianGuiAfter(
            muonSach.getId().getMaDocGia(),
            muonSach.getId().getMaSach(),
            loaiThongBao,
            tuanTruoc.atStartOfDay()
        );
        return !danhSach.isEmpty();
    }

    // Phương thức tự động gửi thông báo khi trả sách (gọi từ service trả sách)
    public void guiThongBaoTraSach(TheoDoiMuonSach muonSach) {
        String tenSach = muonSach.getSach() != null ? muonSach.getSach().getTenSach() : muonSach.getId().getMaSach();
        ThongBaoMuonSachDTO thongBao = taoThongBao(muonSach);
        thongBao.setNoiDung("Bạn đã trả thành công sách \"" + tenSach + "\" vào ngày " + LocalDate.now() + ". Cảm ơn bạn đã sử dụng dịch vụ thư viện đúng quy định.");
        thongBao.setLoaiThongBao("DATRASACH");
        
        this.save(thongBao);
        tinNhanMau.convertAndSendToUser(muonSach.getId().getMaDocGia(), "/queue/thongbao", thongBao);
    }

    private ThongBaoMuonSachDTO taoThongBao(TheoDoiMuonSach muonSach) {
        ThongBaoMuonSachDTO thongBao = new ThongBaoMuonSachDTO();
        thongBao.setMaDocGia(muonSach.getId().getMaDocGia());
        thongBao.setMaSach(muonSach.getId().getMaSach());
        thongBao.setNgayMuon(muonSach.getId().getNgayMuon().toString());
        thongBao.setThoiGianGui(LocalDateTime.now()); // Thêm dòng này
        thongBao.setTrangThaiDaDoc(false);
        return thongBao;
    }

    public String taoThongBaoTuDong(String loaiThongBao, String noiDungMau) {
        ThongBaoMuonSach.LoaiThongBao loai = ThongBaoMuonSach.LoaiThongBao.valueOf(loaiThongBao);
        int soThongBaoTao = 0;
        
        switch (loai) {
            case DADUYET:
                soThongBaoTao = guiThongBaoChoPhieuDaDuyet(noiDungMau);
                break;
            case SAPTOIHAN:
                soThongBaoTao = guiThongBaoSapToiHan(noiDungMau);
                break;
            case QUAHAN:
                soThongBaoTao = guiThongBaoQuaHan(noiDungMau);
                break;
            case DATRASACH:
                soThongBaoTao = guiThongBaoPhieuDaTra(noiDungMau);
                break;
        }
        
        return "Đã tạo " + soThongBaoTao + " thông báo loại " + loaiThongBao;
    }

    private int guiThongBaoChoPhieuDaDuyet(String noiDungMau) {
        List<TheoDoiMuonSach> phieuDaDuyet = theoDoiMuonSachRepository.findByTrangThaiMuon(
            TheoDoiMuonSach.TrangThaiMuon.DADUYET
        );
        
        int count = 0;
        for (TheoDoiMuonSach phieu : phieuDaDuyet) {
            if (!daGuiThongBao(phieu, ThongBaoMuonSach.LoaiThongBao.DADUYET)) {
                String tenSach = phieu.getSach() != null ? phieu.getSach().getTenSach() : phieu.getId().getMaSach();
                ThongBaoMuonSachDTO thongBao = taoThongBao(phieu);
                thongBao.setNoiDung(noiDungMau.replace("{tenSach}", tenSach));
                thongBao.setLoaiThongBao("DADUYET");
                
                this.save(thongBao);
                count++;
            }
        }
        return count;
    }

    private int guiThongBaoSapToiHan(String noiDungMau) {
        LocalDate now = LocalDate.now();
        LocalDate ngayKiemTra1 = now.plusDays(2);
        LocalDate ngayKiemTra2 = now.plusDays(3);
        
        List<TheoDoiMuonSach> phieuSapToiHan = theoDoiMuonSachRepository.findByTrangThaiMuon(
            TheoDoiMuonSach.TrangThaiMuon.DANGMUON
        ).stream().filter(phieu -> 
            phieu.getNgayTra() != null && 
            (phieu.getNgayTra().equals(ngayKiemTra1) || phieu.getNgayTra().equals(ngayKiemTra2))
        ).toList();
        
        int count = 0;
        for (TheoDoiMuonSach phieu : phieuSapToiHan) {
            if (!daGuiThongBao(phieu, ThongBaoMuonSach.LoaiThongBao.SAPTOIHAN)) {
                String tenSach = phieu.getSach() != null ? phieu.getSach().getTenSach() : phieu.getId().getMaSach();
                ThongBaoMuonSachDTO thongBao = taoThongBao(phieu);
                thongBao.setNoiDung(noiDungMau.replace("{tenSach}", tenSach).replace("{ngayTra}", phieu.getNgayTra().toString()));
                thongBao.setLoaiThongBao("SAPTOIHAN");
                
                this.save(thongBao);
                count++;
            }
        }
        return count;
    }

    public void createSapToiHanNotification(TheoDoiMuonSach theoDoiMuonSach) {
        String noiDung = String.format(
            "Sách '%s' sẽ đến hạn trả vào ngày %s. Vui lòng chuẩn bị trả sách đúng hạn.",
            theoDoiMuonSach.getSach().getTenSach(),
            theoDoiMuonSach.getNgayTra().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
        );

        ThongBaoMuonSach thongBao = new ThongBaoMuonSach(
            theoDoiMuonSach,
            noiDung,
            LocalDateTime.now(),
            ThongBaoMuonSach.LoaiThongBao.SAPTOIHAN,
            false
        );

        thongBaoMuonSachRepository.save(thongBao);
    }

    public List<ThongBaoMuonSach> getThongBaoByDocGia(String maDocGia) {
        return thongBaoMuonSachRepository.findByTheoDoiMuonSach_DocGia_MaDocGiaOrderByThoiGianGuiDesc(maDocGia);
    }

    private int guiThongBaoQuaHan(String noiDungMau) {
        LocalDate now = LocalDate.now();
        
        List<TheoDoiMuonSach> phieuQuaHan = theoDoiMuonSachRepository.findByTrangThaiMuon(
            TheoDoiMuonSach.TrangThaiMuon.DANGMUON
        ).stream().filter(phieu -> 
            phieu.getNgayTra() != null && now.isAfter(phieu.getNgayTra())
        ).toList();
        
        int count = 0;
        for (TheoDoiMuonSach phieu : phieuQuaHan) {
            if (!daGuiThongBaoTrongTuan(phieu, ThongBaoMuonSach.LoaiThongBao.QUAHAN)) {
                String tenSach = phieu.getSach() != null ? phieu.getSach().getTenSach() : phieu.getId().getMaSach();
                long soNgayQuaHan = ChronoUnit.DAYS.between(phieu.getNgayTra(), now);
                
                ThongBaoMuonSachDTO thongBao = taoThongBao(phieu);
                thongBao.setNoiDung(noiDungMau
                    .replace("{tenSach}", tenSach)
                    .replace("{soNgayQuaHan}", String.valueOf(soNgayQuaHan))
                    .replace("{ngayTra}", phieu.getNgayTra().toString()));
                thongBao.setLoaiThongBao("QUAHAN");
                
                this.save(thongBao);
                count++;
            }
        }
        return count;
    }

    private int guiThongBaoPhieuDaTra(String noiDungMau) {
        LocalDate now = LocalDate.now();
        
        List<TheoDoiMuonSach> phieuDaTra = theoDoiMuonSachRepository.findByTrangThaiMuon(
            TheoDoiMuonSach.TrangThaiMuon.DATRA
        ).stream().filter(phieu -> 
            // Chỉ gửi cho phiếu trả trong ngày hôm nay
            phieu.getId().getNgayMuon().equals(now) || 
            (phieu.getNgayTra() != null && phieu.getNgayTra().equals(now))
        ).toList();
        
        int count = 0;
        for (TheoDoiMuonSach phieu : phieuDaTra) {
            if (!daGuiThongBao(phieu, ThongBaoMuonSach.LoaiThongBao.DATRASACH)) {
                String tenSach = phieu.getSach() != null ? phieu.getSach().getTenSach() : phieu.getId().getMaSach();
                
                ThongBaoMuonSachDTO thongBao = taoThongBao(phieu);
                thongBao.setNoiDung(noiDungMau
                    .replace("{tenSach}", tenSach)
                    .replace("{ngayTra}", now.toString()));
                thongBao.setLoaiThongBao("DATRASACH");
                
                this.save(thongBao);
                count++;
            }
        }
        return count;
    }

    public void createQuaHanNotification(TheoDoiMuonSach theoDoiMuonSach, int soNgayQuaHan, BigDecimal soTienPhat) {
        String noiDung = String.format(
            "Bạn đã quá hạn trả sách '%s' %d ngày. " +
            "Số tiền phạt: %,.0f VND. " +
            "Vui lòng trả sách và thanh toán phạt sớm nhất có thể.",
            theoDoiMuonSach.getSach().getTenSach(),
            soNgayQuaHan,
            soTienPhat.doubleValue()
        );

        ThongBaoMuonSach thongBao = new ThongBaoMuonSach(
            theoDoiMuonSach,
            noiDung,
            LocalDateTime.now(),
            ThongBaoMuonSach.LoaiThongBao.QUAHAN,
            false
        );

        thongBaoMuonSachRepository.save(thongBao);
    }

    public void createAccountLockNotification(TheoDoiMuonSach theoDoiMuonSach, int soNgayQuaHan) {
        String noiDung = String.format(
            "Tài khoản của bạn đã bị tạm khóa do quá hạn trả sách '%s' %d ngày. " +
            "Vui lòng liên hệ thư viện để trả sách và thanh toán phạt để mở khóa tài khoản.",
            theoDoiMuonSach.getSach().getTenSach(),
            soNgayQuaHan
        );

        ThongBaoMuonSach thongBao = new ThongBaoMuonSach(
            theoDoiMuonSach,
            noiDung,
            LocalDateTime.now(),
            ThongBaoMuonSach.LoaiThongBao.QUAHAN, // Có thể tạo enum mới KHOATAIKHOAN
            false
        );

        thongBaoMuonSachRepository.save(thongBao);
    }

    public void markAsRead(Long id) {
        ThongBaoMuonSach thongBao = thongBaoMuonSachRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo"));
        thongBao.setTrangThaiDaDoc(true);
        thongBaoMuonSachRepository.save(thongBao);
    }

    public ThongBaoMuonSachDTO updateThongBao(Long id, ThongBaoMuonSachDTO dto) {
        ThongBaoMuonSach existing = thongBaoMuonSachRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo"));
        
        existing.setNoiDung(dto.getNoiDung());
        existing.setLoaiThongBao(ThongBaoMuonSach.LoaiThongBao.valueOf(dto.getLoaiThongBao()));
        existing.setTrangThaiDaDoc(dto.getTrangThaiDaDoc());
        
        return toDTO(thongBaoMuonSachRepository.save(existing));
    }

    public List<ThongBaoMuonSachDTO> getByEmail(String email) {
        System.out.println("Looking for docgia with email: " + email);
        
        // Tìm DocGia bằng email
        DocGia docGia = docGiaRepository.findByEmail(email);
        if (docGia == null) {
            System.out.println("No docgia found with email: " + email);
            return List.of(); // Trả về danh sách rỗng
        }
        
        System.out.println("Found docgia: " + docGia.getMaDocGia());
        
        // Lấy thông báo bằng maDocGia
        return getByMaDocGia(docGia.getMaDocGia());
    }

}