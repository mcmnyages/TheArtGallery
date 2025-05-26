import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import HeroSection from '../components/home/HeroSection';
import Carousel from '../components/home/Carousel';

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const [featuredGalleries, setFeaturedGalleries] = useState([]);
  
  useEffect(() => {
    // Mock data for featured galleries
    const mockFeaturedGalleries = [
      {
        id: 1,
        title: "Abstract Expressions",
        description: "Modern art that challenges perceptions and emotions",
        imageUrl: "/assets/images/abstract.jpg",
        imageCount: 24
      },
      {
        id: 2,
        title: "Nature's Wonders",
        description: "Breathtaking landscapes from across the globe",
        imageUrl: "/assets/images/nature.jpg",
        imageCount: 36
      },
      {
        id: 3,
        title: "Urban Photography",
        description: "City life captured in stunning detail",
        imageUrl: "/assets/images/urban.jpg",
        imageCount: 18
      },
      {
        id: 4,
        title: "Renaissance Masters",
        description: "Classical artwork from the European Renaissance period",
        imageUrl: "/assets/images/renaissance.jpg",
        imageCount: 42
      }
    ];
    
    setFeaturedGalleries(mockFeaturedGalleries);
  }, []);

  // Define carousel images
  const carouselImages = [
    {
      id: 1,
      src: "/assets/images/carousel1.jpg",
      alt: "Gallery showcase 1",
      title: "Timeless Masterpieces",
      description: "Experience the world's most renowned artworks in stunning detail"
    },
    {
      id: 2,
      src: "/assets/images/carousel2.jpg",
      alt: "Gallery showcase 2",
      title: "Contemporary Excellence",
      description: "Discover the cutting edge of modern artistic expression"
    },
    {
      id: 3,
      src: "/assets/images/carousel3.jpg",
      alt: "Gallery showcase 3",
      title: "Hidden Treasures",
      description: "Unveil rarely-seen collections from around the world"
    }
  ];

  return (
    <div className="space-y-10">
      <HeroSection 
        title="Kabbala Gallery"
        subtitle="Explore the world's finest art collections in stunning detail"
        isAuthenticated={isAuthenticated}
      />
      
      <Carousel images={carouselImages} />
      
      <section className="mt-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Galleries</h2>
          {isAuthenticated && (
            <Link 
              to="/galleries" 
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              View all galleries
              <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredGalleries.map(gallery => (
            <div 
              key={gallery.id} 
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="h-48 bg-gray-200 relative">
                <img 
                  src={gallery.imageUrl} 
                  alt={gallery.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 right-0 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-tl-md">
                  {gallery.imageCount} images
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg text-gray-900 mb-1">{gallery.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{gallery.description}</p>
                {isAuthenticated ? (
                  <Link
                    to={`/gallery/${gallery.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    Explore gallery
                    <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    Sign in to view
                    <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
      
      <section className="bg-blue-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-10 mt-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Unlock the Full Experience
          </h2>
          <p className="text-gray-600 mb-8">
            Subscribe to Kabbala Gallery for unlimited access to all our premium collections, 
            high-resolution images, and exclusive content.
          </p>
          <Link
            to="/subscriptions"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            View Subscription Plans
          </Link>
        </div>
      </section>
      
      {isAuthenticated && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Continue Exploring</h2>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-lg font-medium text-gray-900 mb-2">
              Welcome back, {user?.firstName || 'Art Enthusiast'}!
            </p>
            <p className="text-gray-600 mb-4">
              Pick up where you left off or explore new collections in our expansive gallery.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/galleries"
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Browse Galleries
              </Link>
              <Link
                to="/account"
                className="bg-white text-blue-600 border border-blue-300 hover:bg-blue-50 px-4 py-2 rounded-md text-sm font-medium"
              >
                Manage Account
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;