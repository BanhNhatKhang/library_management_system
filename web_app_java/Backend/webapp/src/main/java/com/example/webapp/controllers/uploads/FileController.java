package com.example.webapp.controllers.uploads;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class FileController {

    private static final String UPLOAD_DIR = "uploads";

    // Endpoint cho /uploads/** (path trực tiếp)
    @GetMapping("/uploads/**")
    public ResponseEntity<Resource> serveFileDirectly(HttpServletRequest request) {
        return serveFile(request, "/uploads/");
    }

    // Endpoint cho /api/uploads/** (path với /api prefix)
    @GetMapping("/api/uploads/**")
    public ResponseEntity<Resource> serveFileWithApi(HttpServletRequest request) {
        return serveFile(request, "/api/uploads/");
    }

    private ResponseEntity<Resource> serveFile(HttpServletRequest request, String prefixToRemove) {
        try {
            // Lấy đường dẫn sau prefix
            String requestURI = request.getRequestURI();
            String requestPath = requestURI.substring(prefixToRemove.length());
            
            // Debug logs
            System.out.println("=== FILE CONTROLLER DEBUG ===");
            System.out.println("Request URI: " + requestURI);
            System.out.println("Prefix to remove: " + prefixToRemove);
            System.out.println("Request path: " + requestPath);
            System.out.println("Working directory: " + System.getProperty("user.dir"));
            
            // Tạo đường dẫn tuyệt đối đến file
            Path filePath = Paths.get(System.getProperty("user.dir"), UPLOAD_DIR, requestPath).normalize();
            System.out.println("Full file path: " + filePath.toString());
            System.out.println("File exists: " + Files.exists(filePath));
            System.out.println("File readable: " + Files.isReadable(filePath));
            
            // Liệt kê files trong thư mục để debug
            if (requestPath.contains("/")) {
                String folderPath = requestPath.substring(0, requestPath.lastIndexOf("/"));
                Path folderFullPath = Paths.get(System.getProperty("user.dir"), UPLOAD_DIR, folderPath);
                System.out.println("Folder path: " + folderFullPath);
                if (Files.exists(folderFullPath)) {
                    System.out.println("Files in folder:");
                    try {
                        Files.list(folderFullPath).forEach(f -> System.out.println("  - " + f.getFileName()));
                    } catch (IOException e) {
                        System.err.println("Error listing files: " + e.getMessage());
                    }
                }
            }
            
            // Kiểm tra file có tồn tại không
            if (!Files.exists(filePath) || !Files.isReadable(filePath)) {
                System.out.println("❌ File not found or not readable: " + filePath);
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(filePath);
            
            // Xác định content type
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                // Xác định content type dựa trên extension
                String fileName = filePath.getFileName().toString().toLowerCase();
                if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
                    contentType = "image/jpeg";
                } else if (fileName.endsWith(".png")) {
                    contentType = "image/png";
                } else if (fileName.endsWith(".gif")) {
                    contentType = "image/gif";
                } else if (fileName.endsWith(".webp")) {
                    contentType = "image/webp";
                } else {
                    contentType = "application/octet-stream";
                }
            }
            System.out.println("✅ Serving file successfully with content type: " + contentType);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=86400")
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                    .body(resource);
                    
        } catch (Exception e) {
            System.err.println("❌ Error serving file: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Endpoint debug để list files
    @GetMapping("/api/uploads/debug/list")
    public ResponseEntity<String> listFiles() {
        try {
            Path uploadPath = Paths.get(System.getProperty("user.dir"), UPLOAD_DIR);
            StringBuilder result = new StringBuilder();
            result.append("Upload directory: ").append(uploadPath).append("\n");
            result.append("Directory exists: ").append(Files.exists(uploadPath)).append("\n\n");
            
            if (Files.exists(uploadPath)) {
                Files.walk(uploadPath)
                     .forEach(path -> result.append(path.toString()).append("\n"));
            }
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, "text/plain")
                    .body(result.toString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }
}