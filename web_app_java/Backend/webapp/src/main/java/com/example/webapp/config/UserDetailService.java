package com.example.webapp.config;

import com.example.webapp.models.DocGia;
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

    @Override
    public UserDetails loadUserByUsername(String emailOrPhone) throws UsernameNotFoundException {
        DocGia docGia = docGiaRepository.findByEmail(emailOrPhone);
        if (docGia == null) {
            docGia = docGiaRepository.findByDienThoai(emailOrPhone);
        }

        if (docGia == null) {
            throw new UsernameNotFoundException("Không tìm thấy tài khoản: " + emailOrPhone);
        }

        // principal.getName() sẽ = maDocGia
        return User.withUsername(docGia.getMaDocGia())
                .password(docGia.getMatKhau())   
                .roles("DOCGIA")                  
                .build();
    }
}
