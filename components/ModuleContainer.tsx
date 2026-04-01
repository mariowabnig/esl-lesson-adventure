
import React from 'react';

interface ModuleContainerProps {
  title: string;
  children: React.ReactNode;
}

const ModuleContainer: React.FC<ModuleContainerProps> = ({ title, children }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 h-full flex flex-col animate-fade-in">
      <h2 className="text-4xl font-display text-center text-sky-600 mb-6">{title}</h2>
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
};

export default ModuleContainer;
