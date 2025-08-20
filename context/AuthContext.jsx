"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Cria o Contexto
const AuthContext = createContext();

// Componente Provedor que vai envolver nossa aplicação
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ouve as mudanças no estado de autenticação do Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Limpa o listener quando o componente é desmontado
    return () => unsubscribe();
  }, []);

  // Função para criar um novo usuário no Firestore
  const createUserInFirestore = async (user, additionalData) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      const { email } = user;
      try {
        await setDoc(userRef, {
          email,
          createdAt: new Date(),
          ...additionalData,
        });
      } catch (error) {
        console.error("Erro ao criar usuário no Firestore:", error);
      }
    }
  };

  // Função de logout
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const value = {
    user,
    loading,
    logout,
    createUserInFirestore,
  };

  // Retorna o Provedor com o valor, mas só renderiza os filhos se não estiver carregando
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Hook customizado para usar o contexto mais facilmente
export const useAuth = () => {
  return useContext(AuthContext);
};
