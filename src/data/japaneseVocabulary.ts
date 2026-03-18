import type { JapaneseVocabEntry, JapaneseVocabGroup } from '../types';

type CuratedSeedItem = {
  english: string;
  japanese: string;
  romaji: string;
};

type CuratedSeedGroup = {
  id: string;
  name: string;
  topic: string;
  context: string;
  items: CuratedSeedItem[];
};

const CURATED_GROUPS: CuratedSeedGroup[] = [
  {
    id: 'unit-01-greetings-basics',
    name: 'Unit 01: Greetings and Polite Basics',
    topic: 'greetings',
    context: 'JLPT N5 / Genki-style opening greetings and polite set phrases.',
    items: [
      { english: 'hello', japanese: 'こんにちは', romaji: 'konnichiwa' },
      { english: 'good morning', japanese: 'おはようございます', romaji: 'ohayou gozaimasu' },
      { english: 'good evening', japanese: 'こんばんは', romaji: 'konbanwa' },
      { english: 'good night', japanese: 'おやすみなさい', romaji: 'oyasuminasai' },
      { english: 'thank you', japanese: 'ありがとうございます', romaji: 'arigatou gozaimasu' },
      { english: 'excuse me / sorry', japanese: 'すみません', romaji: 'sumimasen' },
      { english: 'please', japanese: 'お願いします', romaji: 'onegaishimasu' },
      { english: 'yes', japanese: 'はい', romaji: 'hai' },
      { english: 'no', japanese: 'いいえ', romaji: 'iie' },
      { english: 'nice to meet you', japanese: 'はじめまして', romaji: 'hajimemashite' },
    ],
  },
  {
    id: 'unit-02-self-intro-people',
    name: 'Unit 02: Self-Intro and People',
    topic: 'study',
    context: 'Official-course self-introduction nouns: nationality, language, and occupation basics.',
    items: [
      { english: 'I / me', japanese: '私', romaji: 'watashi' },
      { english: 'name', japanese: '名前', romaji: 'namae' },
      { english: 'Japan', japanese: '日本', romaji: 'nihon' },
      { english: 'America', japanese: 'アメリカ', romaji: 'amerika' },
      { english: 'student', japanese: '学生', romaji: 'gakusei' },
      { english: 'teacher', japanese: '先生', romaji: 'sensei' },
      { english: 'company employee', japanese: '会社員', romaji: 'kaishain' },
      { english: 'university', japanese: '大学', romaji: 'daigaku' },
      { english: 'Japanese language', japanese: '日本語', romaji: 'nihongo' },
      { english: 'English language', japanese: '英語', romaji: 'eigo' },
    ],
  },
  {
    id: 'unit-03-question-demonstrative-words',
    name: 'Unit 03: Question and Demonstrative Words',
    topic: 'questions',
    context: 'Classic textbook demonstratives and question words for asking and pointing.',
    items: [
      { english: 'what', japanese: '何', romaji: 'nani' },
      { english: 'who', japanese: '誰', romaji: 'dare' },
      { english: 'where', japanese: 'どこ', romaji: 'doko' },
      { english: 'this', japanese: 'これ', romaji: 'kore' },
      { english: 'that', japanese: 'それ', romaji: 'sore' },
      { english: 'that (over there)', japanese: 'あれ', romaji: 'are' },
      { english: 'which one', japanese: 'どれ', romaji: 'dore' },
      { english: 'here', japanese: 'ここ', romaji: 'koko' },
      { english: 'there', japanese: 'そこ', romaji: 'soko' },
      { english: 'over there', japanese: 'あそこ', romaji: 'asoko' },
    ],
  },
  {
    id: 'unit-04-numbers-1-10',
    name: 'Unit 04: Numbers 1-10',
    topic: 'numbers',
    context: 'Foundational counting in official beginner tracks before time and prices.',
    items: [
      { english: 'one', japanese: '一', romaji: 'ichi' },
      { english: 'two', japanese: '二', romaji: 'ni' },
      { english: 'three', japanese: '三', romaji: 'san' },
      { english: 'four', japanese: '四', romaji: 'yon' },
      { english: 'five', japanese: '五', romaji: 'go' },
      { english: 'six', japanese: '六', romaji: 'roku' },
      { english: 'seven', japanese: '七', romaji: 'nana' },
      { english: 'eight', japanese: '八', romaji: 'hachi' },
      { english: 'nine', japanese: '九', romaji: 'kyuu' },
      { english: 'ten', japanese: '十', romaji: 'juu' },
    ],
  },
  {
    id: 'unit-05-time-and-routine',
    name: 'Unit 05: Time and Daily Routine',
    topic: 'time',
    context: 'Course-standard time vocabulary used for schedules and daily routine sentences.',
    items: [
      { english: 'today', japanese: '今日', romaji: 'kyou' },
      { english: 'tomorrow', japanese: '明日', romaji: 'ashita' },
      { english: 'yesterday', japanese: '昨日', romaji: 'kinou' },
      { english: 'now', japanese: '今', romaji: 'ima' },
      { english: 'morning', japanese: '朝', romaji: 'asa' },
      { english: 'night', japanese: '夜', romaji: 'yoru' },
      { english: 'time', japanese: '時間', romaji: 'jikan' },
      { english: 'week', japanese: '週', romaji: 'shuu' },
      { english: 'month', japanese: '月', romaji: 'tsuki' },
      { english: 'every day', japanese: '毎日', romaji: 'mainichi' },
    ],
  },
  {
    id: 'unit-06-classroom-study-core',
    name: 'Unit 06: Classroom and Study Core',
    topic: 'study',
    context: 'Core classroom nouns recurring across N5-focused lesson books.',
    items: [
      { english: 'book', japanese: '本', romaji: 'hon' },
      { english: 'notebook', japanese: 'ノート', romaji: 'nooto' },
      { english: 'dictionary', japanese: '辞書', romaji: 'jisho' },
      { english: 'word', japanese: '言葉', romaji: 'kotoba' },
      { english: 'sentence', japanese: '文', romaji: 'bun' },
      { english: 'question', japanese: '質問', romaji: 'shitsumon' },
      { english: 'answer', japanese: '答え', romaji: 'kotae' },
      { english: 'homework', japanese: '宿題', romaji: 'shukudai' },
      { english: 'test / exam', japanese: '試験', romaji: 'shiken' },
      { english: 'library', japanese: '図書館', romaji: 'toshokan' },
    ],
  },
  {
    id: 'unit-07-home-everyday-objects',
    name: 'Unit 07: Home and Everyday Objects',
    topic: 'daily-life',
    context: 'Everyday object nouns used in location and possession practice.',
    items: [
      { english: 'house', japanese: '家', romaji: 'ie' },
      { english: 'room', japanese: '部屋', romaji: 'heya' },
      { english: 'door', japanese: 'ドア', romaji: 'doa' },
      { english: 'window', japanese: '窓', romaji: 'mado' },
      { english: 'table', japanese: 'テーブル', romaji: 'teeburu' },
      { english: 'chair', japanese: '椅子', romaji: 'isu' },
      { english: 'bag', japanese: 'かばん', romaji: 'kaban' },
      { english: 'key', japanese: '鍵', romaji: 'kagi' },
      { english: 'phone', japanese: '電話', romaji: 'denwa' },
      { english: 'clock / watch', japanese: '時計', romaji: 'tokei' },
    ],
  },
  {
    id: 'unit-08-food-and-drink-core',
    name: 'Unit 08: Food and Drink Core',
    topic: 'food',
    context: 'Food vocabulary commonly taught before ordering dialogues in beginner curricula.',
    items: [
      { english: 'water', japanese: '水', romaji: 'mizu' },
      { english: 'tea', japanese: 'お茶', romaji: 'ocha' },
      { english: 'coffee', japanese: 'コーヒー', romaji: 'koohii' },
      { english: 'rice / meal', japanese: 'ご飯', romaji: 'gohan' },
      { english: 'bread', japanese: 'パン', romaji: 'pan' },
      { english: 'sushi', japanese: '寿司', romaji: 'sushi' },
      { english: 'ramen', japanese: 'ラーメン', romaji: 'raamen' },
      { english: 'apple', japanese: 'りんご', romaji: 'ringo' },
      { english: 'egg', japanese: '卵', romaji: 'tamago' },
      { english: 'delicious', japanese: 'おいしい', romaji: 'oishii' },
    ],
  },
  {
    id: 'unit-09-core-verbs-1',
    name: 'Unit 09: Core Verbs 1',
    topic: 'verbs',
    context: 'High-frequency verbs from early textbook grammar patterns.',
    items: [
      { english: 'to eat', japanese: '食べる', romaji: 'taberu' },
      { english: 'to drink', japanese: '飲む', romaji: 'nomu' },
      { english: 'to go', japanese: '行く', romaji: 'iku' },
      { english: 'to come', japanese: '来る', romaji: 'kuru' },
      { english: 'to return', japanese: '帰る', romaji: 'kaeru' },
      { english: 'to wake up', japanese: '起きる', romaji: 'okiru' },
      { english: 'to sleep', japanese: '寝る', romaji: 'neru' },
      { english: 'to watch / see', japanese: '見る', romaji: 'miru' },
      { english: 'to speak / talk', japanese: '話す', romaji: 'hanasu' },
      { english: 'to work', japanese: '働く', romaji: 'hataraku' },
    ],
  },
  {
    id: 'unit-10-everyday-descriptions',
    name: 'Unit 10: Everyday Descriptions',
    topic: 'adjectives',
    context: 'Typical i-adjectives and common descriptive words from early grammar lessons.',
    items: [
      { english: 'big', japanese: '大きい', romaji: 'ookii' },
      { english: 'small', japanese: '小さい', romaji: 'chiisai' },
      { english: 'new', japanese: '新しい', romaji: 'atarashii' },
      { english: 'old', japanese: '古い', romaji: 'furui' },
      { english: 'good / nice', japanese: 'いい', romaji: 'ii' },
      { english: 'hot', japanese: '暑い', romaji: 'atsui' },
      { english: 'cold', japanese: '寒い', romaji: 'samui' },
      { english: 'busy', japanese: '忙しい', romaji: 'isogashii' },
      { english: 'easy', japanese: '簡単', romaji: 'kantan' },
      { english: 'difficult', japanese: '難しい', romaji: 'muzukashii' },
    ],
  },
  {
    id: 'unit-11-family-relationships',
    name: 'Unit 11: Family and Relationships',
    topic: 'family',
    context: 'Family set used in textbook chapters on talking about home and people.',
    items: [
      { english: 'family', japanese: '家族', romaji: 'kazoku' },
      { english: 'mother', japanese: 'お母さん', romaji: 'okaasan' },
      { english: 'father', japanese: 'お父さん', romaji: 'otousan' },
      { english: 'older sister', japanese: 'お姉さん', romaji: 'oneesan' },
      { english: 'older brother', japanese: 'お兄さん', romaji: 'oniisan' },
      { english: 'younger sister', japanese: '妹', romaji: 'imouto' },
      { english: 'younger brother', japanese: '弟', romaji: 'otouto' },
      { english: 'child', japanese: '子ども', romaji: 'kodomo' },
      { english: 'parents', japanese: '両親', romaji: 'ryoushin' },
      { english: 'friend', japanese: '友達', romaji: 'tomodachi' },
    ],
  },
  {
    id: 'unit-12-shopping-and-money',
    name: 'Unit 12: Shopping and Money',
    topic: 'shopping',
    context: 'Shopping vocabulary and core phrase for textbook role-play checkout dialogs.',
    items: [
      { english: 'store', japanese: '店', romaji: 'mise' },
      { english: 'money', japanese: 'お金', romaji: 'okane' },
      { english: 'price', japanese: '値段', romaji: 'nedan' },
      { english: 'cheap', japanese: '安い', romaji: 'yasui' },
      { english: 'expensive', japanese: '高い', romaji: 'takai' },
      { english: 'to buy', japanese: '買う', romaji: 'kau' },
      { english: 'cash', japanese: '現金', romaji: 'genkin' },
      { english: 'credit card', japanese: 'クレジットカード', romaji: 'kurejitto kaado' },
      { english: 'receipt', japanese: 'レシート', romaji: 'reshiito' },
      { english: 'how much is it?', japanese: 'いくらですか', romaji: 'ikura desu ka' },
    ],
  },
  {
    id: 'unit-13-train-and-travel-basics',
    name: 'Unit 13: Train and Travel Basics',
    topic: 'travel',
    context: 'Transport words and travel phrase aligned with beginner destination lessons.',
    items: [
      { english: 'train', japanese: '電車', romaji: 'densha' },
      { english: 'station', japanese: '駅', romaji: 'eki' },
      { english: 'bus', japanese: 'バス', romaji: 'basu' },
      { english: 'taxi', japanese: 'タクシー', romaji: 'takushii' },
      { english: 'ticket', japanese: '切符', romaji: 'kippu' },
      { english: 'airport', japanese: '空港', romaji: 'kuukou' },
      { english: 'hotel', japanese: 'ホテル', romaji: 'hoteru' },
      { english: 'map', japanese: '地図', romaji: 'chizu' },
      { english: 'reservation', japanese: '予約', romaji: 'yoyaku' },
      { english: 'where is the station?', japanese: '駅はどこですか', romaji: 'eki wa doko desu ka' },
    ],
  },
  {
    id: 'unit-14-directions-and-useful-places',
    name: 'Unit 14: Directions and Useful Places',
    topic: 'directions',
    context: 'Direction language taught in common N5 navigation and wayfinding chapters.',
    items: [
      { english: 'right', japanese: '右', romaji: 'migi' },
      { english: 'left', japanese: '左', romaji: 'hidari' },
      { english: 'straight ahead', japanese: 'まっすぐ', romaji: 'massugu' },
      { english: 'nearby', japanese: '近く', romaji: 'chikaku' },
      { english: 'restaurant', japanese: 'レストラン', romaji: 'resutoran' },
      { english: 'bathroom / restroom', japanese: 'トイレ', romaji: 'toire' },
      { english: 'entrance', japanese: '入口', romaji: 'iriguchi' },
      { english: 'please go straight', japanese: 'まっすぐ行ってください', romaji: 'massugu itte kudasai' },
      { english: 'where is the restroom?', japanese: 'トイレはどこですか', romaji: 'toire wa doko desu ka' },
      { english: 'this way', japanese: 'こちら', romaji: 'kochira' },
    ],
  },
  {
    id: 'unit-15-weather-and-seasons',
    name: 'Unit 15: Weather and Seasons',
    topic: 'weather',
    context: 'Weather and season vocabulary from standard beginner conversation chapters.',
    items: [
      { english: 'sunny', japanese: '晴れ', romaji: 'hare' },
      { english: 'rain', japanese: '雨', romaji: 'ame' },
      { english: 'cloudy', japanese: '曇り', romaji: 'kumori' },
      { english: 'snow', japanese: '雪', romaji: 'yuki' },
      { english: 'hot', japanese: '暑い', romaji: 'atsui' },
      { english: 'cold', japanese: '寒い', romaji: 'samui' },
      { english: 'spring', japanese: '春', romaji: 'haru' },
      { english: 'summer', japanese: '夏', romaji: 'natsu' },
      { english: 'autumn', japanese: '秋', romaji: 'aki' },
      { english: 'winter', japanese: '冬', romaji: 'fuyu' },
    ],
  },
  {
    id: 'unit-16-body-and-health',
    name: 'Unit 16: Body and Health',
    topic: 'health',
    context: 'Body and clinic vocabulary aligned with beginner health and symptom dialogs.',
    items: [
      { english: 'head', japanese: '頭', romaji: 'atama' },
      { english: 'eye', japanese: '目', romaji: 'me' },
      { english: 'ear', japanese: '耳', romaji: 'mimi' },
      { english: 'mouth', japanese: '口', romaji: 'kuchi' },
      { english: 'hand', japanese: '手', romaji: 'te' },
      { english: 'foot / leg', japanese: '足', romaji: 'ashi' },
      { english: 'stomach', japanese: 'お腹', romaji: 'onaka' },
      { english: 'hospital', japanese: '病院', romaji: 'byouin' },
      { english: 'doctor', japanese: '医者', romaji: 'isha' },
      { english: 'medicine', japanese: '薬', romaji: 'kusuri' },
    ],
  },
];

