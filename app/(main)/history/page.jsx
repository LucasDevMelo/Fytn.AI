"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import { ArrowLeftIcon } from '../../components/icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const historyRef = collection(db, 'users', user.uid, 'workoutHistory');
      const q = query(historyRef, orderBy('completedAt', 'desc')); // Ordena do mais recente para o mais antigo

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const historyList = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Converte o timestamp do Firebase para um objeto Date do JS
            completedAt: data.completedAt ? data.completedAt.toDate() : new Date()
          };
        });
        setHistory(historyList);
        setIsLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user]);

  return (
    <div className="p-4 md:p-8">
      <Link href="/dashboard" className="flex items-center text-cyan-400 hover:text-cyan-300 mb-6">
        <ArrowLeftIcon />
        <span>Voltar para o Dashboard</span>
      </Link>
      <h2 className="text-3xl font-bold text-white mb-6">Histórico de Treinos</h2>

      <div className="bg-gray-800 rounded-2xl p-6">
        {isLoading ? (
          <p className="text-gray-400">Carregando histórico...</p>
        ) : history.length > 0 ? (
          <ul className="space-y-4">
            {history.map(workout => (
              <li key={workout.id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center hover:bg-gray-600 transition-colors">
                <div>
                  <p className="font-bold text-white text-lg">{workout.routineName}</p>
                  <p className="text-gray-400 text-sm">
                    {format(workout.completedAt, "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <button className="text-cyan-400 font-semibold hover:underline">
                  Ver Detalhes
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold text-white">Nenhum treino concluído ainda.</h3>
            <p className="text-gray-400 mt-1">Vá para o dashboard, inicie um treino e ele aparecerá aqui!</p>
          </div>
        )}
      </div>
    </div>
  );
}
