import React, { useState } from 'react';
import { Stethoscope, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (usuario: { nome: string; email: string; funcao: string; cro: string }) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('dra.patricia@odontoweb.com');
  const [senha, setSenha] = useState<string>('123456');
  const [mostrarSenha, setMostrarSenha] = useState<boolean>(false);
  const [lembrar, setLembrar] = useState<boolean>(true);
  const [erro, setErro] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) {
      setErro('Por favor, informe o e-mail e a senha de acesso.');
      return;
    }

    if (senha.length < 4) {
      setErro('A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    // Login simulado com sucesso
    setErro('');
    onLoginSuccess({
      nome: 'Dra. Patricia Medeiros',
      email: email,
      funcao: 'Cirurgiã-Dentista / Clínica Geral',
      cro: 'CRO-SP 123456'
    });
  };

  const handleQuickLogin = (nome: string, emailDemo: string, funcao: string, cro: string) => {
    setEmail(emailDemo);
    setSenha('123456');
    onLoginSuccess({
      nome,
      email: emailDemo,
      funcao,
      cro
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header do Login */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center bg-teal-500 p-3 rounded-2xl text-slate-950 font-bold shadow-lg shadow-teal-500/20">
            <Stethoscope className="w-8 h-8 text-slate-950" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-1">
            Odonto<span className="text-teal-400">Web</span>
          </h1>
          <p className="text-sm text-slate-400">Sistema de Gestão & Atendimento de Pacientes</p>
        </div>

        {/* Card de Formulário */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 border border-slate-100">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-800">Acessar Consultório</h2>
            <p className="text-xs text-slate-500">Entre com suas credenciais de profissional de saúde.</p>
          </div>

          {erro && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-semibold">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">E-mail Profissional</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@consultorio.com"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Senha de Acesso</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-10 py-2.5 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={lembrar}
                  onChange={(e) => setLembrar(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                Lembrar neste computador
              </label>

              <a href="#esqueceu" onClick={(e) => { e.preventDefault(); alert('Instruções enviadas para o e-mail cadastrado.'); }} className="text-teal-600 hover:underline font-bold">
                Esqueceu a senha?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              Entrar no Sistema <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Accounts */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Acesso Rápido de Teste (Demonstração)
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('Dra. Patricia Medeiros', 'dra.patricia@odontoweb.com', 'Clínica Geral & Ortodontia', 'CRO-SP 123456')}
                className="bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 p-2.5 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800">Dra. Patricia Medeiros</p>
                  <p className="text-[10px] text-slate-500">Clínica Geral • CRO-SP 123456</p>
                </div>
                <ShieldCheck className="w-4 h-4 text-teal-600" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('Dr. Lucas Ferreira', 'dr.lucas@odontoweb.com', 'Especialista em Endodontia', 'CRO-SP 654321')}
                className="bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 p-2.5 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800">Dr. Lucas Ferreira</p>
                  <p className="text-[10px] text-slate-500">Endodontia • CRO-SP 654321</p>
                </div>
                <ShieldCheck className="w-4 h-4 text-teal-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500">
          OdontoWeb &copy; {new Date().getFullYear()} • Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};
