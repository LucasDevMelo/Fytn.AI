// Adiciona o "use client" no topo para tornar este um Componente de Cliente
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DumbbellIcon, UserIcon, MailIcon, LockIcon } from '../../components/icons';
import { useAuth } from '../../../context/AuthContext'; 

// Importe as funções de autenticação e o objeto auth
import { auth } from '../../../lib/firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Ícones para visualização de senha (idealmente, estariam no seu arquivo components/icons.jsx)
const EyeIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);


export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { createUserInFirestore } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await createUserInFirestore(userCredential.user, { name });
      router.push('/dashboard');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else if (error.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError('Ocorreu um erro ao criar a conta.');
      }
      console.error("Erro no cadastro:", error);
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      await createUserInFirestore(userCredential.user, { name: userCredential.user.displayName });
      router.push('/dashboard');
    } catch (error) {
      setError('Falha ao fazer login com o Google.');
      console.error("Erro no login com Google:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <Link href="/" className="flex justify-center items-center mb-4 cursor-pointer">
                    <DumbbellIcon />
                    <h1 className="text-3xl font-bold text-cyan-400">Fytn.AI</h1>
                </Link>
                <h2 className="text-2xl font-bold text-white">Crie sua conta</h2>
                <p className="text-gray-400">Comece sua jornada de evolução hoje.</p>
            </div>

            <div className="bg-gray-800 p-8 rounded-2xl shadow-lg">
                <form onSubmit={handleSignup} className="space-y-6">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2"><UserIcon /></span>
                        <input 
                          type="text" 
                          placeholder="Nome" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                          required
                        />
                    </div>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2"><MailIcon /></span>
                        <input 
                          type="email" 
                          placeholder="E-mail" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                          required
                        />
                    </div>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10"><LockIcon /></span>
                        <input 
                          type={showPassword ? "text" : "password"}
                          placeholder="Senha" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                          required
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                          {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10"><LockIcon /></span>
                        <input 
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirmar Senha" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                          required
                        />
                         <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                          {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-cyan-800 disabled:cursor-not-allowed">
                        {isLoading ? 'Criando conta...' : 'Criar Conta'}
                    </button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-gray-800 px-2 text-gray-400">OU</span>
                    </div>
                </div>

                <button onClick={handleGoogleLogin} disabled={isLoading} className="w-full flex items-center justify-center bg-white hover:bg-gray-200 text-black font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Cadastrar com Google
                </button>

                 <div className="text-center mt-6">
                    <p className="text-gray-400">Já tem uma conta? <Link href="/login" className="font-semibold text-cyan-400 hover:underline">Faça login</Link></p>
                </div>
            </div>
        </div>
    </div>
  );
}
