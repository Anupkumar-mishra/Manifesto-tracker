import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import ChatBot from './components/common/ChatBot'
import Home from './pages/Home'
import Promises from './pages/Promises'
import PromiseDetail from './pages/PromiseDetail'
import MapView from './pages/MapView'
import StateDetail from './pages/StateDetail'
import PartyReport from './pages/PartyReport'
import Analytics from './pages/Analytics'
import Compare from './pages/Compare'
import Admin from './pages/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/promises" element={<Promises />} />
          <Route path="/promises/:id" element={<PromiseDetail />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/states/:code" element={<StateDetail />} />
          <Route path="/parties/:id" element={<PartyReport />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        <ChatBot />
      </div>
    </BrowserRouter>
  )
}