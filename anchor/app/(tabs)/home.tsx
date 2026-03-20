import { Colors, BorderRadius, Spacing, FontSize, MoodEmojis } from '@/constants/theme';
import { getMoodEntries, MoodEntry, saveMoodEntry } from '@/lib/storage';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

export default function HomeScreen() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [recentEntries, setRecentEntries] = useState<MoodEntry[]>([]);
  const [note, setNote] = useState('');
  const [showSaved, setShowSaved] = useState(false);
  const saveAnim = useState(new Animated.Value(0))[0];

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [])
  );

  const loadEntries = async () => {
    const entries = await getMoodEntries();
    setRecentEntries(entries.slice(0, 5));
  };

  const handleMoodSelect = (value: number) => {
    Haptics.selectionAsync();
    setSelectedMood(value);
  };

  const handleSave = async () => {
    if (selectedMood === null) return;

    await saveMoodEntry({
      timestamp: Date.now(),
      intensity: selectedMood,
      emotions: [],
      triggers: [],
      urges: [],
      skillsUsed: [],
      note: note.trim() || undefined,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setShowSaved(true);
    Animated.sequence([
      Animated.timing(saveAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(1500),
      Animated.timing(saveAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      setShowSaved(false);
      setSelectedMood(null);
      setNote('');
      loadEntries();
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getMoodEmoji = (intensity: number) => {
    const mood = MoodEmojis.find((m) => m.value === intensity);
    return mood ? mood.emoji : '😐';
  };

  const getMoodColor = (intensity: number) => {
    const mood = MoodEmojis.find((m) => m.value === intensity);
    return mood ? mood.color : Colors.border;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.subtitle}>How are you feeling right now?</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="shield-checkmark" size={28} color={Colors.primary} />
          </View>
        </View>

        {/* Mood Selector */}
        <View style={styles.moodCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodScroll}>
            {MoodEmojis.map((mood) => (
              <TouchableOpacity
                key={mood.value}
                style={[
                  styles.moodItem,
                  selectedMood === mood.value && { backgroundColor: mood.color + '20', borderColor: mood.color },
                ]}
                onPress={() => handleMoodSelect(mood.value)}
                activeOpacity={0.7}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text
                  style={[
                    styles.moodLabel,
                    selectedMood === mood.value && { color: mood.color, fontWeight: '600' },
                  ]}
                >
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {selectedMood !== null && (
            <View style={styles.moodDetail}>
              <TextInput
                style={styles.noteInput}
                placeholder="Add a note (optional)..."
                placeholderTextColor={Colors.textLight}
                value={note}
                onChangeText={setNote}
                multiline
                maxLength={200}
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Check-In</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Recent Entries */}
        {recentEntries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Check-Ins</Text>
            {recentEntries.map((entry) => (
              <View key={entry.id} style={styles.entryCard}>
                <View style={[styles.entryMoodBadge, { backgroundColor: getMoodColor(entry.intensity) + '20' }]}>
                  <Text style={styles.entryEmoji}>{getMoodEmoji(entry.intensity)}</Text>
                </View>
                <View style={styles.entryContent}>
                  <Text style={styles.entryIntensity}>Mood: {entry.intensity}/10</Text>
                  {entry.note && <Text style={styles.entryNote} numberOfLines={2}>{entry.note}</Text>}
                </View>
                <Text style={styles.entryTime}>{formatTime(entry.timestamp)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Quick Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>You're Doing Great</Text>
          <View style={styles.tipCard}>
            <Ionicons name="heart-outline" size={24} color={Colors.accent} />
            <Text style={styles.tipText}>
              Checking in with yourself is a sign of strength. Every feeling you have is valid.
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Ionicons name="leaf-outline" size={24} color={Colors.secondary} />
            <Text style={styles.tipText}>
              Remember: emotions are temporary visitors. They will pass.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Saved Toast */}
      {showSaved && (
        <Animated.View style={[styles.savedToast, { opacity: saveAnim }]}>
          <Ionicons name="checkmark-circle" size={24} color="#FFF" />
          <Text style={styles.savedToastText}>Check-in saved</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  greeting: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.calm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  moodScroll: {
    gap: Spacing.sm,
  },
  moodItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 62,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 11,
    color: Colors.textLight,
  },
  moodDetail: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  noteInput: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: Spacing.md,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.round,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  section: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  entryMoodBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  entryEmoji: {
    fontSize: 22,
  },
  entryContent: {
    flex: 1,
  },
  entryIntensity: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  entryNote: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    marginTop: 2,
  },
  entryTime: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  tipText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textLight,
    lineHeight: 22,
  },
  savedToast: {
    position: 'absolute',
    bottom: 120,
    left: '20%',
    right: '20%',
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.round,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  savedToastText: {
    color: '#FFF',
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});
