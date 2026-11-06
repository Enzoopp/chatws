const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function setup() {
    const elements = {};
    for (const id of ['serverIp', 'username', 'message', 'messages', 'status']) {
        elements[id] = { value: '', children: [], appendChild(child) { this.children.push(child); }, addEventListener() {} };
    }
    elements.serverIp.value = 'localhost';
    elements.username.value = 'Ana';
    const calls = { sent: [], sockets: [], clients: [] };
    const document = { getElementById: id => elements[id], createElement: () => ({ children: [], appendChild(child) { this.children.push(child); } }) };
    const context = {
        document, console,
        SockJS: function (url) {
            calls.url = url;
            this.close = () => { this.closed = true; };
            calls.sockets.push(this);
        },
        Stomp: { over: () => {
            const client = {
                connect(headers, success, error) { this.success = calls.success = success; calls.error = error; },
                subscribe(path, callback) { calls.path = path; calls.receive = callback; },
                send(path, headers, body) { calls.sent.push([path, JSON.parse(body)]); },
                disconnect() { calls.disconnected = true; },
            };
            calls.clients.push(client);
            return client;
        } },
    };
    vm.runInNewContext(fs.readFileSync('src/main/resources/static/script.js', 'utf8'), context);
    return { context, elements, calls };
}

test('conecta, suscribe y envía mensajes al destino existente', () => {
    const { context, elements, calls } = setup();
    context.connect();
    assert.equal(calls.url, 'http://localhost:8080/ws');
    calls.success();
    assert.equal(calls.path, '/topic/public');
    assert.equal(elements.status.textContent, 'Conectado');
    elements.message.value = 'Hola';
    context.sendMessage();
    assert.equal(calls.sent.at(-1)[0], '/app/chat.sendMessage');
    assert.equal(calls.sent.at(-1)[1].usuario, 'Ana');
    assert.equal(calls.sent.at(-1)[1].contenido, 'Hola');
    assert.equal(elements.message.value, '');
    context.disconnect();
    assert.equal(calls.disconnected, true);
    assert.equal(elements.status.textContent, 'Desconectado');
});

test('cancelar conexión pendiente cierra transporte e ignora éxito tardío', () => {
    const { context, elements, calls } = setup();
    context.connect();
    const first = calls.clients[0];
    context.disconnect();
    assert.equal(calls.sockets[0].closed, true);
    assert.equal(elements.status.textContent, 'Desconectado');
    assert.equal(elements.message.disabled, true);
    context.connect();
    first.success();
    assert.equal(elements.status.textContent, 'Desconectado');
    assert.equal(calls.path, undefined);
    calls.clients[1].success();
    assert.equal(elements.status.textContent, 'Conectado');
    assert.equal(calls.path, '/topic/public');
    elements.message.value = 'Hola de nuevo';
    context.sendMessage();
    assert.equal(calls.sent.at(-1)[1].contenido, 'Hola de nuevo');
    calls.receive({ body: JSON.stringify({ usuario: 'Ana', contenido: 'Hola de nuevo' }) });
    assert.equal(elements.messages.children[0].children[1].textContent, ' Hola de nuevo');
});

test('no envía vacío o desconectado y renderiza texto sin HTML', () => {
    const { context, elements, calls } = setup();
    elements.message.value = 'Hola';
    context.sendMessage();
    assert.equal(elements.message.value, 'Hola');
    context.connect(); calls.success();
    const before = calls.sent.length;
    elements.message.value = '  '; context.sendMessage();
    assert.equal(calls.sent.length, before);
    calls.receive({ body: JSON.stringify({ usuario: '<img>', contenido: '<script>' }) });
    const row = elements.messages.children[0];
    assert.equal(row.innerHTML, undefined);
    assert.equal(row.children[0].textContent, '<img>:');
    assert.equal(row.children[1].textContent, ' <script>');
});
