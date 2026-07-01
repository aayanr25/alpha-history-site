import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import PasscodeGate from './components/PasscodeGate'
import Navbar from './components/Navbar'
import Ticker from './components/Ticker'
import Hero from './components/Hero'
import Timeline from './pages/Timeline'
import BrotherProfile from './pages/BrotherProfile'
import FamilyTree from './pages/FamilyTree'
import Brothers from './pages/Brothers'

// Scroll to the top of the page whenever the user lands on a Brothers route
// (the list or an individual profile), so navigating there never leaves the
// viewport partway down a previous page.
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (pathname.startsWith('/brothers')) {
      window.scrollTo(0, 0)
    }
  }, [pathname])
  return null
}

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
          <ScrollToTop />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/family-tree" element={<FamilyTree />} />
            <Route path="/brothers" element={<Brothers />} />
            <Route path="/brothers/:id" element={<BrotherProfile />} />
          </Routes>
        </div>
      </PasscodeGate>
    </BrowserRouter>
  )
}