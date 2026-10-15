import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3456;
const DATA_FILE = path.join(__dirname, 'data-store.json');
const INITIAL_DATA_FILE = path.join(__dirname, 'data.js');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon'
};

// Clientes SSE conectados para sincronización en tiempo real
const sseClients = new Set();

// Estado del túnel Cloudflare
let tunnelProcess = null;
let tunnelPublicUrl = null;

import vm from 'vm';

/**
 * Inicializa el archivo de datos data-store.json si no existe
 */
function ensureDataStoreExists() {
  if (!fs.existsSync(DATA_FILE)) {
    try {
      if (fs.existsSync(INITIAL_DATA_FILE)) {
        const dataJsContent = fs.readFileSync(INITIAL_DATA_FILE, 'utf-8');
        const sandbox = { window: {} };
        vm.createContext(sandbox);
        vm.runInContext(dataJsContent, sandbox);
        if (sandbox.window && sandbox.window.WTW_INITIAL_DATA) {
          fs.writeFileSync(DATA_FILE, JSON.stringify(sandbox.window.WTW_INITIAL_DATA, null, 2), 'utf-8');
          console.log('[DATA] data-store.json inicializado desde data.js');
          return;
        }
      }
    } catch (err) {
      console.warn('[DATA] No se pudo parsear data.js automáticamente:', err.message);
    }
  }
}

ensureDataStoreExists();

function broadcast(event, payload) {
  const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

/**
 * Servidor HTTP Principal
 */
const server = http.createServer((req, res) => {
  // CORS Headers para habilitar conexiones externas o embebidas
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const reqPath = parsedUrl.pathname;

  // =========================================================================
  // API ENDPOINTS
  // =========================================================================

  // 1. GET /api/data -> Retorna el estado JSON maestro
  if (req.method === 'GET' && reqPath === '/api/data') {
    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(raw);
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error al leer data-store.json' }));
        return;
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'data-store.json no existe todavía' }));
      return;
    }
  }

  // 2. POST /api/data -> Guarda el estado JSON y notifica a todos los clientes por SSE
  if (req.method === 'POST' && reqPath === '/api/data') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        const tempPath = DATA_FILE + '.tmp';
        fs.writeFileSync(tempPath, JSON.stringify(parsed, null, 2), 'utf-8');
        fs.renameSync(tempPath, DATA_FILE);

        // Notificar en tiempo real a todos los clientes conectados
        broadcast('data_updated', { timestamp: Date.now(), source: 'api' });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, savedAt: new Date().toISOString() }));
      } catch (err) {
        console.error('[API] Error guardando data:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'JSON inválido', message: err.message }));
      }
    });
    return;
  }

  // 3. GET /api/events -> Server-Sent Events (SSE) para sincronización en tiempo real
  if (req.method === 'GET' && reqPath === '/api/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write('retry: 3000\n\n');

    sseClients.add(res);

    // Heartbeat cada 25 segundos para mantener la conexión viva
    const heartbeat = setInterval(() => {
      try {
        res.write(': heartbeat\n\n');
      } catch (e) {
        clearInterval(heartbeat);
        sseClients.delete(res);
      }
    }, 25000);

    req.on('close', () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
    });
    return;
  }

  // 4. GET /api/tunnel -> Consulta el estado del túnel Cloudflare
  if (req.method === 'GET' && reqPath === '/api/tunnel') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      active: !!tunnelPublicUrl,
      publicUrl: tunnelPublicUrl
    }));
    return;
  }

  // 5. POST /api/tunnel -> Inicia o detiene el túnel Cloudflare
  if (req.method === 'POST' && reqPath === '/api/tunnel') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const action = body.trim() ? JSON.parse(body).action : 'start';

      if (action === 'start') {
        if (tunnelPublicUrl) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, publicUrl: tunnelPublicUrl }));
          return;
        }

        const cloudflaredBin = '/opt/homebrew/bin/cloudflared';
        if (!fs.existsSync(cloudflaredBin)) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'cloudflared no encontrado en el sistema' }));
          return;
        }

        try {
          tunnelProcess = spawn(cloudflaredBin, ['tunnel', '--url', `http://localhost:${PORT}`, '--no-autoupdate']);

          let urlFound = false;

          const extractUrl = (data) => {
            const text = data.toString();
            const match = text.match(/https:\/\/[a-zA-Z0-9.-]*\.trycloudflare\.com/);
            if (match && !urlFound) {
              urlFound = true;
              tunnelPublicUrl = match[0];
              console.log(`[TUNNEL] Enlace público seguro generado: ${tunnelPublicUrl}`);
              broadcast('tunnel_ready', { publicUrl: tunnelPublicUrl });
            }
          };

          tunnelProcess.stdout.on('data', extractUrl);
          tunnelProcess.stderr.on('data', extractUrl);

          tunnelProcess.on('close', () => {
            tunnelProcess = null;
            tunnelPublicUrl = null;
            broadcast('tunnel_closed', {});
          });

          // Esperar hasta 8 segundos para responder con la URL
          let attempts = 0;
          const checkInterval = setInterval(() => {
            attempts++;
            if (tunnelPublicUrl) {
              clearInterval(checkInterval);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ ok: true, publicUrl: tunnelPublicUrl }));
            } else if (attempts >= 16) {
              clearInterval(checkInterval);
              res.writeHead(202, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ ok: true, status: 'starting', message: 'Túnel iniciando, URL disponible en breve' }));
            }
          }, 500);

        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        }
        return;
      } else if (action === 'stop') {
        if (tunnelProcess) {
          tunnelProcess.kill('SIGTERM');
          tunnelProcess = null;
          tunnelPublicUrl = null;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, status: 'stopped' }));
        return;
      }
    });
    return;
  }

  // 6. POST /api/reset -> Restablece a los datos iniciales
  if (req.method === 'POST' && reqPath === '/api/reset') {
    try {
      if (fs.existsSync(DATA_FILE)) {
        fs.unlinkSync(DATA_FILE);
      }
      ensureDataStoreExists();
      broadcast('data_updated', { timestamp: Date.now(), source: 'reset' });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, message: 'Datos restablecidos exitosamente' }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // =========================================================================
  // SERVIR ARCHIVOS ESTÁTICOS
  // =========================================================================
  let fileUrl = reqPath;
  if (fileUrl === '/' || fileUrl === '') {
    fileUrl = '/index.html';
  }

  const filePath = path.join(__dirname, decodeURI(fileUrl));

  // Seguridad básica: evitar path traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Acceso denegado');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404: Archivo no encontrado - ${fileUrl}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(` WITNESS TO WAR & VIOLENCE — CONTROL CENTER ONLINE`);
  console.log(` Servidor local activo en:`);
  console.log(` -> http://localhost:${PORT}`);
  console.log(` -> http://127.0.0.1:${PORT}`);
  console.log(` Sincronización en tiempo real (SSE) habilitada.`);
  console.log(` Archivo de persistencia: ${DATA_FILE}`);
  console.log(`=======================================================`);
});
