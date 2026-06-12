import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PasscodeGate from './components/PasscodeGate'
import Navbar from './components/Navbar'
import Ticker from './components/Ticker'
import Hero from './components/Hero'
import Timeline from './pages/Timeline'
import BrotherProfile from './pages/BrotherProfile'
import FamilyTree from './pages/FamilyTree'

function Home() {
  return (
    <>
      <Ticker />
      <Hero />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <PasscodeGate>
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/family-tree" element={<FamilyTree />} />
            <Route path="/brothers/:id" element={<BrotherProfile />} />
          </Routes>
        </div>
      </PasscodeGate>
    </BrowserRouter>
  )
}