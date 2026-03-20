import { Colors, BorderRadius, Spacing, FontSize } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Skill {
  name: string;
  description: string;
  steps: string[];
}

interface Module {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  skills: Skill[];
}

const DBT_MODULES: Module[] = [
  {
    id: 'mindfulness',
    title: 'Mindfulness',
    subtitle: 'Be present with what is',
    icon: 'leaf-outline',
    color: '#6B9AC4',
    bgColor: '#E8F4F8',
    skills: [
      {
        name: 'Observe',
        description: 'Notice what is happening inside and around you without reacting.',
        steps: [
          'Sit quietly and close your eyes or soften your gaze',
          'Notice your breathing — in and out',
          'Observe your thoughts like clouds passing by',
          'Notice physical sensations in your body',
          'Do not judge or try to change anything',
          'Just notice. Just be.',
        ],
      },
      {
        name: 'Describe',
        description: 'Put words to what you observe without judgment.',
        steps: [
          'Name what you are experiencing: "I notice I feel..."',
          'Describe physical sensations: "My chest feels tight"',
          'Label emotions without adding stories: "I feel sad"',
          'Stick to facts, not interpretations',
          'Say "I notice the thought that..." to create distance',
        ],
      },
      {
        name: 'Participate',
        description: 'Throw yourself into the present moment fully.',
        steps: [
          'Choose one activity to do with your full attention',
          'Let go of self-consciousness',
          'Act intuitively when it is wise',
          'Do what is needed in each moment',
          'Enter fully into the experience',
        ],
      },
      {
        name: 'Non-Judgmental Stance',
        description: 'See things as they are without labeling good or bad.',
        steps: [
          'Notice when you are judging yourself or others',
          'Replace "should" with "could"',
          'Focus on what is, not what should be',
          'Acknowledge that everyone is doing their best',
          'Practice saying "I notice I am judging"',
        ],
      },
    ],
  },
  {
    id: 'distress-tolerance',
    title: 'Distress Tolerance',
    subtitle: 'Survive the moment without making it worse',
    icon: 'shield-outline',
    color: '#97C1A9',
    bgColor: '#E8F8E8',
    skills: [
      {
        name: 'TIPP',
        description: 'Change your body chemistry to reduce emotional intensity fast.',
        steps: [
          'T — Temperature: Splash cold water on your face or hold ice cubes',
          'I — Intense exercise: Jump, run, or do push-ups for 10 minutes',
          'P — Paced breathing: Breathe in 4, hold 4, out 6',
          'P — Progressive relaxation: Tense and release each muscle group',
        ],
      },
      {
        name: 'ACCEPTS',
        description: 'Distract yourself until the crisis passes.',
        steps: [
          'A — Activities: Do something engaging (clean, cook, draw)',
          'C — Contributing: Help someone else, volunteer',
          'C — Comparisons: Compare to a harder time you survived',
          'E — Emotions: Create opposite emotions (watch comedy, listen to happy music)',
          'P — Push away: Put the situation on a shelf for later',
          'T — Thoughts: Count to 10, do puzzles, read',
          'S — Sensations: Hold ice, take a hot shower, snap a rubber band',
        ],
      },
      {
        name: 'Self-Soothe',
        description: 'Use your five senses to comfort yourself.',
        steps: [
          'Vision: Look at nature, art, or a candle flame',
          'Hearing: Listen to calming music, rain sounds, or silence',
          'Smell: Light a candle, smell flowers, or essential oils',
          'Taste: Sip tea mindfully, eat something comforting',
          'Touch: Wrap in a soft blanket, pet an animal, take a warm bath',
        ],
      },
      {
        name: 'Radical Acceptance',
        description: 'Accept reality as it is, even when it hurts.',
        steps: [
          'Acknowledge the reality: "This is what happened"',
          'Remind yourself: fighting reality does not change it',
          'Say: "It is what it is" without approval',
          'Notice pain vs suffering — pain is inevitable, suffering is optional',
          'Practice willingness over willfulness',
        ],
      },
    ],
  },
  {
    id: 'emotion-regulation',
    title: 'Emotion Regulation',
    subtitle: 'Understand and shift your emotional state',
    icon: 'heart-outline',
    color: '#B8A9C9',
    bgColor: '#F0EAF8',
    skills: [
      {
        name: 'Check the Facts',
        description: 'Examine whether your emotional reaction fits the situation.',
        steps: [
          'What is the emotion you are feeling?',
          'What event triggered it?',
          'Are you interpreting the situation honestly?',
          'Is your emotion proportional to the facts?',
          'What is the actual threat or loss?',
          'Does the intensity match what happened?',
        ],
      },
      {
        name: 'Opposite Action',
        description: 'When your emotion does not fit the facts, act opposite.',
        steps: [
          'Identify the emotion and what it is telling you to do',
          'Ask: does this emotion fit the facts?',
          'If NO: do the opposite of what the emotion urges',
          'Afraid → approach what you fear',
          'Angry → be kind or gently avoid',
          'Sad → activate, get moving, engage',
          'Guilty → do not apologize if undeserved',
        ],
      },
      {
        name: 'ABC PLEASE',
        description: 'Build resilience by managing your vulnerability factors.',
        steps: [
          'A — Accumulate positives: Do pleasant activities daily',
          'B — Build mastery: Do one challenging thing each day',
          'C — Cope ahead: Plan for difficult situations',
          'PL — treat PhysicaL illness',
          'E — balanced Eating',
          'A — avoid mood-Altering substances',
          'S — balanced Sleep',
          'E — get Exercise',
        ],
      },
    ],
  },
  {
    id: 'interpersonal',
    title: 'Interpersonal Effectiveness',
    subtitle: 'Ask for what you need, keep your self-respect',
    icon: 'people-outline',
    color: '#E8A87C',
    bgColor: '#FFF5EE',
    skills: [
      {
        name: 'DEAR MAN',
        description: 'Ask for what you want effectively.',
        steps: [
          'D — Describe the situation with facts only',
          'E — Express how you feel using "I" statements',
          'A — Assert what you want clearly',
          'R — Reinforce: explain the positive outcome for both',
          'M — stay Mindful: don\'t get derailed by attacks',
          'A — Appear confident: eye contact, steady voice',
          'N — Negotiate: be willing to give to get',
        ],
      },
      {
        name: 'GIVE',
        description: 'Maintain the relationship while getting what you need.',
        steps: [
          'G — be Gentle: no attacks, threats, or judgments',
          'I — act Interested: listen, be curious',
          'V — Validate: acknowledge their feelings',
          'E — use an Easy manner: smile, humor, be light',
        ],
      },
      {
        name: 'FAST',
        description: 'Keep your self-respect in interactions.',
        steps: [
          'F — be Fair to yourself and the other person',
          'A — no (unnecessary) Apologies for your opinion',
          'S — Stick to your values',
          'T — be Truthful, don\'t exaggerate or make excuses',
        ],
      },
    ],
  },
];

