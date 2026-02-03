import React from 'react';
import { CreateAccountForm } from './CreateAccountForm';

const CreateAccountPage = () => {
  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <CreateAccountForm />
      </div>
    </div>
  );
};

export default CreateAccountPage;
