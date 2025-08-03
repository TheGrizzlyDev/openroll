import AppRoutes from './routes'
import './App.css'
import { GameProvider } from './GameContext'

export default function App() {
  return (
    <GameProvider>
      <AppRoutes />
    </GameProvider>
  )
}
