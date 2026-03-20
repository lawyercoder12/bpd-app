import { Colors, BorderRadius, Spacing, FontSize, MoodEmojis, EmotionTags, TriggerTags } from '@/constants/theme';
import { getMoodEntries, getMoodEntriesInRange, MoodEntry } from '@/lib/storage';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { LineChart } from 'react-native-gifted-charts';

type TimeRange = 7 | 30;

export default function InsightsScreen() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>(7);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [timeRange])
  );

  const loadEntries = async () => {
    const data = await getMoodEntriesInRange(timeRange);
    setEntries(data);
  };

  const getChartData = () => {
    if (entries.length === 0) return [];

    const sorted = [...entries].sort((a, b) => a.timestamp - b.timestamp);
    return sorted.map((entry) => {
      const date = new Date(entry.timestamp);
      const label = timeRange <= 7
        ? date.toLocaleDateString('en-US', { weekday: 'short' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const moodColor = MoodEmojis.find((m) => m.value === entry.intensity)?.color || Colors.primary;

      return {
        value: entry.intensity,
        label,
        dataPointColor: moodColor,
        dataPointRadius: 5,
      };
    });
  };

  const getAverageMood = () => {
    if (entries.length === 0) return 0;
    const sum = entries.reduce((acc, e) => acc + e.intensity, 0);
    return (sum / entries.length).toFixed(1);
  };

  const getMostCommonEmotions = () => {
    const counts: Record<string, number> = {};
    entries.forEach((e) => {
      e.emotions.forEach((emotion) => {
        counts[emotion] = (counts[emotion] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const getMostCommonTriggers = () => {
    const counts: Record<string, number> = {};
    entries.forEach((e) => {
      e.triggers.forEach((trigger) => {
        counts[trigger] = (counts[trigger] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const getMoodDistribution = () => {
    const dist: Record<string, number> = {};
    entries.forEach((e) => {
      const key = `${e.intensity}`;
      dist[key] = (dist[key] || 0) + 1;
    });
    return dist;
  };

  const getStreakInfo = () => {
    if (entries.length === 0) return { current: 0, longest: 0 };

    const days = new Set<string>();
    entries.forEach((e) => {
      days.add(new Date(e.timestamp).toDateString());
    });

    const sortedDays = Array.from(days).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    let current = 1;
    let longest = 1;
    let streak = 1;

    for (let i = 1; i < sortedDays.length; i++) {
      const diff = new Date(sortedDays[i - 1]).getTime() - new Date(sortedDays[i]).getTime();
      if (diff <= 86400000) {
        streak++;
        longest = Math.max(longest, streak);
      } else {
        streak = 1;
      }
    }

    // Check if current streak includes today
    const today = new Date().toDateString();
    if (sortedDays[0] === today) {
      current = streak;
    } else {
      current = 0;
    }

    return { current, longest };
  };

  const chartData = getChartData();
  const avgMood = getAverageMood();
  const emotions = getMostCommonEmotions();
  const triggers = getMostCommonTriggers();
  const distribution = getMoodDistribution();
  const streak = getStreakInfo();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Insights</Text>
          <Text style={styles.subtitle}>Your emotional patterns</Text>
        </View>

        {/* Time Range Selector */}
        <View style={styles.rangeRow}>
          <TouchableOpacity
            style={[styles.rangeButton, timeRange === 7 && styles.rangeButtonActive]}
            onPress={() => setTimeRange(7)}
          >
            <Text style={[styles.rangeText, timeRange === 7 && styles.rangeTextActive]}>7 Days</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rangeButton, timeRange === 30 && styles.rangeButtonActive]}
            onPress={() => setTimeRange(30)}
          >
            <Text style={[styles.rangeText, timeRange === 30 && styles.rangeTextActive]}>30 Days</Text>
          </TouchableOpacity>
        </View>

        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="analytics-outline" size={64} color={Colors.border} />
            <Text style={styles.emptyTitle}>No data yet</Text>
            <Text style={styles.emptySubtext}>
              Start checking in daily to see your mood patterns and insights here.
            </Text>
          </View>
        ) : (
          <>
            {/* Summary Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{avgMood}</Text>
                <Text style={styles.statLabel}>Avg Mood</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{entries.length}</Text>
                <Text style={styles.statLabel}>Check-ins</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{streak.current}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
            </View>

            {/* Mood Chart */}
            {chartData.length > 1 && (
              <View style={styles.chartCard}>
                <Text style={styles.cardTitle}>Mood Trend</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <LineChart
                    data={chartData}
                    width={Math.max(chartData.length * 60, 300)}
                    height={200}
                    color={Colors.primary}
                    thickness={2}
                    curved
                    areaChart
                    startFillColor={Colors.primary}
                    endFillColor={Colors.calm}
                    startOpacity={0.3}
                    endOpacity={0.1}
                    yAxisColor="transparent"
                    xAxisColor={Colors.border}
                    yAxisTextStyle={{ color: Colors.textLight, fontSize: 10 }}
                    xAxisLabelTextStyle={{ color: Colors.textLight, fontSize: 10 }}
                    noOfSections={4}
                    maxValue={10}
                    rulesColor={Colors.border}
                    rulesType="dashed"
                    initialSpacing={20}
                    endSpacing={20}
                    adjustToWidth={false}
                  />
                </ScrollView>
              </View>
            )}

            {/* Mood Distribution */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Mood Distribution</Text>
              <View style={styles.distributionGrid}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
                  const count = distribution[`${level}`] || 0;
                  const mood = MoodEmojis.find((m) => m.value === level);
                  const maxCount = Math.max(...Object.values(distribution), 1);
                  const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

                  return (
                    <View key={level} style={styles.distRow}>
                      <Text style={styles.distEmoji}>{mood?.emoji}</Text>
                      <View style={styles.distBarBg}>
                        <View
                          style={[
                            styles.distBar,
                            {
                              width: `${barWidth}%`,
                              backgroundColor: mood?.color || Colors.border,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.distCount}>{count}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Top Triggers */}
            {triggers.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Top Triggers</Text>
                <View style={styles.tagContainer}>
                  {triggers.map(([trigger, count]) => (
                    <View key={trigger} style={styles.triggerTag}>
                      <Text style={styles.triggerText}>{trigger}</Text>
                      <Text style={styles.triggerCount}>{count}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Top Emotions */}
            {emotions.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Most Felt Emotions</Text>
                <View style={styles.tagContainer}>
                  {emotions.map(([emotion, count]) => (
                    <View key={emotion} style={styles.emotionTag}>
                      <Text style={styles.emotionText}>{emotion}</Text>
                      <Text style={styles.emotionCount}>{count}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Encouragement */}
            <View style={styles.encourageCard}>
              <Ionicons name="sparkles-outline" size={28} color={Colors.accent} />
              <Text style={styles.encourageText}>
                {entries.length >= 7
                  ? "You've been consistently checking in. That takes courage and commitment."
                  : 'Keep checking in. The more data you collect, the clearer your patterns become.'}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  rangeRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rangeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  rangeText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textLight,
  },
  rangeTextActive: {
    color: '#FFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textLight,
    marginTop: Spacing.lg,
  },
  emptySubtext: {
    fontSize: FontSize.md,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginTop: 4,
  },
  chartCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  distributionGrid: {
    gap: Spacing.sm,
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  distEmoji: {
    fontSize: 16,
    width: 24,
  },
  distBarBg: {
    flex: 1,
    height: 16,
    backgroundColor: Colors.background,
    borderRadius: 8,
    overflow: 'hidden',
  },
  distBar: {
    height: '100%',
    borderRadius: 8,
    minWidth: 2,
  },
  distCount: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    width: 20,
    textAlign: 'right',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  triggerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5EE',
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: 6,
  },
  triggerText: {
    fontSize: FontSize.sm,
    color: Colors.warning,
    fontWeight: '500',
  },
  triggerCount: {
    fontSize: FontSize.xs,
    color: Colors.warning,
    backgroundColor: 'rgba(232,168,124,0.2)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    fontWeight: '700',
  },
  emotionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.calm,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: 6,
  },
  emotionText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  emotionCount: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    backgroundColor: 'rgba(107,154,196,0.2)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    fontWeight: '700',
  },
  encourageCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: Spacing.lg,
    backgroundColor: '#F0EAF8',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  encourageText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text,
    lineHeight: 22,
  },
});
