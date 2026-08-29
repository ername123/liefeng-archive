import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import { TRPCProvider } from "@/providers/trpc"
import { AuthProvider } from "@/context/AuthContext"
import { PageTransitionProvider } from "@/providers/page-transition"
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TRPCProvider>
          <PageTransitionProvider>
            <App />
          </PageTransitionProvider>
        </TRPCProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
