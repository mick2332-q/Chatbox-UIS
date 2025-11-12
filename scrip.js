// Solo guarda la conversación actual en memoria (RAM)
let sessionId = sessionStorage.getItem('sentirU_sessionId');
let userId = '';

// Al recargar, inicia como anónimo
sessionId = null;
sessionStorage.removeItem('sentirU_sessionId');

function nuevaSesion() {
// Borra el identificador de usuario pero NO borra el chat
userId = '';
sessionId = null;
sessionStorage.removeItem('sentirU_sessionId');
mostrarMensaje('Sistema', 'Nueva sesión iniciada. Ahora eres anónimo, si te identificas la conversación continuará con tu ID.');
}

async function enviar() {
const chat = document.getElementById('chat');
const input = document.getElementById('input');
const mensaje = input.value.trim();
if (!mensaje) return;
mostrarMensaje('Tú', mensaje);
input.value = '';
input.disabled = true;

// Si el mensaje es identificación tipo "hola soy 12345", actualiza userId y sessionId
const idMatch = mensaje.match(/soy\s+(\d{4,})/i);
if (idMatch) {
userId = idMatch[1];
sessionId = 'user_' + userId;
sessionStorage.setItem('sentirU_sessionId', sessionId);
} else if (!sessionId) {
sessionId = 'anon_' + Math.random().toString(36).substr(2, 9) + Date.now();
sessionStorage.setItem('sentirU_sessionId', sessionId);
}

const body = { mensaje, sessionId, userId };

const response = await fetch('https://mfjg.app.n8n.cloud/webhook/178ca3ab-8da0-4f9e-b749-ed843dc157ff', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(body)
});
const data = await response.json();

// Si la IA confirma identificación, actualiza de nuevo userId y sessionId
if (data.userId && data.userId !== userId) {
userId = data.userId;
sessionId = 'user_' + userId;
sessionStorage.setItem('sentirU_sessionId', sessionId);
}
mostrarMensaje('Bot', data.respuesta);
input.disabled = false;
input.focus();
}

function mostrarMensaje(quien, texto) {
  const chat = document.getElementById('chat');

  // Siempre forzar el corazón verde (opcional extra)
  texto = texto.replace(/❤️|💙|💜|🧡|💛|🖤|🤍|💔|💖/g, '💚');

  // Sólo separar si es del 'Bot'
  if (quien === 'Bot') {
    // Divide la respuesta en bloques usando doble salto de línea
    texto.split(/\n\s*\n/).forEach(fragmento => {
      if (fragmento.trim()) {
        const div = document.createElement('div');
        div.className = 'chat-message chat-message-bot';
        div.innerHTML = fragmento.trim();
        chat.appendChild(div);
      }
    });
  } else {
    const div = document.createElement('div');
    div.className = 'chat-message chat-message-user';
    div.innerHTML = texto;
    chat.appendChild(div);
  }
  chat.scrollTop = chat.scrollHeight;
}


document.getElementById('input').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') { enviar(); }
});
