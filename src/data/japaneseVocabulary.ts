import type { JapaneseVocabEntry, JapaneseVocabGroup } from '../types';

type NounSeed = {
  english: string;
  japanese: string;
  romaji: string;
  topic: string;
};

type VerbSeed = {
  english: string;
  japanesePlain: string;
  romajiPlain: string;
  japaneseMasu: string;
  romajiMasu: string;
  japaneseMasuPast: string;
  romajiMasuPast: string;
  japaneseRequest: string;
  romajiRequest: string;
  topic: string;
};

type AdjectiveSeed = {
  english: string;
  japanese: string;
  romaji: string;
  topic: string;
};

type PlaceSeed = {
  english: string;
  japanese: string;
  romaji: string;
  topic: string;
};

type TimeSeed = {
  english: string;
  japanese: string;
  romaji: string;
};

const NOUNS: NounSeed[] = [
  { english: 'water', japanese: '水', romaji: 'mizu', topic: 'daily-life' },
  { english: 'rice', japanese: 'ご飯', romaji: 'gohan', topic: 'food' },
  { english: 'tea', japanese: 'お茶', romaji: 'ocha', topic: 'food' },
  { english: 'coffee', japanese: 'コーヒー', romaji: 'koohii', topic: 'food' },
  { english: 'bread', japanese: 'パン', romaji: 'pan', topic: 'food' },
  { english: 'noodle soup', japanese: 'ラーメン', romaji: 'raamen', topic: 'food' },
  { english: 'sushi', japanese: '寿司', romaji: 'sushi', topic: 'food' },
  { english: 'fish', japanese: '魚', romaji: 'sakana', topic: 'food' },
  { english: 'meat', japanese: '肉', romaji: 'niku', topic: 'food' },
  { english: 'vegetable', japanese: '野菜', romaji: 'yasai', topic: 'food' },
  { english: 'fruit', japanese: '果物', romaji: 'kudamono', topic: 'food' },
  { english: 'apple', japanese: 'りんご', romaji: 'ringo', topic: 'food' },
  { english: 'banana', japanese: 'バナナ', romaji: 'banana', topic: 'food' },
  { english: 'egg', japanese: '卵', romaji: 'tamago', topic: 'food' },
  { english: 'milk', japanese: '牛乳', romaji: 'gyuunyuu', topic: 'food' },
  { english: 'salt', japanese: '塩', romaji: 'shio', topic: 'food' },
  { english: 'sugar', japanese: '砂糖', romaji: 'satou', topic: 'food' },
  { english: 'friend', japanese: '友達', romaji: 'tomodachi', topic: 'social' },
  { english: 'teacher', japanese: '先生', romaji: 'sensei', topic: 'study' },
  { english: 'student', japanese: '学生', romaji: 'gakusei', topic: 'study' },
  { english: 'book', japanese: '本', romaji: 'hon', topic: 'study' },
  { english: 'notebook', japanese: 'ノート', romaji: 'nooto', topic: 'study' },
  { english: 'dictionary', japanese: '辞書', romaji: 'jisho', topic: 'study' },
  { english: 'word', japanese: '言葉', romaji: 'kotoba', topic: 'study' },
  { english: 'sentence', japanese: '文', romaji: 'bun', topic: 'study' },
  { english: 'question', japanese: '質問', romaji: 'shitsumon', topic: 'study' },
  { english: 'answer', japanese: '答え', romaji: 'kotae', topic: 'study' },
  { english: 'meeting', japanese: '会議', romaji: 'kaigi', topic: 'work' },
  { english: 'email', japanese: 'メール', romaji: 'meeru', topic: 'work' },
  { english: 'report', japanese: '報告書', romaji: 'houkokusho', topic: 'work' },
  { english: 'project', japanese: 'プロジェクト', romaji: 'purojekuto', topic: 'work' },
  { english: 'schedule', japanese: '予定', romaji: 'yotei', topic: 'work' },
  { english: 'money', japanese: 'お金', romaji: 'okane', topic: 'daily-life' },
  { english: 'time', japanese: '時間', romaji: 'jikan', topic: 'daily-life' },
  { english: 'phone', japanese: '電話', romaji: 'denwa', topic: 'daily-life' },
  { english: 'message', japanese: 'メッセージ', romaji: 'messeji', topic: 'daily-life' },
  { english: 'home', japanese: '家', romaji: 'ie', topic: 'daily-life' },
  { english: 'room', japanese: '部屋', romaji: 'heya', topic: 'daily-life' },
  { english: 'door', japanese: 'ドア', romaji: 'doa', topic: 'daily-life' },
  { english: 'window', japanese: '窓', romaji: 'mado', topic: 'daily-life' },
  { english: 'table', japanese: 'テーブル', romaji: 'teeburu', topic: 'daily-life' },
  { english: 'chair', japanese: '椅子', romaji: 'isu', topic: 'daily-life' },
  { english: 'bag', japanese: 'かばん', romaji: 'kaban', topic: 'daily-life' },
  { english: 'key', japanese: '鍵', romaji: 'kagi', topic: 'daily-life' },
  { english: 'clock', japanese: '時計', romaji: 'tokei', topic: 'daily-life' },
  { english: 'train', japanese: '電車', romaji: 'densha', topic: 'travel' },
  { english: 'station', japanese: '駅', romaji: 'eki', topic: 'travel' },
  { english: 'ticket', japanese: '切符', romaji: 'kippu', topic: 'travel' },
  { english: 'bus', japanese: 'バス', romaji: 'basu', topic: 'travel' },
  { english: 'taxi', japanese: 'タクシー', romaji: 'takushii', topic: 'travel' },
  { english: 'airport', japanese: '空港', romaji: 'kuukou', topic: 'travel' },
  { english: 'hotel', japanese: 'ホテル', romaji: 'hoteru', topic: 'travel' },
  { english: 'map', japanese: '地図', romaji: 'chizu', topic: 'travel' },
  { english: 'road', japanese: '道', romaji: 'michi', topic: 'travel' },
  { english: 'car', japanese: '車', romaji: 'kuruma', topic: 'travel' },
  { english: 'bicycle', japanese: '自転車', romaji: 'jitensha', topic: 'travel' },
  { english: 'rain', japanese: '雨', romaji: 'ame', topic: 'nature' },
  { english: 'snow', japanese: '雪', romaji: 'yuki', topic: 'nature' },
  { english: 'wind', japanese: '風', romaji: 'kaze', topic: 'nature' },
  { english: 'sun', japanese: '太陽', romaji: 'taiyou', topic: 'nature' },
  { english: 'moon', japanese: '月', romaji: 'tsuki', topic: 'nature' },
  { english: 'tree', japanese: '木', romaji: 'ki', topic: 'nature' },
  { english: 'flower', japanese: '花', romaji: 'hana', topic: 'nature' },
  { english: 'mountain', japanese: '山', romaji: 'yama', topic: 'nature' },
  { english: 'river', japanese: '川', romaji: 'kawa', topic: 'nature' },
  { english: 'sea', japanese: '海', romaji: 'umi', topic: 'nature' },
  { english: 'doctor', japanese: '医者', romaji: 'isha', topic: 'health' },
  { english: 'hospital', japanese: '病院', romaji: 'byouin', topic: 'health' },
  { english: 'medicine', japanese: '薬', romaji: 'kusuri', topic: 'health' },
  { english: 'head', japanese: '頭', romaji: 'atama', topic: 'health' },
  { english: 'stomach', japanese: 'お腹', romaji: 'onaka', topic: 'health' },
  { english: 'hand', japanese: '手', romaji: 'te', topic: 'health' },
  { english: 'foot', japanese: '足', romaji: 'ashi', topic: 'health' },
  { english: 'company', japanese: '会社', romaji: 'kaisha', topic: 'work' },
  { english: 'office', japanese: '事務所', romaji: 'jimusho', topic: 'work' },
  { english: 'boss', japanese: '上司', romaji: 'joushi', topic: 'work' },
  { english: 'coworker', japanese: '同僚', romaji: 'douryou', topic: 'work' },
  { english: 'task', japanese: '作業', romaji: 'sagyou', topic: 'work' },
  { english: 'plan', japanese: '計画', romaji: 'keikaku', topic: 'work' },
  { english: 'family', japanese: '家族', romaji: 'kazoku', topic: 'social' },
  { english: 'mother', japanese: '母', romaji: 'haha', topic: 'social' },
  { english: 'father', japanese: '父', romaji: 'chichi', topic: 'social' },
  { english: 'sister', japanese: '姉', romaji: 'ane', topic: 'social' },
  { english: 'brother', japanese: '兄', romaji: 'ani', topic: 'social' },
  { english: 'child', japanese: '子供', romaji: 'kodomo', topic: 'social' },
  { english: 'weekend', japanese: '週末', romaji: 'shuumatsu', topic: 'daily-life' },
  { english: 'holiday', japanese: '休日', romaji: 'kyuujitsu', topic: 'daily-life' },
  { english: 'music', japanese: '音楽', romaji: 'ongaku', topic: 'entertainment' },
  { english: 'movie', japanese: '映画', romaji: 'eiga', topic: 'entertainment' },
  { english: 'game', japanese: 'ゲーム', romaji: 'geemu', topic: 'entertainment' },
  { english: 'song', japanese: '歌', romaji: 'uta', topic: 'entertainment' },
  { english: 'news', japanese: 'ニュース', romaji: 'nyuusu', topic: 'entertainment' },
  { english: 'camera', japanese: 'カメラ', romaji: 'kamera', topic: 'daily-life' },
  { english: 'computer', japanese: 'コンピューター', romaji: 'konpyuutaa', topic: 'daily-life' },
  { english: 'keyboard', japanese: 'キーボード', romaji: 'kiiboodo', topic: 'daily-life' },
  { english: 'screen', japanese: '画面', romaji: 'gamen', topic: 'daily-life' },
  { english: 'website', japanese: 'ウェブサイト', romaji: 'webusaito', topic: 'daily-life' },
  { english: 'city', japanese: '都市', romaji: 'toshi', topic: 'travel' },
  { english: 'village', japanese: '村', romaji: 'mura', topic: 'travel' },
  { english: 'country', japanese: '国', romaji: 'kuni', topic: 'travel' },
  { english: 'language', japanese: '日本語', romaji: 'nihongo', topic: 'study' },
  { english: 'test', japanese: '試験', romaji: 'shiken', topic: 'study' },
  { english: 'homework', japanese: '宿題', romaji: 'shukudai', topic: 'study' },
  { english: 'class', japanese: '授業', romaji: 'jugyou', topic: 'study' },
  { english: 'library', japanese: '図書館', romaji: 'toshokan', topic: 'study' },
  { english: 'park', japanese: '公園', romaji: 'kouen', topic: 'travel' },
  { english: 'restaurant', japanese: 'レストラン', romaji: 'resutoran', topic: 'food' },
  { english: 'shop', japanese: '店', romaji: 'mise', topic: 'daily-life' },
  { english: 'market', japanese: '市場', romaji: 'ichiba', topic: 'daily-life' },
  { english: 'price', japanese: '値段', romaji: 'nedan', topic: 'daily-life' },
  { english: 'questionnaire', japanese: 'アンケート', romaji: 'ankeeto', topic: 'work' },
  { english: 'contract', japanese: '契約', romaji: 'keiyaku', topic: 'work' },
  { english: 'goal', japanese: '目標', romaji: 'mokuhyou', topic: 'work' },
  { english: 'idea', japanese: '考え', romaji: 'kangae', topic: 'work' },
  { english: 'problem', japanese: '問題', romaji: 'mondai', topic: 'work' },
  { english: 'solution', japanese: '解決', romaji: 'kaiketsu', topic: 'work' },
  { english: 'train line', japanese: '路線', romaji: 'rosen', topic: 'travel' },
  { english: 'platform', japanese: 'ホーム', romaji: 'hoomu', topic: 'travel' },
  { english: 'reservation', japanese: '予約', romaji: 'yoyaku', topic: 'travel' },
  { english: 'passport', japanese: 'パスポート', romaji: 'pasupooto', topic: 'travel' },
  { english: 'luggage', japanese: '荷物', romaji: 'nimotsu', topic: 'travel' },
  { english: 'check-in', japanese: 'チェックイン', romaji: 'chekkuin', topic: 'travel' },
  { english: 'check-out', japanese: 'チェックアウト', romaji: 'chekkuauto', topic: 'travel' },
];

