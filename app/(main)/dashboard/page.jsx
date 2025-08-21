"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../lib/firebase';
import { collection, query, onSnapshot, addDoc, getDocs, orderBy } from 'firebase/firestore';
import { PlusCircleIcon } from '../../components/icons';
import CreateRoutineModal from '../../components/CreateRoutineModal';
import PlateauDetector from '../../components/PlateauDetector'; // 1. Importa o novo componente
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [routines, setRoutines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 2. Estados para o detector de platô
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [exerciseMap, setExerciseMap] = useState({});

  useEffect(() => {
    if (user) {
      // Busca Fichas de Treino
      const routinesRef = collection(db, 'users', user.uid, 'routines');
      const qRoutines = query(routinesRef);
      const unsubscribeRoutines = onSnapshot(qRoutines, (snapshot) => {
        setRoutines(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      // 3. Busca dados para o Detector de Platô
      const fetchDataForPlateau = async () => {
        const routinesSnap = await getDocs(routinesRef);
        const tempExerciseMap = {};
        for (const routineDoc of routinesSnap.docs) {
          const exercisesRef = collection(routineDoc.ref, 'exercises');
          const exercisesSnap = await getDocs(exercisesRef);
          exercisesSnap.forEach(exDoc => { tempExerciseMap[exDoc.id] = exDoc.data().name; });
        }
        setExerciseMap(tempExerciseMap);

        const historyRef = collection(db, 'users', user.uid, 'workoutHistory');
        const qHistory = query(historyRef, orderBy('completedAt', 'asc'));
        const unsubscribeHistory = onSnapshot(qHistory, (snapshot) => {
          setWorkoutHistory(snapshot.docs.map(doc => ({ ...doc.data() })));
        });
        
        setIsLoading(false);
        return unsubscribeHistory;
      };
      
      const unsubscribeHistoryPromise = fetchDataForPlateau();

      return async () => {
        unsubscribeRoutines();
        const unsubscribeHistory = await unsubscribeHistoryPromise;
        if (unsubscribeHistory) unsubscribeHistory();
      };
    }
  }, [user]);

  const handleAddRoutine = async (routineData) => {
    if (user) {
      const routinesRef = collection(db, 'users', user.uid, 'routines');
      await addDoc(routinesRef, { ...routineData, createdAt: new Date() });
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <div className="p-4 md:p-8">
        {/* 4. Renderiza o Detector de Platô */}
        <PlateauDetector history={workoutHistory} exerciseMap={exerciseMap} />
      
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">Minhas Fichas de Treino</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg"
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
              <Link href={`/routines/${routine.id}`} key={routine.id}>
                <div className="bg-gray-800 p-6 rounded-2xl h-full hover:bg-gray-700 transition-colors cursor-pointer">
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

      <CreateRoutineModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddRoutine}
      />
    </>
  );
}
