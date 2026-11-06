# Chat WebSocket - Guía para Alumnos

Este proyecto implementa un sistema de chat en tiempo real utilizando **WebSocket** y el protocolo **STOMP** con Spring Boot. A continuación se explica el flujo completo de funcionamiento y los conceptos clave.

## 📝 Descripción del Proyecto

ChatWS es una aplicación de chat en tiempo real que permite a múltiples usuarios conectarse, enviar mensajes y recibir actualizaciones instantáneas sin necesidad de recargar la página. Utiliza una arquitectura basada en eventos donde los mensajes se propagan automáticamente a todos los clientes conectados.

## Ejecutar localmente

Requisitos: JDK 26, Docker con Compose y conexión a Internet para descargar las dependencias y las bibliotecas del navegador.

1. Inicia RabbitMQ con `docker compose up -d`.
2. Ejecuta la aplicación con `./mvnw spring-boot:run` (en Windows, `mvnw.cmd spring-boot:run`).
3. Abre `http://localhost:8080` en dos pestañas, conecta ambas y envía un mensaje.

Compose habilita el plugin STOMP y expone sus puertos solo en localhost. La consola de RabbitMQ está en `http://localhost:15672`. El usuario local es `chat` y la contraseña de ejemplo es `chat-local`; no son credenciales de producción.

El relay acepta `RELAY_HOST`, `RELAY_PORT`, `RELAY_CLIENT_LOGIN`, `RELAY_CLIENT_PASSCODE`, `RELAY_SYSTEM_LOGIN` y `RELAY_SYSTEM_PASSCODE`. Por defecto usa `localhost:61613` y las credenciales locales anteriores para ambas conexiones. Si cambias las credenciales de Compose mediante `RABBITMQ_DEFAULT_USER` y `RABBITMQ_DEFAULT_PASS`, configura también las del relay. En producción utiliza credenciales seguras y mecanismos apropiados para administrarlas.

Pruebas: `./mvnw test` y `node --test src/test/js/*.test.cjs`.

**Tecnologías principales:**
- Spring Boot 4.1.1
- WebSocket para comunicación bidireccional
- STOMP como protocolo de mensajería, con relay hacia RabbitMQ
- SockJS para compatibilidad con navegadores antiguos
- Jackson para serialización JSON

---

## 🏗️ Arquitectura y Flujo

### Diagrama de Arquitectura

```
┌─────────────────┐         WebSocket          ┌──────────────────┐
│   Cliente Web   │ ◄────────────────────────► │   Servidor       │
│  (Navegador)    │     (ws://localhost:8080)  │   Spring Boot    │
└─────────────────┘                            └──────────────────┘
       │                                                 │
       │ 1. Conexión WebSocket                          │
       │ 2. Suscripción a /topic/public                 │
       │ 3. Envío a /app/chat.sendMessage               │
       │                                                 │
       │                                                 │
       │ 4. Recepción de mensajes                       │
       │    (broadcast desde /topic/public)             │
```

### Flujo Completo de un Mensaje

1. **Conexión:** El cliente web establece una conexión WebSocket con el servidor
2. **Suscripción:** El cliente se suscribe al canal `/topic/public` para recibir mensajes
3. **Envío:** El cliente envía un mensaje a `/app/chat.sendMessage`
4. **Procesamiento:** El `ChatController` recibe el mensaje
5. **Broadcast:** El relay entrega el mensaje a RabbitMQ, que lo reenvía a los suscriptores de `/topic/public`
6. **Recepción:** Todos los clientes conectados reciben el mensaje simultáneamente

