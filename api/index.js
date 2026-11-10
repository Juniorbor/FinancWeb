const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const initialData = require("../data/seed");

// Em ambiente Serverless (Vercel), /tmp é gravável; localmente usa data/database.json
const IS_SERVERLESS = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const DB_PATH = IS_SERVERLESS
  ? path.join("/tmp", "controle_database.json")
  : path.join(__dirname, "..", "data", "database.json");

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

function verifyPassword(password, storedHash) {
  const [salt, key] = (storedHash || "").split(":");
  if (!salt || !key) return false;
  const derivedBuffer = crypto.scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, "hex");
  return crypto.timingSafeEqual(derivedBuffer, keyBuffer);
}

// Token assinado stateless (HMAC-SHA256) para funcionar em múltiplas instâncias Serverless sem cair sessão
const TOKEN_SECRET = process.env.TOKEN_SECRET || "controle-odonto-secret-key-2026-fernando-bernardo";

function createSignedToken(username) {
  const payload = JSON.stringify({
    u: username,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 dias
  });
  const base64Payload = Buffer.from(payload).toString("base64url");
  const sig = crypto.createHmac("sha256", TOKEN_SECRET).update(base64Payload).digest("base64url");
  return `${base64Payload}.${sig}`;
}

function verifySignedToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [base64Payload, sig] = token.split(".");
  const expectedSig = crypto.createHmac("sha256", TOKEN_SECRET).update(base64Payload).digest("base64url");
  if (sig !== expectedSig) return null;
  try {
    const data = JSON.parse(Buffer.from(base64Payload, "base64url").toString("utf8"));
    if (Date.now() > data.exp) return null;
    return data.u;
  } catch {
    return null;
  }
}

let memoryDb = null;

function loadDatabase() {
  if (memoryDb) return memoryDb;
  try {
    if (fs.existsSync(DB_PATH)) {
      memoryDb = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
      return memoryDb;
    }
  } catch (e) {}

  memoryDb = {
    auth: {
      username: "admin",
      displayName: "Controle de Tomos & Traçados",
      passwordHash: hashPassword("123456"),
      updatedAt: new Date().toISOString()
    },
    updatedAt: 0,
    ...JSON.parse(JSON.stringify(initialData))
  };
  saveDatabase(memoryDb);
  return memoryDb;
}

function saveDatabase(db) {
  memoryDb = db;
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
  } catch (e) {}
}

function getAuthUser(req) {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  return verifySignedToken(token);
}

function parseRequestBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === "object") return resolve(req.body);
    if (req.body && typeof req.body === "string") {
      try {
        return resolve(JSON.parse(req.body));
      } catch {
        return resolve({});
      }
    }
    let raw = "";
    req.on("data", chunk => { raw += chunk; });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.end(JSON.stringify(payload));
}

