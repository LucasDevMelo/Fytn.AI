"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../lib/firebase';
import { collection, query, onSnapshot, addDoc, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { PlusCircleIcon, CalendarIcon, TargetIcon, PlayIcon, TrendingUpIcon as StatsIcon } from '../../components/icons';
import CreateRoutineModal from '../../components/CreateRoutineModal';
import PlateauDetector from '../../components/PlateauDetector';
import Link from 'next/link';
import { isThisWeek } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuth();
  const [userName, setUserName] = useState('');
  const [routines, setRoutines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [exerciseMap, setExerciseMap] = useState({});
  const [stats, setStats] = useState({ workoutsThisWeek: 0, volumeThisWeek: 0 });
  const [nextRoutine, setNextRoutine] = useState(null);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) setUserName(docSnap.data().name.split(' ')[0]);
      });

      const routinesRef = collection(db, 'users', user.uid, 'routines');
      const qRoutines = query(routinesRef, orderBy('createdAt', 'asc'));
      const unsubscribeRoutines = onSnapshot(qRoutines, (snapshot) => {
        const routinesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRoutines(routinesData);
      });

      const historyRef = collection(db, 'users', user.uid, 'workoutHistory');
      const qHistory = query(historyRef, orderBy('completedAt', 'asc'));
      const unsubscribeHistory = onSnapshot(qHistory, (snapshot) => {
        const historyData = snapshot.docs.map(doc => ({ ...doc.data() }));
        setWorkoutHistory(historyData);
        
        // Calcular Estatísticas
        const weeklyWorkouts = historyData.filter(w => w.completedAt && isThisWeek(w.completedAt.toDate(), { weekStartsOn: 1 }));
        let totalVolume = 0;
        weeklyWorkouts.forEach(workout => {
            if (workout.log) {
                Object.values(workout.log).forEach(exerciseSets => {
                    exerciseSets.forEach(set => {
                        if (set.done && set.weight && set.reps) {
                            totalVolume += parseFloat(set.weight) * parseInt(set.reps);
                        }
                    });
                });
            }
        });
        setStats({ workoutsThisWeek: weeklyWorkouts.length, volumeThisWeek: totalVolume });

        // Determinar Próximo Treino
        if (routines.length > 0 && historyData.length > 0) {
            const lastWorkoutRoutineId = historyData[historyData.length - 1].routineId;
            const lastRoutineIndex = routines.findIndex(r => r.id === lastWorkoutRoutineId);
            const nextRoutineIndex = (lastRoutineIndex + 1) % routines.length;
            setNextRoutine(routines[nextRoutineIndex]);
        } else if (routines.length > 0) {
            setNextRoutine(routines[0]);
        }
      });

      const fetchDataForPlateau = async () => {
        const routinesSnap = await getDocs(routinesRef);
        const tempExerciseMap = {};
        for (const routineDoc of routinesSnap.docs) {
          const exercisesRef = collection(routineDoc.ref, 'exercises');
          const exercisesSnap = await getDocs(exercisesRef);
          exercisesSnap.forEach(exDoc => { tempExerciseMap[exDoc.id] = exDoc.data().name; });
        }
        setExerciseMap(tempExerciseMap);
        setIsLoading(false);
      };
      
      fetchDataForPlateau();

      return () => {
        unsubscribeRoutines();
        unsubscribeHistory();
      };
    }
  }, [user, routines.length]); // Re-executa se o número de rotinas mudar

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
        <div className="mb-8">
            <h2 className="text-3xl font-bold text-white">Olá, {userName || 'Guerreiro(a)'}!</h2>
            <p className="text-gray-400">Pronto para evoluir hoje?</p>
        </div>

        <PlateauDetector history={workoutHistory} exerciseMap={exerciseMap} />
        
        {/* Nova Secção de Ação Rápida e Estatísticas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-8">
            {/* Ação Rápida */}
            <div className="lg:col-span-2 bg-gradient-to-br from-cyan-500 to-blue-600 p-8 rounded-2xl flex flex-col justify-between shadow-lg">
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-200">Ação Rápida</h3>
                    <p className="text-3xl font-bold text-white mt-2">Próximo Treino: {nextRoutine ? nextRoutine.name : 'N/A'}</p>
                    <p className="text-cyan-100 mt-1">{nextRoutine ? nextRoutine.description : 'Crie uma ficha para começar'}</p>
                </div>
                {nextRoutine && (
                    <Link href={`/workout/${nextRoutine.id}`} className="mt-6 flex items-center justify-center bg-white hover:bg-gray-200 text-blue-600 font-bold py-3 px-4 rounded-lg transition duration-300">
                        <PlayIcon />
                        <span>Iniciar Treino Agora</span>
                    </Link>
                )}
            </div>
            {/* Estatísticas */}
            <div className="space-y-4">
                <div className="bg-gray-800 p-6 rounded-2xl flex items-center gap-4">
                    <CalendarIcon />
                    <div>
                        <p className="text-gray-400 text-sm">Treinos na Semana</p>
                        <p className="text-2xl font-bold text-white">{stats.workoutsThisWeek}</p>
                    </div>
                </div>
                <div className="bg-gray-800 p-6 rounded-2xl flex items-center gap-4">
                    <StatsIcon />
                    <div>
                        <p className="text-gray-400 text-sm">Volume (Semana)</p>
                        <p className="text-2xl font-bold text-white">{stats.volumeThisWeek.toLocaleString('pt-BR')} kg</p>
                    </div>
                </div>
            </div>
        </div>
      
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Minhas Fichas de Treino</h2>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">
            <PlusCircleIcon />
            <span>Nova Ficha</span>
          </button>
        </div>

        {isLoading ? <p className="text-gray-400">A carregar...</p> : routines.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routines.map((routine) => (
              <Link href={`/routines/${routine.id}`} key={routine.id}>
                <div className="bg-gray-800 p-6 rounded-2xl h-full hover:bg-gray-700 transition-colors cursor-pointer">
                  <h3 className="text-lg font-bold text-cyan-400 mb-2">{routine.name}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2">{routine.description}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-800 rounded-2xl">
            <h3 className="text-xl font-semibold text-white">Nenhuma ficha de treino encontrada.</h3>
            <p className="text-gray-400 mt-2">Clique em "Nova Ficha" ou use o Gerador IA para criar a sua primeira!</p>
          </div>
        )}
      </div>

      <CreateRoutineModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddRoutine} />
    </>
  );
}
