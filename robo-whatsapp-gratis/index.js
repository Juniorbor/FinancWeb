const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require('@whiskeysockets/baileys');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');
const cron = require('node-cron');
const axios = require('axios');
const express = require('express');
const readline = require('readline');

// CONFIGURAÇÕES DO ROBÔ
const TELEFONE_ALVO = '69993649158'; // (69) 993649158
const HORARIO_CRON = '30 18 * * *'; // Todos os dias às 18:30h
const SITE_CLOUD_API = 'https://odontoweb-app.vercel.app';
const PORT = process.env.PORT || 3000;

let sock = null;
let qrCodeDataUrl = null;
let conexaoStatus = 'DESCONECTADO';

const UNIDADES_PRODUCAO = [
  { nome: 'Clínica Ariquemes', unidade: 'Ariquemes', proprietario: 'Fernando' },
  { nome: 'Clínica Porto Velho', unidade: 'Porto Velho', proprietario: 'Fernando' },
  { nome: 'Clínica Machadinho', unidade: 'Machadinho', proprietario: 'Fernando' },
  { nome: 'Clínica Cacoal', unidade: 'Cacoal', proprietario: 'Fernando' },
  { nome: 'Clínica Rolim de Moura', unidade: 'Rolim de Moura', proprietario: 'Bernardo' },
  { nome: 'Clínica Ouro Preto', unidade: 'Ouro Preto', proprietario: 'Bernardo' },
  { nome: 'Clínica Ji-Paraná', unidade: 'Ji-Paraná', proprietario: 'Bernardo' }
];

async function buscarLancamentosProducao() {
  try {
    const res = await axios.get(`${SITE_CLOUD_API}/api/sync`, { timeout: 5000 });
    if (res.data && res.data.producao) {
      return res.data.producao;
    }
  } catch (e) {
    // Se a nuvem não responder, calcula zerado com segurança
  }
  return [];
}

async function gerarRelatorioDiario() {
  const dataHojeIso = new Date().toISOString().split('T')[0];
  const dataHojeFormatada = new Date().toLocaleDateString('pt-BR');
  const itens = await buscarLancamentosProducao();

  let totalPacientesGeral = 0;
  let totalFaturamentoGeral = 0;

  let texto = `*📊 FINANÇAS PESSOAL - RESUMO DIÁRIO DE PRODUÇÃO DAS CLÍNICAS*\n`;
  texto += `📅 *Data:* ${dataHojeFormatada} | ⏰ *Horário:* 18:30h\n`;
  texto += `📱 *Destinatário:* (69) 993649158\n\n`;

  const resumoClinicas = UNIDADES_PRODUCAO.map((u) => {
    const lancamentos = itens.filter((i) => i.unidade === u.unidade);
    const lancamentosHoje = lancamentos.filter((i) => i.data === dataHojeIso);
    const alvo = lancamentosHoje.length > 0 ? lancamentosHoje : lancamentos;

    const count = alvo.length;
    const valor = alvo.reduce((acc, i) => acc + i.valor, 0);
    const ticket = count > 0 ? valor / count : 0;

    totalPacientesGeral += count;
    totalFaturamentoGeral += valor;

    return {
      nome: u.nome,
      unidade: u.unidade,
      owner: u.proprietario,
      count,
      valor,
      ticket
    };
  });

  texto += `*📈 BALANÇO CONSOLIDADO DO DIA (TABELA DE PRODUÇÃO):*\n`;
  texto += `• Total de Pacientes Atendidos: *${totalPacientesGeral} pacientes*\n`;
  texto += `• Faturamento Total do Dia: *R$ ${totalFaturamentoGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\n`;
  texto += `*🏥 DESEMPENHO INDIVIDUAL POR CLÍNICA:*\n`;

  resumoClinicas.forEach((c, idx) => {
    texto += `\n*${idx + 1}. ${c.nome.toUpperCase()} (${c.owner})*\n`;
    texto += `  👥 Pacientes Atendidos Hoje: *${c.count}*\n`;
    texto += `  💰 Faturamento do Dia: *R$ ${c.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n`;
    texto += `  🎯 Ticket Médio: *R$ ${c.ticket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/paciente*\n`;
    if (c.count === 0) {
      texto += `  ⚪ Status: _Zerado (Sem lançamentos hoje na tabela)_\n`;
    }
  });

  texto += `\n-----------------------------------\n`;
  texto += `✅ _Relatório automatizado 100% gratuito enviado por Robô Finanças Pessoal Platform._`;

  return texto;
}

// RESOLVE O JID CORRETO DO WHATSAPP NO BRASIL
async function obterJidWhatsApp(telefone) {
  const numLimpo = telefone.replace(/\D/g, '');
  const comPais = numLimpo.startsWith('55') ? numLimpo : `55${numLimpo}`;

  try {
    const res1 = await sock.onWhatsApp(comPais);
    if (res1 && res1.length > 0 && res1[0].exists) {
      return res1[0].jid;
    }

    if (comPais.length === 13) {
      const semNove = comPais.substring(0, 4) + comPais.substring(5);
      const res2 = await sock.onWhatsApp(semNove);
      if (res2 && res2.length > 0 && res2[0].exists) {
        return res2[0].jid;
      }
    }
  } catch (e) {}

  if (sock.user && sock.user.id) {
    return sock.user.id.split(':')[0] + '@s.whatsapp.net';
  }

  return `${comPais}@s.whatsapp.net`;
}