module.exports = async function handler(req, res) {
  const db = loadDatabase();
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname;

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    return res.end();
  }

  // Login
  if (pathname === "/api/login" && req.method === "POST") {
    const { username, password } = await parseRequestBody(req);
    if (
      username &&
      password &&
      username.toLowerCase() === db.auth.username.toLowerCase() &&
      verifyPassword(password, db.auth.passwordHash)
    ) {
      const token = createSignedToken(db.auth.username);
      return sendJson(res, 200, {
        ok: true,
        token,
        user: { username: db.auth.username, displayName: db.auth.displayName }
      });
    }
    return sendJson(res, 401, { ok: false, error: "Usuário ou senha incorretos." });
  }

  // Logout
  if (pathname === "/api/logout" && req.method === "POST") {
    return sendJson(res, 200, { ok: true });
  }

  // Autenticação para demais rotas
  const user = getAuthUser(req);
  if (!user) {
    return sendJson(res, 401, { ok: false, error: "Sessão expirada ou não autenticada." });
  }

  // Obter dados
  if (pathname === "/api/data" && req.method === "GET") {
    return sendJson(res, 200, {
      ok: true,
      user: { username: db.auth.username, displayName: db.auth.displayName },
      config: db.config,
      laudos: db.laudos,
      updatedAt: db.updatedAt || 0
    });
  }

  // Sincronização híbrida (restaura/sincroniza dados mais recentes do navegador caso instância serverless reinicie)
  if (pathname === "/api/sync" && req.method === "POST") {
    const { laudos, updatedAt } = await parseRequestBody(req);
    if (Array.isArray(laudos) && (Number(updatedAt) || 0) >= (db.updatedAt || 0)) {
      db.laudos = laudos;
      db.updatedAt = Number(updatedAt) || Date.now();
      saveDatabase(db);
    }
    return sendJson(res, 200, {
      ok: true,
      laudos: db.laudos,
      updatedAt: db.updatedAt || 0
    });
  }

  // Adicionar Laudo
  if (pathname === "/api/laudos" && req.method === "POST") {
    const body = await parseRequestBody(req);
    const { responsavel, tipo, cidade, codigo, data, paciente, regiao, valor } = body;
    if (!responsavel || !tipo || !cidade || !codigo || !paciente || !regiao) {
      return sendJson(res, 400, { ok: false, error: "Preencha todos os campos obrigatórios." });
    }
    const novo = {
      uid: `ld-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      responsavel: String(responsavel).toUpperCase(),
      tipo: String(tipo).toUpperCase(),
      cidade: String(cidade),
      codigo: String(codigo).trim(),
      data: data || new Date().toISOString().slice(0, 10),
      paciente: String(paciente).trim().toUpperCase(),
      regiao: String(regiao).toUpperCase(),
      valor: Number(valor) || db.config.tabelaPrecos[String(regiao).toUpperCase()] || 0
    };
    db.laudos.push(novo);
    db.updatedAt = Date.now();
    saveDatabase(db);
    return sendJson(res, 201, { ok: true, laudo: novo, updatedAt: db.updatedAt });
  }

  // Atualizar Laudo
  if (pathname.startsWith("/api/laudos/") && req.method === "PUT") {
    const uid = pathname.split("/").pop();
    const idx = db.laudos.findIndex(l => l.uid === uid);
    if (idx === -1) return sendJson(res, 404, { ok: false, error: "Registro não encontrado." });
    const body = await parseRequestBody(req);
    db.laudos[idx] = {
      ...db.laudos[idx],
      codigo: body.codigo !== undefined ? String(body.codigo).trim() : db.laudos[idx].codigo,
      data: body.data !== undefined ? body.data : db.laudos[idx].data,
      paciente: body.paciente !== undefined ? String(body.paciente).trim().toUpperCase() : db.laudos[idx].paciente,
      cidade: body.cidade !== undefined ? body.cidade : db.laudos[idx].cidade,
      regiao: body.regiao !== undefined ? String(body.regiao).toUpperCase() : db.laudos[idx].regiao,
      valor: body.valor !== undefined ? Number(body.valor) : db.laudos[idx].valor
    };
    db.updatedAt = Date.now();
    saveDatabase(db);
    return sendJson(res, 200, { ok: true, laudo: db.laudos[idx], updatedAt: db.updatedAt });
  }

  // Remover Laudo
  if (pathname.startsWith("/api/laudos/") && req.method === "DELETE") {
    const uid = pathname.split("/").pop();
    db.laudos = db.laudos.filter(l => l.uid !== uid);
    db.updatedAt = Date.now();
    saveDatabase(db);
    return sendJson(res, 200, { ok: true, updatedAt: db.updatedAt });
  }

  // Alterar Senha
  if (pathname === "/api/change-password" && req.method === "POST") {
    const { senhaAtual, novaSenha } = await parseRequestBody(req);
    if (!verifyPassword(senhaAtual || "", db.auth.passwordHash)) {
      return sendJson(res, 400, { ok: false, error: "A senha atual informada está incorreta." });
    }
    if (!novaSenha || String(novaSenha).length < 4) {
      return sendJson(res, 400, { ok: false, error: "A nova senha deve ter pelo menos 4 caracteres." });
    }
    db.auth.passwordHash = hashPassword(String(novaSenha));
    db.auth.updatedAt = new Date().toISOString();
    saveDatabase(db);
    return sendJson(res, 200, { ok: true });
  }

  return sendJson(res, 404, { ok: false, error: "Endpoint não encontrado." });
};
