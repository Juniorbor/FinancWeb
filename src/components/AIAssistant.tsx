import React, { useState } from 'react';
import type { MensagemIA, Paciente } from '../types';
import { Bot, Send, Sparkles, AlertCircle, UserCheck } from 'lucide-react';

interface AIAssistantProps {
  mensagens: MensagemIA[];
  onEnviarMensagem: (texto: string) => void;
  pacientes: Paciente[];
  darkMode?: boolean;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  mensagens,
  onEnviarMensagem,
  pacientes,
  darkMode
}) => {
  const [inputTexto, setInputTexto] = useState<string>('');
  const [pacienteSelecionado, setPacienteSelecionado] = useState<string>(pacientes[0]?.id || '');

  const sugestoes = [
    'Sugerir plano de tratamento para cárie profunda com sensibilidade.',
    'Quais as orientações pós-operatórias para cirurgia de implante?',
    'Quais os códigos TUSS mais comuns para profilaxia e endodontia?',
    'Como apresentar um orçamento odontológico claro ao paciente?'
  ];

  const handleEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTexto.trim()) return;
    onEnviarMensagem(inputTexto);
    setInputTexto('');
  };

  const handleSugestaoClick = (sugestao: string) => {
    onEnviarMensagem(sugestao);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className={`p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <Bot className="w-6 h-6 text-teal-500" /> OdontoIA — Assistente Diagnóstico Inteligente
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Suporte para planos de tratamento, análise de exames e dosagens de medicamentos.
          </p>
        </div>

        {/* Seleção de Paciente Contextual */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-400">Paciente em Análise:</span>
          <select
            value={pacienteSelecionado}
            onChange={(e) => setPacienteSelecionado(e.target.value)}
            className={`px-3 py-1.5 rounded-xl border font-bold text-xs focus:ring-2 focus:ring-teal-500 ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}
          >
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Warning Disclaimer Box */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-900 dark:text-amber-300">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Aviso Legal & Ético:</span>
          As respostas geradas pela Inteligência Artificial são estritamente informativas e auxiliares. A decisão clínica, diagnóstico final e prescrição são de responsabilidade exclusiva do cirurgião-dentista habilitado.
        </div>
      </div>

      {/* Area do Chat IA */}
      <div className={`rounded-2xl border shadow-sm flex flex-col h-[520px] overflow-hidden ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>

        {/* Histórico de Mensagens */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {mensagens.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-2xl ${msg.remetente === 'usuario' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold shrink-0 shadow ${
                  msg.remetente === 'usuario'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gradient-to-tr from-teal-500 to-cyan-500 text-slate-950'
                }`}
              >
                {msg.remetente === 'usuario' ? <UserCheck className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs space-y-2 leading-relaxed shadow-sm ${
                  msg.remetente === 'usuario'
                    ? 'bg-teal-600 text-white rounded-tr-none'
                    : darkMode
                    ? 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-tl-none'
                    : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-tl-none'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] opacity-70">
                  <span className="font-bold">{msg.remetente === 'usuario' ? 'Você' : 'OdontoIA Assistente'}</span>
                  <span>{msg.dataHora}</span>
                </div>
                <p className="whitespace-pre-wrap">{msg.texto}</p>

                {msg.sugestaoPlano && (
                  <div className="mt-2 pt-2 border-t border-white/20 text-[11px] font-semibold flex items-center gap-1.5 text-teal-300">
                    <Sparkles className="w-3.5 h-3.5" /> Sugestão de Plano Adicionada
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Sugestões Rápidas */}
        <div className={`p-3 border-t overflow-x-auto flex gap-2 scrollbar-none ${
          darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-100'
        }`}>
          {sugestoes.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleSugestaoClick(sug)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                darkMode
                  ? 'bg-slate-800 border-slate-700 text-teal-400 hover:bg-slate-700'
                  : 'bg-white border-slate-200 text-teal-700 hover:bg-teal-50'
              }`}
            >
              ✨ {sug}
            </button>
          ))}
        </div>

        {/* Form de Envio */}
        <form onSubmit={handleEnviar} className={`p-4 border-t flex gap-3 ${
          darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
        }`}>
          <input
            type="text"
            placeholder="Pergunte à OdontoIA sobre diagnósticos, procedimentos, laudos ou dosagens..."
            value={inputTexto}
            onChange={(e) => setInputTexto(e.target.value)}
            className={`flex-1 px-4 py-3 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          />

          <button
            type="submit"
            className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-5 rounded-xl font-bold text-xs shadow-lg shadow-teal-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            Enviar <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
