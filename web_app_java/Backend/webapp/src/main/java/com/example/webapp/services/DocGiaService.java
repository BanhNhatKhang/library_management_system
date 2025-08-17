package com.example.webapp.services;

import com.example.webapp.models.DocGia;
import com.example.webapp.repository.DocGiaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DocGiaService {

    @Autowired
    private DocGiaRepository docGiaRepository;

    public List<DocGia> getAllDocGia() {
        return docGiaRepository.findAll();
    }

    public Optional<DocGia> getDocGiaById(String maDocGia) {
        return docGiaRepository.findById(maDocGia);
    }

    public DocGia saveDocGia(DocGia docGia) {
        return docGiaRepository.save(docGia);
    }

    public DocGia updateDocGia(String maDocGia, DocGia docGia) {
        if (!docGiaRepository.existsByMaDocGia(maDocGia) || !docGiaRepository.existsByEmail(docGia.getEmail()) || !docGiaRepository.existsByDienThoai(docGia.getDienThoai())) {
            throw new RuntimeException("Thông tin độc giả không hợp lệ hoặc đã tồn tại");
        }
        docGia.setMaDocGia(maDocGia);
        return docGiaRepository.save(docGia);
    }

    public void deleteDocGia(String maDocGia) {
        docGiaRepository.deleteById(maDocGia);
    }

}