package com.example.webapp.controllers.timkiem;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.webapp.dto.SachDTO;
import com.example.webapp.services.SachService;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "http://localhost:5173")
public class TimKiemController {

    @Autowired
    private SachService sachService;

    @GetMapping
    public Map<String, Object> searchBooks(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "type", required = false, defaultValue = "all") String searchType,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        
        List<SachDTO> results;
        long totalResults = 0;
        
        if (query == null || query.trim().isEmpty()) {
            results = sachService.getAllSach();
        } else {
            switch (searchType.toLowerCase()) {
                case "name":
                case "ten":
                    results = sachService.searchSachByTen(query.trim());
                    break;
                case "author":
                case "tacgia":
                    results = sachService.getSachByTacGia(query.trim());
                    break;
                case "publisher":
                case "nxb":
                    results = sachService.getSachByNhaXuatBan(query.trim());
                    break;
                case "category":
                case "theloai":
                    results = sachService.searchSachByTheLoai(query.trim());
                    break;
                default:
                    // Tìm kiếm toàn bộ (tên, tác giả, nxb)
                    results = sachService.searchSachGlobal(query.trim());
                    break;
            }
        }
        
        totalResults = results.size();
        
        // Pagination
        int startIndex = page * size;
        int endIndex = Math.min(startIndex + size, results.size());
        List<SachDTO> paginatedResults = results.subList(startIndex, endIndex);
        
        Map<String, Object> response = new HashMap<>();
        response.put("results", paginatedResults);
        response.put("totalResults", totalResults);
        response.put("totalPages", (int) Math.ceil((double) totalResults / size));
        response.put("currentPage", page);
        response.put("pageSize", size);
        response.put("query", query);
        response.put("searchType", searchType);
        
        return response;
    }

    @GetMapping("/suggestions")
    public Map<String, Object> getSearchSuggestions(
            @RequestParam("q") String query) {
        
        Map<String, Object> suggestions = new HashMap<>();
        
        if (query != null && query.trim().length() >= 2) {
            String trimmedQuery = query.trim();
            
            // Gợi ý tên sách (top 5)
            List<SachDTO> bookSuggestions = sachService.searchSachByTen(trimmedQuery)
                    .stream()
                    .limit(5)
                    .toList();
            
            // Gợi ý tác giả (top 3)
            List<String> authorSuggestions = sachService.getAuthorSuggestions(trimmedQuery, 3);
            
            // Gợi ý nhà xuất bản (top 3)
            List<String> publisherSuggestions = sachService.getPublisherSuggestions(trimmedQuery, 3);
            
            suggestions.put("books", bookSuggestions);
            suggestions.put("authors", authorSuggestions);
            suggestions.put("publishers", publisherSuggestions);
        }
        
        return suggestions;
    }
}