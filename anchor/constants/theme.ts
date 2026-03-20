export const Colors = {
  primary: '#6B9AC4',
  secondary: '#97C1A9',
  accent: '#B8A9C9',
  background: '#F8F6F2',
  card: '#FFFFFF',
  text: '#2D3436',
  textLight: '#636E72',
  calm: '#E8F4F8',
  calmDark: '#D4EBF2',
  success: '#97C1A9',
  warning: '#E8A87C',
  border: '#E0E0E0',
  crisis: '#E8A87C',
  crisisBg: '#FFF5EE',

  // Mood colors (1-10 scale)
  mood1: '#E74C3C',
  mood2: '#E67E22',
  mood3: '#F39C12',
  mood4: '#F1C40F',
  mood5: '#BDC3C7',
  mood6: '#A8E6CF',
  mood7: '#88D8B0',
  mood8: '#6BC5A0',
  mood9: '#4ECDC4',
  mood10: '#45B7D1',

  // Tab colors
  tabActive: '#6B9AC4',
  tabInactive: '#B0BEC5',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
};

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  title: 32,
};

export const MoodEmojis = [
  { value: 1, emoji: '😭', label: 'Terrible', color: Colors.mood1 },
  { value: 2, emoji: '😢', label: 'Very Bad', color: Colors.mood2 },
  { value: 3, emoji: '😟', label: 'Bad', color: Colors.mood3 },
  { value: 4, emoji: '😕', label: 'Down', color: Colors.mood4 },
  { value: 5, emoji: '😐', label: 'Okay', color: Colors.mood5 },
  { value: 6, emoji: '🙂', label: 'Fine', color: Colors.mood6 },
  { value: 7, emoji: '😊', label: 'Good', color: Colors.mood7 },
  { value: 8, emoji: '😄', label: 'Happy', color: Colors.mood8 },
  { value: 9, emoji: '😁', label: 'Great', color: Colors.mood9 },
  { value: 10, emoji: '🤩', label: 'Amazing', color: Colors.mood10 },
];

export const EmotionTags = [
  'Anxious', 'Sad', 'Angry', 'Empty', 'Overwhelmed',
  'Lonely', 'Fearful', 'Guilty', 'Hopeful', 'Calm',
  'Frustrated', 'Numb', 'Grateful', 'Tense', 'Confused',
];

export const TriggerTags = [
  'Relationship', 'Work', 'Sleep', 'Health', 'Family',
  'Money', 'Social', 'Change', 'Rejection', 'Conflict',
];
