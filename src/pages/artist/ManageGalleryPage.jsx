import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import ArtworkGallery from '../../components/artist/ArtworkGallery';

const ManageGalleryPage = () => {
  const navigate = useNavigate();
  
  return (
    <PageContainer>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Your Gallery</h1>
          <button
            onClick={() => navigate('/artist/upload')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Upload New Artwork
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md">
          <ArtworkGallery />
        </div>
      </div>
    </PageContainer>
  );
};

export default ManageGalleryPage;
