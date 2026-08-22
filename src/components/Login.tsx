import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (usuario: { nome: string; email: string; funcao: string; cro: string }) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('juniorbor1986@gmail.com');
  const [senha, setSenha] = useState<string>('bitoninha1234');
  const [mostrarSenha, setMostrarSenha] = useState<boolean>(false);
  const [lembrar, setLembrar] = useState<boolean>(true);
  const [erro, setErro] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!email || !senha) {
      setErro('Por favor, informe o e-mail e a senha de acesso.');
      return;
    }

    // Validação estrita das credenciais do usuário
    if (email.trim().toLowerCase() === 'juniorbor1986@gmail.com' && senha === 'bitoninha1234') {
      onLoginSuccess({
        nome: 'Crenilto Junior',
        email: 'juniorbor1986@gmail.com',
        funcao: 'Administrador / Cirurgião-Dentista',
        cro: 'CRO-RO 147369'
      });
    } else {
      setErro('E-mail ou senha incorretos. Por favor, verifique suas credenciais.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header do Login com Logo Oficial */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-1 rounded-full bg-slate-800 border-2 border-teal-500/40 shadow-2xl shadow-teal-500/20">
            <img
              src="/logo.jpg"
              alt="OdontoWeb - Seu Portal de Saúde Bucal"
              className="w-24 h-24 object-contain rounded-full bg-white p-1"
            />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-1">
              Odonto<span className="text-teal-400">Web</span>
            </h1>
            <p className="text-xs font-bold text-teal-400 uppercase tracking-widest mt-0.5">
              Seu Portal de Saúde Bucal
            </p>
          </div>
        </div>

        {/* Card de Formulário */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 border border-slate-100">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-800">Acessar Sistema</h2>
            <p className="text-xs text-slate-500">Entre com seu e-mail e senha de acesso cadastrado.</p>
          </div>

          {erro && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-semibold">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">E-mail Cadastrado</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="juniorbor1986@gmail.com"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-10 py-2.5 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
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
                Manter conectado
              </label>

              <a
                href="#esqueceu"
                onClick={(e) => { e.preventDefault(); alert('Instruções de recuperação de senha enviadas para juniorbor1986@gmail.com.'); }}
                className="text-teal-600 hover:underline font-bold"
              >
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

          {/* Badge de Acesso Autorizado */}
          <div className="pt-3 border-t border-slate-100">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-800">Crenilto Junior</p>
                <p className="text-[11px] text-slate-500">juniorbor1986@gmail.com</p>
              </div>
              <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
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
