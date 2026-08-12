import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import ReuseWrapper from './pages/ReuseWrapper';

function AppRoutes() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<ReuseWrapper />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
