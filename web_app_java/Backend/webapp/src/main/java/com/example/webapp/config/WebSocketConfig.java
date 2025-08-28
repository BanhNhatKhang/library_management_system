package com.example.webapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.lang.NonNull;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        // Địa chỉ client sẽ kết nối WebSocket
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
    }

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry registry) {
        // prefix cho client subscribe (nhận message)
        registry.enableSimpleBroker("queue", "/topic");

        // prefix cho client gửi message đến server
        registry.setApplicationDestinationPrefixes("/app");

        // prefix từ server gửi về client
        registry.setUserDestinationPrefix("/user");;
    }
}
