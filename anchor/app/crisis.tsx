import { Colors, BorderRadius, Spacing, FontSize } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const GROUNDING_STEPS = [
  { number: 5, sense: 'SEE', instruction: 'Name 5 things you can see around you', icon: 'eye-outline' as const },
  { number: 4, sense: 'TOUCH', instruction: 'Name 4 things you can physically feel', icon: 'hand-left-outline' as const },
  { number: 3, sense: 'HEAR', instruction: 'Name 3 things you can hear right now', icon: 'ear-outline' as const },
  { number: 2, sense: 'SMELL', instruction: 'Name 2 things you can smell', icon: 'flower-outline' as const },
  { number: 1, sense: 'TASTE', instruction: 'Name 1 thing you can taste', icon: 'water-outline' as const },
];

const TIPP_STEPS = [
  {
    title: 'T - Temperature',
    description: 'Hold ice cubes, splash cold water on your face, or take a cold shower. This activates your dive reflex and slows your heart rate.',
    icon: 'snow-outline' as const,
  },
  {
    title: 'I - Intense Exercise',
    description: 'Do jumping jacks, run in place, or push-ups for 5-10 minutes. This burns off stress hormones.',
    icon: 'fitness-outline' as const,
  },
  {
    title: 'P - Paced Breathing',
    description: 'Breathe in for 4 counts, hold for 4, out for 6. Slow, deep breaths activate your calming system.',
    icon: 'pulse-outline' as const,
  },
  {
    title: 'P - Progressive Relaxation',
    description: 'Tense each muscle group for 5 seconds, then release. Start from your toes and work up to your head.',
    icon: 'body-outline' as const,
  },
];

