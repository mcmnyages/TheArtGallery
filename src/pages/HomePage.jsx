import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Eye, Users, Heart, Star, ChevronRight, Play, ArrowRight, Calendar, Award, Palette, Camera, Brush } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const ErrorFallback = ({ error }) => {
  const { isDarkMode } = useTheme();
  return (
    <div role="alert" className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <pre className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{error.message}</pre>
      </div>
    </div>
  );
};

const carouselImages = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1600&h=900&fit=crop",
    alt: "Gallery showcase 1",
    title: "Timeless Masterpieces",
    description: "Experience the world's most renowned artworks in stunning 8K detail",
    cta: "Explore Collection"
  },
  {
    id: 2,
    src: "/assets/images/urban art.avif",
    alt: "Gallery showcase 2",
    title: "Contemporary Excellence",
    description: "Discover the cutting edge of modern artistic expression from emerging artists",
    cta: "View Recent Additions"
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1600&h=900&fit=crop",
    alt: "Gallery showcase 3",
    title: "Hidden Treasures",
    description: "Unveil rarely-seen collections from private museums around the world",
    cta: "Start Discovery"
  },
  {
    id: 4,
    src: "/assets/images/art-2475718_1280.jpg",
    alt: "Gallery showcase 3",
    title: "Hidden Treasures",
    description: " Where you can find the most exquisite pieces of art",
    cta: "Let the Art Speak"
  }
];

// Add testimonials data at the top level with carouselImages
const testimonials = [
  {
    id: 1,
    name: "Maria Santos",
    role: "Art Historian",
    content: "Kabbala Gallery has revolutionized how I research and teach art history. The quality is unprecedented.",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "David Chen",
    role: "Museum Curator",
    content: "An invaluable resource for our institution. The digital preservation quality is museum-grade.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
  }
];