const VERBS: VerbSeed[] = [
  { english: 'eat', japanesePlain: '食べる', romajiPlain: 'taberu', japaneseMasu: '食べます', romajiMasu: 'tabemasu', japaneseMasuPast: '食べました', romajiMasuPast: 'tabemashita', japaneseRequest: '食べてください', romajiRequest: 'tabete kudasai', topic: 'food' },
  { english: 'drink', japanesePlain: '飲む', romajiPlain: 'nomu', japaneseMasu: '飲みます', romajiMasu: 'nomimasu', japaneseMasuPast: '飲みました', romajiMasuPast: 'nomimashita', japaneseRequest: '飲んでください', romajiRequest: 'nonde kudasai', topic: 'food' },
  { english: 'buy', japanesePlain: '買う', romajiPlain: 'kau', japaneseMasu: '買います', romajiMasu: 'kaimasu', japaneseMasuPast: '買いました', romajiMasuPast: 'kaimashita', japaneseRequest: '買ってください', romajiRequest: 'katte kudasai', topic: 'daily-life' },
  { english: 'sell', japanesePlain: '売る', romajiPlain: 'uru', japaneseMasu: '売ります', romajiMasu: 'urimasu', japaneseMasuPast: '売りました', romajiMasuPast: 'urimashita', japaneseRequest: '売ってください', romajiRequest: 'utte kudasai', topic: 'daily-life' },
  { english: 'read', japanesePlain: '読む', romajiPlain: 'yomu', japaneseMasu: '読みます', romajiMasu: 'yomimasu', japaneseMasuPast: '読みました', romajiMasuPast: 'yomimashita', japaneseRequest: '読んでください', romajiRequest: 'yonde kudasai', topic: 'study' },
  { english: 'write', japanesePlain: '書く', romajiPlain: 'kaku', japaneseMasu: '書きます', romajiMasu: 'kakimasu', japaneseMasuPast: '書きました', romajiMasuPast: 'kakimashita', japaneseRequest: '書いてください', romajiRequest: 'kaite kudasai', topic: 'study' },
  { english: 'listen', japanesePlain: '聞く', romajiPlain: 'kiku', japaneseMasu: '聞きます', romajiMasu: 'kikimasu', japaneseMasuPast: '聞きました', romajiMasuPast: 'kikimashita', japaneseRequest: '聞いてください', romajiRequest: 'kiite kudasai', topic: 'social' },
  { english: 'watch', japanesePlain: '見る', romajiPlain: 'miru', japaneseMasu: '見ます', romajiMasu: 'mimasu', japaneseMasuPast: '見ました', romajiMasuPast: 'mimashita', japaneseRequest: '見てください', romajiRequest: 'mite kudasai', topic: 'entertainment' },
  { english: 'speak', japanesePlain: '話す', romajiPlain: 'hanasu', japaneseMasu: '話します', romajiMasu: 'hanashimasu', japaneseMasuPast: '話しました', romajiMasuPast: 'hanashimashita', japaneseRequest: '話してください', romajiRequest: 'hanashite kudasai', topic: 'social' },
  { english: 'study', japanesePlain: '勉強する', romajiPlain: 'benkyou suru', japaneseMasu: '勉強します', romajiMasu: 'benkyou shimasu', japaneseMasuPast: '勉強しました', romajiMasuPast: 'benkyou shimashita', japaneseRequest: '勉強してください', romajiRequest: 'benkyou shite kudasai', topic: 'study' },
  { english: 'work', japanesePlain: '働く', romajiPlain: 'hataraku', japaneseMasu: '働きます', romajiMasu: 'hatarakimasu', japaneseMasuPast: '働きました', romajiMasuPast: 'hatarakimashita', japaneseRequest: '働いてください', romajiRequest: 'hataraite kudasai', topic: 'work' },
  { english: 'rest', japanesePlain: '休む', romajiPlain: 'yasumu', japaneseMasu: '休みます', romajiMasu: 'yasumimasu', japaneseMasuPast: '休みました', romajiMasuPast: 'yasumimashita', japaneseRequest: '休んでください', romajiRequest: 'yasunde kudasai', topic: 'daily-life' },
  { english: 'sleep', japanesePlain: '寝る', romajiPlain: 'neru', japaneseMasu: '寝ます', romajiMasu: 'nemasu', japaneseMasuPast: '寝ました', romajiMasuPast: 'nemashita', japaneseRequest: '寝てください', romajiRequest: 'nete kudasai', topic: 'daily-life' },
  { english: 'wake up', japanesePlain: '起きる', romajiPlain: 'okiru', japaneseMasu: '起きます', romajiMasu: 'okimasu', japaneseMasuPast: '起きました', romajiMasuPast: 'okimashita', japaneseRequest: '起きてください', romajiRequest: 'okite kudasai', topic: 'daily-life' },
  { english: 'go', japanesePlain: '行く', romajiPlain: 'iku', japaneseMasu: '行きます', romajiMasu: 'ikimasu', japaneseMasuPast: '行きました', romajiMasuPast: 'ikimashita', japaneseRequest: '行ってください', romajiRequest: 'itte kudasai', topic: 'travel' },
  { english: 'come', japanesePlain: '来る', romajiPlain: 'kuru', japaneseMasu: '来ます', romajiMasu: 'kimasu', japaneseMasuPast: '来ました', romajiMasuPast: 'kimashita', japaneseRequest: '来てください', romajiRequest: 'kite kudasai', topic: 'travel' },
  { english: 'return', japanesePlain: '帰る', romajiPlain: 'kaeru', japaneseMasu: '帰ります', romajiMasu: 'kaerimasu', japaneseMasuPast: '帰りました', romajiMasuPast: 'kaerimashita', japaneseRequest: '帰ってください', romajiRequest: 'kaette kudasai', topic: 'travel' },
  { english: 'walk', japanesePlain: '歩く', romajiPlain: 'aruku', japaneseMasu: '歩きます', romajiMasu: 'arukimasu', japaneseMasuPast: '歩きました', romajiMasuPast: 'arukimashita', japaneseRequest: '歩いてください', romajiRequest: 'aruite kudasai', topic: 'travel' },
  { english: 'run', japanesePlain: '走る', romajiPlain: 'hashiru', japaneseMasu: '走ります', romajiMasu: 'hashirimasu', japaneseMasuPast: '走りました', romajiMasuPast: 'hashirimashita', japaneseRequest: '走ってください', romajiRequest: 'hashitte kudasai', topic: 'travel' },
  { english: 'open', japanesePlain: '開ける', romajiPlain: 'akeru', japaneseMasu: '開けます', romajiMasu: 'akemasu', japaneseMasuPast: '開けました', romajiMasuPast: 'akemashita', japaneseRequest: '開けてください', romajiRequest: 'akete kudasai', topic: 'daily-life' },
  { english: 'close', japanesePlain: '閉める', romajiPlain: 'shimeru', japaneseMasu: '閉めます', romajiMasu: 'shimemasu', japaneseMasuPast: '閉めました', romajiMasuPast: 'shimemashita', japaneseRequest: '閉めてください', romajiRequest: 'shimete kudasai', topic: 'daily-life' },
  { english: 'turn on', japanesePlain: 'つける', romajiPlain: 'tsukeru', japaneseMasu: 'つけます', romajiMasu: 'tsukemasu', japaneseMasuPast: 'つけました', romajiMasuPast: 'tsukemashita', japaneseRequest: 'つけてください', romajiRequest: 'tsukete kudasai', topic: 'daily-life' },
  { english: 'turn off', japanesePlain: '消す', romajiPlain: 'kesu', japaneseMasu: '消します', romajiMasu: 'keshimasu', japaneseMasuPast: '消しました', romajiMasuPast: 'keshimashita', japaneseRequest: '消してください', romajiRequest: 'keshite kudasai', topic: 'daily-life' },
  { english: 'meet', japanesePlain: '会う', romajiPlain: 'au', japaneseMasu: '会います', romajiMasu: 'aimasu', japaneseMasuPast: '会いました', romajiMasuPast: 'aimashita', japaneseRequest: '会ってください', romajiRequest: 'atte kudasai', topic: 'social' },
  { english: 'call', japanesePlain: '電話する', romajiPlain: 'denwa suru', japaneseMasu: '電話します', romajiMasu: 'denwa shimasu', japaneseMasuPast: '電話しました', romajiMasuPast: 'denwa shimashita', japaneseRequest: '電話してください', romajiRequest: 'denwa shite kudasai', topic: 'social' },
  { english: 'send', japanesePlain: '送る', romajiPlain: 'okuru', japaneseMasu: '送ります', romajiMasu: 'okurimasu', japaneseMasuPast: '送りました', romajiMasuPast: 'okurimashita', japaneseRequest: '送ってください', romajiRequest: 'okutte kudasai', topic: 'work' },
  { english: 'receive', japanesePlain: '受け取る', romajiPlain: 'uketoru', japaneseMasu: '受け取ります', romajiMasu: 'uketorimasu', japaneseMasuPast: '受け取りました', romajiMasuPast: 'uketorimashita', japaneseRequest: '受け取ってください', romajiRequest: 'uketotte kudasai', topic: 'work' },
  { english: 'use', japanesePlain: '使う', romajiPlain: 'tsukau', japaneseMasu: '使います', romajiMasu: 'tsukaimasu', japaneseMasuPast: '使いました', romajiMasuPast: 'tsukaimashita', japaneseRequest: '使ってください', romajiRequest: 'tsukatte kudasai', topic: 'daily-life' },
  { english: 'make', japanesePlain: '作る', romajiPlain: 'tsukuru', japaneseMasu: '作ります', romajiMasu: 'tsukurimasu', japaneseMasuPast: '作りました', romajiMasuPast: 'tsukurimashita', japaneseRequest: '作ってください', romajiRequest: 'tsukutte kudasai', topic: 'work' },
  { english: 'fix', japanesePlain: '直す', romajiPlain: 'naosu', japaneseMasu: '直します', romajiMasu: 'naoshimasu', japaneseMasuPast: '直しました', romajiMasuPast: 'naoshimashita', japaneseRequest: '直してください', romajiRequest: 'naoshite kudasai', topic: 'work' },
  { english: 'remember', japanesePlain: '覚える', romajiPlain: 'oboeru', japaneseMasu: '覚えます', romajiMasu: 'oboemasu', japaneseMasuPast: '覚えました', romajiMasuPast: 'oboemashita', japaneseRequest: '覚えてください', romajiRequest: 'oboete kudasai', topic: 'study' },
  { english: 'forget', japanesePlain: '忘れる', romajiPlain: 'wasureru', japaneseMasu: '忘れます', romajiMasu: 'wasuremasu', japaneseMasuPast: '忘れました', romajiMasuPast: 'wasuremashita', japaneseRequest: '忘れてください', romajiRequest: 'wasurete kudasai', topic: 'study' },
  { english: 'start', japanesePlain: '始める', romajiPlain: 'hajimeru', japaneseMasu: '始めます', romajiMasu: 'hajimemasu', japaneseMasuPast: '始めました', romajiMasuPast: 'hajimemashita', japaneseRequest: '始めてください', romajiRequest: 'hajimete kudasai', topic: 'work' },
  { english: 'finish', japanesePlain: '終わる', romajiPlain: 'owaru', japaneseMasu: '終わります', romajiMasu: 'owarimasu', japaneseMasuPast: '終わりました', romajiMasuPast: 'owarimashita', japaneseRequest: '終わってください', romajiRequest: 'owatte kudasai', topic: 'work' },
  { english: 'wait', japanesePlain: '待つ', romajiPlain: 'matsu', japaneseMasu: '待ちます', romajiMasu: 'machimasu', japaneseMasuPast: '待ちました', romajiMasuPast: 'machimashita', japaneseRequest: '待ってください', romajiRequest: 'matte kudasai', topic: 'social' },
  { english: 'help', japanesePlain: '手伝う', romajiPlain: 'tetsudau', japaneseMasu: '手伝います', romajiMasu: 'tetsudaimasu', japaneseMasuPast: '手伝いました', romajiMasuPast: 'tetsudaimashita', japaneseRequest: '手伝ってください', romajiRequest: 'tetsudatte kudasai', topic: 'social' },
  { english: 'clean', japanesePlain: '掃除する', romajiPlain: 'souji suru', japaneseMasu: '掃除します', romajiMasu: 'souji shimasu', japaneseMasuPast: '掃除しました', romajiMasuPast: 'souji shimashita', japaneseRequest: '掃除してください', romajiRequest: 'souji shite kudasai', topic: 'daily-life' },
  { english: 'cook', japanesePlain: '料理する', romajiPlain: 'ryouri suru', japaneseMasu: '料理します', romajiMasu: 'ryouri shimasu', japaneseMasuPast: '料理しました', romajiMasuPast: 'ryouri shimashita', japaneseRequest: '料理してください', romajiRequest: 'ryouri shite kudasai', topic: 'food' },
  { english: 'practice', japanesePlain: '練習する', romajiPlain: 'renshuu suru', japaneseMasu: '練習します', romajiMasu: 'renshuu shimasu', japaneseMasuPast: '練習しました', romajiMasuPast: 'renshuu shimashita', japaneseRequest: '練習してください', romajiRequest: 'renshuu shite kudasai', topic: 'study' },
  { english: 'travel', japanesePlain: '旅行する', romajiPlain: 'ryokou suru', japaneseMasu: '旅行します', romajiMasu: 'ryokou shimasu', japaneseMasuPast: '旅行しました', romajiMasuPast: 'ryokou shimashita', japaneseRequest: '旅行してください', romajiRequest: 'ryokou shite kudasai', topic: 'travel' },
  { english: 'pay', japanesePlain: '払う', romajiPlain: 'harau', japaneseMasu: '払います', romajiMasu: 'haraimasu', japaneseMasuPast: '払いました', romajiMasuPast: 'haraimashita', japaneseRequest: '払ってください', romajiRequest: 'haratte kudasai', topic: 'daily-life' },
];

