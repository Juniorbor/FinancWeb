const state = {
  token: localStorage.getItem("controle_token") || null,
  user: null,
  activeTab: "tomos_fernando", // 'tomos_fernando' | 'tracados_fernando' | 'tomos_bernardo' | 'tracados_bernardo' | 'dashboard' | 'seguranca'
  buscaLaudo: "",
  config: null,
  laudos: [],
  toast: null
};

function showToast(msg, type = "success") {
  state.toast = { msg, type };
  renderToast();
  setTimeout(() => {
    state.toast = null;
    renderToast();
  }, 3200);
}

function renderToast() {
  let el = document.getElementById("toast-container");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast-container";
    el.className = "fixed bottom-5 right-5 z-50";
    document.body.appendChild(el);
  }
  if (!state.toast) {
    el.innerHTML = "";
    return;
  }
  const bg = state.toast.type === "error" ? "bg-rose-600 border-rose-400" : "bg-emerald-600 border-emerald-400";
  el.innerHTML = `
    <div class="${bg} border text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium">
      <span>${state.toast.type === "error" ? "⚠️" : "✓"}</span>
      <span>${state.toast.msg}</span>
    </div>
  `;
}

function fmtMoeda(val) {
  const num = Number(val) || 0;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtNum(val) {
  const num = Number(val) || 0;
  return num.toLocaleString("pt-BR", { minimumFractionDigits: num % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 });
}

async function apiFetch(url, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.token) headers["Authorization"] = `Bearer ${state.token}`;
  const res = await fetch(url, { ...options, headers });
  const data = await res.json();
  if (res.status === 401 && url !== "/api/login") {
    state.token = null;
    localStorage.removeItem("controle_token");
    renderApp();
    throw new Error("Sessão expirada. Faça login novamente.");
  }
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "Erro na requisição");
  }
  return data;
}

function salvarCacheLocal() {
  try {
    const ts = Date.now();
    localStorage.setItem("controle_laudos_backup_v1", JSON.stringify(state.laudos));
    localStorage.setItem("controle_laudos_updated_at", String(ts));
  } catch (e) {}
}

async function initApp() {
  if (!state.token) {
    renderApp();
    return;
  }
  try {
    const res = await apiFetch("/api/data");
    state.user = res.user;
    state.config = res.config;

    const localRaw = localStorage.getItem("controle_laudos_backup_v1");
    const localTs = Number(localStorage.getItem("controle_laudos_updated_at")) || 0;
    const serverTs = Number(res.updatedAt) || 0;

    if (localRaw && localTs > serverTs) {
      try {
        const localLaudos = JSON.parse(localRaw);
        if (Array.isArray(localLaudos)) {
          state.laudos = localLaudos;
          await apiFetch("/api/sync", {
            method: "POST",
            body: JSON.stringify({ laudos: localLaudos, updatedAt: localTs })
          });
        } else {
          state.laudos = res.laudos;
        }
      } catch {
        state.laudos = res.laudos;
      }
    } else {
      state.laudos = res.laudos;
      if (serverTs > 0) {
        localStorage.setItem("controle_laudos_backup_v1", JSON.stringify(res.laudos));
        localStorage.setItem("controle_laudos_updated_at", String(serverTs));
      }
    }
    renderApp();
  } catch (e) {
    state.token = null;
    renderApp();
  }
}

function calcularResumoGrupo(responsavel, tipo) {
  const cidades = state.config.grupos[responsavel].cidades;
  const registros = state.laudos.filter(l => l.responsavel === responsavel && l.tipo === tipo);
  const porCidade = {};
  let totalGeral = 0;

  cidades.forEach(c => {
    const lista = registros.filter(r => r.cidade === c.id);
    const soma = lista.reduce((acc, item) => acc + (Number(item.valor) || 0), 0);
    const qtdUmDente = lista.filter(i => i.regiao === "UM DENTE").length;
    const qtdMaxEMand = lista.filter(i => i.regiao === "MAX E MAND").length;
    const qtdMaxOuMand = lista.filter(i => i.regiao === "MAX OU MAND").length;
    const qtdTracado = lista.filter(i => i.regiao === "TRAÇADO").length;

    porCidade[c.id] = {
      cidade: c,
      lista,
      soma,
      contagem: {
        "UM DENTE": { qtd: qtdUmDente, total: qtdUmDente * 10 },
        "MAX E MAND": { qtd: qtdMaxEMand, total: qtdMaxEMand * 20 },
        "MAX OU MAND": { qtd: qtdMaxOuMand, total: qtdMaxOuMand * 15 },
        "TRAÇADO": { qtd: qtdTracado, total: qtdTracado * 4 }
      }
    };
    totalGeral += soma;
  });

  return { cidades, porCidade, totalGeral, totalExames: registros.length };
}

