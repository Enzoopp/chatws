package org.example.chatws.controller;

import org.example.chatws.entity.ChatMessage;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class ChatControllerTest {
    @Test
    void conservaDestinosYPayload() throws Exception {
        ChatController controller = new ChatController(mock(SimpMessagingTemplate.class));
        ChatMessage message = new ChatMessage("CHAT", "Ana", "Hola", "Luis");
        message.setWebRTCSignal("signal");
        assertSame(message, controller.enviarMensaje(message));
        assertSame(message, controller.agregarUsuario(message));
        assertEquals("Luis", message.getDestinatario());
        assertEquals("signal", message.getWebRTCSignal());
        var send = ChatController.class.getMethod("enviarMensaje", ChatMessage.class);
        var join = ChatController.class.getMethod("agregarUsuario", ChatMessage.class);
        assertArrayEquals(new String[]{"/chat.sendMessage"}, send.getAnnotation(MessageMapping.class).value());
        assertArrayEquals(new String[]{"/chat.addUser"}, join.getAnnotation(MessageMapping.class).value());
        assertArrayEquals(new String[]{"/topic/public"}, send.getAnnotation(SendTo.class).value());
        assertArrayEquals(new String[]{"/topic/public"}, join.getAnnotation(SendTo.class).value());
    }
}
