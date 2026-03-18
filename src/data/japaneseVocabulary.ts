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
    id: 'greetings-basics',
    name: 'Polite Greetings and Basics',
    topic: 'greetings',
    context: 'Core polite expressions used in greetings, thanks, and first meetings.',
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
    id: 'self-intro-classroom',
    name: 'Self-Intro and Classroom Nouns',
    topic: 'study',
    context: 'Foundational words for self-introductions and early classroom study.',
    items: [
      { english: 'I / me', japanese: '私', romaji: 'watashi' },
      { english: 'name', japanese: '名前', romaji: 'namae' },
      { english: 'student', japanese: '学生', romaji: 'gakusei' },
      { english: 'teacher', japanese: '先生', romaji: 'sensei' },
      { english: 'school', japanese: '学校', romaji: 'gakkou' },
      { english: 'book', japanese: '本', romaji: 'hon' },
      { english: 'notebook', japanese: 'ノート', romaji: 'nooto' },
      { english: 'dictionary', japanese: '辞書', romaji: 'jisho' },
      { english: 'Japanese language', japanese: '日本語', romaji: 'nihongo' },
      { english: 'English language', japanese: '英語', romaji: 'eigo' },
    ],
  },
  {
    id: 'numbers-1-10',
    name: 'Numbers 1-10',
    topic: 'numbers',
    context: 'Basic counting words that appear in every beginner Japanese course.',
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
    id: 'time-daily-rhythm',
    name: 'Time and Daily Rhythm',
    topic: 'time',
    context: 'High-frequency time words used to talk about routines and schedules.',
    items: [
      { english: 'today', japanese: '今日', romaji: 'kyou' },
      { english: 'tomorrow', japanese: '明日', romaji: 'ashita' },
      { english: 'yesterday', japanese: '昨日', romaji: 'kinou' },
      { english: 'morning', japanese: '朝', romaji: 'asa' },
      { english: 'afternoon', japanese: '昼', romaji: 'hiru' },
      { english: 'night', japanese: '夜', romaji: 'yoru' },
      { english: 'now', japanese: '今', romaji: 'ima' },
      { english: 'every day', japanese: '毎日', romaji: 'mainichi' },
      { english: 'weekend', japanese: '週末', romaji: 'shuumatsu' },
      { english: 'time', japanese: '時間', romaji: 'jikan' },
    ],
  },
  {
    id: 'family-relationships',
    name: 'Family and Close Relationships',
    topic: 'family',
    context: 'Starter family and relationship vocabulary used in personal introductions.',
    items: [
      { english: 'family', japanese: '家族', romaji: 'kazoku' },
      { english: 'friend', japanese: '友達', romaji: 'tomodachi' },
      { english: 'mother', japanese: 'お母さん', romaji: 'okaasan' },
      { english: 'father', japanese: 'お父さん', romaji: 'otousan' },
      { english: 'older sister', japanese: 'お姉さん', romaji: 'oneesan' },
      { english: 'older brother', japanese: 'お兄さん', romaji: 'oniisan' },
      { english: 'younger sister', japanese: '妹', romaji: 'imouto' },
      { english: 'younger brother', japanese: '弟', romaji: 'otouto' },
      { english: 'child', japanese: '子ども', romaji: 'kodomo' },
      { english: 'parents', japanese: '両親', romaji: 'ryoushin' },
    ],
  },
  {
    id: 'food-drinks-1',
    name: 'Food and Drinks 1',
    topic: 'food',
    context: 'Common beginner food vocabulary found in textbook dialogues and restaurant practice.',
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
    id: 'core-verbs-1',
    name: 'Core Verbs 1',
    topic: 'verbs',
    context: 'Essential dictionary-form verbs used in early sentence building.',
    items: [
      { english: 'to eat', japanese: '食べる', romaji: 'taberu' },
      { english: 'to drink', japanese: '飲む', romaji: 'nomu' },
      { english: 'to go', japanese: '行く', romaji: 'iku' },
      { english: 'to come', japanese: '来る', romaji: 'kuru' },
      { english: 'to see / watch', japanese: '見る', romaji: 'miru' },
      { english: 'to listen / hear', japanese: '聞く', romaji: 'kiku' },
      { english: 'to read', japanese: '読む', romaji: 'yomu' },
      { english: 'to write', japanese: '書く', romaji: 'kaku' },
      { english: 'to speak / talk', japanese: '話す', romaji: 'hanasu' },
      { english: 'to study', japanese: '勉強する', romaji: 'benkyou suru' },
    ],
  },
  {
    id: 'home-everyday-objects',
    name: 'Home and Everyday Objects',
    topic: 'daily-life',
    context: 'Useful home and carry-around nouns that support practical beginner conversation.',
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
    id: 'shopping-money',
    name: 'Shopping and Money',
    topic: 'shopping',
    context: 'Shopping vocabulary with one essential phrase learners use in real purchases.',
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
    id: 'train-travel-basics',
    name: 'Train and Travel Basics',
    topic: 'travel',
    context: 'Core transport and trip vocabulary modeled on common textbook travel units.',
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
    id: 'directions-useful-places',
    name: 'Directions and Useful Places',
    topic: 'directions',
    context: 'Common direction words and location nouns that support asking for help.',
    items: [
      { english: 'right', japanese: '右', romaji: 'migi' },
      { english: 'left', japanese: '左', romaji: 'hidari' },
      { english: 'straight ahead', japanese: 'まっすぐ', romaji: 'massugu' },
      { english: 'here', japanese: 'ここ', romaji: 'koko' },
      { english: 'there', japanese: 'そこ', romaji: 'soko' },
      { english: 'nearby', japanese: '近く', romaji: 'chikaku' },
      { english: 'restaurant', japanese: 'レストラン', romaji: 'resutoran' },
      { english: 'bathroom / restroom', japanese: 'トイレ', romaji: 'toire' },
      { english: 'entrance', japanese: '入口', romaji: 'iriguchi' },
      { english: 'please go straight', japanese: 'まっすぐ行ってください', romaji: 'massugu itte kudasai' },
    ],
  },
  {
    id: 'weather-seasons',
    name: 'Weather and Seasons',
    topic: 'weather',
    context: 'Everyday weather and season vocabulary taught early in beginner courses.',
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
    id: 'body-health',
    name: 'Body and Health',
    topic: 'health',
    context: 'Body parts and basic health words needed for simple symptom talk.',
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
  {
    id: 'everyday-descriptions',
    name: 'Everyday Descriptions',
    topic: 'adjectives',
    context: 'High-frequency adjectives for describing objects, plans, and experiences.',
    items: [
      { english: 'big', japanese: '大きい', romaji: 'ookii' },
      { english: 'small', japanese: '小さい', romaji: 'chiisai' },
      { english: 'new', japanese: '新しい', romaji: 'atarashii' },
      { english: 'old', japanese: '古い', romaji: 'furui' },
      { english: 'good / nice', japanese: 'いい', romaji: 'ii' },
      { english: 'bad', japanese: '悪い', romaji: 'warui' },
      { english: 'busy', japanese: '忙しい', romaji: 'isogashii' },
      { english: 'free (not busy)', japanese: '暇', romaji: 'hima' },
      { english: 'easy', japanese: '簡単', romaji: 'kantan' },
      { english: 'difficult', japanese: '難しい', romaji: 'muzukashii' },
    ],
  },
  {
    id: 'question-words-study-phrases',
    name: 'Question Words and Study Phrases',
    topic: 'questions',
    context: 'Core question words plus a few essential classroom survival phrases.',
    items: [
      { english: 'what', japanese: '何', romaji: 'nani' },
      { english: 'who', japanese: '誰', romaji: 'dare' },
      { english: 'where', japanese: 'どこ', romaji: 'doko' },
      { english: 'when', japanese: 'いつ', romaji: 'itsu' },
      { english: 'why', japanese: 'どうして', romaji: 'doushite' },
      { english: 'how', japanese: 'どう', romaji: 'dou' },
      { english: 'which one', japanese: 'どれ', romaji: 'dore' },
      { english: 'I understand', japanese: 'わかります', romaji: 'wakarimasu' },
      { english: 'I do not understand', japanese: 'わかりません', romaji: 'wakarimasen' },
      { english: 'one more time, please', japanese: 'もう一度お願いします', romaji: 'mou ichido onegaishimasu' },
    ],
  },
  {
    id: 'meals-ordering',
    name: 'Meals and Ordering',
    topic: 'food',
    context: 'Words and phrases that naturally show up when ordering and talking about meals.',
    items: [
      { english: 'menu', japanese: 'メニュー', romaji: 'menyuu' },
      { english: 'breakfast', japanese: '朝ご飯', romaji: 'asagohan' },
      { english: 'lunch', japanese: '昼ご飯', romaji: 'hirugohan' },
      { english: 'dinner', japanese: '晩ご飯', romaji: 'bangohan' },
      { english: 'fork', japanese: 'フォーク', romaji: 'fooku' },
      { english: 'spoon', japanese: 'スプーン', romaji: 'supuun' },
      { english: 'chopsticks', japanese: '箸', romaji: 'hashi' },
      { english: 'water, please', japanese: 'お水をお願いします', romaji: 'omizu o onegaishimasu' },
      { english: 'this one, please', japanese: 'これをお願いします', romaji: 'kore o onegaishimasu' },
      { english: 'this is delicious', japanese: 'これはおいしいです', romaji: 'kore wa oishii desu' },
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
