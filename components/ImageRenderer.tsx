import React, { useState } from 'react';
import { resolveWordImage, isImageSource, fallbackWordEmoji } from '../utils/wordPictures';

interface ImageRendererProps {
  image: string;
  alt: string;
  className?: string;
}

const ImageRenderer: React.FC<ImageRendererProps> = ({ image, alt, className }) => {
  const source = resolveWordImage(alt, image);
  const [failedSource, setFailedSource] = useState<string | null>(null);

  if (isImageSource(source) && failedSource !== source) {
    return <img src={source} alt={alt} width="100%" height="100%" className={`object-contain ${className ?? ''}`} decoding="async" onError={() => setFailedSource(source)} />;
  }

  // A shared square coordinate system makes emoji scale with their allotted slot.
  // Fixed text-6xl overflowed small lists and undersized large flashcards.
  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      className={className}
      role="img" 
      aria-label={alt}
    >
      <text x="50" y="54" textAnchor="middle" dominantBaseline="central" fontSize="80" fontFamily="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">
        {fallbackWordEmoji(alt, image)}
      </text>
    </svg>
  );
};

export default ImageRenderer;
