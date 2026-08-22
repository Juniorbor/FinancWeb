// Netlify Serverless Function para Sincronização em Nuvem em Tempo Real sem limites de requisições
// Permite que qualquer alteração no celular (Android/iOS) apareça instantaneamente no notebook!

let stateStore = {
  producao: [],
  financeiro: [],
  pacientes: [],
  consultas: [],
  updatedAt: 0,
  updatedBy: ''
};

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'POST' || event.httpMethod === 'PUT') {
    try {
      const body = JSON.parse(event.body || '{}');
      
      if (Array.isArray(body.producao)) stateStore.producao = body.producao;
      if (Array.isArray(body.financeiro)) stateStore.financeiro = body.financeiro;
      if (Array.isArray(body.pacientes)) stateStore.pacientes = body.pacientes;
      if (Array.isArray(body.consultas)) stateStore.consultas = body.consultas;
      
      stateStore.updatedAt = body.updatedAt || Date.now();
      stateStore.updatedBy = body.updatedBy || 'Dispositivo';

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: stateStore })
      };
    } catch (e) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Formato JSON inválido' })
      };
    }
  }

  // GET request - Retorna os dados mais recentes da nuvem
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, data: stateStore })
  };
};
