import { Colors, BorderRadius, Spacing, FontSize } from '@/constants/theme';
import { getJournalEntries, JournalEntry, saveJournalEntry } from '@/lib/storage';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

const PROMPTS = [
  'What am I feeling right now? Where do I feel it in my body?',
  'What triggered this emotion? What happened right before?',
  'What story am I telling myself about this situation?',
  'What would I say to a friend feeling this way?',
  'What do I need right now? What would feel supportive?',
  'What is one small thing I can do to take care of myself today?',
  'What am I grateful for, even in this difficult moment?',
  'What did I handle well today, no matter how small?',
  'What boundary do I need to set or reinforce?',
  'What would my wisest self say about this situation?',
];

export default function JournalScreen() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState('');
  const [entryType, setEntryType] = useState<'free' | 'prompt' | 'cbt'>('free');
  const [currentPrompt, setCurrentPrompt] = useState('');

  // CBT state
  const [cbtSituation, setCbtSituation] = useState('');
  const [cbtThought, setCbtThought] = useState('');
  const [cbtEmotion, setCbtEmotion] = useState('');
  const [cbtEvidence, setCbtEvidence] = useState('');
  const [cbtBalanced, setCbtBalanced] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [])
  );

  const loadEntries = async () => {
    const data = await getJournalEntries();
    setEntries(data);
  };

  const getRandomPrompt = () => {
    const idx = Math.floor(Math.random() * PROMPTS.length);
    return PROMPTS[idx];
  };

  const openModal = (type: 'free' | 'prompt' | 'cbt') => {
    setEntryType(type);
    setContent('');
    setCbtSituation('');
    setCbtThought('');
    setCbtEmotion('');
    setCbtEvidence('');
    setCbtBalanced('');
    if (type === 'prompt') {
      setCurrentPrompt(getRandomPrompt());
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (entryType === 'cbt') {
      if (!cbtSituation.trim() && !cbtThought.trim()) {
        Alert.alert('Add something', 'Write about the situation or your thought.');
        return;
      }
      const cbtContent = [
        cbtSituation ? `Situation: ${cbtSituation}` : '',
        cbtThought ? `Thought: ${cbtThought}` : '',
        cbtEmotion ? `Emotion: ${cbtEmotion}` : '',
        cbtEvidence ? `Evidence: ${cbtEvidence}` : '',
        cbtBalanced ? `Balanced thought: ${cbtBalanced}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      await saveJournalEntry({
        timestamp: Date.now(),
        content: cbtContent,
        type: 'cbt',
      });
    } else {
      if (!content.trim()) {
        Alert.alert('Add something', 'Write a few words about how you feel.');
        return;
      }
      await saveJournalEntry({
        timestamp: Date.now(),
        content: content.trim(),
        prompt: entryType === 'prompt' ? currentPrompt : undefined,
        type: entryType,
      });
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowModal(false);
    loadEntries();
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'prompt': return 'chatbubble-ellipses-outline';
      case 'cbt': return 'analytics-outline';
      default: return 'pencil-outline';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'prompt': return 'Guided';
      case 'cbt': return 'Thought Record';
      default: return 'Free Write';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Journal</Text>
          <Text style={styles.subtitle}>A safe space for your thoughts</Text>
        </View>

        {/* Entry Type Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.entryTypeButton} onPress={() => openModal('free')}>
            <View style={[styles.typeIconBg, { backgroundColor: '#E8F4F8' }]}>
              <Ionicons name="pencil-outline" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.typeLabel}>Free Write</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.entryTypeButton} onPress={() => openModal('prompt')}>
            <View style={[styles.typeIconBg, { backgroundColor: '#E8F8E8' }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={24} color={Colors.secondary} />
            </View>
            <Text style={styles.typeLabel}>Guided Prompt</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.entryTypeButton} onPress={() => openModal('cbt')}>
            <View style={[styles.typeIconBg, { backgroundColor: '#F0EAF8' }]}>
              <Ionicons name="analytics-outline" size={24} color={Colors.accent} />
            </View>
            <Text style={styles.typeLabel}>Thought Record</Text>
          </TouchableOpacity>
        </View>

        {/* Entries List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Entries</Text>
          {entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="journal-outline" size={48} color={Colors.border} />
              <Text style={styles.emptyText}>No entries yet</Text>
              <Text style={styles.emptySubtext}>Tap a button above to write your first entry</Text>
            </View>
          ) : (
            entries.map((entry) => (
              <View key={entry.id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryTypeTag}>
                    <Ionicons name={getTypeIcon(entry.type)} size={14} color={Colors.primary} />
                    <Text style={styles.entryTypeText}>{getTypeLabel(entry.type)}</Text>
                  </View>
                  <Text style={styles.entryDate}>{formatDate(entry.timestamp)}</Text>
                </View>
                {entry.prompt && <Text style={styles.entryPrompt}>Prompt: {entry.prompt}</Text>}
                <Text style={styles.entryContent} numberOfLines={4}>
                  {entry.content}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Entry Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {entryType === 'free' ? 'Free Write' : entryType === 'prompt' ? 'Guided Prompt' : 'Thought Record'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
            {entryType === 'prompt' && (
              <View style={styles.promptCard}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color={Colors.secondary} />
                <Text style={styles.promptText}>{currentPrompt}</Text>
                <TouchableOpacity onPress={() => setCurrentPrompt(getRandomPrompt())}>
                  <Ionicons name="refresh-outline" size={20} color={Colors.textLight} />
                </TouchableOpacity>
              </View>
            )}

            {entryType === 'cbt' ? (
              <View style={styles.cbtForm}>
                <View style={styles.cbtField}>
                  <Text style={styles.cbtLabel}>Situation</Text>
                  <Text style={styles.cbtHint}>What happened? Just the facts.</Text>
                  <TextInput
                    style={styles.cbtInput}
                    value={cbtSituation}
                    onChangeText={setCbtSituation}
                    placeholder="Describe the situation..."
                    placeholderTextColor={Colors.textLight}
                    multiline
                  />
                </View>
                <View style={styles.cbtField}>
                  <Text style={styles.cbtLabel}>Thought</Text>
                  <Text style={styles.cbtHint}>What went through your mind?</Text>
                  <TextInput
                    style={styles.cbtInput}
                    value={cbtThought}
                    onChangeText={setCbtThought}
                    placeholder="What did you think?"
                    placeholderTextColor={Colors.textLight}
                    multiline
                  />
                </View>
                <View style={styles.cbtField}>
                  <Text style={styles.cbtLabel}>Emotion</Text>
                  <Text style={styles.cbtHint}>What did you feel? How intense (1-10)?</Text>
                  <TextInput
                    style={styles.cbtInput}
                    value={cbtEmotion}
                    onChangeText={setCbtEmotion}
                    placeholder="Name the emotion and intensity..."
                    placeholderTextColor={Colors.textLight}
                    multiline
                  />
                </View>
                <View style={styles.cbtField}>
                  <Text style={styles.cbtLabel}>Evidence</Text>
                  <Text style={styles.cbtHint}>What supports or challenges this thought?</Text>
                  <TextInput
                    style={styles.cbtInput}
                    value={cbtEvidence}
                    onChangeText={setCbtEvidence}
                    placeholder="For and against..."
                    placeholderTextColor={Colors.textLight}
                    multiline
                  />
                </View>
                <View style={styles.cbtField}>
                  <Text style={styles.cbtLabel}>Balanced Thought</Text>
                  <Text style={styles.cbtHint}>A more balanced perspective</Text>
                  <TextInput
                    style={styles.cbtInput}
                    value={cbtBalanced}
                    onChangeText={setCbtBalanced}
                    placeholder="A more balanced view..."
                    placeholderTextColor={Colors.textLight}
                    multiline
                  />
                </View>
              </View>
            ) : (
              <TextInput
                style={styles.journalInput}
                value={content}
                onChangeText={setContent}
                placeholder="Start writing..."
                placeholderTextColor={Colors.textLight}
                multiline
                autoFocus
              />
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  entryTypeButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  typeIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  typeLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textLight,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  entryCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  entryTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  entryTypeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primary,
  },
  entryDate: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
  },
  entryPrompt: {
    fontSize: FontSize.sm,
    color: Colors.secondary,
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
  },
  entryContent: {
    fontSize: FontSize.sm,
    color: Colors.text,
    lineHeight: 22,
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cancelText: {
    fontSize: FontSize.md,
    color: Colors.textLight,
  },
  modalTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  saveText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  promptCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.calm,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  promptText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  journalInput: {
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 26,
    minHeight: 300,
    textAlignVertical: 'top',
  },
  cbtForm: {
    gap: Spacing.lg,
  },
  cbtField: {},
  cbtLabel: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  cbtHint: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    marginBottom: Spacing.sm,
  },
  cbtInput: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    minHeight: 60,
    textAlignVertical: 'top',
  },
});