function renderLogin() {
  return `
    <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div class="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-8">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xl">
            🦷
          </div>
          <div>
            <h1 class="text-xl font-bold text-white">Controle de Tomos & Traçados</h1>
            <p class="text-xs text-slate-400">Acesso Restrito • Protegido por Criptografia</p>
          </div>
        </div>

        <form id="login-form" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Usuário</label>
            <input type="text" id="login-user" value="admin" required
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Senha de Acesso</label>
            <input type="password" id="login-pass" value="123456" required
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 text-sm" />
          </div>
          <div id="login-error" class="hidden text-xs text-rose-400 bg-rose-950/50 border border-rose-800/60 rounded-lg p-2.5"></div>
          <button type="submit"
            class="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition text-sm">
            Entrar no Sistema Seguro
          </button>
        </form>

        <div class="mt-6 pt-5 border-t border-slate-800/80 text-xs text-slate-400 space-y-1">
          <p class="font-medium text-slate-300">Credenciais iniciais configuradas:</p>
          <p>Usuário: <code class="mono text-blue-400 bg-slate-950 px-1.5 py-0.5 rounded">admin</code> • Senha: <code class="mono text-blue-400 bg-slate-950 px-1.5 py-0.5 rounded">123456</code></p>
          <p class="text-slate-500">Você pode alterar a senha na aba "🔒 Senha & Segurança".</p>
        </div>
      </div>
    </div>
  `;
}

function renderTopBar() {
  const tf = calcularResumoGrupo("FERNANDO", "TOMO").totalGeral;
  const trf = calcularResumoGrupo("FERNANDO", "TRACADO").totalGeral;
  const tb = calcularResumoGrupo("BERNARDO", "TOMO").totalGeral;
  const trb = calcularResumoGrupo("BERNARDO", "TRACADO").totalGeral;

  const tabs = [
    { id: "tomos_fernando", label: "Controle Tomos - FERNANDO", badge: fmtMoeda(tf) },
    { id: "tracados_fernando", label: "Controle Traçados - FERNANDO", badge: fmtMoeda(trf) },
    { id: "tomos_bernardo", label: "Controle Tomos - BERNARDO", badge: fmtMoeda(tb) },
    { id: "tracados_bernardo", label: "Controle Traçados - BERNARDO", badge: fmtMoeda(trb) },
    { id: "dashboard", label: "Resumo Geral Consolidado", badge: fmtMoeda(tf + trf + tb + trb) },
    { id: "seguranca", label: "🔒 Senha & Segurança", badge: "Acesso" }
  ];

  return `
    <header class="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-30 backdrop-blur">
      <div class="max-w-[1850px] mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-600/30">
            🦷
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="font-bold text-base text-white tracking-tight">Sistema de Controle Web — Tomos & Traçados</h1>
              <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">Protegido</span>
            </div>
            <p class="text-xs text-slate-400">Fernando (Ariquemes, PVH, Machadinho, Cacoal) • Bernardo (Jipa, Ouro, Rolim)</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button onclick="exportarCSV()" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition flex items-center gap-1.5">
            <span>📥</span> Exportar Planilha (CSV)
          </button>
          <button onclick="fazerLogout()" class="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border border-rose-800/60 text-xs font-medium transition">
            Sair
          </button>
        </div>
      </div>

      <!-- Abas no estilo Planilha Profissional -->
      <div class="max-w-[1850px] mx-auto px-4 flex items-center gap-1.5 overflow-x-auto pb-2 pt-1">
        ${tabs.map(t => {
          const active = state.activeTab === t.id;
          return `
            <button onclick="mudarAba('${t.id}')"
              class="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 border ${
                active
                  ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20"
                  : "bg-slate-950/70 text-slate-400 border-slate-800 hover:bg-slate-800/80 hover:text-slate-200"
              }">
              <span>${t.label}</span>
              <span class="px-1.5 py-0.5 rounded text-xs mono ${
                active ? "bg-blue-700/80 text-blue-100" : "bg-slate-900 text-slate-300"
              }">${t.badge}</span>
            </button>
          `;
        }).join("")}
      </div>
    </header>
  `;
}

