import type { SessionWord } from '../types';

export interface BingoCard {
  id: number;
  words: (SessionWord | null)[][];
}

export const generateBingoCards = (
  words: SessionWord[], 
  gridSize: number = 4, 
  numberOfCards: number = 6
): BingoCard[] => {
  const cards: BingoCard[] = [];
  
  for (let cardId = 0; cardId < numberOfCards; cardId++) {
    const card: BingoCard = {
      id: cardId + 1,
      words: []
    };
    
    // Shuffle words for this card
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    const wordsNeeded = gridSize * gridSize;
    
    // Fill the grid
    for (let row = 0; row < gridSize; row++) {
      const cardRow: (SessionWord | null)[] = [];
      for (let col = 0; col < gridSize; col++) {
        const wordIndex = row * gridSize + col;
        if (wordIndex < shuffledWords.length) {
          cardRow.push(shuffledWords[wordIndex]);
        } else {
          cardRow.push(null);
        }
      }
      card.words.push(cardRow);
    }
    
    cards.push(card);
  }
  
  return cards;
};

export const exportBingoCardsToPDF = (cards: BingoCard[]): void => {
  // Create a printable HTML page
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>BINGO Cards - ESL Lesson Adventure</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
        }
        .page {
          page-break-after: always;
          margin-bottom: 40px;
        }
        .page:last-child {
          page-break-after: avoid;
        }
        .cards-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .bingo-card {
          border: 3px solid #333;
          border-radius: 10px;
          padding: 15px;
          background: white;
        }
        .card-title {
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #2563eb;
        }
        .bingo-grid {
          display: grid;
          grid-template-columns: repeat(var(--grid-size), 1fr);
          gap: 2px;
          border: 2px solid #333;
        }
        .bingo-cell {
          aspect-ratio: 1;
          border: 1px solid #666;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 5px;
          background: #f8f9fa;
          font-size: 12px;
          text-align: center;
        }
        .cell-letter {
          font-weight: bold;
          font-size: 16px;
          color: #1e40af;
          margin-bottom: 2px;
        }
        .cell-emoji {
          font-size: 20px;
          margin-bottom: 2px;
        }
        .cell-word {
          font-size: 10px;
          font-weight: bold;
          text-transform: capitalize;
        }
        @media print {
          body { margin: 0; padding: 10px; }
          .page { page-break-after: always; margin-bottom: 20px; }
        }
      </style>
    </head>
    <body>
      ${cards.map((card, index) => {
        const gridSize = card.words.length;
        return `
          ${index % 2 === 0 ? '<div class="page"><div class="cards-container">' : ''}
          <div class="bingo-card">
            <div class="card-title">BINGO Card ${card.id}</div>
            <div class="bingo-grid" style="--grid-size: ${gridSize}">
              ${card.words.flat().map(word => `
                <div class="bingo-cell">
                  ${word ? `
                    <div class="cell-letter">${word.letter}</div>
                    <div class="cell-emoji">${word.image}</div>
                    <div class="cell-word">${word.word}</div>
                  ` : '<div style="color: #ccc;">Empty</div>'}
                </div>
              `).join('')}
            </div>
          </div>
          ${index % 2 === 1 || index === cards.length - 1 ? '</div></div>' : ''}
        `;
      }).join('')}
    </body>
    </html>
  `;
  
  printWindow.document.write(html);
  printWindow.document.close();
  
  // Auto-print after a short delay
  setTimeout(() => {
    printWindow.print();
  }, 500);
};
