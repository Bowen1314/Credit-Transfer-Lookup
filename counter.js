const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'visitors.json');
const PORT = 3001;

// Load or initialize visitor data
function loadData() {
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch {
        return { total: new Set(), daily: {} };
    }
}

function saveData(data) {
    const serializable = {
        total: [...data.total],
        daily: {}
    };
    for (const [day, ips] of Object.entries(data.daily)) {
        serializable.daily[day] = [...ips];
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(serializable), 'utf8');
}

function deserialize(raw) {
    return {
        total: new Set(raw.total || []),
        daily: Object.fromEntries(
            Object.entries(raw.daily || {}).map(([k, v]) => [k, new Set(v)])
        )
    };
}

let data = deserialize(loadData());

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Get real IP (behind Caddy/Cloudflare)
    const ip = req.headers['cf-connecting-ip']
        || req.headers['x-forwarded-for']?.split(',')[0]?.trim()
        || req.headers['x-real-ip']
        || req.socket.remoteAddress;

    const today = new Date().toISOString().slice(0, 10);

    if (req.url === '/api/visit' && req.method === 'POST') {
        // Record visit
        data.total.add(ip);
        if (!data.daily[today]) data.daily[today] = new Set();
        data.daily[today].add(ip);
        saveData(data);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            unique_total: data.total.size,
            unique_today: data.daily[today].size
        }));
    } else if (req.url === '/api/stats' && req.method === 'GET') {
        // Get stats
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            unique_total: data.total.size,
            unique_today: (data.daily[today] || new Set()).size
        }));
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`Visitor counter running on port ${PORT}`);
});