async function enviarRelatorioWhatsApp(motivo = 'Agendamento 18:30h') {
  if (!sock) {
    console.log('⚠️ WhatsApp ainda não está conectado.');
    return { status: 'error', message: 'WhatsApp não conectado' };
  }

  console.log(`\n🚀 [${new Date().toLocaleTimeString('pt-BR')}] Enviando relatório (${motivo})...`);

  try {
    const mensagem = await gerarRelatorioDiario();
    const targetJid = await obterJidWhatsApp(TELEFONE_ALVO);

    await sock.sendMessage(targetJid, { text: mensagem });

    if (sock.user && sock.user.id) {
      const meuJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      if (meuJid !== targetJid) {
        await sock.sendMessage(meuJid, { text: mensagem });
      }
    }

    console.log(`✅ RELATÓRIO ENTREGUE COM SUCESSO NO WHATSAPP! (${targetJid})\n`);
    return { status: 'success', message: 'Relatório entregue no WhatsApp com sucesso!' };
  } catch (err) {
    console.error('❌ Erro ao enviar mensagem no WhatsApp:', err.message);
    return { status: 'error', message: err.message };
  }
}

async function conectarWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      conexaoStatus = 'AGUARDANDO_QRCODE';
      qrcodeTerminal.generate(qr, { small: true });
      try {
        qrCodeDataUrl = await QRCode.toDataURL(qr);
      } catch (e) {}
    }

    if (connection === 'close') {
      conexaoStatus = 'DESCONECTADO';
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('🔌 Conexão encerrada. Reconectando...', shouldReconnect);
      if (shouldReconnect) {
        conectarWhatsApp();
      }
    } else if (connection === 'open') {
      conexaoStatus = 'CONECTADO';
      qrCodeDataUrl = null;
      console.log('\n=============================================================');
      console.log('🎉 WHATSAPP CONECTADO COM SUCESSO NA NUVEM!');
      console.log('⏰ Robô agendado para disparar o resumo todos os dias às 18:30h');
      console.log('📱 Destinatário: (69) 993649158');
      console.log('=============================================================\n');
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

// INICIA A CONEXÃO WHATSAPP
conectarWhatsApp();

// AGENDAMENTO AUTOMÁTICO CRON ÀS 18:30H TODOS OS DIAS
cron.schedule(HORARIO_CRON, () => {
  enviarRelatorioWhatsApp('Disparo Agendado 18:30h (Nuvem)');
});

// SERVIDOR WEB HTTP EXPLICITAMENTE PARA RENDER.COM / NUVEM
const app = express();

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Robô WhatsApp 100% Gratuito - Finanças Pessoal</title>
      <style>
        body { font-family: system-ui, sans-serif; background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
        .card { background: #1e293b; padding: 30px; border-radius: 24px; border: 1px solid #334155; max-width: 480px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
        h1 { font-size: 1.4rem; color: #34d399; margin-bottom: 8px; }
        p { color: #94a3b8; font-size: 0.85rem; line-height: 1.5; }
        .status { display: inline-block; padding: 6px 16px; border-radius: 9999px; font-weight: bold; font-size: 0.8rem; margin: 15px 0; }
        .conectado { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); }
        .desconectado { background: rgba(244, 63, 94, 0.2); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.4); }
        .qr-img { width: 240px; height: 240px; margin: 15px auto; border-radius: 16px; border: 4px solid #10b981; background: white; padding: 10px; }
        .btn { background: linear-gradient(135deg, #059669, #0d9488); color: white; border: none; padding: 12px 24px; font-weight: bold; font-size: 0.85rem; border-radius: 12px; cursor: pointer; text-decoration: none; display: inline-block; margin-top: 15px; }
        .btn:hover { opacity: 0.9; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>🤖 Robô WhatsApp Finanças Pessoal</h1>
        <p>Servidor 100% Gratuito & Vitalício rodando na Nuvem 24/7.</p>

        <div class="status ${conexaoStatus === 'CONECTADO' ? 'conectado' : 'desconectado'}">
          STATUS: ${conexaoStatus}
        </div>

        ${conexaoStatus === 'CONECTADO' ? `
          <p style="color: #34d399; font-weight: bold;">✅ Seu WhatsApp ((69) 993649158) está conectado!</p>
          <p>O robô enviará o relatório da produção das clínicas automaticamente todos os dias às 18:30h.</p>
          <a href="/testar" class="btn">🚀 Disparar Teste no WhatsApp Agora</a>
        ` : qrCodeDataUrl ? `
          <p>Escaneie o QR Code abaixo com o WhatsApp do seu celular ((69) 993649158):</p>
          <img src="${qrCodeDataUrl}" class="qr-img" alt="QR Code WhatsApp" />
          <p style="font-size: 0.75rem; color: #64748b;">Abra o WhatsApp ➔ Aparelhos Conectados ➔ Conectar um Aparelho</p>
        ` : `
          <p>Gerando QR Code... Recarregue a página em alguns segundos.</p>
        `}
      </div>
    </body>
    </html>
  `);
});

app.get('/testar', async (req, res) => {
  const result = await enviarRelatorioWhatsApp('Teste via Painel Web Render');
  res.send(`
    <script>
      alert("${result.message}");
      window.location.href = "/";
    </script>
  `);
});

app.listen(PORT, () => {
  console.log(`🌐 Servidor Web do Robô rodando na porta ${PORT}`);
});

// LEITURA DO TECLADO LOCAL
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (line) => {
  const input = line.trim().toLowerCase();
  if (input === 't' || input === 'test' || input === 'teste') {
    enviarRelatorioWhatsApp('Teste Manual do Teclado');
  }
});
