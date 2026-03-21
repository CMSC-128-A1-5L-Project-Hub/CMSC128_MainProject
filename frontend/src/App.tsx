import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MapPage from './pages/MapPage'
import AuthSuccess from './pages/AuthSuccess';
import SetupPage from './pages/SetupPage';
import LoginPage from './pages/LoginPage'
import AccommodationTestPage from './pages/AccommTestPage';
import ApplicationTestPage from './pages/ApplicationTestPage';
import AdminTestPage from './pages/AdminTestPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/map" element={<MapPage />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/" element={<LoginPage />} />

        <Route path="/test/accommodations" element={<AccommodationTestPage />} />
        <Route path="/test/applications" element={<ApplicationTestPage />} />
        <Route path="/test/admin" element={<AdminTestPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App