const HomePage = () => {
  const { isDarkMode } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [featuredGalleries, setFeaturedGalleries] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState({ galleries: 0, artworks: 0, users: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isArtist = user?.userResources?.includes('Artwork');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Mock data for featured galleries
        const mockFeaturedGalleries = [
          {
            id: 1,
            title: "Abstract Expressions",
            description: "Modern art that challenges perceptions and emotions through bold colors and innovative techniques",
            imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop",
            imageCount: 24,
            curator: "Elena Rodriguez",
            featured: true,
            tags: ["Modern", "Abstract", "Contemporary"]
          },
          {
            id: 2,
            title: "Nature's Wonders",
            description: "Breathtaking landscapes from across the globe captured in stunning detail",
            imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
            imageCount: 36,
            curator: "Marcus Chen",
            featured: true,
            tags: ["Landscape", "Photography", "Nature"]
          },
          {
            id: 3,
            title: "Urban Photography",
            description: "City life captured through the lens of award-winning photographers",
            imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop",
            imageCount: 18,
            curator: "Sarah Kim",
            featured: false,
            tags: ["Urban", "Street", "Architecture"]
          },
          {
            id: 4,
            title: "Renaissance Masters",
            description: "Classical artwork from the European Renaissance period, digitally restored",
            imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
            imageCount: 42,
            curator: "Dr. Antonio Rossi",
            featured: true,
            tags: ["Classical", "Renaissance", "Historical"]
          },
          {
            id: 5,
            title: "Digital Frontiers",
            description: "Cutting-edge digital art pushing the boundaries of creativity",
            imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
            imageCount: 28,
            curator: "Zara Ahmed",
            featured: false,
            tags: ["Digital", "NFT", "Future"]
          },
          {
            id: 6,
            title: "Portrait Masters",
            description: "Expressive portraits that capture the human spirit across cultures",
            imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
            imageCount: 31,
            curator: "James Morrison",
            featured: false,
            tags: ["Portrait", "Human", "Culture"]
          }
        ];
        
        setFeaturedGalleries(mockFeaturedGalleries);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Start stats animation after data is loaded
        const targetStats = { galleries: 150, artworks: 12500, users: 50000 };
        animateStats(targetStats);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const animateStats = (targetStats) => {
    const duration = 2000;
    const interval = 50;
    const steps = duration / interval;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setStats({
        galleries: Math.floor(targetStats.galleries * progress),
        artworks: Math.floor(targetStats.artworks * progress),
        users: Math.floor(targetStats.users * progress)
      });
      
      if (step >= steps) {
        clearInterval(timer);
        setStats(targetStats);
      }
    }, interval);

    return () => clearInterval(timer);
  };

  // Fix carousel dependency warning by moving carouselImages outside component
  const carouselLength = carouselImages.length;
  
  // Auto-advance carousel with proper dependency
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselLength);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselLength]);

  const handleStartTrial = () => {
    // Add trial signup logic
    console.log('Starting trial...');
  };

  const handleScheduleDemo = () => {
    // Add demo scheduling logic
    console.log('Scheduling demo...');
  };

  const handleArtistUpgrade = () => {
    // Add artist upgrade logic
    console.log('Upgrading to artist...');
  };

  if (isLoading) {
    return (
      <div role="alert" aria-busy="true" className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className={`animate-spin rounded-full h-32 w-32 border-b-2 ${
          isDarkMode ? 'border-purple-400' : 'border-purple-600'
        }`}></div>
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className={`min-h-screen ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-slate-50 via-white to-purple-50'
      }`}>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background Carousel */}
          <div className="absolute inset-0">
            {carouselImages.map((image, index) => (
              <div
                key={image.id}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                  index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
              </div>
            ))}
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white/90 text-sm">
                <Award className="w-4 h-4" />
                <span>Winner of Digital Art Innovation Award 2024</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
                <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Kabbala Gallery
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                {carouselImages[currentSlide].description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2">
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>{carouselImages[currentSlide].cta}</span>
                </button>
                
                {!isAuthenticated && (
                  <button className="group bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/20 transition-all duration-300 flex items-center space-x-2">
                    <span>Start Free Trial</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className={`py-16 backdrop-blur-sm ${
          isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="group hover:scale-105 transition-transform duration-300">
                <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {stats.galleries.toLocaleString()}+
                </div>
                <div className={`font-semibold mt-2 flex items-center justify-center space-x-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <Palette className="w-5 h-5" />
                  <span>Curated Galleries</span>
                </div>
              </div>
              <div className="group hover:scale-105 transition-transform duration-300">
                <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stats.artworks.toLocaleString()}+
                </div>
                <div className="text-gray-600 font-semibold mt-2 flex items-center justify-center space-x-2">
                  <Camera className="w-5 h-5" />
                  <span>High-Res Artworks</span>
                </div>
              </div>
              <div className="group hover:scale-105 transition-transform duration-300">
                <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  {stats.users.toLocaleString()}+
                </div>
                <div className="text-gray-600 font-semibold mt-2 flex items-center justify-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Art Enthusiasts</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Galleries */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl lg:text-5xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Featured <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Collections</span>
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Discover our most popular and critically acclaimed galleries, curated by world-renowned experts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredGalleries.map((gallery, index) => (
              <div
                key={gallery.id}
                className={`group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } ${
                  gallery.featured 
                    ? isDarkMode 
                      ? 'ring-2 ring-purple-400' 
                      : 'ring-2 ring-purple-200'
                    : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {gallery.featured && (
                  <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1 text-white ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600'
                  }`}>
                    <Star className="w-3 h-3" />
                    <span>Featured</span>
                  </div>
                )}

                <div className="relative h-64 overflow-hidden">
                  <img
                    src={gallery.imageUrl}
                    alt={gallery.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{gallery.imageCount}</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {gallery.tags.map(tag => (
                      <span 
                        key={tag} 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isDarkMode 
                            ? 'bg-gray-700 text-gray-300' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <h3 className={`text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {gallery.title}
                  </h3>
                  
                  <p className={`mb-4 leading-relaxed ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {gallery.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Curated by <span className={`font-semibold ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>{gallery.curator}</span>
                    </div>
                  </div>

                  <button className={`w-full group py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  } text-white`}>
                    <span>{isAuthenticated ? 'Explore Gallery' : 'Sign in to View'}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className={`group px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 mx-auto ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}>
              <span>View All {featuredGalleries.length} Galleries</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

        {/* Become an Artist Section - Only shown to authenticated non-artist users */}
        {isAuthenticated && !isArtist && (
          <section className={`py-16 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-gray-800 to-gray-900' 
              : 'bg-gradient-to-r from-purple-50 to-pink-50'
          }`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={`rounded-2xl shadow-xl overflow-hidden ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-90"></div>
                  <img 
                    src="/assets/images/urban art.avif" 
                    alt="Artist workspace" 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white p-6">
                      <h2 className="text-3xl font-bold mb-2">Are You an Artist?</h2>
                      <p className="text-lg text-white/90">Share your masterpieces with our global community</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 md:p-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className={`text-xl font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Why Join as an Artist?</h3>
                      <ul className={`space-y-3 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        <li className="flex items-center space-x-2">
                          <Palette className="w-5 h-5 text-purple-500" />
                          <span>Showcase your artwork to millions</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Star className="w-5 h-5 text-purple-500" />
                          <span>Get featured in curated collections</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Heart className="w-5 h-5 text-purple-500" />
                          <span>Build your following</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Brush className="w-5 h-5 text-purple-500" />
                          <span>Professional artist tools</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="flex flex-col justify-center space-y-4">
                      <p className={`${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Ready to take your art to the next level? Join our vibrant community of artists and reach art enthusiasts worldwide.
                      </p>
                      <button
                        onClick={() => navigate('/account')}
                        className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
                      >
                        <span>Request Artist Access</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Testimonials */}
        <section className={`py-20 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-gray-800 to-gray-900' 
            : 'bg-gradient-to-r from-purple-50 to-pink-50'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className={`text-4xl lg:text-5xl font-bold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Loved by <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Professionals</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map(testimonial => (
                <div 
                  key={testimonial.id} 
                  className={`rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src={testimonial.avatar}
                      alt={`${testimonial.name}'s avatar`}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className={`text-lg leading-relaxed mb-4 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        "{testimonial.content}"
                      </p>
                      <div>
                        <div className={`font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{testimonial.name}</div>
                        <div className={`font-medium ${
                          isDarkMode ? 'text-purple-400' : 'text-purple-600'
                        }`}>{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className={`py-20 relative overflow-hidden ${
          isDarkMode 
            ? 'bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900' 
            : 'bg-gradient-to-r from-purple-900 via-purple-800 to-pink-800'
        }`}>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
          
          <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Explore the World of Art?
            </h2>
            <p className={`text-xl mb-8 leading-relaxed ${
              isDarkMode ? 'text-gray-300' : 'text-purple-100'
            }`}>
              Join thousands of art lovers, researchers, and professionals who trust Kabbala Gallery 
              for premium art collections and unmatched quality.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleStartTrial}
                disabled={isLoadingMore}
                className="group bg-white text-purple-900 hover:bg-gray-50 px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2">
                <span>{isLoadingMore ? 'Starting...' : 'Start Your Free Trial'}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={handleScheduleDemo}
                disabled={isLoadingMore}
                className="group border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-full font-semibold text-lg backdrop-blur-sm transition-all duration-300 flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>{isLoadingMore ? 'Scheduling...' : 'Schedule a Demo'}</span>
              </button>
            </div>

            <div className="mt-8 text-purple-200 text-sm">
              No credit card required • 14-day free trial • Cancel anytime
            </div>
          </div>
        </section>

        {/* Welcome Back Section */}
        {isAuthenticated && (
          <section className={`py-16 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-gray-800 to-gray-900' 
              : 'bg-gradient-to-r from-blue-50 to-purple-50'
          }`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={`rounded-2xl shadow-xl p-8 border-l-4 border-purple-500 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex flex-col lg:flex-row items-center justify-between">
                  <div className="text-center lg:text-left mb-6 lg:mb-0">
                    <h2 className={`text-2xl font-bold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Welcome back, {user?.firstName || 'Art Enthusiast'}! 🎨
                    </h2>
                    <p className={`text-lg ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Continue your artistic journey with personalized recommendations and new arrivals.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => console.log('Navigate to collections')}
                      className="bg-purple-600 text-white hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2">
                      <Palette className="w-4 h-4" />
                      <span>My Collections</span>
                    </button>
                    <button 
                      onClick={() => console.log('Navigate to favorites')}
                      className="bg-white text-purple-600 border border-purple-300 hover:bg-purple-50 px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2">
                      <Heart className="w-4 h-4" />
                      <span>Favorites</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </ErrorBoundary>
  );
};

HomePage.propTypes = {
  // Add props if needed
};

export default HomePage;