import type { VocabEntry } from '../../types';

export const japaneseVocab: VocabEntry[] = [
  // Greetings
  { id: 'ja-001', english: 'hello', translation: 'こんにちは', romanization: 'konnichiwa', category: 'greetings', difficulty: 1, exampleSentence: 'こんにちは！お元気ですか？', exampleTranslation: 'Hello! How are you?' },
  { id: 'ja-002', english: 'goodbye', translation: 'さようなら', romanization: 'sayōnara', category: 'greetings', difficulty: 1 },
  { id: 'ja-003', english: 'good morning', translation: 'おはようございます', romanization: 'ohayō gozaimasu', category: 'greetings', difficulty: 1 },
  { id: 'ja-004', english: 'good evening', translation: 'こんばんは', romanization: 'konbanwa', category: 'greetings', difficulty: 1 },
  { id: 'ja-005', english: 'good night', translation: 'おやすみなさい', romanization: 'oyasuminasai', category: 'greetings', difficulty: 1 },
  { id: 'ja-006', english: 'thank you', translation: 'ありがとうございます', romanization: 'arigatō gozaimasu', category: 'greetings', difficulty: 1, exampleSentence: 'ありがとうございます！助かりました。', exampleTranslation: 'Thank you! That was a great help.' },
  { id: 'ja-007', english: 'excuse me / sorry', translation: 'すみません', romanization: 'sumimasen', category: 'greetings', difficulty: 1 },
  { id: 'ja-008', english: 'nice to meet you', translation: 'はじめまして', romanization: 'hajimemashite', category: 'greetings', difficulty: 1, exampleSentence: 'はじめまして。田中と申します。', exampleTranslation: 'Nice to meet you. My name is Tanaka.' },
  { id: 'ja-009', english: 'how are you', translation: 'お元気ですか？', romanization: 'ogenki desu ka?', category: 'greetings', difficulty: 1 },
  { id: 'ja-010', english: 'yes', translation: 'はい', romanization: 'hai', category: 'greetings', difficulty: 1 },

  // Numbers
  { id: 'ja-011', english: 'one', translation: '一 (いち)', romanization: 'ichi', category: 'numbers', difficulty: 1 },
  { id: 'ja-012', english: 'two', translation: '二 (に)', romanization: 'ni', category: 'numbers', difficulty: 1 },
  { id: 'ja-013', english: 'three', translation: '三 (さん)', romanization: 'san', category: 'numbers', difficulty: 1 },
  { id: 'ja-014', english: 'four', translation: '四 (し・よん)', romanization: 'shi / yon', category: 'numbers', difficulty: 1 },
  { id: 'ja-015', english: 'five', translation: '五 (ご)', romanization: 'go', category: 'numbers', difficulty: 1 },
  { id: 'ja-016', english: 'six', translation: '六 (ろく)', romanization: 'roku', category: 'numbers', difficulty: 1 },
  { id: 'ja-017', english: 'seven', translation: '七 (しち・なな)', romanization: 'shichi / nana', category: 'numbers', difficulty: 1 },
  { id: 'ja-018', english: 'eight', translation: '八 (はち)', romanization: 'hachi', category: 'numbers', difficulty: 1 },
  { id: 'ja-019', english: 'nine', translation: '九 (く・きゅう)', romanization: 'ku / kyū', category: 'numbers', difficulty: 1 },
  { id: 'ja-020', english: 'ten', translation: '十 (じゅう)', romanization: 'jū', category: 'numbers', difficulty: 1 },
  { id: 'ja-021', english: 'hundred', translation: '百 (ひゃく)', romanization: 'hyaku', category: 'numbers', difficulty: 2 },
  { id: 'ja-022', english: 'thousand', translation: '千 (せん)', romanization: 'sen', category: 'numbers', difficulty: 2 },

  // Colors
  { id: 'ja-023', english: 'red', translation: '赤 (あか)', romanization: 'aka', category: 'colors', difficulty: 1 },
  { id: 'ja-024', english: 'blue', translation: '青 (あお)', romanization: 'ao', category: 'colors', difficulty: 1 },
  { id: 'ja-025', english: 'white', translation: '白 (しろ)', romanization: 'shiro', category: 'colors', difficulty: 1 },
  { id: 'ja-026', english: 'black', translation: '黒 (くろ)', romanization: 'kuro', category: 'colors', difficulty: 1 },
  { id: 'ja-027', english: 'yellow', translation: '黄色 (きいろ)', romanization: 'kiiro', category: 'colors', difficulty: 1 },
  { id: 'ja-028', english: 'green', translation: '緑 (みどり)', romanization: 'midori', category: 'colors', difficulty: 1 },
  { id: 'ja-029', english: 'orange', translation: 'オレンジ', romanization: 'orenji', category: 'colors', difficulty: 2 },
  { id: 'ja-030', english: 'purple', translation: '紫 (むらさき)', romanization: 'murasaki', category: 'colors', difficulty: 2 },
  { id: 'ja-031', english: 'pink', translation: 'ピンク', romanization: 'pinku', category: 'colors', difficulty: 1 },
  { id: 'ja-032', english: 'brown', translation: '茶色 (ちゃいろ)', romanization: 'chairo', category: 'colors', difficulty: 2 },

  // Food
  { id: 'ja-033', english: 'rice', translation: 'ご飯 (ごはん)', romanization: 'gohan', category: 'food', difficulty: 1, exampleSentence: 'ご飯を食べましょう。', exampleTranslation: "Let's eat rice / Let's eat a meal." },
  { id: 'ja-034', english: 'sushi', translation: 'お寿司 (おすし)', romanization: 'osushi', category: 'food', difficulty: 1 },
  { id: 'ja-035', english: 'ramen', translation: 'ラーメン', romanization: 'rāmen', category: 'food', difficulty: 1 },
  { id: 'ja-036', english: 'tempura', translation: '天ぷら (てんぷら)', romanization: 'tenpura', category: 'food', difficulty: 2 },
  { id: 'ja-037', english: 'water', translation: '水 (みず)', romanization: 'mizu', category: 'food', difficulty: 1 },
  { id: 'ja-038', english: 'tea', translation: 'お茶 (おちゃ)', romanization: 'ocha', category: 'food', difficulty: 1 },
  { id: 'ja-039', english: 'bread', translation: 'パン', romanization: 'pan', category: 'food', difficulty: 1 },
  { id: 'ja-040', english: 'egg', translation: '卵 (たまご)', romanization: 'tamago', category: 'food', difficulty: 1 },
  { id: 'ja-041', english: 'fish', translation: '魚 (さかな)', romanization: 'sakana', category: 'food', difficulty: 1 },
  { id: 'ja-042', english: 'meat', translation: '肉 (にく)', romanization: 'niku', category: 'food', difficulty: 1 },
  { id: 'ja-043', english: 'tofu', translation: '豆腐 (とうふ)', romanization: 'tōfu', category: 'food', difficulty: 1 },
  { id: 'ja-044', english: 'miso soup', translation: '味噌汁 (みそしる)', romanization: 'misoshiru', category: 'food', difficulty: 2, exampleSentence: '朝食に味噌汁を飲みます。', exampleTranslation: 'I drink miso soup at breakfast.' },

  // Travel
  { id: 'ja-045', english: 'train', translation: '電車 (でんしゃ)', romanization: 'densha', category: 'travel', difficulty: 1, exampleSentence: '電車で東京へ行きます。', exampleTranslation: 'I go to Tokyo by train.' },
  { id: 'ja-046', english: 'station', translation: '駅 (えき)', romanization: 'eki', category: 'travel', difficulty: 1 },
  { id: 'ja-047', english: 'airport', translation: '空港 (くうこう)', romanization: 'kūkō', category: 'travel', difficulty: 2 },
  { id: 'ja-048', english: 'hotel', translation: 'ホテル', romanization: 'hoteru', category: 'travel', difficulty: 1 },
  { id: 'ja-049', english: 'ticket', translation: '切符 (きっぷ)', romanization: 'kippu', category: 'travel', difficulty: 2 },
  { id: 'ja-050', english: 'passport', translation: 'パスポート', romanization: 'pasupōto', category: 'travel', difficulty: 2 },
  { id: 'ja-051', english: 'map', translation: '地図 (ちず)', romanization: 'chizu', category: 'travel', difficulty: 2 },
  { id: 'ja-052', english: 'bus', translation: 'バス', romanization: 'basu', category: 'travel', difficulty: 1 },
  { id: 'ja-053', english: 'taxi', translation: 'タクシー', romanization: 'takushī', category: 'travel', difficulty: 1 },

  // Family
  { id: 'ja-054', english: 'mother', translation: 'お母さん (おかあさん)', romanization: 'okāsan', category: 'family', difficulty: 1 },
  { id: 'ja-055', english: 'father', translation: 'お父さん (おとうさん)', romanization: 'otōsan', category: 'family', difficulty: 1 },
  { id: 'ja-056', english: 'older sister', translation: 'お姉さん (おねえさん)', romanization: 'onēsan', category: 'family', difficulty: 2 },
  { id: 'ja-057', english: 'older brother', translation: 'お兄さん (おにいさん)', romanization: 'oniisan', category: 'family', difficulty: 2 },
  { id: 'ja-058', english: 'younger sister', translation: '妹 (いもうと)', romanization: 'imōto', category: 'family', difficulty: 2 },
  { id: 'ja-059', english: 'younger brother', translation: '弟 (おとうと)', romanization: 'otōto', category: 'family', difficulty: 2 },
  { id: 'ja-060', english: 'grandmother', translation: 'おばあさん', romanization: 'obāsan', category: 'family', difficulty: 1 },
  { id: 'ja-061', english: 'grandfather', translation: 'おじいさん', romanization: 'ojīsan', category: 'family', difficulty: 1 },
  { id: 'ja-062', english: 'child', translation: '子供 (こども)', romanization: 'kodomo', category: 'family', difficulty: 1 },
  { id: 'ja-063', english: 'friend', translation: '友達 (ともだち)', romanization: 'tomodachi', category: 'family', difficulty: 1 },

  // Time
  { id: 'ja-064', english: 'today', translation: '今日 (きょう)', romanization: 'kyō', category: 'time', difficulty: 1 },
  { id: 'ja-065', english: 'tomorrow', translation: '明日 (あした)', romanization: 'ashita', category: 'time', difficulty: 1 },
  { id: 'ja-066', english: 'yesterday', translation: '昨日 (きのう)', romanization: 'kinō', category: 'time', difficulty: 1 },
  { id: 'ja-067', english: 'morning', translation: '朝 (あさ)', romanization: 'asa', category: 'time', difficulty: 1 },
  { id: 'ja-068', english: 'evening', translation: '夕方 (ゆうがた)', romanization: 'yūgata', category: 'time', difficulty: 2 },
  { id: 'ja-069', english: 'night', translation: '夜 (よる)', romanization: 'yoru', category: 'time', difficulty: 1 },
  { id: 'ja-070', english: 'now', translation: '今 (いま)', romanization: 'ima', category: 'time', difficulty: 1 },
  { id: 'ja-071', english: 'week', translation: '週 (しゅう)', romanization: 'shū', category: 'time', difficulty: 2 },
  { id: 'ja-072', english: 'month', translation: '月 (つき)', romanization: 'tsuki', category: 'time', difficulty: 2 },
  { id: 'ja-073', english: 'year', translation: '年 (とし・ねん)', romanization: 'toshi / nen', category: 'time', difficulty: 2 },

  // Weather
  { id: 'ja-074', english: 'sunny', translation: '晴れ (はれ)', romanization: 'hare', category: 'weather', difficulty: 1, exampleSentence: '今日は晴れです。', exampleTranslation: 'Today is sunny.' },
  { id: 'ja-075', english: 'rain', translation: '雨 (あめ)', romanization: 'ame', category: 'weather', difficulty: 1 },
  { id: 'ja-076', english: 'snow', translation: '雪 (ゆき)', romanization: 'yuki', category: 'weather', difficulty: 1 },
  { id: 'ja-077', english: 'cloudy', translation: '曇り (くもり)', romanization: 'kumori', category: 'weather', difficulty: 2 },
  { id: 'ja-078', english: 'wind', translation: '風 (かぜ)', romanization: 'kaze', category: 'weather', difficulty: 1 },
  { id: 'ja-079', english: 'hot', translation: '暑い (あつい)', romanization: 'atsui', category: 'weather', difficulty: 1 },
  { id: 'ja-080', english: 'cold', translation: '寒い (さむい)', romanization: 'samui', category: 'weather', difficulty: 1 },
  { id: 'ja-081', english: 'typhoon', translation: '台風 (たいふう)', romanization: 'taifū', category: 'weather', difficulty: 3 },

  // Body
  { id: 'ja-082', english: 'head', translation: '頭 (あたま)', romanization: 'atama', category: 'body', difficulty: 1 },
  { id: 'ja-083', english: 'eye', translation: '目 (め)', romanization: 'me', category: 'body', difficulty: 1 },
  { id: 'ja-084', english: 'ear', translation: '耳 (みみ)', romanization: 'mimi', category: 'body', difficulty: 1 },
  { id: 'ja-085', english: 'nose', translation: '鼻 (はな)', romanization: 'hana', category: 'body', difficulty: 1 },
  { id: 'ja-086', english: 'mouth', translation: '口 (くち)', romanization: 'kuchi', category: 'body', difficulty: 1 },
  { id: 'ja-087', english: 'hand', translation: '手 (て)', romanization: 'te', category: 'body', difficulty: 1 },
  { id: 'ja-088', english: 'foot / leg', translation: '足 (あし)', romanization: 'ashi', category: 'body', difficulty: 1 },
  { id: 'ja-089', english: 'back', translation: '背中 (せなか)', romanization: 'senaka', category: 'body', difficulty: 2 },
  { id: 'ja-090', english: 'stomach', translation: 'お腹 (おなか)', romanization: 'onaka', category: 'body', difficulty: 2 },

  // Verbs
  { id: 'ja-091', english: 'to eat', translation: '食べる (たべる)', romanization: 'taberu', category: 'verbs', difficulty: 1, exampleSentence: '私は寿司を食べます。', exampleTranslation: 'I eat sushi.' },
  { id: 'ja-092', english: 'to drink', translation: '飲む (のむ)', romanization: 'nomu', category: 'verbs', difficulty: 1 },
  { id: 'ja-093', english: 'to go', translation: '行く (いく)', romanization: 'iku', category: 'verbs', difficulty: 1 },
  { id: 'ja-094', english: 'to come', translation: '来る (くる)', romanization: 'kuru', category: 'verbs', difficulty: 1 },
  { id: 'ja-095', english: 'to see / to watch', translation: '見る (みる)', romanization: 'miru', category: 'verbs', difficulty: 1 },
  { id: 'ja-096', english: 'to listen / to hear', translation: '聞く (きく)', romanization: 'kiku', category: 'verbs', difficulty: 1 },
  { id: 'ja-097', english: 'to speak', translation: '話す (はなす)', romanization: 'hanasu', category: 'verbs', difficulty: 2, exampleSentence: '日本語を話します。', exampleTranslation: 'I speak Japanese.' },
  { id: 'ja-098', english: 'to write', translation: '書く (かく)', romanization: 'kaku', category: 'verbs', difficulty: 2 },
  { id: 'ja-099', english: 'to read', translation: '読む (よむ)', romanization: 'yomu', category: 'verbs', difficulty: 2 },
  { id: 'ja-100', english: 'to buy', translation: '買う (かう)', romanization: 'kau', category: 'verbs', difficulty: 2 },
  { id: 'ja-101', english: 'to sleep', translation: '寝る (ねる)', romanization: 'neru', category: 'verbs', difficulty: 1 },
  { id: 'ja-102', english: 'to work', translation: '働く (はたらく)', romanization: 'hataraku', category: 'verbs', difficulty: 2 },

  // Adjectives
  { id: 'ja-103', english: 'big', translation: '大きい (おおきい)', romanization: 'ōkii', category: 'adjectives', difficulty: 1 },
  { id: 'ja-104', english: 'small', translation: '小さい (ちいさい)', romanization: 'chiisai', category: 'adjectives', difficulty: 1 },
  { id: 'ja-105', english: 'new', translation: '新しい (あたらしい)', romanization: 'atarashii', category: 'adjectives', difficulty: 2 },
  { id: 'ja-106', english: 'old', translation: '古い (ふるい)', romanization: 'furui', category: 'adjectives', difficulty: 2 },
  { id: 'ja-107', english: 'delicious', translation: 'おいしい', romanization: 'oishii', category: 'adjectives', difficulty: 1, exampleSentence: 'このラーメンはおいしい！', exampleTranslation: 'This ramen is delicious!' },
  { id: 'ja-108', english: 'beautiful', translation: '美しい (うつくしい)', romanization: 'utsukushii', category: 'adjectives', difficulty: 3 },
  { id: 'ja-109', english: 'fast / early', translation: '速い / 早い (はやい)', romanization: 'hayai', category: 'adjectives', difficulty: 2 },
  { id: 'ja-110', english: 'expensive', translation: '高い (たかい)', romanization: 'takai', category: 'adjectives', difficulty: 2 },
  { id: 'ja-111', english: 'cheap / low', translation: '安い (やすい)', romanization: 'yasui', category: 'adjectives', difficulty: 2 },

  // Phrases
  { id: 'ja-112', english: 'I understand', translation: 'わかりました', romanization: 'wakarimashita', category: 'phrases', difficulty: 1 },
  { id: 'ja-113', english: 'I don\'t understand', translation: 'わかりません', romanization: 'wakarimasen', category: 'phrases', difficulty: 1 },
  { id: 'ja-114', english: 'please (requesting)', translation: 'お願いします (おねがいします)', romanization: 'onegaishimasu', category: 'phrases', difficulty: 1 },
  { id: 'ja-115', english: 'let\'s eat (before a meal)', translation: 'いただきます', romanization: 'itadakimasu', category: 'phrases', difficulty: 1, exampleSentence: '食事の前に「いただきます」と言います。', exampleTranslation: 'We say "itadakimasu" before a meal.' },
  { id: 'ja-116', english: 'thank you for the meal', translation: 'ごちそうさまでした', romanization: 'gochisōsamadeshita', category: 'phrases', difficulty: 2 },
  { id: 'ja-117', english: 'welcome (shop greeting)', translation: 'いらっしゃいませ', romanization: 'irasshaimase', category: 'phrases', difficulty: 3 },
  { id: 'ja-118', english: 'that\'s right / indeed', translation: 'そうです', romanization: 'sō desu', category: 'phrases', difficulty: 2 },

  // Directions
  { id: 'ja-119', english: 'right', translation: '右 (みぎ)', romanization: 'migi', category: 'directions', difficulty: 1 },
  { id: 'ja-120', english: 'left', translation: '左 (ひだり)', romanization: 'hidari', category: 'directions', difficulty: 1 },
  { id: 'ja-121', english: 'straight ahead', translation: 'まっすぐ', romanization: 'massugu', category: 'directions', difficulty: 1, exampleSentence: 'まっすぐ行ってください。', exampleTranslation: 'Please go straight ahead.' },
  { id: 'ja-122', english: 'north', translation: '北 (きた)', romanization: 'kita', category: 'directions', difficulty: 2 },
  { id: 'ja-123', english: 'south', translation: '南 (みなみ)', romanization: 'minami', category: 'directions', difficulty: 2 },
  { id: 'ja-124', english: 'east', translation: '東 (ひがし)', romanization: 'higashi', category: 'directions', difficulty: 2 },
  { id: 'ja-125', english: 'west', translation: '西 (にし)', romanization: 'nishi', category: 'directions', difficulty: 2 },
  { id: 'ja-126', english: 'nearby', translation: '近く (ちかく)', romanization: 'chikaku', category: 'directions', difficulty: 2 },

  // Shopping
  { id: 'ja-127', english: 'how much', translation: 'いくら', romanization: 'ikura', category: 'shopping', difficulty: 1, exampleSentence: 'これはいくらですか？', exampleTranslation: 'How much is this?' },
  { id: 'ja-128', english: 'money', translation: 'お金 (おかね)', romanization: 'okane', category: 'shopping', difficulty: 1 },
  { id: 'ja-129', english: 'store / shop', translation: 'お店 (おみせ)', romanization: 'omise', category: 'shopping', difficulty: 1 },
  { id: 'ja-130', english: 'receipt', translation: 'レシート', romanization: 'reshīto', category: 'shopping', difficulty: 2 },
  { id: 'ja-131', english: 'cash', translation: '現金 (げんきん)', romanization: 'genkin', category: 'shopping', difficulty: 2 },
  { id: 'ja-132', english: 'sale / discount', translation: 'セール', romanization: 'sēru', category: 'shopping', difficulty: 2 },

  // Health
  { id: 'ja-133', english: 'hospital', translation: '病院 (びょういん)', romanization: 'byōin', category: 'health', difficulty: 2, exampleSentence: '病院に行かなければなりません。', exampleTranslation: 'I have to go to the hospital.' },
  { id: 'ja-134', english: 'doctor', translation: '医者 (いしゃ)', romanization: 'isha', category: 'health', difficulty: 2 },
  { id: 'ja-135', english: 'medicine', translation: '薬 (くすり)', romanization: 'kusuri', category: 'health', difficulty: 2 },
  { id: 'ja-136', english: 'pain / it hurts', translation: '痛い (いたい)', romanization: 'itai', category: 'health', difficulty: 2 },
  { id: 'ja-137', english: 'fever', translation: '熱 (ねつ)', romanization: 'netsu', category: 'health', difficulty: 2 },
  { id: 'ja-138', english: 'allergy', translation: 'アレルギー', romanization: 'arerugī', category: 'health', difficulty: 3 },

  // Education
  { id: 'ja-139', english: 'school', translation: '学校 (がっこう)', romanization: 'gakkō', category: 'education', difficulty: 1, exampleSentence: '毎日学校へ行きます。', exampleTranslation: 'I go to school every day.' },
  { id: 'ja-140', english: 'university', translation: '大学 (だいがく)', romanization: 'daigaku', category: 'education', difficulty: 2 },
  { id: 'ja-141', english: 'teacher', translation: '先生 (せんせい)', romanization: 'sensei', category: 'education', difficulty: 1 },
  { id: 'ja-142', english: 'student', translation: '学生 (がくせい)', romanization: 'gakusei', category: 'education', difficulty: 1 },
  { id: 'ja-143', english: 'textbook', translation: '教科書 (きょうかしょ)', romanization: 'kyōkasho', category: 'education', difficulty: 3 },
  { id: 'ja-144', english: 'homework', translation: '宿題 (しゅくだい)', romanization: 'shukudai', category: 'education', difficulty: 2 },
  { id: 'ja-145', english: 'exam / test', translation: '試験 (しけん)', romanization: 'shiken', category: 'education', difficulty: 3, exampleSentence: '明日、試験があります。', exampleTranslation: 'There is an exam tomorrow.' },
  { id: 'ja-146', english: 'library', translation: '図書館 (としょかん)', romanization: 'toshokan', category: 'education', difficulty: 3 },
  { id: 'ja-147', english: 'to study', translation: '勉強する (べんきょうする)', romanization: 'benkyō suru', category: 'education', difficulty: 2, exampleSentence: '日本語を勉強しています。', exampleTranslation: 'I am studying Japanese.' },
  { id: 'ja-148', english: 'language', translation: '言語 / 言葉 (ことば)', romanization: 'gengo / kotoba', category: 'education', difficulty: 3 },
];

export default japaneseVocab;
