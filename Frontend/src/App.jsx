import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Dashboard from './pages/Dashboard';
import {
  clearStoredAuth,
  fetchCurrentUser,
  getStoredAuth,
  loginUser,
  persistAuth,
  signupUser,
} from './lib/auth';
import './App.css';

const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicRoute = ({ isAuthenticated, children }) => {
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const FullScreenLoader = () => (
  <div className="grid min-h-screen place-items-center bg-[linear-gradient(180deg,#090b13_0%,#0f1222_48%,#0a0b14_100%)] px-6 text-center text-slate-300">
    <div>
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
      <p className="mt-4 text-sm uppercase tracking-[0.2em] text-slate-500">Checking session</p>
    </div>
  </div>
);

function App() {
  const [auth, setAuth] = useState(() => getStoredAuth());
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const storedAuth = getStoredAuth();

      if (!storedAuth?.token) {
        setIsCheckingSession(false);
        return;
      }

      try {
        const response = await fetchCurrentUser(storedAuth.token);
        const nextAuth = {
          ...storedAuth,
          user: response.user,
        };
        persistAuth(nextAuth, storedAuth.remember);
        setAuth(nextAuth);
      } catch {
        clearStoredAuth();
        setAuth(null);
      } finally {
        setIsCheckingSession(false);
      }
    };

    restoreSession();
  }, []);

  const handleLogin = async ({ email, password, remember }) => {
    const response = await loginUser({ email, password });
    const nextAuth = { 
      token: response.data.token, 
      user: response.data.user,
      remember 
    };
    persistAuth(nextAuth, remember);
    setAuth(nextAuth);
    return nextAuth;
  };

  const handleSignup = async ({ name, email, companyName, password }) => {
    const response = await signupUser({ name, email, companyName, password });
    const nextAuth = { 
      token: response.data.token, 
      user: response.data.user,
      remember: true 
    };
    persistAuth(nextAuth, true);
    setAuth(nextAuth);
    return nextAuth;
  };

  const handleLogout = () => {
    clearStoredAuth();
    setAuth(null);
  };

  if (isCheckingSession) {
    return <FullScreenLoader />;
  }

  return (
    <Router>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route
          path='/login'
          element={(
            <PublicRoute isAuthenticated={Boolean(auth?.token)}>
              <Login onLogin={handleLogin} isAuthenticated={Boolean(auth?.token)} />
            </PublicRoute>
          )}
        />
        <Route
          path='/signup'
          element={(
            <PublicRoute isAuthenticated={Boolean(auth?.token)}>
              <Signup onSignup={handleSignup} isAuthenticated={Boolean(auth?.token)} />
            </PublicRoute>
          )}
        />
        <Route
          path='/dashboard/*'
          element={(
            <ProtectedRoute isAuthenticated={Boolean(auth?.token)}>
              <Dashboard user={auth?.user} token={auth?.token} onLogout={handleLogout} />
            </ProtectedRoute>
          )}
        />
      </Routes>
    </Router>
  );
}

export default App;