const ADJECTIVES: AdjectiveSeed[] = [
  { english: 'good', japanese: '良い', romaji: 'yoi', topic: 'general' },
  { english: 'bad', japanese: '悪い', romaji: 'warui', topic: 'general' },
  { english: 'new', japanese: '新しい', romaji: 'atarashii', topic: 'general' },
  { english: 'old', japanese: '古い', romaji: 'furui', topic: 'general' },
  { english: 'big', japanese: '大きい', romaji: 'ookii', topic: 'general' },
  { english: 'small', japanese: '小さい', romaji: 'chiisai', topic: 'general' },
  { english: 'cheap', japanese: '安い', romaji: 'yasui', topic: 'daily-life' },
  { english: 'expensive', japanese: '高い', romaji: 'takai', topic: 'daily-life' },
  { english: 'fast', japanese: '速い', romaji: 'hayai', topic: 'travel' },
  { english: 'slow', japanese: '遅い', romaji: 'osoi', topic: 'travel' },
  { english: 'hot', japanese: '暑い', romaji: 'atsui', topic: 'nature' },
  { english: 'cold', japanese: '寒い', romaji: 'samui', topic: 'nature' },
  { english: 'sweet', japanese: '甘い', romaji: 'amai', topic: 'food' },
  { english: 'salty', japanese: 'しょっぱい', romaji: 'shoppai', topic: 'food' },
  { english: 'delicious', japanese: 'おいしい', romaji: 'oishii', topic: 'food' },
  { english: 'busy', japanese: '忙しい', romaji: 'isogashii', topic: 'work' },
  { english: 'free', japanese: '暇', romaji: 'hima', topic: 'work' },
  { english: 'easy', japanese: '簡単', romaji: 'kantan', topic: 'study' },
  { english: 'difficult', japanese: '難しい', romaji: 'muzukashii', topic: 'study' },
  { english: 'interesting', japanese: '面白い', romaji: 'omoshiroi', topic: 'entertainment' },
  { english: 'boring', japanese: 'つまらない', romaji: 'tsumaranai', topic: 'entertainment' },
  { english: 'quiet', japanese: '静か', romaji: 'shizuka', topic: 'daily-life' },
  { english: 'noisy', japanese: 'うるさい', romaji: 'urusai', topic: 'daily-life' },
  { english: 'important', japanese: '大切', romaji: 'taisetsu', topic: 'work' },
  { english: 'safe', japanese: '安全', romaji: 'anzen', topic: 'general' },
];

