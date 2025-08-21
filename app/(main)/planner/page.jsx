"use client";

import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../lib/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore'; // Adicionada a importação 'doc'
import { BotIcon, SparklesIcon } from '../../components/icons';

export default function PlannerPage() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        objective: 'hypertrophy',
        level: 'intermediate',
        days: '4',
    });
    const [generatedPlan, setGeneratedPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Corrige a forma como o estado é atualizado
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const generateWorkoutPlan = async () => {
        setIsLoading(true);
        setError('');
        setGeneratedPlan(null);

        const prompt = `
            Crie um programa de treino de musculação para um usuário com os seguintes detalhes:
            - Objetivo: ${formData.objective} (hypertrophy = hipertrofia, strength = força, endurance = resistência)
            - Nível: ${formData.level} (beginner = iniciante, intermediate = intermediário, advanced = avançado)
            - Dias por semana: ${formData.days}

            O programa deve ser dividido em ${formData.days} treinos (Treino A, Treino B, Treino C, etc.).
            Para cada treino, liste de 5 a 7 exercícios.
            Para cada exercício, forneça o nome, as séries (sets) e as repetições (reps).

            Responda APENAS com um objeto JSON válido, sem nenhum texto ou formatação extra. O JSON deve ter a seguinte estrutura:
            {
              "planName": "Plano de Treino de ${formData.days} Dias para ${formData.objective}",
              "routines": [
                {
                  "name": "Treino A - Peito e Tríceps",
                  "description": "Foco em hipertrofia para peitoral e tríceps.",
                  "exercises": [
                    { "name": "Supino Reto com Barra", "sets": 4, "reps": "8-12" },
                    { "name": "Supino Inclinado com Halteres", "sets": 4, "reps": "10-12" },
                    { "name": "Crucifixo na Máquina", "sets": 3, "reps": "12-15" },
                    { "name": "Tríceps na Polia", "sets": 4, "reps": "10-12" },
                    { "name": "Flexão de Braço", "sets": 3, "reps": "até a falha" }
                  ]
                }
              ]
            }
        `;
        
        try {
            let chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });
            const payload = { contents: chatHistory };
            // AJUSTE: Lê a chave da API do arquivo .env.local
            const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // Lógica de erro aprimorada
            if (!response.ok) {
                const errorData = await response.json().catch(() => null); // Tenta pegar mais detalhes do erro
                const errorMessage = errorData?.error?.message || `Erro da API: ${response.status} ${response.statusText}`;
                throw new Error(errorMessage);
            }

            const result = await response.json();
            
            if (result.candidates && result.candidates[0]?.content?.parts?.[0]) {
              const text = result.candidates[0].content.parts[0].text;
              const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
              const parsedPlan = JSON.parse(cleanedText);
              setGeneratedPlan(parsedPlan);
            } else {
              throw new Error("Resposta da IA inválida ou vazia.");
            }

        } catch (err) {
            console.error("Erro ao gerar plano:", err);
            // Mostra a mensagem de erro mais detalhada para o usuário
            setError(err.message || "Não foi possível gerar o plano. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const savePlanToFirestore = async () => {
        if (!generatedPlan || !user) return;
        
        const batch = writeBatch(db);

        generatedPlan.routines.forEach(routine => {
            const routineRef = doc(collection(db, 'users', user.uid, 'routines'));
            batch.set(routineRef, {
                name: routine.name,
                description: routine.description,
                createdAt: new Date()
            });

            routine.exercises.forEach(exercise => {
                const exerciseRef = doc(collection(routineRef, 'exercises'));
                batch.set(exerciseRef, {
                    name: exercise.name,
                    sets: exercise.sets,
                    reps: exercise.reps,
                    createdAt: new Date()
                });
            });
        });

        try {
            await batch.commit();
            alert('Plano salvo com sucesso!');
            setGeneratedPlan(null); // Limpa o plano da tela
        } catch (error) {
            console.error("Erro ao salvar plano:", error);
            setError("Ocorreu um erro ao salvar seu plano.");
        }
    };

    return (
        <div className="p-4 md:p-8">
            <div className="flex items-center gap-4 mb-6">
                <BotIcon />
                <div>
                    <h2 className="text-3xl font-bold text-white">Gerador de Treino com IA</h2>
                    <p className="text-gray-400">Responda as perguntas abaixo e deixe nossa IA criar o plano perfeito para você.</p>
                </div>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6">
                {/* Formulário Completo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                        <label htmlFor="objective" className="block text-sm font-medium text-gray-300 mb-2">Qual seu principal objetivo?</label>
                        <select name="objective" id="objective" value={formData.objective} onChange={handleInputChange} className="w-full bg-gray-700 text-white rounded-lg p-3 border-0 focus:ring-2 focus:ring-cyan-500">
                            <option value="hypertrophy">Hipertrofia</option>
                            <option value="strength">Força</option>
                            <option value="endurance">Resistência</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="level" className="block text-sm font-medium text-gray-300 mb-2">Qual seu nível de experiência?</label>
                        <select name="level" id="level" value={formData.level} onChange={handleInputChange} className="w-full bg-gray-700 text-white rounded-lg p-3 border-0 focus:ring-2 focus:ring-cyan-500">
                            <option value="beginner">Iniciante</option>
                            <option value="intermediate">Intermediário</option>
                            <option value="advanced">Avançado</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="days" className="block text-sm font-medium text-gray-300 mb-2">Quantos dias por semana?</label>
                        <select name="days" id="days" value={formData.days} onChange={handleInputChange} className="w-full bg-gray-700 text-white rounded-lg p-3 border-0 focus:ring-2 focus:ring-cyan-500">
                            <option value="2">2 dias</option>
                            <option value="3">3 dias</option>
                            <option value="4">4 dias</option>
                            <option value="5">5 dias</option>
                        </select>
                    </div>
                </div>
                <button onClick={generateWorkoutPlan} disabled={isLoading} className="w-full flex justify-center items-center bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-cyan-800">
                    <SparklesIcon />
                    {isLoading ? 'Gerando seu plano...' : 'Gerar Treino'}
                </button>
            </div>

            {error && <p className="text-red-500 text-center mt-4">{error}</p>}

            {/* Exibição do Plano Gerado */}
            {generatedPlan && (
                <div className="mt-8 bg-gray-800 rounded-2xl p-6">
                    <h3 className="text-2xl font-bold text-white mb-4">{generatedPlan.planName}</h3>
                    <div className="space-y-6">
                        {generatedPlan.routines.map((routine, index) => (
                            <div key={index} className="bg-gray-700 p-4 rounded-lg">
                                <h4 className="text-xl font-bold text-cyan-400">{routine.name}</h4>
                                <p className="text-gray-400 mb-2">{routine.description}</p>
                                <ul className="list-disc list-inside text-gray-300">
                                    {routine.exercises.map((ex, i) => <li key={i}>{ex.name} ({ex.sets}x{ex.reps})</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <button onClick={savePlanToFirestore} className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg">
                        Salvar este Plano
                    </button>
                </div>
            )}
        </div>
    );
}