export default function CrisisScreen() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'menu' | 'grounding' | 'tipp' | 'breathing'>('menu');
  const [groundingStep, setGroundingStep] = useState(0);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'idle'>('idle');
  const [breathCount, setBreathCount] = useState(0);
  const breathAnim = useRef(new Animated.Value(0.3)).current;
  const breathTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
    };
  }, []);

  const startBreathing = () => {
    setBreathPhase('inhale');
    setBreathCount(0);
    runBreathCycle();
  };

  const runBreathCycle = () => {
    const cycle = () => {
      // Inhale 4s
      setBreathPhase('inhale');
      Animated.timing(breathAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        // Hold 4s
        setBreathPhase('hold');
        setTimeout(() => {
          // Exhale 6s
          setBreathPhase('exhale');
          Animated.timing(breathAnim, {
            toValue: 0.3,
            duration: 6000,
            useNativeDriver: true,
          }).start();

          setTimeout(() => {
            setBreathCount((c) => c + 1);
            if (breathCount < 5) {
              cycle();
            } else {
              setBreathPhase('idle');
            }
          }, 6000);
        }, 4000);
      }, 4000);
    };
    cycle();
  };

  const stopBreathing = () => {
    setBreathPhase('idle');
    breathAnim.setValue(0.3);
    if (breathTimerRef.current) clearInterval(breathTimerRef.current);
  };

  const renderMenu = () => (
    <View style={styles.menuContainer}>
      <Text style={styles.subtitle}>You are safe. This feeling will pass.{'\n'}Choose an exercise to help you right now.</Text>

      <TouchableOpacity style={styles.menuCard} onPress={() => setActiveSection('grounding')}>
        <View style={[styles.menuIconBg, { backgroundColor: '#E8F4F8' }]}>
          <Ionicons name="hand-left-outline" size={28} color={Colors.primary} />
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>5-4-3-2-1 Grounding</Text>
          <Text style={styles.menuDesc}>Use your senses to reconnect with the present</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuCard} onPress={() => setActiveSection('tipp')}>
        <View style={[styles.menuIconBg, { backgroundColor: '#E8F8E8' }]}>
          <Ionicons name="flash-outline" size={28} color={Colors.secondary} />
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>TIPP Skills</Text>
          <Text style={styles.menuDesc}>Quick techniques to lower intense emotions fast</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuCard} onPress={() => setActiveSection('breathing')}>
        <View style={[styles.menuIconBg, { backgroundColor: '#F0EAF8' }]}>
          <Ionicons name="pulse-outline" size={28} color={Colors.accent} />
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>Box Breathing</Text>
          <Text style={styles.menuDesc}>Guided breathing to calm your nervous system</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
      </TouchableOpacity>

      <View style={styles.emergencySection}>
        <Text style={styles.emergencyTitle}>Need immediate help?</Text>
        <Text style={styles.emergencyText}>
          If you are in danger or having thoughts of self-harm, please reach out:
        </Text>
        <View style={styles.hotlineCard}>
          <Text style={styles.hotlineName}>988 Suicide & Crisis Lifeline</Text>
          <Text style={styles.hotlineNumber}>Call or text 988</Text>
        </View>
        <View style={styles.hotlineCard}>
          <Text style={styles.hotlineName}>Crisis Text Line</Text>
          <Text style={styles.hotlineNumber}>Text HOME to 741741</Text>
        </View>
      </View>
    </View>
  );

  const renderGrounding = () => {
    const step = GROUNDING_STEPS[groundingStep];
    const isComplete = groundingStep >= GROUNDING_STEPS.length;

    if (isComplete) {
      return (
        <View style={styles.exerciseContainer}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
          </View>
          <Text style={styles.exerciseComplete}>You did it.</Text>
          <Text style={styles.exerciseCompleteSub}>
            You are here. You are present. You are safe.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => { setGroundingStep(0); setActiveSection('menu'); }}>
            <Text style={styles.primaryButtonText}>Back to Safety Tools</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.exerciseContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => { setGroundingStep(0); setActiveSection('menu'); }}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.progressDots}>
          {GROUNDING_STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i <= groundingStep && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.groundingCard}>
          <View style={styles.groundingIconBg}>
            <Ionicons name={step.icon} size={48} color={Colors.primary} />
          </View>
          <Text style={styles.groundingNumber}>{step.number}</Text>
          <Text style={styles.groundingSense}>things you can {step.sense}</Text>
          <Text style={styles.groundingInstruction}>{step.instruction}</Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setGroundingStep((s) => s + 1)}
        >
          <Text style={styles.primaryButtonText}>
            {groundingStep < GROUNDING_STEPS.length - 1 ? 'Next' : 'Finish'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTIPP = () => (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity style={styles.backButton} onPress={() => setActiveSection('menu')}>
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>TIPP Skills</Text>
      <Text style={styles.sectionSubtitle}>These work fast to bring down intense emotions. Try one or all of them.</Text>

      {TIPP_STEPS.map((step, i) => (
        <View key={i} style={styles.tippCard}>
          <View style={styles.tippHeader}>
            <Ionicons name={step.icon} size={24} color={Colors.secondary} />
            <Text style={styles.tippTitle}>{step.title}</Text>
          </View>
          <Text style={styles.tippDesc}>{step.description}</Text>
        </View>
      ))}
    </ScrollView>
  );

  const renderBreathing = () => (
    <View style={styles.exerciseContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => { stopBreathing(); setActiveSection('menu'); }}>
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Box Breathing</Text>
      <Text style={styles.sectionSubtitle}>
        Breathe with the circle. Inhale as it grows, hold, then exhale as it shrinks.
      </Text>

      <View style={styles.breathContainer}>
        <Animated.View
          style={[
            styles.breathCircle,
            { transform: [{ scale: breathAnim }] },
          ]}
        >
          <Text style={styles.breathText}>
            {breathPhase === 'idle' ? 'Start' : breathPhase === 'inhale' ? 'Breathe In' : breathPhase === 'hold' ? 'Hold' : 'Breathe Out'}
          </Text>
        </Animated.View>
      </View>

      {breathPhase !== 'idle' && (
        <Text style={styles.breathCounter}>Cycle {breathCount + 1} of 6</Text>
      )}

      <TouchableOpacity
        style={[styles.primaryButton, breathPhase !== 'idle' && styles.secondaryButton]}
        onPress={breathPhase === 'idle' ? startBreathing : stopBreathing}
      >
        <Text style={[styles.primaryButtonText, breathPhase !== 'idle' && styles.secondaryButtonText]}>
          {breathPhase === 'idle' ? 'Start Breathing' : 'Stop'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crisis Support</Text>
        <View style={{ width: 44 }} />
      </View>

      {activeSection === 'menu' && renderMenu()}
      {activeSection === 'grounding' && renderGrounding()}
      {activeSection === 'tipp' && renderTIPP()}
      {activeSection === 'breathing' && renderBreathing()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.crisisBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  menuIconBg: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  menuDesc: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
  },
  emergencySection: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
  },
  emergencyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emergencyText: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  hotlineCard: {
    backgroundColor: Colors.calm,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  hotlineName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  hotlineNumber: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    marginTop: 2,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  backText: {
    fontSize: FontSize.md,
    color: Colors.text,
    marginLeft: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  exerciseContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primary,
  },
  groundingCard: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  groundingIconBg: {
    marginBottom: Spacing.md,
  },
  groundingNumber: {
    fontSize: 64,
    fontWeight: '800',
    color: Colors.primary,
  },
  groundingSense: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  groundingInstruction: {
    fontSize: FontSize.md,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.round,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    color: Colors.primary,
  },
  checkCircle: {
    marginBottom: Spacing.lg,
    marginTop: Spacing.xxl,
  },
  exerciseComplete: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  exerciseCompleteSub: {
    fontSize: FontSize.md,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  tippCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  tippHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  tippTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  tippDesc: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    lineHeight: 22,
  },
  breathContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathCircle: {
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: width * 0.3,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  breathText: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: '#FFF',
  },
  breathCounter: {
    fontSize: FontSize.md,
    color: Colors.textLight,
    marginBottom: Spacing.lg,
  },
});
