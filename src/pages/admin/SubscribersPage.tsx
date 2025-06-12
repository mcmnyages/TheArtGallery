import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { galleryService, GallerySubscriber } from '../../services/galleryService';

const SubscribersPage = () => {
  const [subscribers, setSubscribers] = useState<GallerySubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const data = await galleryService.getAllSubscribers();
        setSubscribers(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch subscribers. Please try again later.');
        console.error('Error fetching subscribers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Gallery Subscribers</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subscribers.map((subscriber, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-purple-500 dark:text-purple-300" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {subscriber.firstName} {subscriber.lastName}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Subscriber
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {subscribers.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No subscribers found.
        </div>
      )}
    </div>
  );
};

export default SubscribersPage;