const PLACES: PlaceSeed[] = [
  { english: 'at home', japanese: '家で', romaji: 'ie de', topic: 'daily-life' },
  { english: 'at school', japanese: '学校で', romaji: 'gakkou de', topic: 'study' },
  { english: 'at the office', japanese: '会社で', romaji: 'kaisha de', topic: 'work' },
  { english: 'at the station', japanese: '駅で', romaji: 'eki de', topic: 'travel' },
  { english: 'at the restaurant', japanese: 'レストランで', romaji: 'resutoran de', topic: 'food' },
  { english: 'at the store', japanese: '店で', romaji: 'mise de', topic: 'daily-life' },
  { english: 'in the park', japanese: '公園で', romaji: 'kouen de', topic: 'travel' },
  { english: 'at the hospital', japanese: '病院で', romaji: 'byouin de', topic: 'health' },
  { english: 'at the library', japanese: '図書館で', romaji: 'toshokan de', topic: 'study' },
  { english: 'in the city', japanese: '都市で', romaji: 'toshi de', topic: 'travel' },
  { english: 'on the train', japanese: '電車で', romaji: 'densha de', topic: 'travel' },
  { english: 'online', japanese: 'オンラインで', romaji: 'onrain de', topic: 'daily-life' },
];

const TIMES: TimeSeed[] = [
  { english: 'today', japanese: '今日', romaji: 'kyou' },
  { english: 'tomorrow', japanese: '明日', romaji: 'ashita' },
  { english: 'yesterday', japanese: '昨日', romaji: 'kinou' },
  { english: 'this morning', japanese: '今朝', romaji: 'kesa' },
  { english: 'tonight', japanese: '今夜', romaji: 'konya' },
  { english: 'every day', japanese: '毎日', romaji: 'mainichi' },
  { english: 'every week', japanese: '毎週', romaji: 'maishuu' },
  { english: 'sometimes', japanese: '時々', romaji: 'tokidoki' },
  { english: 'often', japanese: 'よく', romaji: 'yoku' },
  { english: 'right now', japanese: '今', romaji: 'ima' },
];

