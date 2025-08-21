"use client";

import { CheckIcon } from '../../components/icons';

const Feature = ({ children }) => (
    <li className="flex items-center">
        <CheckIcon />
        <span>{children}</span>
    </li>
);

export default function SubscriptionPage() {
    return (
        <div className="p-4 md:p-8 text-white">
            <div className="text-center max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-white">Torne-se Premium</h1>
                <p className="text-lg text-cyan-400 mt-2">Desbloqueie todo o potencial do Evoluir AI e acelere seus resultados.</p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Plano Gratuito */}
                <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
                    <h2 className="text-2xl font-bold">Gratuito</h2>
                    <p className="text-gray-400 mt-2">O essencial para registrar e acompanhar seu progresso.</p>
                    <p className="text-4xl font-bold mt-6">R$0<span className="text-lg font-normal text-gray-400">/mês</span></p>
                    <ul className="space-y-4 mt-8 text-gray-300">
                        <Feature>Fichas de treino ilimitadas</Feature>
                        <Feature>Registro de treinos completo</Feature>
                        <Feature>Histórico de treinos</Feature>
                        <Feature>Gráficos de progresso básicos</Feature>
                    </ul>
                    <button disabled className="w-full mt-8 bg-gray-600 text-white font-bold py-3 rounded-lg cursor-not-allowed">
                        Seu Plano Atual
                    </button>
                </div>

                {/* Plano Premium */}
                <div className="bg-gray-800 p-8 rounded-2xl border-2 border-cyan-400 relative">
                    <div className="absolute top-0 -translate-y-1/2 bg-cyan-400 text-black font-bold text-sm py-1 px-3 rounded-full">MAIS POPULAR</div>
                    <h2 className="text-2xl font-bold text-cyan-400">Premium</h2>
                    <p className="text-gray-400 mt-2">Seu personal trainer com inteligência artificial.</p>
                    <p className="text-4xl font-bold mt-6">R$19,90<span className="text-lg font-normal text-gray-400">/mês</span></p>
                    <ul className="space-y-4 mt-8 text-gray-300">
                        <Feature>Tudo do plano Gratuito, e mais:</Feature>
                        <Feature><strong>Gerador de Treino com IA</strong></Feature>
                        <Feature><strong>Conselheiro de Carga Pós-Treino</strong></Feature>
                        <Feature><strong>Detector de Platô Automático</strong></Feature>
                        <Feature>Análises e insights avançados</Feature>
                    </ul>
                    <button className="w-full mt-8 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-lg transition duration-300">
                        Assinar Agora
                    </button>
                </div>
            </div>
        </div>
    );
}
