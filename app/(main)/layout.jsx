"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { DumbbellIcon, HistoryIcon, TrendingUpIcon } from '../components/icons'; // 1. Adiciona o TrendingUpIcon
import Link from 'next/link';

export default function MainLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Hook para saber a rota atual

  useEffect(() => {
    // Se não estiver carregando e não houver usuário, redireciona para o login
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Se estiver carregando ou não houver usuário, mostra um loader
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-xl">Carregando...</p>
      </div>
    );
  }

  // Se o usuário estiver logado, mostra o layout do dashboard
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 flex justify-between items-center shadow-md sticky top-0 z-10">
        {/* Logo agora é um link para o dashboard */}
        <Link href="/dashboard" className="flex items-center">
          <DumbbellIcon />
          <h1 className="text-xl font-bold text-cyan-400">Evoluir AI</h1>
        </Link>
        <nav className="flex items-center gap-4">
          {/* 2. Novo link para a página de Progresso */}
          <Link href="/progress" className={`flex items-center text-gray-300 hover:text-cyan-400 transition-colors ${pathname === '/progress' ? 'text-cyan-400' : ''}`}>
            <TrendingUpIcon />
            <span className="hidden sm:inline ml-2">Progresso</span>
          </Link>

          <Link href="/history" className={`flex items-center text-gray-300 hover:text-cyan-400 transition-colors ${pathname === '/history' ? 'text-cyan-400' : ''}`}>
            <HistoryIcon />
            <span className="hidden sm:inline ml-2">Histórico</span>
          </Link>
          
          {/* Botão de Sair */}
          <button onClick={logout} className="bg-gray-700 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
            Sair
          </button>
        </nav>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}
