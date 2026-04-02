import React from 'react';
import { useGameFilters } from '../contexts/GameFiltersContext';
import { WORD_CATEGORIES, CATEGORY_COLORS } from '../constants';

const GameFiltersPanel: React.FC = () => {
  const { gameFilters, setGameFilters } = useGameFilters();

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
      <h3 className="font-bold text-lg mb-3 text-center">🎮 Game Customization</h3>

      {/* Category Filter */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-gray-700 mb-2">Word Category:</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setGameFilters(prev => ({ ...prev, category: 'all' }))}
            className={`px-3 py-1 rounded-full text-sm font-bold transition-colors ${
              gameFilters.category === 'all'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Categories
          </button>
          {WORD_CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setGameFilters(prev => ({ ...prev, category }))}
              className={`px-3 py-1 rounded-full text-sm font-bold border-2 transition-colors ${
                gameFilters.category === category
                  ? `${CATEGORY_COLORS[category]} border-current`
                  : `${CATEGORY_COLORS[category]} border-transparent hover:border-current`
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Max Word Length and Source Filters */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Max Word Length (≤):</label>
          <div className="flex items-center space-x-3">
            <input
              type="number"
              min="1"
              max="15"
              value={gameFilters.maxWordLength ?? ''}
              onChange={(e) => {
                const val = e.target.value === '' ? null : (parseInt(e.target.value) || null);
                setGameFilters(prev => ({ ...prev, maxWordLength: val }));
              }}
              placeholder="none"
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center font-bold"
            />
            <div className="flex flex-wrap gap-1">
              {[4,5,6,7,8,9].map(len => (
                <button
                  key={len}
                  onClick={() => setGameFilters(prev => ({ ...prev, maxWordLength: len }))}
                  className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                    gameFilters.maxWordLength === len ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  }`}
                >
                  ≤ {len}
                </button>
              ))}
              <button
                onClick={() => setGameFilters(prev => ({ ...prev, maxWordLength: null }))}
                className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                  gameFilters.maxWordLength == null ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                none
              </button>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Word Source:</label>
          <div className="flex flex-wrap gap-2">
            {(['all','alphabet','custom'] as const).map(src => (
              <button
                key={src}
                onClick={() => setGameFilters(prev => ({ ...prev, vocabSource: src }))}
                className={`px-3 py-1 rounded-full text-sm font-bold transition-colors ${
                  gameFilters.vocabSource === src ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                }`}
              >
                {src === 'all' ? 'all words' : src === 'alphabet' ? 'alphabet words' : 'custom words'}
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default GameFiltersPanel;
