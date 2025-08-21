"use client";

import { useState, useEffect } from 'react';
import { AlertTriangleIcon } from './icons';

// Função que contém a lógica principal para detectar platôs
const detectPlateaus = (history, exerciseMap) => {
    const plateaus = [];
    if (!history || history.length < 3) return plateaus;

    const exerciseProgress = {};

    // 1. Organiza o histórico por exercício
    history.forEach(workout => {
        if (!workout.log) return;
        Object.keys(workout.log).forEach(exerciseId => {
            const exerciseName = exerciseMap[exerciseId];
            if (!exerciseName) return;

            if (!exerciseProgress[exerciseName]) {
                exerciseProgress[exerciseName] = [];
            }

            let maxWeight = 0;
            workout.log[exerciseId].forEach(set => {
                if (set.done && parseFloat(set.weight) > maxWeight) {
                    maxWeight = parseFloat(set.weight);
                }
            });

            if (maxWeight > 0) {
                exerciseProgress[exerciseName].push({
                    date: workout.completedAt.toDate(),
                    weight: maxWeight
                });
            }
        });
    });

    // 2. Analisa o progresso de cada exercício
    Object.keys(exerciseProgress).forEach(exerciseName => {
        const progress = exerciseProgress[exerciseName];
        if (progress.length < 3) return; // Precisa de pelo menos 3 treinos para detectar um platô

        const lastThreeSessions = progress.slice(-3);
        const lastWeight = lastThreeSessions[2].weight;
        const secondLastWeight = lastThreeSessions[1].weight;
        const thirdLastWeight = lastThreeSessions[0].weight;

        // 3. Verifica se o peso não aumentou nas últimas 3 sessões
        if (lastWeight <= secondLastWeight && secondLastWeight <= thirdLastWeight) {
            plateaus.push({
                exerciseName,
                message: `Seu progresso no ${exerciseName} parece ter estagnado. Considere variar a faixa de repetições ou trocar por um exercício alternativo para quebrar o platô.`
            });
        }
    });

    return plateaus;
};


export default function PlateauDetector({ history, exerciseMap }) {
    const [plateaus, setPlateaus] = useState([]);

    useEffect(() => {
        if (history && exerciseMap) {
            const detected = detectPlateaus(history, exerciseMap);
            setPlateaus(detected);
        }
    }, [history, exerciseMap]);

    if (plateaus.length === 0) {
        return null; // Não mostra nada se não houver platôs
    }

    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <AlertTriangleIcon />
                <span>Pontos de Atenção</span>
            </h2>
            <div className="bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-200 p-4 rounded-r-lg space-y-3">
                {plateaus.map((plateau, index) => (
                    <div key={index}>
                        <p><strong>{plateau.exerciseName}:</strong> {plateau.message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
