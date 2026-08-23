let stateStore = {
  producao: [],
  financeiro: [],
  pacientes: [],
  consultas: [],
  fotografias: [],
  updatedAt: 0,
  updatedBy: ''
};

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      
      if (Array.isArray(body.producao)) stateStore.producao = body.producao;
      if (Array.isArray(body.financeiro)) stateStore.financeiro = body.financeiro;
      if (Array.isArray(body.pacientes)) stateStore.pacientes = body.pacientes;
      if (Array.isArray(body.consultas)) stateStore.consultas = body.consultas;
      if (Array.isArray(body.fotografias)) stateStore.fotografias = body.fotografias;
      
      stateStore.updatedAt = body.updatedAt || Date.now();
      stateStore.updatedBy = body.updatedBy || 'Dispositivo';

      return res.status(200).json({ success: true, data: stateStore });
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Formato JSON inválido' });
    }
  }

  return res.status(200).json({ success: true, data: stateStore });
}
