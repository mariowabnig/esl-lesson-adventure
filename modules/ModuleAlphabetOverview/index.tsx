import React, { useMemo } from 'react';
import { ALPHABET, type SessionWord } from '../../types';
import ImageRenderer from '../../components/ImageRenderer';

interface Props {
  sessionVocabulary: SessionWord[];
}

const ModuleAlphabetOverview: React.FC<Props> = ({ sessionVocabulary }) => {
  const byLetter = useMemo(() => {
    const map: Record<string, SessionWord[]> = {};
    ALPHABET.forEach(l => { map[l] = []; });
    sessionVocabulary.forEach(w => { map[w.letter] = [...(map[w.letter] || []), w]; });
    return map;
  }, [sessionVocabulary]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">🔎 Alphabet Overview</h1>
        <p className="text-lg text-gray-600">Read-only summary of letters, words, and pronunciation notes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ALPHABET.map(letter => (
          <div key={letter} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-3xl font-bold text-blue-600">{letter}</div>
              <div className="text-xs text-gray-500">{(byLetter[letter] || []).length} word(s)</div>
            </div>

            {(byLetter[letter] || []).length === 0 ? (
              <div className="text-gray-400 text-sm">No word selected for this letter</div>
            ) : (
              <div className="space-y-3">
                {(byLetter[letter] || []).map((w, i) => (
                  <div key={letter + i} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <ImageRenderer image={w.image} alt={w.word} className="max-w-full max-h-full" />
                      </div>
                      <div>
                        <div className="font-semibold capitalize">{w.word}</div>
                        {w.pronunciation && (
                          <div className="text-xs text-gray-500">Pronunciation: {w.pronunciation}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{w.category}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModuleAlphabetOverview;

