import { Navigate, Route, Routes } from 'react-router-dom'
import About from './pages/About'
import Contribute from './pages/Contribute'
import Data from './pages/Data'
import Explore from './pages/Explore'
import Home from './pages/Home'
import Landing from './pages/Landing'
import Listen from './pages/Listen'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/data" element={<Data />} />
      <Route path="/contribute" element={<Contribute />} />
      <Route path="/listen" element={<Listen />} />
      <Route path="/phonebook" element={<Navigate to="/explore" replace />} />
      <Route path="/explore" element={<Explore />} />
    </Routes>
  )
}

export default App
