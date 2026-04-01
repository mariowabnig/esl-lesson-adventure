import React, { useState } from 'react';
import { useSessionVocabulary } from '../../contexts/SessionVocabularyContext';
import ModuleContainer from '../../components/ModuleContainer';
import ImageRenderer from '../../components/ImageRenderer';
import type { SessionWord } from '../../types';

const FlippableCard: React.FC<{ word: SessionWord }> = ({ word }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div 
            className="w-full h-48 perspective-1000"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div 
                className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
            >
                {/* Front of card (Image) */}
                <div className="absolute w-full h-full backface-hidden flex items-center justify-center rounded-xl bg-white shadow-lg cursor-pointer">
                    <ImageRenderer image={word.image} alt={word.word} className="w-32 h-32 object-contain" />
                </div>

                {/* Back of card (Word) */}
                <div className="absolute w-full h-full rotate-y-180 backface-hidden flex items-center justify-center rounded-xl bg-sky-200 shadow-lg cursor-pointer">
                    <span className="text-3xl font-bold text-sky-800 capitalize">{word.word}</span>
                </div>
            </div>
        </div>
    );
};

const Module5WordReview: React.FC = () => {
    const { sessionVocabulary } = useSessionVocabulary();

    return (
        <ModuleContainer title="Word Review">
            <p className="text-center text-slate-600 mb-6">Click on any card to flip it and see the word!</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {sessionVocabulary.map(word => (
                    <FlippableCard key={word.word} word={word} />
                ))}
            </div>
        </ModuleContainer>
    );
};

export default Module5WordReview;
