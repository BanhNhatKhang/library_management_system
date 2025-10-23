package com.example.webapp.config;

// import com.example.webapp.repository.DocGiaRepository;
import com.example.webapp.security.JwtAuthFilter;

// import org.springframework.web.servlet.config.annotation.CorsRegistry;
// import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
// import org.springframework.lang.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
// import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    // private final DocGiaRepository docGiaRepository;
    @Autowired
    private UserDetailService userDetailService;

    // public SecurityConfig(DocGiaRepository docGiaRepository) {
    //     this.docGiaRepository = docGiaRepository;
    // }

    // Dịch vụ load user từ DB
    @Bean
    public UserDetailsService userDetailsService() {
        return userDetailService;
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
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) 
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/xacthuc/**", 
                    "/api/home/**",
                    "/api/sach/image/**"         
                ).permitAll()
                
                .requestMatchers(
                    "/api/admin/**",
                    "/api/sach/**",   
                    "/api/theloai/**",
                    "/api/nhaxuatban/**", 
                    "/api/uudai/**",
                    "/api/docgia/**",    
                    "/api/nhanvien/**",  
                    "/api/donhang/**",   
                    "/api/thongbao/**",  
                    "/api/chitietdonhang/**", 
                    "/api/muontra/**" 
                ).hasAnyRole("ADMIN", "NHANVIEN", "THUTHU", "QUANLY") 

                .requestMatchers(
                    "/api/docgia/thongtin/**", 
                    "/api/theodoimuonsach/**"
                ).hasRole("DOCGIA")

                .requestMatchers(
                    "/api/user/me" 
                ).authenticated()
                
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }

    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("http://localhost:5173");
        configuration.addAllowedOrigin("http://localhost:8080");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}
