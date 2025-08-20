"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../lib/firebase';
import { collection, query, onSnapshot, orderBy, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { ArrowLeftIcon } from '../../components/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function ProgressPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uniqueExercises, setUniqueExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [exerciseMap, setExerciseMap] = useState({}); // Mapeia ID do exercício para o nome

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setIsLoading(true);

        // 1. Busca todas as rotinas e exercícios para criar um mapa de nomes
        const routinesRef = collection(db, 'users', user.uid, 'routines');
        const routinesSnap = await getDocs(routinesRef);
        const tempExerciseMap = {};
        for (const routineDoc of routinesSnap.docs) {
          const exercisesRef = collection(routineDoc.ref, 'exercises');
          const exercisesSnap = await getDocs(exercisesRef);
          exercisesSnap.forEach(exerciseDoc => {
            tempExerciseMap[exerciseDoc.id] = exerciseDoc.data().name;
          });
        }
        setExerciseMap(tempExerciseMap);

        // 2. Ouve o histórico de treinos em tempo real
        const historyRef = collection(db, 'users', user.uid, 'workoutHistory');
        const q = query(historyRef, orderBy('completedAt', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const historyList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setHistory(historyList);

          // 3. Extrai exercícios únicos do histórico usando o mapa de nomes
          const exerciseIds = new Set();
          historyList.forEach(workout => {
            if (workout.log) {
              Object.keys(workout.log).forEach(exerciseId => {
                exerciseIds.add(exerciseId);
              });
            }
          });
          
          const uniqueExs = Array.from(exerciseIds).map(id => ({
            id: id,
            name: tempExerciseMap[id] || 'Exercício Antigo'
          })).filter(ex => ex.name !== 'Exercício Antigo'); // Filtra exercícios que podem ter sido deletados

          setUniqueExercises(uniqueExs);
          setIsLoading(false);
        });

        return unsubscribe;
      };
      
      fetchData();
    }
  }, [user]);
  
  // Efeito para gerar dados do gráfico quando um exercício é selecionado
  useEffect(() => {
    if (selectedExercise && history.length > 0) {
      const data = history
        .map(workout => {
          let maxWeight = 0;
          // Verifica se o exercício selecionado existe no log deste treino
          if (workout.log && workout.log[selectedExercise.id]) {
            const exerciseSets = workout.log[selectedExercise.id];
            // Encontra o maior peso levantado nas séries para este exercício
            exerciseSets.forEach(set => {
              const weight = parseFloat(set.weight);
              if (weight > maxWeight) {
                maxWeight = weight;
              }
            });
          }
          
          return {
            date: format(workout.completedAt.toDate(), 'dd/MM/yy'),
            peso: maxWeight,
          };
        })
        .filter(item => item.peso > 0); // Inclui apenas treinos onde o exercício foi feito

      setChartData(data);
    }
  }, [selectedExercise, history]);


  return (
    <div className="p-4 md:p-8">
      <Link href="/dashboard" className="flex items-center text-cyan-400 hover:text-cyan-300 mb-6">
        <ArrowLeftIcon />
        <span>Voltar para o Dashboard</span>
      </Link>
      <h2 className="text-3xl font-bold text-white mb-6">Meu Progresso</h2>

      <div className="bg-gray-800 rounded-2xl p-6 mb-6">
        <h3 className="text-xl font-bold text-white mb-4">Selecione um Exercício</h3>
        {isLoading ? <p className="text-gray-400">Analisando seu histórico...</p> :
        <div className="flex flex-wrap gap-2">
          {uniqueExercises.map(ex => (
            <button 
              key={ex.id} 
              onClick={() => setSelectedExercise(ex)}
              className={`py-2 px-4 rounded-lg transition-colors ${selectedExercise?.id === ex.id ? 'bg-cyan-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
            >
              {ex.name}
            </button>
          ))}
        </div>
        }
      </div>

      {selectedExercise && (
        <div className="bg-gray-800 rounded-2xl p-6">
          <h3 className="text-2xl font-bold text-white mb-4">Evolução de Carga: <span className="text-cyan-400">{selectedExercise.name}</span></h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                <XAxis dataKey="date" stroke="#A0AEC0" />
                <YAxis stroke="#A0AEC0" />
                <Tooltip contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568', color: '#CBD5E0' }} />
                <Legend />
                <Line type="monotone" dataKey="peso" name="Peso (kg)" stroke="#4FD1C5" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
