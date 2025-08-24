package   com.example.webapp.controllers.khachhang.taikhoan;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.webapp.models.*;
import com.example.webapp.services.*;
import com.example.webapp.dto.*;

@RestController
@RequestMapping("/api/xacthuc")
public class XacThucController {

    @Autowired
    private DocGiaService docGiaService;

    @Autowired
    private NhanVienService nhanVienService;

    @PostMapping("/dangky")
    public DocGia registerDocGia(@RequestBody DocGiaDangKyDTO docGiaDangKyDTO) {
        return docGiaService.registerDocGia(docGiaDangKyDTO);
    }

    @PostMapping("/dangnhap")
    public Object login(@RequestBody DangNhapDTO dangNhapDTO) {
        try {
            return docGiaService.loginDocGia(dangNhapDTO.getEmailOrDienThoai(), dangNhapDTO.getMatKhau());
        } catch (RuntimeException e) {
            try {
                return nhanVienService.loginNhanVien(dangNhapDTO.getEmailOrDienThoai(), dangNhapDTO.getMatKhau());
            } catch (Exception ex) {
                throw new RuntimeException("Tài khoản hoặc mật khẩu không đúng");
            }
        }
    }
}
