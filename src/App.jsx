import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TeamSetupPage from './pages/TeamSetupPage';
import GamePage from './pages/GamePage';
import WinnerPage from './pages/WinnerPage';
import RulesPage from './pages/RulesPage';
import RoomsPage from './pages/RoomsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import UserCardsPage from './pages/UserCardsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import YoVs100SetupPage from './pages/YoVs100SetupPage';
import YoVs100GamePage from './pages/YoVs100GamePage';
import YoVs100GameOverPage from './pages/YoVs100GameOverPage';
import { SocketProvider } from './contexts/SocketContext';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/teams" element={<TeamSetupPage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="/winner" element={<WinnerPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/yo-vs-100" element={<YoVs100SetupPage />} />
            <Route path="/yo-vs-100/game" element={<YoVs100GamePage />} />
            <Route path="/yo-vs-100/gameover" element={<YoVs100GameOverPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/mis-mazos" element={<UserCardsPage />} />
            
            {/* Rutas de Admin */}
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            
            {/* Catch-all para rutas no encontradas */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