function renderPlanilhaLaudos(responsavel, tipo, tituloPlanilha) {
  const resumo = calcularResumoGrupo(responsavel, tipo);
  const isTomo = tipo === "TOMO";
  const opcoesRegiao = isTomo
    ? [
        { val: "UM DENTE", label: "UM DENTE (R$ 10,00)", preco: 10 },
        { val: "MAX OU MAND", label: "MAX OU MAND (R$ 15,00)", preco: 15 },
        { val: "MAX E MAND", label: "MAX E MAND (R$ 20,00)", preco: 20 }
      ]
    : [{ val: "TRAÇADO", label: "TRAÇADO (R$ 4,00)", preco: 4 }];

  const hoje = new Date().toISOString().slice(0, 10);
  const colsGrid = resumo.cidades.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";

  return `
    <div class="space-y-5">
      <!-- Cabeçalho + Barra de Lançamento Rápido -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div class="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-blue-400">${responsavel} • ${isTomo ? "TOMOGRAFIAS" : "TRAÇADOS"}</span>
            <h2 class="text-xl font-bold text-white flex items-center gap-3 mt-0.5">
              ${tituloPlanilha}
              <span class="text-sm font-normal text-slate-400">(${resumo.totalExames} exames lançados)</span>
            </h2>
          </div>

          <div class="flex items-center gap-4">
            <div class="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-right">
              <span class="text-xs text-slate-400 uppercase font-semibold block">TOTAL DA PLANILHA</span>
              <span class="text-2xl font-bold text-emerald-400 mono">${fmtMoeda(resumo.totalGeral)}</span>
            </div>
          </div>
        </div>

        <!-- Formulário de Adição Rápida pela Web -->
        <form onsubmit="adicionarLaudoRapido(event, '${responsavel}', '${tipo}')" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">Cidade / Unidade</label>
            <select id="novo-cidade" required class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-medium focus:border-blue-500 focus:outline-none">
              ${resumo.cidades.map(c => `<option value="${c.id}">${c.nome}</option>`).join("")}
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">ID (Código)</label>
            <input type="text" id="novo-codigo" placeholder="Ex: 72595" required
              class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs mono focus:border-blue-500 focus:outline-none" />
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">Data</label>
            <input type="date" id="novo-data" value="${hoje}" required
              class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs mono focus:border-blue-500 focus:outline-none" />
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">Nome do Paciente</label>
            <input type="text" id="novo-paciente" placeholder="NOME DO PACIENTE" required
              class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs uppercase focus:border-blue-500 focus:outline-none" />
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">Região & Valor Automático</label>
            <select id="novo-regiao" onchange="atualizarPrecoAutomatico(this)" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-medium focus:border-blue-500 focus:outline-none">
              ${opcoesRegiao.map(o => `<option value="${o.val}" data-preco="${o.preco}">${o.label}</option>`).join("")}
            </select>
          </div>

          <div class="flex gap-2">
            <div class="w-24">
              <label class="block text-xs font-medium text-slate-400 mb-1">Valor (R$)</label>
              <input type="number" step="0.01" id="novo-valor" value="${opcoesRegiao[0].preco}" required
                class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-bold text-xs mono focus:border-blue-500 focus:outline-none" />
            </div>
            <button type="submit" class="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-1.5 h-[34px] mt-auto">
              <span>+</span> Adicionar
            </button>
          </div>
        </form>
      </div>

      <!-- Busca rápida -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="relative w-full sm:w-80">
          <input type="text" placeholder="🔍 Filtrar por ID ou Nome do paciente..." value="${state.buscaLaudo}"
            oninput="filtrarBuscaLaudo(this.value)"
            class="w-full pl-3.5 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500" />
        </div>
        <div class="text-xs text-slate-400 flex items-center gap-4">
          <span>Tabela de Referência:</span>
          ${isTomo ? `
            <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Um Dente: <strong class="text-white">R$ 10</strong></span>
            <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Max ou Mand: <strong class="text-white">R$ 15</strong></span>
            <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Max e Mand: <strong class="text-white">R$ 20</strong></span>
          ` : `
            <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Traçado: <strong class="text-white">R$ 4</strong></span>
          `}
        </div>
      </div>

      <!-- Layout Principal Original: Colunas por Cidade Lado a Lado + Coluna Direita de Fechamento -->
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-3.5 items-start">
        <!-- Colunas das Cidades (10/12 da largura para dar mais espaço a cada quadrado) -->
        <div class="xl:col-span-10 grid grid-cols-1 md:grid-cols-2 ${colsGrid} gap-3.5">
          ${resumo.cidades.map(cid => {
            const dadosCid = resumo.porCidade[cid.id];
            const termo = state.buscaLaudo.trim().toLowerCase();
            const listaFiltrada = termo
              ? dadosCid.lista.filter(item => item.codigo.toLowerCase().includes(termo) || item.paciente.toLowerCase().includes(termo))
              : dadosCid.lista;

            return `
              <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-md">
                <!-- Topo da Cidade -->
                <div class="bg-slate-800/70 px-3 py-2.5 border-b border-slate-700/80 flex items-center justify-between">
                  <div>
                    <h3 class="font-bold text-sm text-white">${cid.nome}</h3>
                    <span class="text-[11px] text-slate-400">${dadosCid.lista.length} registros</span>
                  </div>
                  <div class="text-right">
                    <span class="text-[10px] text-slate-400 block uppercase">Subtotal</span>
                    <span class="text-sm font-bold text-emerald-400 mono">${fmtMoeda(dadosCid.soma)}</span>
                  </div>
                </div>

                <!-- Tabela da Cidade com Fonte Reduzida para Não Cortar Nomes -->
                <div class="overflow-x-auto flex-1">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 bg-slate-950/50">
                        <th class="py-2 px-2 font-semibold">ID</th>
                        <th class="py-2 px-1.5 font-semibold">Data</th>
                        <th class="py-2 px-2 font-semibold">Nome</th>
                        <th class="py-2 px-1.5 font-semibold">Região</th>
                        <th class="py-2 px-2 font-semibold text-right">R$</th>
                        <th class="py-2 px-1 text-center"></th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/60 text-[11px]">
                      ${listaFiltrada.length === 0 ? `
                        <tr>
                          <td colspan="6" class="py-8 text-center text-slate-500 text-xs">Nenhum exame lançado em ${cid.nome}</td>
                        </tr>
                      ` : listaFiltrada.map(item => {
                        const badgeColor =
                          item.regiao === "MAX E MAND"
                            ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                            : item.regiao === "MAX OU MAND"
                            ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                            : item.regiao === "UM DENTE"
                            ? "bg-slate-800 text-slate-300 border-slate-700"
                            : "bg-teal-500/15 text-teal-300 border-teal-500/30";
                        return `
                          <tr class="hover:bg-slate-800/40 transition group">
                            <td class="py-1.5 px-2 mono font-medium text-blue-400 whitespace-nowrap">${item.codigo}</td>
                            <td class="py-1.5 px-1.5 mono text-slate-400 whitespace-nowrap text-[10px]">${item.data.slice(5).replace("-", "/")}</td>
                            <td class="py-1.5 px-2 font-semibold text-slate-100 leading-tight break-words">${item.paciente}</td>
                            <td class="py-1.5 px-1.5 whitespace-nowrap">
                              <span class="px-1.5 py-0.5 rounded border text-[10px] font-medium ${badgeColor}">${item.regiao}</span>
                            </td>
                            <td class="py-1.5 px-2 mono font-bold text-right text-emerald-400 whitespace-nowrap">${fmtNum(item.valor)}</td>
                            <td class="py-1.5 px-1 text-center">
                              <button onclick="removerLaudo('${item.uid}')" title="Excluir registro"
                                class="opacity-60 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition px-1">
                                ✕
                              </button>
                            </td>
                          </tr>
                        `;
                      }).join("")}
                    </tbody>
                  </table>
                </div>

                <!-- Rodapé TOTAL da Cidade -->
                <div class="bg-slate-950/90 px-3 py-2.5 border-t border-slate-800 flex items-center justify-between text-xs font-bold">
                  <span class="text-slate-400 uppercase">TOTAL ${cid.id.toUpperCase()}</span>
                  <span class="text-emerald-400 mono text-sm">${fmtMoeda(dadosCid.soma)}</span>
                </div>
              </div>
            `;
          }).join("")}
        </div>

        <!-- Coluna Lateral de Fechamento (Idêntica à direita da planilha original) -->
        <div class="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-md space-y-3 sticky top-28">
          <div class="border-b border-slate-800 pb-2.5 flex items-center justify-between">
            <div>
              <h3 class="font-bold text-xs text-white uppercase">Resumo Lateral</h3>
              <p class="text-[11px] text-slate-400">Por região</p>
            </div>
            <span class="px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold mono text-xs">
              ${fmtMoeda(resumo.totalGeral)}
            </span>
          </div>

          <div class="space-y-2.5">
            ${resumo.cidades.map(cid => {
              const d = resumo.porCidade[cid.id];
              return `
                <div class="bg-slate-950/80 border border-slate-800/90 rounded-xl p-2.5 space-y-1">
                  <div class="flex items-center justify-between border-b border-slate-800/80 pb-1">
                    <span class="font-bold text-[11px] text-white uppercase">${cid.nome}</span>
                    <span class="font-bold text-[11px] text-emerald-400 mono">${fmtMoeda(d.soma)}</span>
                  </div>
                  ${isTomo ? `
                    <div class="flex justify-between text-[11px] text-slate-400">
                      <span><strong class="text-slate-200 mono">${d.contagem["UM DENTE"].qtd}</strong> × UM DENTE</span>
                      <span class="mono text-slate-300">${fmtMoeda(d.contagem["UM DENTE"].total)}</span>
                    </div>
                    <div class="flex justify-between text-[11px] text-slate-400">
                      <span><strong class="text-slate-200 mono">${d.contagem["MAX E MAND"].qtd}</strong> × MAX E MAND</span>
                      <span class="mono text-slate-300">${fmtMoeda(d.contagem["MAX E MAND"].total)}</span>
                    </div>
                    <div class="flex justify-between text-[11px] text-slate-400">
                      <span><strong class="text-slate-200 mono">${d.contagem["MAX OU MAND"].qtd}</strong> × MAX OU MAND</span>
                      <span class="mono text-slate-300">${fmtMoeda(d.contagem["MAX OU MAND"].total)}</span>
                    </div>
                  ` : `
                    <div class="flex justify-between text-[11px] text-slate-400">
                      <span><strong class="text-slate-200 mono">${d.contagem["TRAÇADO"].qtd}</strong> × TRAÇADO</span>
                      <span class="mono text-slate-300">${fmtMoeda(d.contagem["TRAÇADO"].total)}</span>
                    </div>
                  `}
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderDashboard() {
  const tf = calcularResumoGrupo("FERNANDO", "TOMO");
  const trf = calcularResumoGrupo("FERNANDO", "TRACADO");
  const tb = calcularResumoGrupo("BERNARDO", "TOMO");
  const trb = calcularResumoGrupo("BERNARDO", "TRACADO");

  const totalFernando = tf.totalGeral + trf.totalGeral;
  const totalBernardo = tb.totalGeral + trb.totalGeral;
  const totalGeralLaudos = totalFernando + totalBernardo;
  const totalExames = tf.totalExames + trf.totalExames + tb.totalExames + trb.totalExames;

  return `
    <div class="space-y-6">
      <!-- Cards Principais -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span class="text-xs font-bold uppercase text-slate-400">Total Geral Produção</span>
          <div class="text-3xl font-bold text-emerald-400 mono mt-1">${fmtMoeda(totalGeralLaudos)}</div>
          <p class="text-xs text-slate-400 mt-1">${totalExames} exames somados (Fernando + Bernardo)</p>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span class="text-xs font-bold uppercase text-blue-400">Total Fernando (4 Cidades)</span>
          <div class="text-3xl font-bold text-white mono mt-1">${fmtMoeda(totalFernando)}</div>
          <p class="text-xs text-slate-400 mt-1">Tomos: ${fmtMoeda(tf.totalGeral)} • Traçados: ${fmtMoeda(trf.totalGeral)}</p>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span class="text-xs font-bold uppercase text-teal-400">Total Bernardo (3 Cidades)</span>
          <div class="text-3xl font-bold text-white mono mt-1">${fmtMoeda(totalBernardo)}</div>
          <p class="text-xs text-slate-400 mt-1">Tomos: ${fmtMoeda(tb.totalGeral)} • Traçados: ${fmtMoeda(trb.totalGeral)}</p>
        </div>
      </div>

      <!-- Quadro Comparativo por Unidade -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 class="font-bold text-base text-white">Fechamento — FERNANDO</h3>
              <p class="text-xs text-slate-400">Ariquemes, Porto Velho (PVH), Machadinho e Cacoal</p>
            </div>
            <span class="text-lg font-bold text-emerald-400 mono">${fmtMoeda(totalFernando)}</span>
          </div>
          <table class="w-full text-xs text-left">
            <thead>
              <tr class="text-slate-400 border-b border-slate-800">
                <th class="py-2">Unidade</th>
                <th class="py-2 text-right">Tomos</th>
                <th class="py-2 text-right">Traçados</th>
                <th class="py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${tf.cidades.map(c => {
                const vTomo = tf.porCidade[c.id].soma;
                const vTrac = trf.porCidade[c.id].soma;
                return `
                  <tr>
                    <td class="py-2.5 font-semibold text-white">${c.nome}</td>
                    <td class="py-2.5 text-right mono text-slate-300">${fmtMoeda(vTomo)}</td>
                    <td class="py-2.5 text-right mono text-slate-300">${fmtMoeda(vTrac)}</td>
                    <td class="py-2.5 text-right mono font-bold text-emerald-400">${fmtMoeda(vTomo + vTrac)}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 class="font-bold text-base text-white">Fechamento — BERNARDO</h3>
              <p class="text-xs text-slate-400">Ji-Paraná (Jipa), Ouro Preto e Rolim de Moura</p>
            </div>
            <span class="text-lg font-bold text-emerald-400 mono">${fmtMoeda(totalBernardo)}</span>
          </div>
          <table class="w-full text-xs text-left">
            <thead>
              <tr class="text-slate-400 border-b border-slate-800">
                <th class="py-2">Unidade</th>
                <th class="py-2 text-right">Tomos</th>
                <th class="py-2 text-right">Traçados</th>
                <th class="py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${tb.cidades.map(c => {
                const vTomo = tb.porCidade[c.id].soma;
                const vTrac = trb.porCidade[c.id].soma;
                return `
                  <tr>
                    <td class="py-2.5 font-semibold text-white">${c.nome}</td>
                    <td class="py-2.5 text-right mono text-slate-300">${fmtMoeda(vTomo)}</td>
                    <td class="py-2.5 text-right mono text-slate-300">${fmtMoeda(vTrac)}</td>
                    <td class="py-2.5 text-right mono font-bold text-emerald-400">${fmtMoeda(vTomo + vTrac)}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderSeguranca() {
  return `
    <div class="max-w-lg mx-auto">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
        <div class="border-b border-slate-800 pb-3">
          <span class="text-xs font-bold uppercase text-blue-400">CONTROLE DE ACESSO</span>
          <h2 class="text-lg font-bold text-white mt-0.5">🔒 Alterar Senha do Sistema Web</h2>
          <p class="text-xs text-slate-400">Sua senha é criptografada com algoritmo <code class="mono">scrypt</code> + salt aleatório para proteger seus lançamentos.</p>
        </div>

        <form onsubmit="alterarSenhaSistema(event)" class="space-y-3">
          <div>
            <label class="block text-xs text-slate-400 mb-1">Senha Atual</label>
            <input type="password" id="sec-atual" required
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label class="block text-xs text-slate-400 mb-1">Nova Senha</label>
            <input type="password" id="sec-nova" required
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-blue-500" />
          </div>
          <button type="submit" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition">
            Atualizar Senha de Acesso
          </button>
        </form>
      </div>
    </div>
  `;
}

function renderApp() {
  const root = document.getElementById("app");
  if (!state.token || !state.config) {
    root.innerHTML = renderLogin();
    const form = document.getElementById("login-form");
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("login-user").value;
        const password = document.getElementById("login-pass").value;
        const errEl = document.getElementById("login-error");
        try {
          const res = await apiFetch("/api/login", {
            method: "POST",
            body: JSON.stringify({ username, password })
          });
          state.token = res.token;
          localStorage.setItem("controle_token", res.token);
          await initApp();
        } catch (err) {
          errEl.textContent = err.message;
          errEl.classList.remove("hidden");
        }
      });
    }
    return;
  }

  let mainContent = "";
  if (state.activeTab === "tomos_fernando") {
    mainContent = renderPlanilhaLaudos("FERNANDO", "TOMO", "Controle Tomos — FERNANDO");
  } else if (state.activeTab === "tracados_fernando") {
    mainContent = renderPlanilhaLaudos("FERNANDO", "TRACADO", "Controle Traçados — FERNANDO");
  } else if (state.activeTab === "tomos_bernardo") {
    mainContent = renderPlanilhaLaudos("BERNARDO", "TOMO", "Controle Tomos — BERNARDO");
  } else if (state.activeTab === "tracados_bernardo") {
    mainContent = renderPlanilhaLaudos("BERNARDO", "TRACADO", "Controle Traçados — BERNARDO");
  } else if (state.activeTab === "seguranca") {
    mainContent = renderSeguranca();
  } else {
    mainContent = renderDashboard();
  }

  root.innerHTML = `
    <div class="min-h-screen flex flex-col">
      ${renderTopBar()}
      <main class="max-w-[1850px] w-full mx-auto px-4 py-6 flex-1">
        ${mainContent}
      </main>
    </div>
  `;
}

// Ações Globais da Interface
window.mudarAba = (tab) => {
  state.activeTab = tab;
  renderApp();
};

window.filtrarBuscaLaudo = (val) => {
  state.buscaLaudo = val;
  renderApp();
  const input = document.querySelector('input[placeholder*="Filtrar por ID"]');
  if (input) {
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }
};

window.atualizarPrecoAutomatico = (selectEl) => {
  const opt = selectEl.options[selectEl.selectedIndex];
  const preco = opt.getAttribute("data-preco");
  const valInput = document.getElementById("novo-valor");
  if (valInput && preco) valInput.value = preco;
};

window.adicionarLaudoRapido = async (e, responsavel, tipo) => {
  e.preventDefault();
  const cidade = document.getElementById("novo-cidade").value;
  const codigo = document.getElementById("novo-codigo").value;
  const data = document.getElementById("novo-data").value;
  const paciente = document.getElementById("novo-paciente").value;
  const regiao = document.getElementById("novo-regiao").value;
  const valor = document.getElementById("novo-valor").value;

  try {
    const res = await apiFetch("/api/laudos", {
      method: "POST",
      body: JSON.stringify({ responsavel, tipo, cidade, codigo, data, paciente, regiao, valor })
    });
    state.laudos.push(res.laudo);
    salvarCacheLocal();
    showToast(`Exame #${res.laudo.codigo} (${res.laudo.paciente}) adicionado em ${cidade}!`);
    renderApp();
    const cidSelect = document.getElementById("novo-cidade");
    if (cidSelect) cidSelect.value = cidade;
    const codInput = document.getElementById("novo-codigo");
    if (codInput) codInput.focus();
  } catch (err) {
    showToast(err.message, "error");
  }
};

