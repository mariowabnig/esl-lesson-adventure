// Comprehensive emoji database for educational words
export interface EmojiOption {
  emoji: string;
  description: string;
}

// Word-to-emoji mapping database
export const EMOJI_DATABASE: Record<string, EmojiOption[]> = {
  // Animals
  'cat': [{ emoji: '🐱', description: 'cat face' }, { emoji: '🐈', description: 'cat' }, { emoji: '🐈‍⬛', description: 'black cat' }],
  'dog': [{ emoji: '🐕', description: 'dog' }, { emoji: '🐶', description: 'dog face' }, { emoji: '🦮', description: 'guide dog' }],
  'bird': [{ emoji: '🐦', description: 'bird' }, { emoji: '🐦‍⬛', description: 'black bird' }, { emoji: '🕊️', description: 'dove' }],
  'fish': [{ emoji: '🐟', description: 'fish' }, { emoji: '🐠', description: 'tropical fish' }, { emoji: '🎣', description: 'fishing' }],
  'elephant': [{ emoji: '🐘', description: 'elephant' }],
  'lion': [{ emoji: '🦁', description: 'lion' }],
  'tiger': [{ emoji: '🐅', description: 'tiger' }],
  'bear': [{ emoji: '🐻', description: 'bear' }, { emoji: '🐻‍❄️', description: 'polar bear' }, { emoji: '🧸', description: 'teddy bear' }],
  'monkey': [{ emoji: '🐒', description: 'monkey' }, { emoji: '🙈', description: 'see-no-evil monkey' }],
  'rabbit': [{ emoji: '🐰', description: 'rabbit face' }, { emoji: '🐇', description: 'rabbit' }],
  'mouse': [{ emoji: '🐭', description: 'mouse face' }, { emoji: '🐁', description: 'mouse' }],
  'horse': [{ emoji: '🐴', description: 'horse face' }, { emoji: '🐎', description: 'horse' }, { emoji: '🦄', description: 'unicorn' }],
  'cow': [{ emoji: '🐄', description: 'cow' }, { emoji: '🐮', description: 'cow face' }],
  'pig': [{ emoji: '🐷', description: 'pig face' }, { emoji: '🐖', description: 'pig' }],
  'sheep': [{ emoji: '🐑', description: 'sheep' }, { emoji: '🐏', description: 'ram' }],
  'goat': [{ emoji: '🐐', description: 'goat' }],
  'chicken': [{ emoji: '🐔', description: 'chicken' }, { emoji: '🐣', description: 'hatching chick' }],
  'duck': [{ emoji: '🦆', description: 'duck' }],
  'dragon': [{ emoji: '🐲', description: 'dragon face' }, { emoji: '🐉', description: 'dragon' }],
  'dinosaur': [{ emoji: '🦕', description: 'sauropod dinosaur' }, { emoji: '🦖', description: 'T-Rex dinosaur' }],
  'penguin': [{ emoji: '🐧', description: 'penguin' }],
  'frog': [{ emoji: '🐸', description: 'frog' }],
  'snake': [{ emoji: '🐍', description: 'snake' }],
  'turtle': [{ emoji: '🐢', description: 'turtle' }],
  'octopus': [{ emoji: '🐙', description: 'octopus' }],
  'butterfly': [{ emoji: '🦋', description: 'butterfly' }],
  'bee': [{ emoji: '🐝', description: 'bee' }],
  'ant': [{ emoji: '🐜', description: 'ant' }],
  'spider': [{ emoji: '🕷️', description: 'spider' }],
  'whale': [{ emoji: '🐋', description: 'whale' }, { emoji: '🐳', description: 'spouting whale' }],
  'dolphin': [{ emoji: '🐬', description: 'dolphin' }],
  'shark': [{ emoji: '🦈', description: 'shark' }],
  'crab': [{ emoji: '🦀', description: 'crab' }],
  'lobster': [{ emoji: '🦞', description: 'lobster' }],
  'zebra': [{ emoji: '🦓', description: 'zebra' }],
  'giraffe': [{ emoji: '🦒', description: 'giraffe' }],
  'kangaroo': [{ emoji: '🦘', description: 'kangaroo' }],
  'owl': [{ emoji: '🦉', description: 'owl' }],

  // Food & Drinks
  'apple': [{ emoji: '🍎', description: 'red apple' }, { emoji: '🍏', description: 'green apple' }],
  'banana': [{ emoji: '🍌', description: 'banana' }],
  'lemon': [{ emoji: '🍋', description: 'lemon' }],
  'grapes': [{ emoji: '🍇', description: 'grapes' }],
  'strawberry': [{ emoji: '🍓', description: 'strawberry' }],
  'watermelon': [{ emoji: '🍉', description: 'watermelon' }],
  'pineapple': [{ emoji: '🍍', description: 'pineapple' }],
  'peach': [{ emoji: '🍑', description: 'peach' }],
  'cherry': [{ emoji: '🍒', description: 'cherries' }],
  'bread': [{ emoji: '🍞', description: 'bread' }, { emoji: '🥖', description: 'baguette' }],
  'cake': [{ emoji: '🎂', description: 'birthday cake' }, { emoji: '🍰', description: 'cake slice' }],
  'cookie': [{ emoji: '🍪', description: 'cookie' }],
  'donut': [{ emoji: '🍩', description: 'donut' }],
  'pizza': [{ emoji: '🍕', description: 'pizza' }],
  'hamburger': [{ emoji: '🍔', description: 'hamburger' }],
  'hotdog': [{ emoji: '🌭', description: 'hot dog' }],
  'sandwich': [{ emoji: '🥪', description: 'sandwich' }],
  'egg': [{ emoji: '🥚', description: 'egg' }, { emoji: '🍳', description: 'fried egg' }],
  'milk': [{ emoji: '🥛', description: 'glass of milk' }, { emoji: '🍼', description: 'baby bottle' }],
  'water': [{ emoji: '💧', description: 'droplet' }, { emoji: '🚰', description: 'water tap' }],
  'juice': [{ emoji: '🧃', description: 'juice box' }, { emoji: '🥤', description: 'cup with straw' }],
  'coffee': [{ emoji: '☕', description: 'coffee' }],
  'tea': [{ emoji: '🍵', description: 'tea' }],
  'ice cream': [{ emoji: '🍦', description: 'ice cream' }, { emoji: '🍨', description: 'ice cream bowl' }],

  // Transportation
  'car': [{ emoji: '🚗', description: 'car' }, { emoji: '🚙', description: 'SUV' }],
  'bus': [{ emoji: '🚌', description: 'bus' }],
  'train': [{ emoji: '🚂', description: 'train' }, { emoji: '🚆', description: 'train' }],
  'airplane': [{ emoji: '✈️', description: 'airplane' }, { emoji: '🛩️', description: 'small airplane' }],
  'helicopter': [{ emoji: '🚁', description: 'helicopter' }],
  'boat': [{ emoji: '⛵', description: 'sailboat' }, { emoji: '🚤', description: 'speedboat' }],
  'ship': [{ emoji: '🚢', description: 'ship' }],
  'bicycle': [{ emoji: '🚲', description: 'bicycle' }],
  'motorcycle': [{ emoji: '🏍️', description: 'motorcycle' }],
  'truck': [{ emoji: '🚚', description: 'delivery truck' }],
  'taxi': [{ emoji: '🚕', description: 'taxi' }],
  'rocket': [{ emoji: '🚀', description: 'rocket' }],

  // Nature & Weather
  'sun': [{ emoji: '☀️', description: 'sun' }, { emoji: '🌞', description: 'sun with face' }],
  'moon': [{ emoji: '🌙', description: 'crescent moon' }, { emoji: '🌕', description: 'full moon' }],
  'star': [{ emoji: '⭐', description: 'star' }, { emoji: '🌟', description: 'glowing star' }],
  'cloud': [{ emoji: '☁️', description: 'cloud' }, { emoji: '⛅', description: 'partly cloudy' }],
  'rain': [{ emoji: '🌧️', description: 'rain' }, { emoji: '☔', description: 'umbrella with rain' }],
  'snow': [{ emoji: '❄️', description: 'snowflake' }, { emoji: '🌨️', description: 'snowing' }],
  'lightning': [{ emoji: '⚡', description: 'lightning' }],
  'rainbow': [{ emoji: '🌈', description: 'rainbow' }],
  'tree': [{ emoji: '🌳', description: 'tree' }, { emoji: '🌲', description: 'evergreen tree' }],
  'flower': [{ emoji: '🌸', description: 'cherry blossom' }, { emoji: '🌺', description: 'hibiscus' }, { emoji: '🌻', description: 'sunflower' }],
  'leaf': [{ emoji: '🍃', description: 'leaf' }, { emoji: '🍂', description: 'fallen leaves' }],
  'grass': [{ emoji: '🌱', description: 'seedling' }, { emoji: '🌿', description: 'herb' }],
  'mountain': [{ emoji: '⛰️', description: 'mountain' }, { emoji: '🏔️', description: 'snow-capped mountain' }],
  'volcano': [{ emoji: '🌋', description: 'volcano' }],
  'ocean': [{ emoji: '🌊', description: 'ocean wave' }],
  'desert': [{ emoji: '🏜️', description: 'desert' }],
  'forest': [{ emoji: '🌲', description: 'evergreen tree' }, { emoji: '🌳', description: 'tree' }],

  // Objects & Things
  'house': [{ emoji: '🏠', description: 'house' }, { emoji: '🏡', description: 'house with garden' }],
  'school': [{ emoji: '🏫', description: 'school' }],
  'hospital': [{ emoji: '🏥', description: 'hospital' }],
  'book': [{ emoji: '📖', description: 'open book' }, { emoji: '📚', description: 'books' }],
  'pencil': [{ emoji: '✏️', description: 'pencil' }, { emoji: '📝', description: 'memo' }],
  'pen': [{ emoji: '🖊️', description: 'pen' }],
  'paper': [{ emoji: '📄', description: 'paper' }],
  'computer': [{ emoji: '💻', description: 'laptop' }, { emoji: '🖥️', description: 'desktop computer' }],
  'phone': [{ emoji: '📱', description: 'mobile phone' }, { emoji: '☎️', description: 'telephone' }],
  'television': [{ emoji: '📺', description: 'television' }],
  'clock': [{ emoji: '🕐', description: 'clock' }, { emoji: '⏰', description: 'alarm clock' }],
  'ball': [{ emoji: '⚽', description: 'soccer ball' }, { emoji: '🏀', description: 'basketball' }],
  'toy': [{ emoji: '🧸', description: 'teddy bear' }, { emoji: '🪀', description: 'yo-yo' }],
  'robot': [{ emoji: '🤖', description: 'robot' }],
  'guitar': [{ emoji: '🎸', description: 'guitar' }],
  'piano': [{ emoji: '🎹', description: 'piano' }],
  'drum': [{ emoji: '🥁', description: 'drum' }],
  'violin': [{ emoji: '🎻', description: 'violin' }],
  'camera': [{ emoji: '📷', description: 'camera' }, { emoji: '📸', description: 'camera with flash' }],
  'key': [{ emoji: '🔑', description: 'key' }],
  'door': [{ emoji: '🚪', description: 'door' }],
  'window': [{ emoji: '🪟', description: 'window' }],
  'chair': [{ emoji: '🪑', description: 'chair' }],
  'table': [{ emoji: '🪞', description: 'mirror' }],
  'bed': [{ emoji: '🛏️', description: 'bed' }],
  'lamp': [{ emoji: '💡', description: 'light bulb' }],
  'umbrella': [{ emoji: '☂️', description: 'umbrella' }, { emoji: '🌂', description: 'closed umbrella' }],
  'castle': [{ emoji: '🏰', description: 'castle' }],
  'magic': [{ emoji: '✨', description: 'sparkles' }, { emoji: '🪄', description: 'magic wand' }],
  'monster': [{ emoji: '👾', description: 'monster' }, { emoji: '👹', description: 'ogre' }],
  'ghost': [{ emoji: '👻', description: 'ghost' }],
  'vampire': [{ emoji: '🧛', description: 'vampire' }],
  'zombie': [{ emoji: '🧟', description: 'zombie' }],

  // Colors (as objects)
  'red': [{ emoji: '🔴', description: 'red circle' }, { emoji: '🍎', description: 'red apple' }],
  'blue': [{ emoji: '🔵', description: 'blue circle' }, { emoji: '💙', description: 'blue heart' }],
  'green': [{ emoji: '🟢', description: 'green circle' }, { emoji: '💚', description: 'green heart' }],
  'yellow': [{ emoji: '🟡', description: 'yellow circle' }, { emoji: '💛', description: 'yellow heart' }],
  'orange': [{ emoji: '🟠', description: 'orange circle' }, { emoji: '🍊', description: 'orange fruit' }],
  'purple': [{ emoji: '🟣', description: 'purple circle' }, { emoji: '💜', description: 'purple heart' }],
  'black': [{ emoji: '⚫', description: 'black circle' }, { emoji: '🖤', description: 'black heart' }],
  'white': [{ emoji: '⚪', description: 'white circle' }, { emoji: '🤍', description: 'white heart' }],

  // Body Parts
  'eye': [{ emoji: '👁️', description: 'eye' }, { emoji: '👀', description: 'eyes' }],
  'nose': [{ emoji: '👃', description: 'nose' }],
  'mouth': [{ emoji: '👄', description: 'mouth' }],
  'ear': [{ emoji: '👂', description: 'ear' }],
  'hand': [{ emoji: '✋', description: 'raised hand' }, { emoji: '👋', description: 'waving hand' }],
  'foot': [{ emoji: '🦶', description: 'foot' }],
  'leg': [{ emoji: '🦵', description: 'leg' }],
  'arm': [{ emoji: '💪', description: 'flexed arm' }],

  // Actions & Activities
  'run': [{ emoji: '🏃', description: 'running person' }],
  'walk': [{ emoji: '🚶', description: 'walking person' }],
  'jump': [{ emoji: '🦘', description: 'kangaroo' }],
  'swim': [{ emoji: '🏊', description: 'swimming person' }],
  'fly': [{ emoji: '🦋', description: 'butterfly' }, { emoji: '✈️', description: 'airplane' }],
  'climb': [{ emoji: '🧗', description: 'climbing person' }],
  'kick': [{ emoji: '⚽', description: 'soccer ball' }],
  'throw': [{ emoji: '🤾', description: 'person playing handball' }],
  'catch': [{ emoji: '🥎', description: 'softball' }],
  'dance': [{ emoji: '💃', description: 'dancing woman' }, { emoji: '🕺', description: 'dancing man' }],
  'sing': [{ emoji: '🎤', description: 'microphone' }],
  'read': [{ emoji: '📖', description: 'open book' }],
  'write': [{ emoji: '✍️', description: 'writing hand' }],
  'draw': [{ emoji: '🎨', description: 'artist palette' }],
  'paint': [{ emoji: '🖌️', description: 'paintbrush' }],
  'build': [{ emoji: '🔨', description: 'hammer' }, { emoji: '🧱', description: 'brick' }],
  'play': [{ emoji: '🎮', description: 'video game' }, { emoji: '⚽', description: 'soccer ball' }],
  'sleep': [{ emoji: '😴', description: 'sleeping face' }, { emoji: '🛌', description: 'person in bed' }],
  'eat': [{ emoji: '🍽️', description: 'fork and knife with plate' }],
  'drink': [{ emoji: '🥤', description: 'cup with straw' }],

  // People & Characters
  'queen': [{ emoji: '👸', description: 'queen' }],
  'princess': [{ emoji: '👸', description: 'princess' }],
  'prince': [{ emoji: '🤴', description: 'prince' }],
  'fairy': [{ emoji: '🧚', description: 'fairy' }, { emoji: '🧚‍♀️', description: 'woman fairy' }],
  'wizard': [{ emoji: '🧙', description: 'wizard' }, { emoji: '🧙‍♂️', description: 'man wizard' }],
  'superhero': [{ emoji: '🦸', description: 'superhero' }, { emoji: '🦸‍♂️', description: 'man superhero' }],
  'pirate': [{ emoji: '🏴‍☠️', description: 'pirate flag' }, { emoji: '🦜', description: 'parrot' }],
  'knight': [{ emoji: '🛡️', description: 'shield' }, { emoji: '⚔️', description: 'crossed swords' }],

  // Emotions (simple ones)
  'happy': [{ emoji: '😊', description: 'smiling face' }, { emoji: '😄', description: 'grinning face' }],
  'sad': [{ emoji: '😢', description: 'crying face' }, { emoji: '😞', description: 'disappointed face' }],
  'angry': [{ emoji: '😠', description: 'angry face' }],
  'love': [{ emoji: '❤️', description: 'red heart' }, { emoji: '😍', description: 'heart eyes' }],
  'laugh': [{ emoji: '😂', description: 'laughing face' }],

  // Numbers (as text)
  'one': [{ emoji: '1️⃣', description: 'number one' }],
  'two': [{ emoji: '2️⃣', description: 'number two' }],
  'three': [{ emoji: '3️⃣', description: 'number three' }],
  'four': [{ emoji: '4️⃣', description: 'number four' }],
  'five': [{ emoji: '5️⃣', description: 'number five' }],
  'six': [{ emoji: '6️⃣', description: 'number six' }],
  'seven': [{ emoji: '7️⃣', description: 'number seven' }],
  'eight': [{ emoji: '8️⃣', description: 'number eight' }],
  'nine': [{ emoji: '9️⃣', description: 'number nine' }],
  'ten': [{ emoji: '🔟', description: 'number ten' }],

  // Special educational words
  'alphabet': [{ emoji: '🔤', description: 'alphabet' }],
  'number': [{ emoji: '🔢', description: 'numbers' }],
  'question': [{ emoji: '❓', description: 'question mark' }],
  'exclamation': [{ emoji: '❗', description: 'exclamation mark' }],
  'plus': [{ emoji: '➕', description: 'plus sign' }],
  'minus': [{ emoji: '➖', description: 'minus sign' }],
  'equals': [{ emoji: '🟰', description: 'equals sign' }],
};

