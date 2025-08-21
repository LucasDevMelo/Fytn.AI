"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { DumbbellIcon, HistoryIcon, TrendingUpIcon, BotIcon, CrownIcon } from '../components/icons'; // Adiciona o CrownIcon
import Link from 'next/link';

export default function MainLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-xl">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 flex justify-between items-center shadow-md sticky top-0 z-10">
        <Link href="/dashboard" className="flex items-center">
          <DumbbellIcon />
          <h1 className="text-xl font-bold text-cyan-400">Fytn.AI</h1>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/planner" className={`flex items-center text-gray-300 hover:text-cyan-400 transition-colors ${pathname === '/planner' ? 'text-cyan-400' : ''}`}>
            <BotIcon />
            <span className="hidden sm:inline ml-2">Gerador IA</span>
          </Link>
          <Link href="/progress" className={`flex items-center text-gray-300 hover:text-cyan-400 transition-colors ${pathname === '/progress' ? 'text-cyan-400' : ''}`}>
            <TrendingUpIcon />
            <span className="hidden sm:inline ml-2">Progresso</span>
          </Link>
          <Link href="/history" className={`flex items-center text-gray-300 hover:text-cyan-400 transition-colors ${pathname === '/history' ? 'text-cyan-400' : ''}`}>
            <HistoryIcon />
            <span className="hidden sm:inline ml-2">Histórico</span>
          </Link>
          
          {/* Novo link para Assinatura */}
          <Link href="/subscription" className="flex items-center bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-3 rounded-lg transition duration-300 text-sm">
            <CrownIcon />
            <span className="hidden sm:inline ml-2">Seja Premium</span>
          </Link>

          <button onClick={logout} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">
            Sair
          </button>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
