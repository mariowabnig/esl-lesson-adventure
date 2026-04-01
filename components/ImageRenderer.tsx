import React from 'react';

interface ImageRendererProps {
  image: string;
  alt: string;
  className?: string;
}

const ImageRenderer: React.FC<ImageRendererProps> = ({ image, alt, className }) => {
  const isBase64 = image.startsWith('data:image');

  if (isBase64) {
    return <img src={image} alt={alt} className={className} />;
  }

  // Render emoji as a large, centered text character
  return (
    <span 
      className={`flex items-center justify-center text-6xl ${className}`} 
      role="img" 
      aria-label={alt}
    >
      {image}
    </span>
  );
};

export default ImageRenderer;
