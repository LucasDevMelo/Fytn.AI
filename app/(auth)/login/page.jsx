// Adiciona o "use client" no topo para tornar este um Componente de Cliente
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DumbbellIcon, MailIcon, LockIcon } from '../../components/icons';

// Importe as funções de autenticação e o objeto auth do seu arquivo de configuração
import { auth } from '../../../lib/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';


export default function LoginPage() {
  // Estados para controlar os inputs do usuário e o feedback da UI
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Função para lidar com o login via E-mail e Senha
  const handleLogin = async (e) => {
    e.preventDefault(); // Previne o recarregamento da página
    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }
    setIsLoading(true); // Ativa o estado de carregamento
    setError(null); // Limpa erros anteriores
    try {
      // Tenta fazer o login com o Firebase
      await signInWithEmailAndPassword(auth, email, password);
      // Se o login for bem-sucedido, redireciona para o dashboard
      router.push('/dashboard');
    } catch (error) {
      // Se der erro, exibe uma mensagem amigável
      setError('E-mail ou senha inválidos. Por favor, tente novamente.');
      console.error("Erro no login:", error);
      setIsLoading(false); // Desativa o estado de carregamento
    }
  };
  
  // Função para lidar com o login via conta Google
  const handleGoogleLogin = async () => {
    setIsLoading(true); // Ativa o estado de carregamento
    setError(null); // Limpa erros anteriores
    const provider = new GoogleAuthProvider();
    try {
      // Abre o popup de login do Google
      await signInWithPopup(auth, provider);
      // Se o login for bem-sucedido, redireciona para o dashboard
      router.push('/dashboard');
    } catch (error) {
      // Se der erro, exibe uma mensagem amigável
      setError('Falha ao fazer login com o Google.');
      console.error("Erro no login com Google:", error);
      setIsLoading(false); // Desativa o estado de carregamento
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <Link href="/" className="flex justify-center items-center mb-4 cursor-pointer">
                    <DumbbellIcon />
                    <h1 className="text-3xl font-bold text-cyan-400">Fytn.AI</h1>
                </Link>
                <h2 className="text-2xl font-bold text-white">Bem-vindo de volta!</h2>
                <p className="text-gray-400">Insira seus dados para continuar.</p>
            </div>

            <div className="bg-gray-800 p-8 rounded-2xl shadow-lg">
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2"><MailIcon /></span>
                        <input 
                          type="email" 
                          placeholder="E-mail" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                          required
                        />
                    </div>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2"><LockIcon /></span>
                        <input 
                          type="password" 
                          placeholder="Senha" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                          required
                        />
                    </div>
                    {/* Exibe a mensagem de erro, se houver */}
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    
                    {/* Botão de login principal, que fica desabilitado durante o carregamento */}
                    <button type="submit" disabled={isLoading} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-cyan-800 disabled:cursor-not-allowed">
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                 <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-gray-800 px-2 text-gray-400">OU</span>
                    </div>
                </div>

                {/* Botão de login com Google */}
                <button onClick={handleGoogleLogin} disabled={isLoading} className="w-full flex items-center justify-center bg-white hover:bg-gray-200 text-black font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Entrar com Google
                </button>
                 
                 <div className="text-center mt-6">
                    <p className="text-gray-400">Não tem uma conta? <Link href="/signup" className="font-semibold text-cyan-400 hover:underline">Cadastre-se</Link></p>
                </div>
            </div>
        </div>
    </div>
  );
}
