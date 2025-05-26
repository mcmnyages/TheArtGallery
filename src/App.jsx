import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import TopNavBar from './components/layout/TopNavBar';
import LeftSidebar from './components/layout/LeftSidebar';
import BottomNavBar from './components/layout/BottomNavBar';
import PageContainer from './components/layout/PageContainer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GalleriesPage from './pages/GalleriesPage';
import GalleryDetailPage from './pages/GalleryDetailPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import AccountPage from './pages/AccountPage';
import { useAuth } from './hooks/useAuth';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile && !isSidebarOpen) {
        setIsSidebarOpen(true);
      } else if (mobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopNavBar toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden">
        {isAuthenticated && (
          <LeftSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isMobile={isMobile} />
        )}
        
        <PageContainer sidebarOpen={isSidebarOpen && isAuthenticated}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route 
              path="/galleries" 
              element={
                <ProtectedRoute>
                  <GalleriesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/gallery/:id" 
              element={
                <ProtectedRoute>
                  <GalleryDetailPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/subscriptions" 
              element={
                <ProtectedRoute>
                  <SubscriptionsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/account" 
              element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </PageContainer>
      </div>
      
      {isAuthenticated && <BottomNavBar isMobile={isMobile} />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;