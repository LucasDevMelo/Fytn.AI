"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { db } from '../../../../lib/firebase';
import { doc, getDoc, collection, getDocs, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowLeftIcon, CheckCircleIcon, ClockIcon } from '../../../components/icons';

// Componente para o Cronômetro de Descanso
const RestTimer = ({ onFinish }) => {
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    if (seconds > 0) {
      const timerId = setTimeout(() => setSeconds(seconds - 1), 1000);
      return () => clearTimeout(timerId);
    } else {
      onFinish();
    }
  }, [seconds, onFinish]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-cyan-500 text-white p-4 flex justify-center items-center z-50">
      <ClockIcon />
      <span className="font-bold text-lg">Descanso: {seconds}s</span>
    </div>
  );
};

export default function WorkoutPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const routineId = params.routineId;

  const [routine, setRoutine] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [workoutLog, setWorkoutLog] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => {
    if (user && routineId) {
      const fetchRoutineData = async () => {
        const routineRef = doc(db, 'users', user.uid, 'routines', routineId);
        const routineSnap = await getDoc(routineRef);

        if (routineSnap.exists()) {
          setRoutine({ id: routineSnap.id, ...routineSnap.data() });
          const exercisesRef = collection(db, 'users', user.uid, 'routines', routineId, 'exercises');
          const q = query(exercisesRef, orderBy('createdAt', 'asc'));
          const exercisesSnap = await getDocs(q);
          const exercisesList = exercisesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setExercises(exercisesList);

          // Inicializa o log de treino
          const initialLog = {};
          exercisesList.forEach(ex => {
            initialLog[ex.id] = Array.from({ length: Number(ex.sets) }, () => ({ weight: '', reps: '', done: false }));
          });
          setWorkoutLog(initialLog);
        }
        setIsLoading(false);
      };
      fetchRoutineData();
    }
  }, [user, routineId]);

  const handleLogSet = (exerciseId, setIndex) => {
    setWorkoutLog(prevLog => {
      const newLog = { ...prevLog };
      newLog[exerciseId][setIndex].done = true;
      return newLog;
    });
    setShowTimer(true);
  };

  const handleInputChange = (exerciseId, setIndex, field, value) => {
    setWorkoutLog(prevLog => {
      const newLog = { ...prevLog };
      newLog[exerciseId][setIndex][field] = value;
      return newLog;
    });
  };

  const finishWorkout = async () => {
    if(!user) return;
    
    try {
      // Salva o treino no histórico e pega a referência do novo documento
      const docRef = await addDoc(collection(db, 'users', user.uid, 'workoutHistory'), {
        routineId,
        routineName: routine.name,
        completedAt: serverTimestamp(),
        log: workoutLog
      });
      
      // Redireciona para a página de resumo com o ID do treino recém-criado
      router.push(`/summary/${docRef.id}`);

    } catch (error) {
      console.error("Erro ao salvar o treino:", error);
      alert('Ocorreu um erro ao salvar seu treino.');
    }
  };

  if (isLoading) return <div className="p-8 text-white">Carregando treino...</div>;

  return (
    <>
      <div className="p-4 md:p-8 pb-20"> {/* Padding no final para o timer não cobrir */}
        <button onClick={() => router.back()} className="flex items-center text-cyan-400 hover:text-cyan-300 mb-6">
          <ArrowLeftIcon />
          <span>Voltar</span>
        </button>
        <h2 className="text-3xl font-bold text-white mb-6">{routine?.name}</h2>

        <div className="space-y-6">
          {exercises.map(exercise => (
            <div key={exercise.id} className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">{exercise.name} <span className="text-base text-gray-400 font-normal">- {exercise.sets}x{exercise.reps}</span></h3>
              <div className="space-y-3">
                {workoutLog[exercise.id]?.map((set, index) => (
                  <div key={index} className={`flex items-center space-x-4 p-2 rounded-lg ${set.done ? 'bg-green-900/50' : ''}`}>
                    <span className="font-bold text-white w-8">{index + 1}</span>
                    <input
                      type="number"
                      placeholder="Peso (kg)"
                      className="w-full bg-gray-700 text-white rounded-lg p-2 border-0 focus:ring-2 focus:ring-cyan-500"
                      value={set.weight}
                      onChange={(e) => handleInputChange(exercise.id, index, 'weight', e.target.value)}
                      disabled={set.done}
                    />
                    <input
                      type="number"
                      placeholder="Reps"
                      className="w-full bg-gray-700 text-white rounded-lg p-2 border-0 focus:ring-2 focus:ring-cyan-500"
                      value={set.reps}
                      onChange={(e) => handleInputChange(exercise.id, index, 'reps', e.target.value)}
                      disabled={set.done}
                    />
                    <button onClick={() => handleLogSet(exercise.id, index)} disabled={set.done} className="disabled:opacity-50">
                      <CheckCircleIcon isDone={set.done} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={finishWorkout} className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition duration-300">
          Finalizar Treino
        </button>
      </div>
      {showTimer && <RestTimer onFinish={() => setShowTimer(false)} />}
    </>
  );
}
