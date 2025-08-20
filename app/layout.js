import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '../context/AuthContext' // Importe o AuthProvider

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Fytn.AI',
  description: 'Transforme seus treinos com Inteligência Artificial.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {/* Envolva todo o conteúdo com o AuthProvider */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
