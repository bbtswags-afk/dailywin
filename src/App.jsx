import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/layout/Header';
import Hero from './components/layout/Hero';
import Footer from './components/layout/Footer';
import PredictionFeed from './components/features/PredictionFeed';
import Newsletter from './components/features/Newsletter';

import LiveScores from './pages/LiveScores';
import AboutAI from './pages/AboutAI';
import Premium from './pages/Premium';
import { Terms, Privacy, Contact } from './pages/Legal';

import Upgrade from './pages/Upgrade';
import PaymentCallback from './pages/PaymentCallback';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import History from './pages/History';
import Login from './pages/Login';

import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { useAuth } from './context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import ScrollToTop from './components/common/ScrollToTop';


import Dashboard from './pages/Dashboard';
import RecentWins from './components/features/RecentWins';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;

  if (!user) {
    if (location.pathname.startsWith('/admin')) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4 bg-[#0a0f1c]">
          <p className="text-gray-400">Restricted Access</p>
          <a href="/admin-login" className="px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-bold">
            Admin Login
          </a>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4 bg-[#0a0f1c]">
        <p className="text-gray-400">Please log in to access this page.</p>
        <a href="/login" className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors">
          Login
        </a>
      </div>
    );
  }
  return children;
};

// Placeholder for now
const Home = () => {
  const { user, loading } = useAuth(); // Assuming loading state exists or we interpret null
  const [viewMode, setViewMode] = useState(null);

  // If logged in, show Dashboard
  if (user) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Header />
        <Dashboard />
        <Footer />
      </main>
    );
  }

  // Otherwise, show Landing Page
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <RecentWins />

      <div className="container mx-auto px-4 py-8 space-y-12">
        <PredictionFeed viewMode={null} />{/* Guest sees auto (controller limits) */}
        <Newsletter />
      </div>
      <Footer />
    </main>
  );
};

const Live = () => (
  <main className="min-h-screen bg-background text-foreground">
    <Header />
    <LiveScores />
    <Footer />
  </main>
);

const About = () => (
  <main className="min-h-screen bg-background text-foreground">
    <Header />
    <AboutAI />
    <Footer />
  </main>
);

const PremiumPage = () => (
  <main className="min-h-screen bg-background text-foreground">
    <Header />
    <Premium />
    <Footer />
  </main>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/live" element={<Live />} />
          <Route path="/about" element={<About />} />
          <Route path="/premium" element={<PremiumPage />} />
          <Route path="/history" element={<History />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/terms" element={<><Header /><Terms /><Footer /></>} />
          <Route path="/privacy" element={<><Header /><Privacy /><Footer /></>} />
          <Route path="/upgrade" element={<ProtectedRoute><Upgrade /></ProtectedRoute>} />
          <Route path="/payment-callback" element={<PaymentCallback />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/contact" element={<><Header /><Contact /><Footer /></>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
