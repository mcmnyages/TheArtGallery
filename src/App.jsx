import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext/index';
import { ArtistProvider } from './contexts/ArtistContext/provider';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { MessageProvider } from './contexts/MessageContext/provider';
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
import DashboardPage from './pages/artist/DashboardPage';
import UploadArtworkPage from './pages/artist/UploadArtworkPage';
import ManageGalleryPage from './pages/artist/ManageGalleryPage';
import CreateGalleryPage from './pages/artist/CreateGalleryPage';
import ArtistRoute from './components/auth/ArtistRoute';
import { useAuth } from './hooks/useAuth';
import PictureManagementPage from './pages/artist/PictureManagementPage';

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
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <TopNavBar toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 mt-16">
        {isAuthenticated && (
          <LeftSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isMobile={isMobile} />
        )}
        
        <PageContainer sidebarOpen={isSidebarOpen && isAuthenticated}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Public Routes */}
            <Route path="/galleries" element={
              <ProtectedRoute>
                <GalleriesPage />
              </ProtectedRoute>
            } />
            <Route path="/gallery/:id" element={
              <ProtectedRoute>
                <GalleryDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/subscriptions" element={
              <ProtectedRoute>
                <SubscriptionsPage />
              </ProtectedRoute>
            } />
            <Route path="/account" element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            } />
            
            {/* Artist Routes */}
            <Route path="/artist" element={
              <ArtistRoute>
                <DashboardPage />
              </ArtistRoute>
            } />
            <Route path="/artist/dashboard" element={
              <ArtistRoute>
                <DashboardPage />
              </ArtistRoute>
            } />
            <Route path="/artist/upload" element={
              <ArtistRoute>
                <UploadArtworkPage />
              </ArtistRoute>
            } />
            <Route path="/artist/gallery" element={
              <ArtistRoute>
                <ManageGalleryPage />
              </ArtistRoute>
            } />
            <Route path="/artist/gallery/create" element={
              <ArtistRoute>
                <CreateGalleryPage />
              </ArtistRoute>
            } />
            <Route path="/artist/gallery/edit/:id" element={
              <ArtistRoute>
                <CreateGalleryPage />
              </ArtistRoute>
            } />
            <Route path="/artist/pictures" element={
              <ArtistRoute>
                <PictureManagementPage />
              </ArtistRoute>
            } />
          </Routes>
        </PageContainer>
      </div>
      
      {isAuthenticated && isMobile && <BottomNavBar />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SubscriptionProvider>
          <ArtistProvider>
            <ThemeProvider>
              <MessageProvider>
                <AppContent />
              </MessageProvider>
            </ThemeProvider>
          </ArtistProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;