package com.example.webapp.controllers.uploads;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/uploads")
@CrossOrigin(origins = "http://localhost:5173")
public class FileController {

    private static final String UPLOAD_DIR = "uploads";

    @GetMapping("/**")
    public ResponseEntity<Resource> serveFile(@RequestParam String file) {
        try {
            // Lấy đường dẫn file từ parameter
            Path filePath = Paths.get(UPLOAD_DIR).resolve(file).normalize();
            
            // Kiểm tra file có tồn tại không
            if (!Files.exists(filePath) || !Files.isReadable(filePath)) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(filePath);
            
            // Xác định content type
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .body(resource);
                    
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}