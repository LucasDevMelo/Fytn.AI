import Link from 'next/link';
import { DumbbellIcon } from './components/icons';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <header className="w-full max-w-6xl mx-auto flex justify-between items-center p-4 absolute top-0">
        <div className="flex items-center">
          <DumbbellIcon />
          <h1 className="text-2xl font-bold text-cyan-400">Fytn.AI</h1>
        </div>
        <nav>
          <Link href="/login" className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
            Entrar
          </Link>
        </nav>
      </header>

      <main className="text-center flex flex-col items-center">
        <h2 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
          Pare de <span className="text-cyan-400">adivinhar</span>. <br /> Comece a <span className="text-cyan-400">evoluir</span>.
        </h2>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-8">
          Sua academia, seus dados, seu progresso. Usamos Inteligência Artificial para ser o personal trainer que analisa seus treinos e garante sua evolução contínua.
        </p>
        <Link href="/signup" className="bg-cyan-500 hover:bg-cyan-600 text-white font-extrabold py-4 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105">
          Crie sua conta grátis
        </Link>
      </main>
       <footer className="absolute bottom-4 text-gray-500 text-sm">
        © Fytn.AI Todos os direitos reservados.
      </footer>
    </div>
  );
}