const entries: JapaneseVocabEntry[] = [];
const groups: JapaneseVocabGroup[] = [];
const streamGroupCounter = new Map<string, number>();
const streamCurrentGroup = new Map<string, JapaneseVocabGroup>();
let rank = 1;

function currentBand(fromRank: number): number {
  return Math.min(10, Math.floor((fromRank - 1) / 2000) + 1);
}

function getOrCreateGroup(streamId: string, streamName: string, topic: string): JapaneseVocabGroup {
  const active = streamCurrentGroup.get(streamId);
  if (active && active.wordIds.length < 20) {
    return active;
  }

  const nextIndex = (streamGroupCounter.get(streamId) ?? 0) + 1;
  streamGroupCounter.set(streamId, nextIndex);

  const group: JapaneseVocabGroup = {
    id: `${streamId}-${String(nextIndex).padStart(4, '0')}`,
    name: `${streamName} ${nextIndex}`,
    topic,
    levelBand: currentBand(rank),
    wordIds: [],
  };

  streamCurrentGroup.set(streamId, group);
  groups.push(group);
  return group;
}

function pushEntry(streamId: string, streamName: string, topic: string, english: string, japanese: string, romaji: string, context: string): void {
  const group = getOrCreateGroup(streamId, streamName, topic);
  const entry: JapaneseVocabEntry = {
    id: `jp-${String(rank).padStart(5, '0')}`,
    english,
    japanese,
    romaji,
    context,
    groupId: group.id,
    groupName: group.name,
    rank,
    topic,
  };

  group.wordIds.push(entry.id);
  entries.push(entry);
  rank += 1;
}

