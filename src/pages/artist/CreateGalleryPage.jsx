import React from 'react';
import PageContainer from '../../components/layout/PageContainer';
import CreateGalleryForm from '../../components/artist/CreateGalleryForm';

const CreateGalleryPage = () => {
  return (
    <PageContainer>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Create Gallery</h1>
        <CreateGalleryForm />
      </div>
    </PageContainer>
  );
};

export default CreateGalleryPage;
