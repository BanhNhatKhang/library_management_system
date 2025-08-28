package com.example.webapp.services;

import com.example.webapp.models.*;
import com.example.webapp.dto.ThongBaoMuonSachDTO;
import com.example.webapp.repository.ThongBaoMuonSachRepository;
import com.example.webapp.repository.TheoDoiMuonSachRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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
        thongBaoMuonSach.setThoiGianGui(thongBaoMuonSachDTO.getThoiGianGui());
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
    

    @Scheduled(cron = "0 0 8,16 * * *")
    public void guiThongBaoTuDong() {
        List<TheoDoiMuonSach> muonSachList = theoDoiMuonSachRepository.findAll();
        LocalDate now = LocalDate.now();


        for (TheoDoiMuonSach muonSach : muonSachList) {
            String tenSach = muonSach.getSach() != null ? muonSach.getSach().getTenSach() : muonSach.getId().getMaSach();

            if (muonSach.getNgayTra() != null && ChronoUnit.DAYS.between(now, muonSach.getNgayTra()) == 2) {
                ThongBaoMuonSachDTO thongBao = taoThongBao(muonSach);
                thongBao.setNoiDung("Sách " + tenSach + " sẽ tới hạn trả sau 2 ngày: " + muonSach.getNgayTra() + ". Vui lòng trả trước hạn.");
                thongBao.setLoaiThongBao("SAPTOIHAN");
                tinNhanMau.convertAndSendToUser(muonSach.getId().getMaDocGia(), "queue/thongbao", thongBao.getNoiDung());
                this.save(thongBao);

            }
            if (muonSach.getNgayTra() != null && now.isAfter(muonSach.getNgayTra())) {
                ThongBaoMuonSachDTO thongBao = taoThongBao(muonSach);
                thongBao.setNoiDung("Sách " + tenSach + " đã quá hạn trả (hạn cuối: " + muonSach.getNgayTra() + "). Vui lòng nộp phạt.");
                thongBao.setLoaiThongBao("QUAHAN");
                tinNhanMau.convertAndSendToUser(muonSach.getId().getMaDocGia(), "queue/thongbao", thongBao.getNoiDung());
                this.save(thongBao);
            }

            if (muonSach.getTrangThaiMuon() == TheoDoiMuonSach.TrangThaiMuon.DADUYET) {
                ThongBaoMuonSachDTO thongBao = taoThongBao(muonSach);
                thongBao.setNoiDung("Yêu cầu mượn sách " + tenSach + " đã được duyệt. Vui lòng nhận sách tại thư viện.");
                thongBao.setLoaiThongBao("DADUYET");
                tinNhanMau.convertAndSendToUser(muonSach.getId().getMaDocGia(), "queue/thongbao", thongBao.getNoiDung());
                this.save(thongBao);
            }
        }
    }

    private ThongBaoMuonSachDTO taoThongBao(TheoDoiMuonSach muonSach) {
        ThongBaoMuonSachDTO thongBao = new ThongBaoMuonSachDTO();
        thongBao.setMaDocGia(muonSach.getId().getMaDocGia());
        thongBao.setMaSach(muonSach.getId().getMaSach());
        thongBao.setNgayMuon(muonSach.getId().getNgayMuon().toString());
        thongBao.setTrangThaiDaDoc(false);
        return thongBao;
    }

}