function buildBaseVocabulary(): void {
  NOUNS.forEach((noun) => {
    pushEntry(
      `core-noun-${noun.topic}`,
      `${noun.topic} core nouns`,
      noun.topic,
      noun.english,
      noun.japanese,
      noun.romaji,
      `Basic ${noun.topic} noun used frequently in everyday conversation.`,
    );
  });

  VERBS.forEach((verb) => {
    pushEntry(
      `core-verb-${verb.topic}`,
      `${verb.topic} core verbs`,
      verb.topic,
      `to ${verb.english}`,
      verb.japanesePlain,
      verb.romajiPlain,
      `Dictionary form of a common ${verb.topic} verb.`,
    );
  });

  ADJECTIVES.forEach((adj) => {
    pushEntry(
      `core-adj-${adj.topic}`,
      `${adj.topic} core adjectives`,
      adj.topic,
      adj.english,
      adj.japanese,
      adj.romaji,
      `Common adjective for daily descriptions and beginner conversations.`,
    );
  });
}

function buildVerbObjectSet(): void {
  VERBS.forEach((verb) => {
    NOUNS.forEach((noun) => {
      pushEntry(
        `verb-object-${verb.topic}`,
        `${verb.topic} verb + object`,
        verb.topic,
        `${verb.english} ${noun.english}`,
        `${noun.japanese}を${verb.japaneseMasu}`,
        `${noun.romaji} o ${verb.romajiMasu}`,
        `Polite sentence pattern with object + verb. Common in practical conversation.`,
      );
    });
  });
}