// Function to search for emojis based on a word
export function searchEmojis(word: string): EmojiOption[] {
  const searchWord = word.toLowerCase().trim();
  
  // Direct match
  if (EMOJI_DATABASE[searchWord]) {
    return EMOJI_DATABASE[searchWord];
  }
  
  // Fuzzy search - find words that contain the search term
  const fuzzyMatches: EmojiOption[] = [];
  
  Object.keys(EMOJI_DATABASE).forEach(key => {
    if (key.includes(searchWord) || searchWord.includes(key)) {
      fuzzyMatches.push(...EMOJI_DATABASE[key]);
    }
  });
  
  // Remove duplicates
  const uniqueEmojis = fuzzyMatches.filter((emoji, index, self) => 
    index === self.findIndex(e => e.emoji === emoji.emoji)
  );
  
  return uniqueEmojis;
}

// Function to get random emoji suggestions for a letter
export function getEmojiSuggestionsByLetter(letter: string): EmojiOption[] {
  const letterLower = letter.toLowerCase();
  const suggestions: EmojiOption[] = [];
  
  Object.keys(EMOJI_DATABASE).forEach(word => {
    if (word.startsWith(letterLower)) {
      suggestions.push(EMOJI_DATABASE[word][0]); // Add first emoji option for each word
    }
  });
  
  return suggestions.slice(0, 12); // Return up to 12 suggestions
}

// Function to get a default emoji for any word (fallback)
export function getDefaultEmoji(word: string): string {
  const emojis = searchEmojis(word);
  if (emojis.length > 0) {
    return emojis[0].emoji;
  }
  
  // Fallback emojis based on first letter
  const firstLetter = word.charAt(0).toLowerCase();
  const fallbackMap: Record<string, string> = {
    'a': '🅰️', 'b': '🅱️', 'c': '©️', 'd': '🇩', 'e': '🇪', 'f': '🇫', 'g': '🇬', 
    'h': '🇭', 'i': '🇮', 'j': '🇯', 'k': '🇰', 'l': '🇱', 'm': '🇲', 'n': '🇳',
    'o': '🅾️', 'p': '🅿️', 'q': '🇶', 'r': '🇷', 's': '🇸', 't': '🇹', 'u': '🇺',
    'v': '🇻', 'w': '🇼', 'x': '🇽', 'y': '🇾', 'z': '🇿'
  };
  
  return fallbackMap[firstLetter] || '❓';
}