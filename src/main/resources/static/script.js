let stompClient = null;
let socket = null;
let connected = false;

function connect() {
    if (stompClient) return;
    const serverIp = document.getElementById('serverIp').value.trim();
    socket = new SockJS('http://' + serverIp + ':8080/ws');
    const client = Stomp.over(socket);
    stompClient = client;
    client.connect({}, function () {
        if (stompClient !== client) return;
        connected = true;
        setConnected(true);
        client.subscribe('/topic/public', function (frame) {
            showMessage(JSON.parse(frame.body));
        });
    }, function () {
        if (stompClient !== client) return;
        stompClient = null;
        socket = null;
        connected = false;
        setConnected(false);
    });
}

function disconnect() {
    const client = stompClient;
    const transport = socket;
    stompClient = null;
    socket = null;
    if (client && connected) client.disconnect();
    else if (transport) transport.close();
    connected = false;
    setConnected(false);
}

function setConnected(connected) {
    const status = document.getElementById('status');
    status.className = connected ? 'connected' : 'disconnected';
    status.textContent = connected ? 'Conectado' : 'Desconectado';
    document.getElementById('message').disabled = !connected;
}

function sendMessage() {
    const username = document.getElementById('username').value;
    const input = document.getElementById('message');
    const content = input.value;
    if (!connected || content.trim() === '') return;
    stompClient.send('/app/chat.sendMessage', {}, JSON.stringify({
        tipo: 'CHAT', usuario: username, contenido: content
    }));
    input.value = '';
}

function showMessage(message) {
    const messages = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    const sender = document.createElement('strong');
    const content = document.createElement('span');
    messageDiv.className = 'message';
    sender.textContent = message.usuario + ':';
    content.textContent = ' ' + message.contenido;
    messageDiv.appendChild(sender);
    messageDiv.appendChild(content);
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

document.getElementById('message').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') sendMessage();
});
