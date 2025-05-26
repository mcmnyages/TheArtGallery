import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = ({ title, subtitle, isAuthenticated }) => {
  return (
    <div className="relative overflow-hidden bg-blue-600 rounded-xl shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-700 opacity-90"></div>
      <div className="relative px-6 py-12 md:py-20 md:px-12 flex flex-col items-center text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-blue-100 mb-6 max-w-2xl">
          {subtitle}
        </p>
        <div className="mt-4 space-x-4">
          {isAuthenticated ? (
            <Link
              to="/galleries"
              className="inline-block bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-md text-base font-medium shadow-md transition-colors"
            >
              Explore Galleries
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="inline-block bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-md text-base font-medium shadow-md transition-colors"
              >
                Sign Up Free
              </Link>
              <Link
                to="/login"
                className="inline-block bg-transparent text-white border border-white hover:bg-white/10 px-6 py-3 rounded-md text-base font-medium transition-colors"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
        <div className="mt-8 w-full max-w-lg">
          <div className="flex -space-x-2 overflow-hidden justify-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`inline-block h-10 w-10 rounded-full border-2 border-white bg-blue-${300 + i * 100}`}
              ></div>
            ))}
          </div>
          <p className="text-blue-100 mt-3 text-sm">Join thousands of art enthusiasts exploring our collections</p>
        </div>
      </div>
      
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 hidden md:block">
        <div className="text-blue-500 opacity-20">
          <svg width="404" height="404" fill="none" viewBox="0 0 404 404">
            <defs>
              <pattern id="hero-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="4" height="4" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="404" height="404" fill="url(#hero-pattern)" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 hidden md:block">
        <div className="text-blue-500 opacity-20">
          <svg width="404" height="404" fill="none" viewBox="0 0 404 404">
            <defs>
              <pattern id="hero-pattern-2" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="4" height="4" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="404" height="404" fill="url(#hero-pattern-2)" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;