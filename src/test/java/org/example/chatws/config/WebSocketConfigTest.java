package org.example.chatws.config;

import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.config.StompBrokerRelayRegistration;

import static org.mockito.Mockito.*;

class WebSocketConfigTest {
    @Test
    void configuraRelayYDestinosExistentes() {
        MessageBrokerRegistry registry = mock(MessageBrokerRegistry.class);
        StompBrokerRelayRegistration relay = mock(StompBrokerRelayRegistration.class, RETURNS_SELF);
        when(registry.enableStompBrokerRelay("/topic", "/queue")).thenReturn(relay);

        new WebSocketConfig("broker", 61613, "cliente", "clave", "sistema", "clave-sistema")
                .configureMessageBroker(registry);

        verify(relay).setRelayHost("broker");
        verify(relay).setRelayPort(61613);
        verify(relay).setClientLogin("cliente");
        verify(relay).setClientPasscode("clave");
        verify(relay).setSystemLogin("sistema");
        verify(relay).setSystemPasscode("clave-sistema");
        verify(registry).setApplicationDestinationPrefixes("/app");
        verify(registry, never()).enableSimpleBroker(any(String[].class));
    }
}