const entries: JapaneseVocabEntry[] = [];
const groups: JapaneseVocabGroup[] = [];
let rank = 1;

CURATED_GROUPS.forEach((seed, groupIndex) => {
  const group: JapaneseVocabGroup = {
    id: seed.id,
    name: seed.name,
    topic: seed.topic,
    levelBand: Math.min(10, Math.floor(groupIndex / 4) + 1),
    wordIds: [],
  };

  seed.items.forEach((item) => {
    const entry: JapaneseVocabEntry = {
      id: `jp-${String(rank).padStart(5, '0')}`,
      english: item.english,
      japanese: item.japanese,
      romaji: item.romaji,
      context: seed.context,
      groupId: group.id,
      groupName: group.name,
      rank,
      topic: seed.topic,
    };

    group.wordIds.push(entry.id);
    entries.push(entry);
    rank += 1;
  });

  groups.push(group);
});

export const JAPANESE_VOCABULARY: JapaneseVocabEntry[] = entries;
export const JAPANESE_VOCAB_GROUPS: JapaneseVocabGroup[] = groups;

export const JAPANESE_VOCAB_BY_ID: Record<string, JapaneseVocabEntry> = Object.fromEntries(
  JAPANESE_VOCABULARY.map((entry) => [entry.id, entry]),
);

export const GROUP_BY_ID: Record<string, JapaneseVocabGroup> = Object.fromEntries(
  JAPANESE_VOCAB_GROUPS.map((group) => [group.id, group]),
);

export const JAPANESE_VOCAB_SIZE = JAPANESE_VOCABULARY.length;
