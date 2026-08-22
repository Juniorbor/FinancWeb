import React, { useState } from 'react';
import type { AnamneseDetalhada } from '../types';
import {
  FileText,
  ShieldAlert,
  HeartPulse,
  Pill,
  Stethoscope,
  Save,
  CheckCircle2,
  AlertTriangle,
  Printer,
  UserCheck,
  Flame
} from 'lucide-react';

interface AnamneseViewProps {
  anamnese: AnamneseDetalhada;
  pacienteNome?: string;
  onSalvarAnamnese?: (novaAnamnese: AnamneseDetalhada) => void;
  darkMode?: boolean;
}

const DOENCAS_CHECKBOXES = [
  'Hipertensão Arterial',
  'Diabetes Mellitus',
  'Problemas Cardíacos / Sopro',
  'Uso de Marcapasso',
  'Asma / Bronquite',
  'Hepatite A/B/C',
  'HIV / Imunodeficiência',
  'Anemia / Hemofilia',
  'Epilepsia / Convulsões',
  'Ansiedade / Depressão',
  'Gastrite / Úlceras',
  'Doença Renal / Dialítica'
];

const ALERGIAS_CHECKBOXES = [
  'Penicilina / Amoxicilina',
  'Dipirona',
  'Nimesulida / Ibuprofeno',
  'Aspirina (AAS)',
  'Sulfa',
  'Látex / Luvas',
  'Anestésicos Locais',
  'Iodo / Contrastes'
];

const HABITOS_PARAFUNCIONAIS = [
  'Bruxismo Noturno (Ranger dentes)',
  'Apertamento Dental Diurno',
  'Roer Unhas (Onicofagia)',
  'Morder Objetos (Canetas/Lápis)',
  'Respiração Bucal / Noturna',
  'Mastigação Unilateral'
];

const FATORES_AGRAVANTES = [
  'Sensibilidade ao Frio/Gelado',
  'Sensibilidade ao Quente',
  'Dor ao Mastigar / Tocar',
  'Dor Espontânea / Noturna',
  'Sensibilidade a Doces/Açúcar'
];

