package com.example.webapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.lang.NonNull;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
@EnableScheduling // Thêm annotation này
public class WebappApplication {

    public static void main(String[] args) {
        System.out.println("=== JACKSON VERSION CHECK ===");
        try {
            System.out.println("Jackson Annotations: " + 
                com.fasterxml.jackson.annotation.JsonProperty.class.getPackage().getImplementationVersion());
            System.out.println("Jackson Databind: " + 
                com.fasterxml.jackson.databind.ObjectMapper.class.getPackage().getImplementationVersion());
        } catch (Exception e) {
            System.out.println("Jackson version check failed: " + e.getMessage());
        }
        System.out.println("==============================");
        
        SpringApplication.run(WebappApplication.class, args);
    }

    @Bean
    public WebMvcConfigurer webMvcConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
                // Thêm resource handler cho uploads
                registry.addResourceHandler("/uploads/**")
                        .addResourceLocations("file:uploads/")
                        .setCachePeriod(86400); // Cache 1 ngày
                        
                System.out.println(" Resource handler added for /uploads/**");
            }
        };
    }
}
