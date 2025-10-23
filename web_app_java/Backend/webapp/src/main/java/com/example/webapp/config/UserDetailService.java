package com.example.webapp.config;

import com.example.webapp.models.DocGia;
import com.example.webapp.models.NhanVien;
import com.example.webapp.repository.NhanVienRepository;
import com.example.webapp.repository.DocGiaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailService implements UserDetailsService {

    @Autowired
    private DocGiaRepository docGiaRepository;

    @Autowired
    private NhanVienRepository nhanVienRepository;

    @Override
    public UserDetails loadUserByUsername(String emailOrPhone) throws UsernameNotFoundException {
        DocGia docGia = docGiaRepository.findByEmail(emailOrPhone);
        if (docGia == null) {
            docGia = docGiaRepository.findByDienThoai(emailOrPhone);
        }
        if (docGia != null) {
            return User.withUsername(docGia.getEmail())
                    .password(docGia.getMatKhau())
                    .roles("DOCGIA")
                    .build();
        }

        NhanVien nv = nhanVienRepository.findByEmail(emailOrPhone);
        if (nv == null) {
            nv = nhanVienRepository.findByDienThoai(emailOrPhone);
        }
        if (nv != null) {
            return User.withUsername(nv.getEmail())
                    .password(nv.getMatKhau())
                    .roles(nv.getVaiTro().name())
                    .build();
        }

        throw new UsernameNotFoundException("Không tìm thấy tài khoản: " + emailOrPhone);
    }
}

