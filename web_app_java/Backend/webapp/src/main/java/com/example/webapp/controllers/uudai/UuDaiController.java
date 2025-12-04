package com.example.webapp.controllers.uudai;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import com.example.webapp.dto.*;
import com.example.webapp.services.UuDaiService;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/uudai")
@CrossOrigin(origins = "http://localhost:5173")
public class UuDaiController {

    @Autowired
    private UuDaiService uuDaiService;

    // SỬA: Loại bỏ @PreAuthorize để endpoint này thực sự public
    @GetMapping("/public")
    public List<UuDaiDTO> getPublicUuDai() {
        return uuDaiService.getActiveUuDaiNotLinkedToBooks();
    }

    @PostMapping("/save/{maUuDai}")
    @PreAuthorize("hasRole('DOCGIA')")
    public ResponseEntity<?> saveUuDaiForDocGia(
            @PathVariable String maUuDai,
            Principal principal) {
        try {
            String email = principal.getName();
            String result = uuDaiService.saveUuDaiForDocGia(email, maUuDai);
            Map<String, Object> response = new HashMap<>();
            response.put("message", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/saved")
    @PreAuthorize("hasRole('DOCGIA')")
    public List<UuDaiDTO> getSavedUuDai(Principal principal) {
        String email = principal.getName();
        return uuDaiService.getSavedUuDaiByEmail(email);
    }

    @DeleteMapping("/unsave/{maUuDai}")
    @PreAuthorize("hasRole('DOCGIA')")
    public ResponseEntity<?> unsaveUuDaiForDocGia(
            @PathVariable String maUuDai,
            Principal principal) {
        try {
            String email = principal.getName();
            String result = uuDaiService.unsaveUuDaiForDocGia(email, maUuDai);
            Map<String, Object> response = new HashMap<>();
            response.put("message", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}