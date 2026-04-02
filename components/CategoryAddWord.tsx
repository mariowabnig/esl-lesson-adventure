import React, { useState } from 'react';
import { SessionWord, WordCategory } from '../types';

interface Props {
  category: WordCategory;
  onAdd: (word: SessionWord) => void;
}

const CategoryAddWord: React.FC<Props> = ({ category, onAdd }) => {
  const [value, setValue] = useState('');

  const handleAdd = () => {
    const w = value.trim().toLowerCase();
    if (!w) return;
    const letter = w[0]?.toUpperCase() || 'A';
    onAdd({ letter, word: w, image: '📝', category, predefined: false });
    setValue('');
  };

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex gap-2 items-end">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`add word for ${category} (buchstabe automatisch)`}
          className="flex-1 p-2 border rounded-lg"
        />
        <button onClick={handleAdd} className="bg-green-500 hover:bg-green-600 text-white font-bold px-3 py-2 rounded-lg">
          add word
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-1">will be automatically added to the matching letter</p>
    </div>
  );
};

export default CategoryAddWord;

