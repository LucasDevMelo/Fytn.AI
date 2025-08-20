"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../lib/firebase';
import { collection, query, onSnapshot, addDoc } from 'firebase/firestore';
import { PlusCircleIcon } from '../../components/icons';
import CreateRoutineModal from '../../components/CreateRoutineModal';
import Link from 'next/link'; // Importa o componente Link

export default function DashboardPage() {
  const { user } = useAuth();
  const [routines, setRoutines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Efeito para buscar as fichas de treino do usuário em tempo real
  useEffect(() => {
    if (user) {
      const routinesRef = collection(db, 'users', user.uid, 'routines');
      const q = query(routinesRef);
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userRoutines = [];
        querySnapshot.forEach((doc) => {
          userRoutines.push({ id: doc.id, ...doc.data() });
        });
        setRoutines(userRoutines);
        setIsLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  // Função para adicionar uma nova ficha de treino
  const handleAddRoutine = async (routineData) => {
    if (user) {
      try {
        const routinesRef = collection(db, 'users', user.uid, 'routines');
        await addDoc(routinesRef, { ...routineData, createdAt: new Date() });
        setIsModalOpen(false);
      } catch (error) {
        console.error("Erro ao adicionar ficha de treino:", error);
      }
    }
  };

  return (
    <>
      <div className="p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">Minhas Fichas de Treino</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105"
          >
            <PlusCircleIcon />
            <span>Nova Ficha</span>
          </button>
        </div>

        {isLoading ? (
          <p className="text-gray-400">Carregando suas fichas...</p>
        ) : routines.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routines.map((routine) => (
              // ATUALIZAÇÃO: O card agora é um link clicável
              <Link href={`/routines/${routine.id}`} key={routine.id}>
                <div className="bg-gray-800 p-6 rounded-2xl shadow-lg h-full hover:bg-gray-700 transition-colors duration-300 cursor-pointer">
                  <h3 className="text-xl font-bold text-cyan-400 mb-2">{routine.name}</h3>
                  <p className="text-gray-400">{routine.description}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-800 rounded-2xl">
            <h3 className="text-xl font-semibold text-white">Nenhuma ficha de treino encontrada.</h3>
            <p className="text-gray-400 mt-2">Clique em "Nova Ficha" para criar sua primeira!</p>
          </div>
        )}
      </div>

      {/* Renderiza o Modal */}
      <CreateRoutineModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddRoutine}
      />
    </>
  );
}
