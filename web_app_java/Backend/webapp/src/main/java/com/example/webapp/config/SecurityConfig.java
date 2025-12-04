package com.example.webapp.config;

// import com.example.webapp.repository.DocGiaRepository;
import com.example.webapp.security.JwtAuthFilter;

// import org.springframework.web.servlet.config.annotation.CorsRegistry;
// import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
// import org.springframework.lang.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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
                // PUBLIC endpoints
                .requestMatchers(
                    "/api/xacthuc/**", 
                    "/api/home/**",
                    "/api/sach/image/**",
                    "/api/sach/id/**",
                    "/api/sach/goi-y/**",
                    "/api/sach/theloai/**",    
                    "/api/theloai/id/**",      
                    "/api/nhaxuatban",
                    "/uploads/**",
                    "/api/uploads/**",
                    "/api/uudai/public",
                    "/api/search/**"        
                ).permitAll()

                // DOCGIA profile management
                .requestMatchers("/api/docgia/thongtin/**").hasRole("DOCGIA")
                .requestMatchers("/api/docgia/doimatkhau/**").hasRole("DOCGIA") 
                .requestMatchers("/api/giohang/**").hasRole("DOCGIA")
                
            
                .requestMatchers(HttpMethod.GET, "/api/docgia/theodoimuon/**").hasRole("DOCGIA")
                
                // Cho phép độc giả tạo yêu cầu mượn sách
                .requestMatchers(HttpMethod.POST, "/api/theodoimuonsach").hasRole("DOCGIA")
                .requestMatchers(HttpMethod.GET, "/api/theodoimuonsach/check-borrow-status").hasRole("DOCGIA")
                // Thêm quyền cho DOCGIA truy cập thông báo 
                .requestMatchers(HttpMethod.GET, "/api/thongbao/current-user").hasRole("DOCGIA")
                .requestMatchers(HttpMethod.GET, "/api/thongbao/docgia/**").hasRole("DOCGIA")
                .requestMatchers(HttpMethod.PUT, "/api/thongbao/*/mark-read").hasRole("DOCGIA")

                // DOCGIA ưu đãi management - SỬA: Thêm các endpoint này
                .requestMatchers("/api/uudai/save/**").hasRole("DOCGIA")
                .requestMatchers("/api/uudai/saved").hasRole("DOCGIA") 
                .requestMatchers("/api/uudai/unsave/**").hasRole("DOCGIA")
                

                // DOCGIA order access (chỉ GET own orders)
                .requestMatchers(HttpMethod.GET, "/api/docgia/donhang/**").hasRole("DOCGIA")
                .requestMatchers(HttpMethod.GET, "/api/chitietdonhang/donhang/**").hasRole("DOCGIA")
                .requestMatchers(HttpMethod.POST, "/api/donhang/thanhtoan").hasRole("DOCGIA")
                
                // ADMIN theodoimuonsach access
                .requestMatchers("/api/theodoimuonsach/admin/**").hasAnyAuthority("ADMIN", "NHANVIEN", "THUTHU", "QUANLY")

                // ADMIN order management (tất cả HTTP methods)
                .requestMatchers(HttpMethod.GET, "/api/donhang/**").hasAnyAuthority("ADMIN", "NHANVIEN", "THUTHU", "QUANLY")
                .requestMatchers(HttpMethod.POST, "/api/donhang/**").hasAnyAuthority("ADMIN", "NHANVIEN", "THUTHU", "QUANLY")
                .requestMatchers(HttpMethod.PUT, "/api/donhang/**").hasAnyAuthority("ADMIN", "NHANVIEN", "THUTHU", "QUANLY")
                .requestMatchers(HttpMethod.DELETE, "/api/donhang/**").hasAnyAuthority("ADMIN", "NHANVIEN", "THUTHU", "QUANLY")
                
                .requestMatchers("/api/chitietdonhang/**").hasAnyAuthority("ADMIN", "NHANVIEN", "THUTHU", "QUANLY")
                .requestMatchers("/api/admin/**", "/api/sach/**", "/api/theloai/**").hasAnyAuthority("ADMIN", "NHANVIEN", "THUTHU", "QUANLY")
                .requestMatchers("/api/nhaxuatban/**", "/api/uudai/**", "/api/nhanvien/**").hasAnyAuthority("ADMIN", "NHANVIEN", "THUTHU", "QUANLY")
                .requestMatchers("/api/thongbao/auto/**").hasAnyAuthority("ADMIN", "NHANVIEN", "THUTHU", "QUANLY")
                .requestMatchers("/api/thongbao/**").hasAnyAuthority("ADMIN", "NHANVIEN", "THUTHU", "QUANLY")        
                .requestMatchers("/api/docgia/**").hasAnyAuthority("ADMIN", "NHANVIEN", "THUTHU", "QUANLY")
                .requestMatchers("/api/user/me").authenticated()
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
