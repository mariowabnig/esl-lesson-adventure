import React, { useState } from 'react';
import type { Word, WordCategory } from '../../types';
import ImageRenderer from '../../components/ImageRenderer';
import { searchEmojis, getDefaultEmoji, type EmojiOption } from '../../emojiDatabase';
import { WORD_CATEGORIES, CATEGORY_COLORS } from '../../constants';

interface WordGeneratorProps {
    letter: string;
    onAddWord: (word: Word) => void;
    defaultCategory?: WordCategory;
    compact?: boolean;
}

const WordGenerator: React.FC<WordGeneratorProps> = ({ letter, onAddWord, defaultCategory, compact = false }) => {
    const [wordInput, setWordInput] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
    const [emojiOptions, setEmojiOptions] = useState<EmojiOption[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<WordCategory>(defaultCategory || 'other');

    const handleSearchEmojis = () => {
        if (!wordInput.trim()) {
            setError('Please enter a word.');
            return;
        }
        setError(null);
        
        const foundEmojis = searchEmojis(wordInput);
        if (foundEmojis.length > 0) {
            setEmojiOptions(foundEmojis);
            setShowEmojiPicker(true);
            // Auto-select first emoji as default
            setSelectedEmoji(foundEmojis[0].emoji);
        } else {
            // Use fallback emoji
            const fallbackEmoji = getDefaultEmoji(wordInput);
            setSelectedEmoji(fallbackEmoji);
            setEmojiOptions([{ emoji: fallbackEmoji, description: 'fallback emoji' }]);
            setShowEmojiPicker(true);
        }
    };

    const handleEmojiSelect = (emoji: string) => {
        setSelectedEmoji(emoji);
    };

    const handleAdd = () => {
        if (wordInput && selectedEmoji) {
            onAddWord({ word: wordInput.toLowerCase(), image: selectedEmoji, category: selectedCategory });
            setWordInput('');
            setSelectedEmoji(null);
            setEmojiOptions([]);
            setShowEmojiPicker(false);
            setSelectedCategory('other');
        }
    };

    return (
        <div className={compact ? "space-y-2" : "p-4 border-2 border-dashed border-sky-300 rounded-lg"}>
            {!compact && <h3 className="font-bold text-slate-600 text-center mb-2">Add A New Word</h3>}

            {/* Category Selector */}
            {!compact && (
            <div className="mb-3">
                <label className="block text-sm font-bold text-gray-700 mb-1">Category:</label>
                <div className="flex flex-wrap gap-2">
                    {WORD_CATEGORIES.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-3 py-1 rounded-full text-sm font-bold border-2 transition-colors ${
                                selectedCategory === category
                                    ? `${CATEGORY_COLORS[category]} border-current`
                                    : `${CATEGORY_COLORS[category]} border-transparent hover:border-current`
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>
            )}

            <div className={`flex items-center gap-2 ${compact ? 'flex-col' : ''}`}>
                <input
                    type="text"
                    value={wordInput}
                    onChange={(e) => setWordInput(e.target.value)}
                    placeholder={compact ? "Add word..." : (letter ? `e.g., Dragon for ${letter}` : "Enter any word")}
                    className={`border p-2 rounded-md ${compact ? 'w-full text-sm' : 'flex-grow'}`}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchEmojis()}
                />
                <button
                    onClick={handleSearchEmojis}
                    className={`bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-md ${compact ? 'w-full text-sm' : ''}`}
                >
                    {compact ? '+ Add' : 'Find Emoji'}
                </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            
            {showEmojiPicker && emojiOptions.length > 0 && (
                <div className="mt-4">
                    <p className="font-semibold text-center mb-3">Choose an emoji for "{wordInput}":</p>
                    
                    {/* Emoji options grid */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        {emojiOptions.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleEmojiSelect(option.emoji)}
                                className={`p-3 rounded-lg border-2 transition-all hover:scale-110 ${
                                    selectedEmoji === option.emoji 
                                        ? 'border-blue-500 bg-blue-50' 
                                        : 'border-gray-200 hover:border-blue-300'
                                }`}
                                title={option.description}
                            >
                                <div className="text-3xl">{option.emoji}</div>
                            </button>
                        ))}
                    </div>
                    
                    {/* Selected emoji preview */}
                    {selectedEmoji && (
                        <div className="flex flex-col items-center gap-4 mt-4">
                            <p className="font-semibold">Selected:</p>
                            <div className="w-32 h-32 bg-gray-100 rounded-md p-2 flex items-center justify-center">
                               <ImageRenderer image={selectedEmoji} alt={wordInput} className="w-full h-full" />
                            </div>
                            <button 
                                onClick={handleAdd} 
                                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-full"
                            >
                                Add to List
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WordGenerator;
