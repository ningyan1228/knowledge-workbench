import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { SiteGate } from './SiteGate'

createRoot(document.getElementById('root')!).render(
  <StrictMode><SiteGate /></StrictMode>,
)
