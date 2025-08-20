"use client";

import { useState } from 'react';
import { XIcon } from './icons';

export default function CreateRoutineModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome da ficha é obrigatório.');
      return;
    }
    onSave({ name, description });
    // Limpa o formulário para a próxima vez
    setName('');
    setDescription('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Criar Nova Ficha</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="routine-name" className="block text-sm font-medium text-gray-300 mb-2">
                Nome da Ficha (ex: Treino A - Peito/Tríceps)
              </label>
              <input
                id="routine-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                required
              />
            </div>
            <div>
              <label htmlFor="routine-description" className="block text-sm font-medium text-gray-300 mb-2">
                Descrição (opcional)
              </label>
              <textarea
                id="routine-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                placeholder="Foco em hipertrofia, com ênfase na parte superior do peitoral."
              ></textarea>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
          <div className="mt-8 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
              Cancelar
            </button>
            <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
              Salvar Ficha
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
