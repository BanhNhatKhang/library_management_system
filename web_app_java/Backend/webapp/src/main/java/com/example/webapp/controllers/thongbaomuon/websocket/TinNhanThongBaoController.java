package com.example.webapp.controllers.thongbaomuon.websocket;

import com.example.webapp.dto.TinNhanThongBaoDTO;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/thongbao/ws")
public class TinNhanThongBaoController {
        private final SimpMessagingTemplate tinNhanMau;

    public TinNhanThongBaoController(SimpMessagingTemplate tinNhanMau) {
        this.tinNhanMau = tinNhanMau;
    }

    @MessageMapping("/notify")
    @SendTo("/chude/thongbao")
    public TinNhanThongBaoDTO sendMessage(TinNhanThongBaoDTO tinNhanThongBaoDTO) {
        return tinNhanThongBaoDTO;
    }


    @PostMapping
    public void notifyAll(@RequestBody TinNhanThongBaoDTO tinNhanThongBaoDTO) {
        tinNhanMau.convertAndSend("/chude/thongbao", tinNhanThongBaoDTO);
    }
}
