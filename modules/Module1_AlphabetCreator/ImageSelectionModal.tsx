import React from 'react';
import type { Word, SessionWord } from '../../types';
import Modal from '../../components/Modal';
import ImageRenderer from '../../components/ImageRenderer';

interface ImageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  letter: string;
  words: Word[];
  onSelect: (word: SessionWord) => void;
}

const ImageSelectionModal: React.FC<ImageSelectionModalProps> = ({ isOpen, onClose, letter, words, onSelect }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Choose a word for "${letter}"`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {words.map((word) => (
          <button 
            key={word.word} 
            onClick={() => onSelect({ letter, ...word })}
            className="flex flex-col items-center p-4 border-2 border-transparent rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="w-32 h-32 bg-gray-100 rounded-md flex items-center justify-center p-2">
              <ImageRenderer image={word.image} alt={word.word} className="w-full h-full object-contain" />
            </div>
            <span className="mt-2 font-bold text-lg text-slate-700 capitalize">{word.word}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
};

export default ImageSelectionModal;