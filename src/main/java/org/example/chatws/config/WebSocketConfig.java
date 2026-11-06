package org.example.chatws.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/** Configuracion de WebSocket para habilitar mensajeria en tiempo real. */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    public static final String TOPIC = "/topic";
    public static final String APP = "/app";

    private final String host, clientLogin, clientPasscode, systemLogin, systemPasscode;
    private final int port;

    public WebSocketConfig(@Value("${chat.relay.host}") String host,
                           @Value("${chat.relay.port}") int port,
                           @Value("${chat.relay.client-login}") String clientLogin,
                           @Value("${chat.relay.client-passcode}") String clientPasscode,
                           @Value("${chat.relay.system-login}") String systemLogin,
                           @Value("${chat.relay.system-passcode}") String systemPasscode) {
        this.host = host;
        this.port = port;
        this.clientLogin = clientLogin;
        this.clientPasscode = clientPasscode;
        this.systemLogin = systemLogin;
        this.systemPasscode = systemPasscode;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableStompBrokerRelay(TOPIC, "/queue")
                .setRelayHost(host).setRelayPort(port)
                .setClientLogin(clientLogin).setClientPasscode(clientPasscode)
                .setSystemLogin(systemLogin).setSystemPasscode(systemPasscode);
        config.setApplicationDestinationPrefixes(APP);
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").withSockJS();
    }
}