function buildRequestsSet(): void {
  VERBS.forEach((verb) => {
    NOUNS.forEach((noun) => {
      pushEntry(
        `request-${verb.topic}`,
        `${verb.topic} polite requests`,
        verb.topic,
        `please ${verb.english} ${noun.english}`,
        `${noun.japanese}を${verb.japaneseRequest}`,
        `${noun.romaji} o ${verb.romajiRequest}`,
        `Useful request form used in service, home, and travel situations.`,
      );
    });
  });
}

function buildAdjectiveNounSet(): void {
  ADJECTIVES.forEach((adj) => {
    NOUNS.forEach((noun) => {
      pushEntry(
        `adj-noun-${adj.topic}`,
        `${adj.topic} adjective + noun`,
        adj.topic,
        `${adj.english} ${noun.english}`,
        `${adj.japanese}${noun.japanese}`,
        `${adj.romaji} ${noun.romaji}`,
        `Adjective + noun collocation. Good for describing people, things, and situations.`,
      );
    });
  });
}

function buildNounPlaceSet(): void {
  NOUNS.forEach((noun) => {
    PLACES.forEach((place) => {
      pushEntry(
        `noun-place-${noun.topic}`,
        `${noun.topic} noun in place`,
        noun.topic,
        `${noun.english} at ${place.english.replace('at ', '')}`,
        `${place.japanese}、${noun.japanese}`,
        `${place.romaji}, ${noun.romaji}`,
        `Location phrase often used in short explanations and travel conversations.`,
      );
    });
  });
}