window.removerLaudo = async (uid) => {
  if (!confirm("Deseja remover este exame da planilha?")) return;
  try {
    await apiFetch(`/api/laudos/${uid}`, { method: "DELETE" });
    state.laudos = state.laudos.filter(l => l.uid !== uid);
    salvarCacheLocal();
    showToast("Exame removido com sucesso.");
    renderApp();
  } catch (err) {
    showToast(err.message, "error");
  }
};

window.alterarSenhaSistema = async (e) => {
  e.preventDefault();
  const senhaAtual = document.getElementById("sec-atual").value;
  const novaSenha = document.getElementById("sec-nova").value;
  try {
    await apiFetch("/api/change-password", {
      method: "POST",
      body: JSON.stringify({ senhaAtual, novaSenha })
    });
    showToast("Senha do sistema atualizada com sucesso!");
    document.getElementById("sec-atual").value = "";
    document.getElementById("sec-nova").value = "";
  } catch (err) {
    showToast(err.message, "error");
  }
};

window.exportarCSV = () => {
  const linhas = [["Responsavel", "Tipo", "Cidade", "ID", "Data", "Paciente", "Regiao", "Valor"]];
  state.laudos.forEach(l => {
    linhas.push([l.responsavel, l.tipo, l.cidade, l.codigo, l.data, l.paciente, l.regiao, l.valor]);
  });
  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + linhas.map(e => e.join(";")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `relatorio_laudos_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("Relatório CSV exportado para seu computador!");
};

window.fazerLogout = async () => {
  try {
    await apiFetch("/api/logout", { method: "POST" });
  } catch (e) {}
  state.token = null;
  localStorage.removeItem("controle_token");
  renderApp();
};

initApp();
