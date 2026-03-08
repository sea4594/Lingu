/**
 * Fuzzy string matching for "close enough" answers
 * Uses Levenshtein distance normalized by string length
 */

/**
 * Calculate Levenshtein edit distance between two strings
 */
export const levenshtein = (a: string, b: string): number => {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
};

/**
 * Normalize a string for comparison
 * - Lowercase
 * - Remove extra whitespace
 * - Remove punctuation (except in words like "don't")
 * - Handle common accent variations
 */
const normalize = (s: string): string => {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.,!?;:"""''()[\]{}<>]/g, '')
    .replace(/[\u2018\u2019]/g, "'"); // Smart quotes to apostrophe
};

export type MatchResult = 'exact' | 'close' | 'wrong';

/**
 * Check if a user's answer is close enough to be considered correct
 * Returns 'exact', 'close', or 'wrong'
 */
export const checkAnswer = (
  userAnswer: string,
  correctAnswer: string,
  threshold = 0.8
): MatchResult => {
  const user = normalize(userAnswer);
  const correct = normalize(correctAnswer);

  if (user === correct) return 'exact';

  // Check if user wrote the correct answer without diacritics (accent marks)
  const userNoAccents = stripAccents(user);
  const correctNoAccents = stripAccents(correct);
  if (userNoAccents === correctNoAccents) return 'exact';

  // Calculate similarity
  const distance = levenshtein(user, correct);
  const maxLen = Math.max(user.length, correct.length);
  if (maxLen === 0) return 'exact';

  const similarity = 1 - distance / maxLen;

  if (similarity >= threshold) return 'close';
  return 'wrong';
};

/**
 * Remove diacritical marks / accent characters from a string
 */
export const stripAccents = (s: string): string => {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

/**
 * Highlight differences between user answer and correct answer
 */
export const highlightDiff = (
  userAnswer: string,
  correctAnswer: string
): { user: string; correct: string } => {
  return {
    user: userAnswer,
    correct: correctAnswer,
  };
};

/**
 * Check if pronunciation recognition result matches target
 * More lenient matching for spoken language
 */
export const checkPronunciation = (
  spokenText: string,
  targetText: string
): MatchResult => {
  return checkAnswer(spokenText, targetText, 0.65);
};
