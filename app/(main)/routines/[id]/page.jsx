"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { db } from '../../../../lib/firebase';
import { doc, getDoc, collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import { ArrowLeftIcon, PlusCircleIcon, PlayIcon } from '../../../components/icons'; // 1. Adiciona PlayIcon
import AddExerciseModal from '../../../components/AddExerciseModal';

export default function RoutineDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter(); // Adiciona o router
  const id = params.id;
  const [routine, setRoutine] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user && id) {
      const routineRef = doc(db, 'users', user.uid, 'routines', id);
      getDoc(routineRef).then(docSnap => {
        if (docSnap.exists()) {
          setRoutine({ id: docSnap.id, ...docSnap.data() });
        }
      });

      const exercisesRef = collection(db, 'users', user.uid, 'routines', id, 'exercises');
      const q = query(exercisesRef, orderBy('createdAt', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const exercisesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExercises(exercisesList);
        setIsLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user, id]);

  const handleAddExercise = async (exerciseData) => {
    if (user && id) {
      try {
        const exercisesRef = collection(db, 'users', user.uid, 'routines', id, 'exercises');
        await addDoc(exercisesRef, { ...exerciseData, createdAt: new Date() });
        setIsModalOpen(false);
      } catch (error) {
        console.error("Erro ao adicionar exercício:", error);
      }
    }
  };

  if (isLoading) return <div className="p-8 text-white">Carregando...</div>;
  if (!routine) return <div className="p-8 text-white">Ficha não encontrada.</div>;

  return (
    <>
      <div className="p-4 md:p-8">
        <Link href="/dashboard" className="flex items-center text-cyan-400 hover:text-cyan-300 mb-6">
          <ArrowLeftIcon />
          <span>Voltar para o Dashboard</span>
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white">{routine.name}</h2>
            <p className="text-gray-400">{routine.description}</p>
          </div>
          {/* 2. Grupo de botões */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              <PlusCircleIcon />
              <span>Adicionar Exercício</span>
            </button>
            <button 
              onClick={() => router.push(`/workout/${id}`)}
              className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              <PlayIcon />
              <span>Iniciar Treino</span>
            </button>
          </div>
        </div>

        {/* Lista de Exercícios */}
        <div className="bg-gray-800 rounded-2xl p-6">
          {exercises.length > 0 ? (
            <ul className="space-y-4">
              {exercises.map(ex => (
                <li key={ex.id} className="flex justify-between items-center bg-gray-700 p-4 rounded-lg">
                  <span className="font-bold text-white">{ex.name}</span>
                  <span className="text-gray-300">{ex.sets} séries x {ex.reps} reps</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold text-white">Nenhum exercício adicionado.</h3>
              <p className="text-gray-400 mt-1">Clique em "Adicionar Exercício" para começar.</p>
            </div>
          )}
        </div>
      </div>
      <AddExerciseModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddExercise}
      />
    </>
  );
}
