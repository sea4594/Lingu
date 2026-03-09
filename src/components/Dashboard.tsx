import type { Language, LanguageProgress, ActivityType } from '../types';
import { getDueCards } from '../utils/spacedRepetition';
import {
  BookOpen,
  Puzzle,
  Headphones,
  BookMarked,
  Brain,
  Trophy,
  TrendingUp,
  Clock,
  ChevronRight,
} from 'lucide-react';

interface ActivityCard {
  type: ActivityType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  badge?: string;
}

interface DashboardProps {
  language: Language;
  langProgress: LanguageProgress;
  onStartActivity: (activity: ActivityType) => void;
}

export default function Dashboard({ langProgress, onStartActivity }: Omit<DashboardProps, 'language'> & { language?: Language }) {
  const dueCount = getDueCards(langProgress.srsCards).length;

  const activities: ActivityCard[] = [
    {
      type: 'vocabulary',
      title: 'Vocabulary Practice',
      description: 'Flashcards, multiple choice, typing & pronunciation drills',
      icon: <BookOpen size={28} />,
      color: 'text-indigo-600',
      bgColor: 'from-indigo-500 to-purple-600',
    },
    {
      type: 'srs-review',
      title: 'Spaced Repetition Review',
      description: 'Review words due for reinforcement using the SM-2 algorithm',
      icon: <Brain size={28} />,
      color: 'text-emerald-600',
      bgColor: 'from-emerald-500 to-teal-600',
      badge: dueCount > 0 ? `${dueCount} due` : undefined,
    },
    {
      type: 'listening',
      title: 'Listening Practice',
      description: 'Listen and identify spoken words & phrases',
      icon: <Headphones size={28} />,
      color: 'text-pink-600',
      bgColor: 'from-pink-500 to-rose-600',
    },
    {
      type: 'sentence-builder',
      title: 'Sentence Builder',
      description: 'Arrange words to construct grammatically correct sentences',
      icon: <Puzzle size={28} />,
      color: 'text-amber-600',
      bgColor: 'from-amber-500 to-orange-600',
    },
    {
      type: 'story',
      title: 'Reading Stories',
      description: 'Read short stories with translation support and vocabulary highlights',
      icon: <BookMarked size={28} />,
      color: 'text-sky-600',
      bgColor: 'from-sky-500 to-blue-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats overview */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={<Trophy size={20} className="text-yellow-500" />}
          label="Words Mastered"
          value={langProgress.wordsMastered}
          color="bg-yellow-50 border-yellow-200"
        />
        <StatCard
          icon={<TrendingUp size={20} className="text-green-500" />}
          label="Words Learned"
          value={langProgress.wordsLearned}
          color="bg-green-50 border-green-200"
        />
        <StatCard
          icon={<Clock size={20} className="text-blue-500" />}
          label="In Review"
          value={langProgress.wordsInReview}
          color="bg-blue-50 border-blue-200"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={<TrendingUp size={20} className="text-emerald-500" />}
          label="Accuracy"
          value={`${langProgress.totalAnswers > 0 ? Math.round((langProgress.correctAnswers / langProgress.totalAnswers) * 100) : 0}%`}
          color="bg-emerald-50 border-emerald-200"
        />
        <StatCard
          icon={<Clock size={20} className="text-fuchsia-500" />}
          label="Avg Response"
          value={`${langProgress.averageResponseMs > 0 ? `${(langProgress.averageResponseMs / 1000).toFixed(1)}s` : '0.0s'}`}
          color="bg-fuchsia-50 border-fuchsia-200"
        />
      </div>

      {/* Activity Cards */}
      <div>
        <h2 className="text-lg font-bold text-gray-700 mb-3">
          What would you like to practice?
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {activities.map((activity) => (
            <ActivityCardButton
              key={activity.type}
              activity={activity}
              onClick={() => onStartActivity(activity.type)}
            />
          ))}
        </div>
      </div>

      {/* Tips based on research */}
      <TipsSection langProgress={langProgress} />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className={`rounded-xl border p-3 ${color} text-center`}>
      <div className="flex justify-center mb-1">{icon}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function ActivityCardButton({
  activity,
  onClick,
}: {
  activity: ActivityCard;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 bg-white hover:bg-gray-50 border border-gray-200 hover:border-indigo-300 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 text-left w-full"
    >
      <div
        className={`bg-gradient-to-br ${activity.bgColor} p-3 rounded-xl text-white flex-shrink-0 shadow-sm`}
      >
        {activity.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">
            {activity.title}
          </span>
          {activity.badge && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
              {activity.badge}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{activity.description}</p>
      </div>
      <ChevronRight
        size={18}
        className="text-gray-300 group-hover:text-indigo-400 transition-colors flex-shrink-0"
      />
    </button>
  );
}

function TipsSection({ langProgress }: { langProgress: LanguageProgress }) {
  const tips = [
    {
      title: '🧠 Spaced Repetition',
      text: 'Review words at increasing intervals for long-term retention.',
      show: langProgress.wordsLearned < 10,
    },
    {
      title: '🎯 Active Recall',
      text: 'Testing yourself is 2-3× more effective than passive review.',
      show: langProgress.completedActivities < 5,
    },
    {
      title: '🔁 Daily Practice',
      text: 'Even 5-10 minutes daily beats occasional long sessions.',
      show: langProgress.streak < 3,
    },
    {
      title: '🌊 Comprehensible Input',
      text: 'Read and listen to content slightly above your level.',
      show: langProgress.level >= 3,
    },
  ];

  const activeTips = tips.filter((t) => t.show);
  if (activeTips.length === 0) return null;

  const tip = activeTips[Math.floor(Math.random() * activeTips.length)];

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
      <h3 className="font-semibold text-indigo-800 mb-1">{tip.title}</h3>
      <p className="text-sm text-indigo-700">{tip.text}</p>
    </div>
  );
}
