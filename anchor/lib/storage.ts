import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MoodEntry {
  id: string;
  timestamp: number;
  intensity: number;
  emotions: string[];
  triggers: string[];
  urges: { type: string; intensity: number }[];
  skillsUsed: string[];
  note?: string;
}

export interface JournalEntry {
  id: string;
  timestamp: number;
  content: string;
  prompt?: string;
  moodId?: string;
  type: 'free' | 'prompt' | 'cbt';
}

export interface SafetyPlan {
  reasonsToLive: string[];
  contacts: { name: string; phone: string; relationship: string }[];
  safePlaces: string[];
  copingStrategies: string[];
  professionalHelp: { name: string; phone: string }[];
}

const KEYS = {
  MOODS: 'anchor_moods',
  JOURNALS: 'anchor_journals',
  SAFETY_PLAN: 'anchor_safety_plan',
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Mood entries
export async function saveMoodEntry(entry: Omit<MoodEntry, 'id'>): Promise<MoodEntry> {
  const fullEntry: MoodEntry = { ...entry, id: generateId() };
  const existing = await getMoodEntries();
  existing.unshift(fullEntry);
  await AsyncStorage.setItem(KEYS.MOODS, JSON.stringify(existing));
  return fullEntry;
}

export async function getMoodEntries(): Promise<MoodEntry[]> {
  const data = await AsyncStorage.getItem(KEYS.MOODS);
  return data ? JSON.parse(data) : [];
}

export async function getMoodEntriesInRange(days: number): Promise<MoodEntry[]> {
  const entries = await getMoodEntries();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return entries.filter((e) => e.timestamp >= cutoff);
}

// Journal entries
export async function saveJournalEntry(entry: Omit<JournalEntry, 'id'>): Promise<JournalEntry> {
  const fullEntry: JournalEntry = { ...entry, id: generateId() };
  const existing = await getJournalEntries();
  existing.unshift(fullEntry);
  await AsyncStorage.setItem(KEYS.JOURNALS, JSON.stringify(existing));
  return fullEntry;
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
  const data = await AsyncStorage.getItem(KEYS.JOURNALS);
  return data ? JSON.parse(data) : [];
}

// Safety plan
const defaultSafetyPlan: SafetyPlan = {
  reasonsToLive: [],
  contacts: [],
  safePlaces: [],
  copingStrategies: [],
  professionalHelp: [],
};

export async function getSafetyPlan(): Promise<SafetyPlan> {
  const data = await AsyncStorage.getItem(KEYS.SAFETY_PLAN);
  return data ? JSON.parse(data) : defaultSafetyPlan;
}

export async function saveSafetyPlan(plan: SafetyPlan): Promise<void> {
  await AsyncStorage.setItem(KEYS.SAFETY_PLAN, JSON.stringify(plan));
}