export const AnamneseView: React.FC<AnamneseViewProps> = ({
  anamnese: initialAnamnese,
  pacienteNome,
  onSalvarAnamnese,
  darkMode
}) => {
  const [anamnese, setAnamnese] = useState<AnamneseDetalhada>({
    ...initialAnamnese,
    intensidadeDor: initialAnamnese.intensidadeDor ?? 0,
    fatoresAgravantes: initialAnamnese.fatoresAgravantes ?? ['Sensibilidade ao Frio/Gelado'],
    pressaoArterialBase: initialAnamnese.pressaoArterialBase ?? '120/80 mmHg',
    gestanteLactante: initialAnamnese.gestanteLactante ?? 'Não',
    usoBifosfonatos: initialAnamnese.usoBifosfonatos ?? false,
    sangramentoExcessivo: initialAnamnese.sangramentoExcessivo ?? false,
    habitosParafuncionais: initialAnamnese.habitosParafuncionais ?? ['Apertamento Dental Diurno'],
    frequenciaHigieneBucal: initialAnamnese.frequenciaHigieneBucal ?? '3x ao dia com Fio Dental',
    ultimoTratamentoOdontologico: initialAnamnese.ultimoTratamentoOdontologico ?? 'Há 6 meses',
    dentistaResponsavel: initialAnamnese.dentistaResponsavel ?? 'Dra. Patricia Medeiros'
  });

  const [salvo, setSalvo] = useState<boolean>(false);

  const toggleArrayItem = (key: 'doencasSistemicas' | 'alergias' | 'habitosParafuncionais' | 'fatoresAgravantes', item: string) => {
    const list = (anamnese[key] as string[]) || [];
    const updated = list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
    setAnamnese({ ...anamnese, [key]: updated });
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSalvarAnamnese) {
      onSalvarAnamnese({
        ...anamnese,
        dataUltimaAtualizacao: new Date().toLocaleDateString('pt-BR')
      });
    }
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
  };

  return (
    <form onSubmit={handleSalvar} className="space-y-6">
      
      {/* 1. TOP HEADER FICHA CLÍNICA DE ANAMNESE */}
      <div className={`p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-md border border-teal-500/20">
            Ficha Anamnéstica Odontológica Oficial (CFO / Ondoctor 2026)
          </span>
          <h2 className="text-xl font-extrabold flex items-center gap-2 mt-1">
            <FileText className="w-6 h-6 text-teal-500" /> Anamnese & Prontuário de Saúde Geral
          </h2>
          <p className="text-xs text-slate-400">
            {pacienteNome ? `Ficha médica e protocolo anamnéstico do paciente: ${pacienteNome}` : 'Histórico de saúde sistêmica, alergias, medicações e dor.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3.5 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer shadow"
          >
            <Printer className="w-4 h-4 text-teal-400" /> Imprimir Anamnese (PDF)
          </button>

          <button
            type="submit"
            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-teal-600/25 transition-all cursor-pointer"
          >
            {salvo ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-300" /> : <Save className="w-4.5 h-4.5" />}
            {salvo ? 'Ficha Anamnéstica Salva!' : 'Salvar Alterações da Anamnese'}
          </button>
        </div>
      </div>

      {salvo && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Ficha de Anamnese atualizada e registrada com sucesso no prontuário!
        </div>
      )}

      {/* ALERTAS MÉDICOS DE SEGURANÇA (BIFOSFONATOS, ANESTESIA, SANGRAMENTO) */}
      {(anamnese.usoBifosfonatos || anamnese.sensibilidadeAnestesia || anamnese.sangramentoExcessivo) && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border-2 border-rose-500 text-rose-200 space-y-2 text-xs shadow-xl">
          <h4 className="font-extrabold text-rose-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" /> ALERTAS CLÍNICOS CRÍTICOS PARA ESTE PACIENTE
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {anamnese.usoBifosfonatos && (
              <div className="bg-rose-900/40 p-2.5 rounded-xl border border-rose-700/60">
                <strong className="block text-rose-300">⚠️ USO DE BIFOSFONATOS:</strong>
                Risco alto de Osteonecrose Maxilar/Mandibular em procedimentos cirúrgicos.
              </div>
            )}
            {anamnese.sensibilidadeAnestesia && (
              <div className="bg-rose-900/40 p-2.5 rounded-xl border border-rose-700/60">
                <strong className="block text-rose-300">⚠️ ALERGIA A ANESTÉSICOS:</strong>
                Paciente relata reação prévia a anestésico local/vasoconritor.
              </div>
            )}
            {anamnese.sangramentoExcessivo && (
              <div className="bg-rose-900/40 p-2.5 rounded-xl border border-rose-700/60">
                <strong className="block text-rose-300">⚠️ SANGRAMENTO EXCESSIVO:</strong>
                Histórico de hemorragia prolongada em extrações/cirurgias.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. GRID DE SEÇÕES DA ANAMNESE COMPLETA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* SEÇÃO 1: QUEIXA PRINCIPAL & AVALIAÇÃO DA DOR (HDA) */}
        <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="border-b border-slate-800/40 pb-2">
            <h3 className="font-extrabold text-sm uppercase text-teal-400 tracking-wider flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-500" /> 1. Queixa Principal & Avaliação da Dor (HDA)
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">
              Queixa Principal do Paciente (Motivo da Consulta)
            </label>
            <textarea
              rows={3}
              value={anamnese.queixaPrincipal}
              onChange={(e) => setAnamnese({ ...anamnese, queixaPrincipal: e.target.value })}
              placeholder="Ex: Paciente relata dor intensa na região molar superior direita ao mastigar e beber gelado..."
              className={`w-full p-3 text-xs rounded-xl border focus:ring-2 focus:ring-teal-500 focus:outline-none ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>

          {/* Escala Analógica Visual de Dor (0 a 10) */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-500" /> Nível de Intensidade da Dor (EVA):
              </span>
              <span className="font-extrabold text-sm px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {anamnese.intensidadeDor || 0} / 10
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={anamnese.intensidadeDor || 0}
              onChange={(e) => setAnamnese({ ...anamnese, intensidadeDor: Number(e.target.value) })}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>0 (Sem Dor)</span>
              <span>5 (Moderada)</span>
              <span>10 (Insuportável)</span>
            </div>
          </div>

          {/* Fatores Agravantes */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">Fatores de Estímulo / Melhora e Piora:</label>
            <div className="grid grid-cols-2 gap-2">
              {FATORES_AGRAVANTES.map((fator) => {
                const checked = (anamnese.fatoresAgravantes || []).includes(fator);
                return (
                  <button
                    key={fator}
                    type="button"
                    onClick={() => toggleArrayItem('fatoresAgravantes', fator)}
                    className={`p-2 rounded-xl text-[11px] font-bold text-left border transition-all cursor-pointer ${
                      checked
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {checked ? '✓ ' : '+ '} {fator}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SEÇÃO 2: HISTÓRICO MÉDICO & DOENÇAS SISTÊMICAS */}
        <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="border-b border-slate-800/40 pb-2">
            <h3 className="font-extrabold text-sm uppercase text-teal-400 tracking-wider flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-teal-500" /> 2. Doenças Sistêmicas & Revisão Médica
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-400 mb-1">Pressão Arterial Base (PA)</label>
              <input
                type="text"
                placeholder="Ex: 120/80 mmHg"
                value={anamnese.pressaoArterialBase || ''}
                onChange={(e) => setAnamnese({ ...anamnese, pressaoArterialBase: e.target.value })}
                className={`w-full p-2.5 rounded-xl border ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">Gestante / Lactante?</label>
              <select
                value={anamnese.gestanteLactante || 'Não'}
                onChange={(e) => setAnamnese({ ...anamnese, gestanteLactante: e.target.value })}
                className={`w-full p-2.5 rounded-xl border ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value="Não">Não</option>
                <option value="Gestante 1º Trimestre">Gestante (1º Trimestre)</option>
                <option value="Gestante 2º Trimestre">Gestante (2º Trimestre)</option>
                <option value="Gestante 3º Trimestre">Gestante (3º Trimestre)</option>
                <option value="Lactante">Lactante</option>
              </select>
            </div>
          </div>

          {/* Checklist de Doenças Sistêmicas */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">Selecione as Condições Diagnosticadas:</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {DOENCAS_CHECKBOXES.map((doenca) => {
                const checked = (anamnese.doencasSistemicas || []).includes(doenca);
                return (
                  <button
                    key={doenca}
                    type="button"
                    onClick={() => toggleArrayItem('doencasSistemicas', doenca)}
                    className={`p-2 rounded-xl text-[11px] font-bold text-left border transition-all cursor-pointer ${
                      checked
                        ? 'bg-teal-600 text-white border-teal-400 shadow'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {checked ? '✓ ' : '+ '} {doenca}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alertas Médicos Especiais */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-rose-300">
              <input
                type="checkbox"
                checked={anamnese.usoBifosfonatos || false}
                onChange={(e) => setAnamnese({ ...anamnese, usoBifosfonatos: e.target.checked })}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
              Paciente faz uso de Bifosfonatos (Alendronato, Zoledronato, Prolia)
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-300">
              <input
                type="checkbox"
                checked={anamnese.sangramentoExcessivo || false}
                onChange={(e) => setAnamnese({ ...anamnese, sangramentoExcessivo: e.target.checked })}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              Histórico de Sangramento Prolongado / Dificuldade de Coagulação
            </label>
          </div>
        </div>

        {/* SEÇÃO 3: ALERGIAS & SENSIBILIDADES FARMACOLÓGICAS */}
        <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="border-b border-slate-800/40 pb-2">
            <h3 className="font-extrabold text-sm uppercase text-rose-400 tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" /> 3. Alergias & Sensibilidades Farmacológicas
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">Alergias Conocidas (Medicamentos & Materiais):</label>
            <div className="grid grid-cols-2 gap-2">
              {ALERGIAS_CHECKBOXES.map((alergia) => {
                const checked = (anamnese.alergias || []).includes(alergia);
                return (
                  <button
                    key={alergia}
                    type="button"
                    onClick={() => toggleArrayItem('alergias', alergia)}
                    className={`p-2 rounded-xl text-[11px] font-bold text-left border transition-all cursor-pointer ${
                      checked
                        ? 'bg-rose-600 text-white border-rose-400 shadow'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {checked ? '⚠️ ' : '+ '} {alergia}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-rose-950/40 p-3.5 rounded-2xl border border-rose-900/60 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-rose-300">
              <input
                type="checkbox"
                checked={anamnese.sensibilidadeAnestesia}
                onChange={(e) => setAnamnese({ ...anamnese, sensibilidadeAnestesia: e.target.checked })}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
              Paciente relata reação adversa prévia a Anestésicos Locais Odontológicos
            </label>
          </div>
        </div>

        {/* SEÇÃO 4: MEDICAMENTOS EM USO CONTÍNUO & HÁBITOS PARAFUNCIONAIS */}
        <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="border-b border-slate-800/40 pb-2">
            <h3 className="font-extrabold text-sm uppercase text-sky-400 tracking-wider flex items-center gap-2">
              <Pill className="w-4 h-4 text-sky-500" /> 4. Medicamentos Contínuos & Hábitos Parafuncionais
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">
              Medicamentos de Uso Contínuo (Nome e Posologia)
            </label>
            <input
              type="text"
              value={anamnese.medicamentosUso.join(', ')}
              onChange={(e) => setAnamnese({ ...anamnese, medicamentosUso: e.target.value.split(',').map((s) => s.trim()) })}
              placeholder="Ex: Losartana 50mg, Metformina 850mg, AAS 100mg..."
              className={`w-full p-2.5 text-xs rounded-xl border focus:ring-2 focus:ring-sky-500 ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">Hábitos Parafuncionais & Mastigatórios:</label>
            <div className="grid grid-cols-2 gap-2">
              {HABITOS_PARAFUNCIONAIS.map((habito) => {
                const checked = (anamnese.habitosParafuncionais || []).includes(habito);
                return (
                  <button
                    key={habito}
                    type="button"
                    onClick={() => toggleArrayItem('habitosParafuncionais', habito)}
                    className={`p-2 rounded-xl text-[11px] font-bold text-left border transition-all cursor-pointer ${
                      checked
                        ? 'bg-sky-600 text-white border-sky-400 shadow'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {checked ? '✓ ' : '+ '} {habito}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* 3. TERMO DE RESPONSABILIDADE & ASSINATURA DIGITAL */}
      <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
          <h3 className="font-extrabold text-sm uppercase text-teal-400 tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-teal-500" /> 5. Termo de Consentimento & Assinatura Digital
          </h3>
          <span className="text-xs text-slate-400 font-semibold">Última Atualização: {anamnese.dataUltimaAtualizacao}</span>
        </div>

        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
          <p className="leading-relaxed">
            Declaro para os devidos fins que as informações acima prestadas são a expressão da verdade, não tendo omitido nenhum fato relativo à minha saúde geral ou bucal. Autorizo a realização dos exames clínicos diagnósticos necessários ao meu tratamento odontológico.
          </p>
          <label className="flex items-center gap-2 cursor-pointer font-extrabold text-teal-400 pt-2">
            <input
              type="checkbox"
              checked={anamnese.termoConsentimentoAceito}
              onChange={(e) => setAnamnese({ ...anamnese, termoConsentimentoAceito: e.target.checked })}
              className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
            />
            Termo de Consentimento Esclarecido Odontológico Assinado Eletronicamente
          </label>
        </div>
      </div>

    </form>
  );
};
