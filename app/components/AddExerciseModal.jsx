"use client";

import { useState } from 'react';
import { XIcon } from './icons';

export default function AddExerciseModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !sets.trim() || !reps.trim()) {
      setError('Todos os campos são obrigatórios.');
      return;
    }
    onSave({ name, sets, reps });
    // Limpa o formulário para a próxima vez
    setName('');
    setSets('');
    setReps('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Adicionar Exercício</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="exercise-name" className="block text-sm font-medium text-gray-300 mb-2">
                Nome do Exercício (ex: Supino Reto com Barra)
              </label>
              <input
                id="exercise-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                required
              />
            </div>
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label htmlFor="exercise-sets" className="block text-sm font-medium text-gray-300 mb-2">
                  Séries
                </label>
                <input
                  id="exercise-sets"
                  type="number"
                  placeholder="ex: 4"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                  required
                />
              </div>
              <div className="w-1/2">
                <label htmlFor="exercise-reps" className="block text-sm font-medium text-gray-300 mb-2">
                  Repetições
                </label>
                <input
                  id="exercise-reps"
                  type="text"
                  placeholder="ex: 8-12"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                  required
                />
              </div>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
          <div className="mt-8 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
              Cancelar
            </button>
            <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
              Salvar Exercício
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