function buildTimeVerbSet(): void {
  TIMES.forEach((time) => {
    VERBS.forEach((verb) => {
      pushEntry(
        `time-verb-${verb.topic}`,
        `${verb.topic} time + verb`,
        verb.topic,
        `${time.english} ${verb.english}`,
        `${time.japanese}${verb.japaneseMasu}`,
        `${time.romaji} ${verb.romajiMasu}`,
        `Temporal phrase showing when an action happens; natural in routine talk.`,
      );
    });
  });
}

function buildFullSentenceSet(): void {
  const nounSubset = NOUNS.slice(0, 30);
  const verbSubset = VERBS.slice(0, 20);
  const placeSubset = PLACES.slice(0, 10);

  nounSubset.forEach((noun) => {
    verbSubset.forEach((verb) => {
      placeSubset.forEach((place) => {
        pushEntry(
          `full-sentence-${verb.topic}`,
          `${verb.topic} practical sentences`,
          verb.topic,
          `I ${verb.english} ${noun.english} ${place.english}`,
          `私は${place.japanese}${noun.japanese}を${verb.japaneseMasu}`,
          `watashi wa ${place.romaji} ${noun.romaji} o ${verb.romajiMasu}`,
          `High-frequency sentence frame used by beginners in daily interactions.`,
        );
      });
    });
  });
}

function buildPastSentenceSet(): void {
  const nounSubset = NOUNS.slice(0, 30);
  const verbSubset = VERBS.slice(0, 20);
  const placeSubset = PLACES.slice(0, 10);

  nounSubset.forEach((noun) => {
    verbSubset.forEach((verb) => {
      placeSubset.forEach((place) => {
        pushEntry(
          `past-sentence-${verb.topic}`,
          `${verb.topic} past-tense sentences`,
          verb.topic,
          `I ${verb.english} ${noun.english} ${place.english} yesterday`,
          `昨日私は${place.japanese}${noun.japanese}を${verb.japaneseMasuPast}`,
          `kinou watashi wa ${place.romaji} ${noun.romaji} o ${verb.romajiMasuPast}`,
          `Polite past tense sentence for talking about completed actions.`,
        );
      });
    });
  });
}

buildBaseVocabulary();
buildVerbObjectSet();
buildRequestsSet();
buildAdjectiveNounSet();
buildNounPlaceSet();
buildTimeVerbSet();
buildFullSentenceSet();
buildPastSentenceSet();

export const JAPANESE_VOCABULARY: JapaneseVocabEntry[] = entries;
export const JAPANESE_VOCAB_GROUPS: JapaneseVocabGroup[] = groups;

export const JAPANESE_VOCAB_BY_ID: Record<string, JapaneseVocabEntry> = Object.fromEntries(
  JAPANESE_VOCABULARY.map((entry) => [entry.id, entry]),
);

export const GROUP_BY_ID: Record<string, JapaneseVocabGroup> = Object.fromEntries(
  JAPANESE_VOCAB_GROUPS.map((group) => [group.id, group]),
);

export const JAPANESE_VOCAB_SIZE = JAPANESE_VOCABULARY.length;
