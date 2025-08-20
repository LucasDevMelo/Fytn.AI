"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { db } from '../../../../lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { ThumbsUpIcon, LightbulbIcon } from '../../../components/icons';

// Função para analisar o treino e gerar sugestões
const generateInsights = (workoutLog, exercises) => {
    const insights = [];
    if (!workoutLog || !exercises) return insights;

    exercises.forEach(exercise => {
        const log = workoutLog[exercise.id];
        if (!log) return;

        const targetReps = parseInt(exercise.reps.split('-')[0]); // Pega o limite inferior de reps
        let successfulSets = 0;

        log.forEach(set => {
            if (set.done && parseInt(set.reps) >= targetReps) {
                successfulSets++;
            }
        });

        // Se todas as séries foram bem-sucedidas, gera uma sugestão
        if (successfulSets === log.length) {
            const lastWeight = parseFloat(log[log.length - 1].weight);
            if (lastWeight > 0) {
                const suggestedWeight = lastWeight * 1.05; // Sugere aumento de 5%
                insights.push({
                    exerciseName: exercise.name,
                    message: `Você completou todas as séries de ${exercise.name} com sucesso! Para o próximo treino, tente aumentar o peso para ~${suggestedWeight.toFixed(1)}kg.`
                });
            }
        }
    });

    return insights;
};


export default function SummaryPage() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const { workoutId } = params;

    const [workout, setWorkout] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [insights, setInsights] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user && workoutId) {
            const fetchData = async () => {
                const workoutRef = doc(db, 'users', user.uid, 'workoutHistory', workoutId);
                const workoutSnap = await getDoc(workoutRef);

                if (workoutSnap.exists()) {
                    const workoutData = workoutSnap.data();
                    setWorkout(workoutData);

                    // Busca os exercícios da rotina original para comparar
                    const exercisesRef = collection(db, 'users', user.uid, 'routines', workoutData.routineId, 'exercises');
                    const exercisesSnap = await getDocs(exercisesRef);
                    const exercisesList = exercisesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setExercises(exercisesList);
                    
                    // Gera as sugestões da IA
                    const generatedInsights = generateInsights(workoutData.log, exercisesList);
                    setInsights(generatedInsights);
                }
                setIsLoading(false);
            };
            fetchData();
        }
    }, [user, workoutId]);

    if (isLoading) return <div className="p-8 text-white">Analisando seu treino...</div>;

    return (
        <div className="p-4 md:p-8">
            <div className="text-center max-w-2xl mx-auto">
                <ThumbsUpIcon />
                <h1 className="text-4xl font-bold text-white mt-4">Parabéns!</h1>
                <p className="text-xl text-cyan-400 mt-2">Você concluiu o treino "{workout?.routineName}" com sucesso.</p>
            </div>

            {insights.length > 0 && (
                <div className="mt-12 max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center"><LightbulbIcon /> Insights para Evoluir</h2>
                    <div className="space-y-4">
                        {insights.map((insight, index) => (
                            <div key={index} className="bg-gray-800 p-4 rounded-lg border-l-4 border-cyan-400">
                                <p className="text-white"><strong className="text-cyan-400">{insight.exerciseName}:</strong> {insight.message}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-12 text-center">
                <Link href="/dashboard" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
                    Voltar para o Dashboard
                </Link>
            </div>
        </div>
    );
}