export default function SkillsScreen() {
  const router = useRouter();
  const [expandedModule, setExpandedModule] = React.useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>DBT Skills</Text>
          <Text style={styles.subtitle}>Tap a module to explore skills</Text>
        </View>

        {DBT_MODULES.map((mod) => (
          <View key={mod.id}>
            <TouchableOpacity
              style={styles.moduleCard}
              onPress={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.moduleIconBg, { backgroundColor: mod.bgColor }]}>
                <Ionicons name={mod.icon} size={28} color={mod.color} />
              </View>
              <View style={styles.moduleInfo}>
                <Text style={styles.moduleTitle}>{mod.title}</Text>
                <Text style={styles.moduleSubtitle}>{mod.subtitle}</Text>
              </View>
              <Ionicons
                name={expandedModule === mod.id ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={Colors.textLight}
              />
            </TouchableOpacity>

            {expandedModule === mod.id && (
              <View style={styles.skillsList}>
                {mod.skills.map((skill, i) => (
                  <View key={i} style={styles.skillCard}>
                    <Text style={styles.skillName}>{skill.name}</Text>
                    <Text style={styles.skillDesc}>{skill.description}</Text>
                    <View style={styles.stepsContainer}>
                      {skill.steps.map((step, j) => (
                        <View key={j} style={styles.stepRow}>
                          <View style={[styles.stepDot, { backgroundColor: mod.color }]} />
                          <Text style={styles.stepText}>{step}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
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
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  moduleIconBg: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  moduleSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    marginTop: 2,
  },
  skillsList: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  skillCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  skillName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  skillDesc: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  stepsContainer: {
    gap: Spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  stepText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text,
    lineHeight: 20,
  },
});
