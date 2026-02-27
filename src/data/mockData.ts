// Mock data for TruthPulse dashboard

export interface Tweet {
  id: string;
  username: string;
  handle: string;
  text: string;
  timestamp: Date;
  botScore: number;
  sentiment: number; // -1 to 1
  clusterId: string | null;
  accountAge: number; // days
  followers: number;
  following: number;
  tweetFrequency: number; // tweets per hour
}

export interface AttackAlert {
  id: string;
  timestamp: Date;
  hashtag: string;
  confidence: number;
  type: 'bot_cluster' | 'copy_paste' | 'spike' | 'coordinated';
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface SentimentPoint {
  time: string;
  positive: number;
  negative: number;
  neutral: number;
  organic: number;
  fake: number;
}

export interface ClusterNode {
  id: string;
  label: string;
  size: number;
  botScore: number;
  x: number;
  y: number;
}

export const MOCK_HASHTAG = "#BoycottBrandX";

export const generateSentimentData = (): SentimentPoint[] => {
  const data: SentimentPoint[] = [];
  for (let i = 0; i < 24; i++) {
    const hour = `${String(i).padStart(2, '0')}:00`;
    const isAttack = i >= 14 && i <= 18;
    data.push({
      time: hour,
      positive: isAttack ? Math.floor(Math.random() * 20 + 5) : Math.floor(Math.random() * 40 + 30),
      negative: isAttack ? Math.floor(Math.random() * 60 + 40) : Math.floor(Math.random() * 20 + 10),
      neutral: Math.floor(Math.random() * 20 + 15),
      organic: isAttack ? Math.floor(Math.random() * 15 + 5) : Math.floor(Math.random() * 50 + 40),
      fake: isAttack ? Math.floor(Math.random() * 70 + 30) : Math.floor(Math.random() * 10 + 2),
    });
  }
  return data;
};

export const MOCK_ALERTS: AttackAlert[] = [
  {
    id: '1', timestamp: new Date(Date.now() - 120000), hashtag: '#BoycottBrandX',
    confidence: 94, type: 'bot_cluster', severity: 'critical',
    description: '847 posts from 312 accounts that were just created — likely bots',
  },
  {
    id: '2', timestamp: new Date(Date.now() - 300000), hashtag: '#BoycottBrandX',
    confidence: 87, type: 'copy_paste', severity: 'high',
    description: '523 posts saying almost the same thing — looks like copy-paste',
  },
  {
    id: '3', timestamp: new Date(Date.now() - 600000), hashtag: '#BoycottBrandX',
    confidence: 76, type: 'spike', severity: 'high',
    description: 'Sudden explosion of posts — 42x more than normal in just 15 minutes',
  },
  {
    id: '4', timestamp: new Date(Date.now() - 900000), hashtag: '#FakeProduct',
    confidence: 62, type: 'coordinated', severity: 'medium',
    description: '45 accounts posting at the exact same time — appears coordinated',
  },
];

export const MOCK_SUSPICIOUS_ACCOUNTS = [
  { handle: '@user_29381x', botScore: 97, accountAge: 2, tweets: 847, followers: 3, following: 1200 },
  { handle: '@truth_speak01', botScore: 94, accountAge: 1, tweets: 623, followers: 7, following: 980 },
  { handle: '@real_voice_in', botScore: 91, accountAge: 3, tweets: 412, followers: 12, following: 1500 },
  { handle: '@citizen_2024x', botScore: 88, accountAge: 1, tweets: 389, followers: 2, following: 870 },
  { handle: '@voice_of_ppl', botScore: 85, accountAge: 5, tweets: 267, followers: 18, following: 1100 },
];

export const MOCK_CLUSTERS: ClusterNode[] = [
  { id: 'c1', label: 'Fake Group A', size: 312, botScore: 94, x: 30, y: 35 },
  { id: 'c2', label: 'Fake Group B', size: 189, botScore: 87, x: 65, y: 25 },
  { id: 'c3', label: 'Real Users', size: 45, botScore: 12, x: 50, y: 70 },
  { id: 'c4', label: 'Fake Group C', size: 134, botScore: 91, x: 75, y: 60 },
  { id: 'c5', label: 'Real Users B', size: 28, botScore: 8, x: 20, y: 65 },
];

export const EXPLAINABILITY_FACTORS = [
  { label: 'Most accounts are brand new', value: 73, color: 'destructive' },
  { label: 'Posts are almost copy-paste', value: 89, color: 'destructive' },
  { label: 'Posting way too fast for a human', value: 67, color: 'warning' },
  { label: 'Accounts have barely any followers', value: 81, color: 'destructive' },
  { label: 'Posts sent at the exact same time', value: 72, color: 'warning' },
];
