package com.example.webapp.config;

import com.example.webapp.models.DocGia;
import com.example.webapp.repository.DocGiaRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@Configuration
public class SecurityConfig {

    private final DocGiaRepository docGiaRepository;

    public SecurityConfig(DocGiaRepository docGiaRepository) {
        this.docGiaRepository = docGiaRepository;
    }

    // Dịch vụ load user từ DB
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            DocGia docGia = docGiaRepository.findByEmail(username);
            if (docGia == null) {
                throw new UsernameNotFoundException("Không tìm thấy độc giả: " + username);
            }
            return User.withUsername(docGia.getEmail())
                    .password(docGia.getMatKhau())
                    .roles("DOCGIA")
                    .build();
        };
    }

    // Mã hóa mật khẩu
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

   
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    // Cấu hình HTTP security
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/ws/**", "/xacthuc/dangnhap", "/xacthuc/dangky").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/xacthuc/dangnhap")
                .permitAll()
            )
            .logout(logout -> logout.permitAll());

        return http.build();
    }
}
