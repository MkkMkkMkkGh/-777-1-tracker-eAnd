/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useColorScheme,
  View,
  Pressable,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

type LimitUnit = 'AED' | 'MIN';
const APP_BAR_COLLAPSED_HEIGHT = 64;
const APP_BAR_EXPANDED_HEIGHT = 156;

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [autoLimitEnabled, setAutoLimitEnabled] = useState(true);
  const [limitValue, setLimitValue] = useState('25');
  const [limitUnit, setLimitUnit] = useState<LimitUnit>('AED');
  const [sessionActive, setSessionActive] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;

  const appBarHeight = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [APP_BAR_EXPANDED_HEIGHT, APP_BAR_COLLAPSED_HEIGHT],
    extrapolate: 'clamp',
  });
  const expandedTitleOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const condensedTitleOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const actionRowTranslate = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, -16],
    extrapolate: 'clamp',
  });

  const session = useMemo(
    () => ({
      elapsed: '00:18:42',
      spend: '0.32',
      remaining: limitValue || '0',
    }),
    [limitValue],
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        <Animated.View style={{ height: appBarHeight }} />

        <SessionCard
          sessionActive={sessionActive}
          onToggleSession={() => setSessionActive(!sessionActive)}
          session={session}
          autoLimitEnabled={autoLimitEnabled}
          limitUnit={limitUnit}
        />

        <SectionHeader
          title="Session settings"
          hint="Global limit configuration"
        />

        <SettingsCard
          autoLimitEnabled={autoLimitEnabled}
          onToggleAutoLimit={setAutoLimitEnabled}
          limitValue={limitValue}
          onChangeLimitValue={setLimitValue}
          limitUnit={limitUnit}
          onChangeLimitUnit={setLimitUnit}
        />

        <SectionHeader title="Pricing rules" hint="Etisalat pay-as-you-go" />
        <PricingRules />
      </Animated.ScrollView>

      <AppBar
        topInset={safeAreaInsets.top}
        height={appBarHeight}
        expandedTitleOpacity={expandedTitleOpacity}
        condensedTitleOpacity={condensedTitleOpacity}
        actionRowTranslate={actionRowTranslate}
      />
    </SafeAreaView>
  );
}

function AppBar({
  topInset,
  height,
  expandedTitleOpacity,
  condensedTitleOpacity,
  actionRowTranslate,
}: {
  topInset: number;
  height: Animated.AnimatedInterpolation<number>;
  expandedTitleOpacity: Animated.AnimatedInterpolation<number>;
  condensedTitleOpacity: Animated.AnimatedInterpolation<number>;
  actionRowTranslate: Animated.AnimatedInterpolation<number>;
}) {
  return (
    <Animated.View style={[styles.appBar, { height, paddingTop: topInset }]}>
      <View style={styles.appBarTopRow}>
        <Pressable style={styles.appBarIcon}>
          <Text style={styles.appBarIconText}>≡</Text>
        </Pressable>
        <Animated.Text
          style={[styles.appBarTitleCondensed, { opacity: condensedTitleOpacity }]}
        >
          Pay-as-you-go
        </Animated.Text>
        <View style={styles.appBarActions}>
          <Pressable style={styles.appBarAction}>
            <Text style={styles.appBarActionText}>Help</Text>
          </Pressable>
          <Pressable style={styles.appBarAction}>
            <Text style={styles.appBarActionText}>Settings</Text>
          </Pressable>
        </View>
      </View>

      <Animated.View
        style={[
          styles.appBarExpanded,
          {
            opacity: expandedTitleOpacity,
            transform: [{ translateY: actionRowTranslate }],
          },
        ]}
      >
        <Text style={styles.appBarTitleExpanded}>Pay-as-you-go</Text>
        <Text style={styles.appBarSubtitle}>Session guard</Text>
        <View style={styles.appBarMetaRow}>
          <Text style={styles.appBarMeta}>Auto-limit ready</Text>
          <View style={styles.appBarMetaDot} />
          <Text style={styles.appBarMeta}>2 rules active</Text>
        </View>
        <View style={styles.appBarButtons}>
          <Pressable style={styles.appBarPrimary}>
            <Text style={styles.appBarPrimaryText}>View session</Text>
          </Pressable>
          <Pressable style={styles.appBarSecondary}>
            <Text style={styles.appBarSecondaryText}>Usage log</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

function SectionHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
    </View>
  );
}

function SessionCard({
  sessionActive,
  onToggleSession,
  session,
  autoLimitEnabled,
  limitUnit,
}: {
  sessionActive: boolean;
  onToggleSession: () => void;
  session: { elapsed: string; spend: string; remaining: string };
  autoLimitEnabled: boolean;
  limitUnit: LimitUnit;
}) {
  return (
    <View style={styles.cardPrimary}>
      <View style={styles.cardRowBetween}>
        <View>
          <Text style={styles.cardLabel}>Session status</Text>
          <Text style={styles.cardTitle}>
            {sessionActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.pillButton,
            sessionActive ? styles.pillStop : styles.pillStart,
            pressed && styles.pillPressed,
          ]}
          onPress={onToggleSession}
        >
          <Text style={styles.pillText}>
            {sessionActive ? 'Stop' : 'Start'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricBlock}>
          <Text style={styles.metricLabel}>Elapsed</Text>
          <Text style={styles.metricValue}>{session.elapsed}</Text>
        </View>
        <View style={styles.metricBlock}>
          <Text style={styles.metricLabel}>Spend (AED)</Text>
          <Text style={styles.metricValue}>{session.spend}</Text>
        </View>
      </View>

      <RemainingCard
        remaining={session.remaining}
        autoLimitEnabled={autoLimitEnabled}
        limitUnit={limitUnit}
      />
    </View>
  );
}

function RemainingCard({
  remaining,
  autoLimitEnabled,
  limitUnit,
}: {
  remaining: string;
  autoLimitEnabled: boolean;
  limitUnit: LimitUnit;
}) {
  return (
    <View
      style={[
        styles.remainingCard,
        !autoLimitEnabled && styles.remainingCardDisabled,
      ]}
    >
      <Text
        style={[
          styles.remainingLabel,
          !autoLimitEnabled && styles.remainingLabelDisabled,
        ]}
      >
        Remaining
      </Text>
      <Text
        style={[
          styles.remainingValue,
          !autoLimitEnabled && styles.remainingValueDisabled,
        ]}
      >
        {remaining} {limitUnit === 'AED' ? 'AED' : 'min'}
      </Text>
      <Text
        style={[
          styles.remainingHint,
          !autoLimitEnabled && styles.remainingHintDisabled,
        ]}
      >
        {autoLimitEnabled
          ? 'Auto-limit will stop the session at the set value.'
          : 'Auto-limit is off.'}
      </Text>
    </View>
  );
}

function SettingsCard({
  autoLimitEnabled,
  onToggleAutoLimit,
  limitValue,
  onChangeLimitValue,
  limitUnit,
  onChangeLimitUnit,
}: {
  autoLimitEnabled: boolean;
  onToggleAutoLimit: (value: boolean) => void;
  limitValue: string;
  onChangeLimitValue: (value: string) => void;
  limitUnit: LimitUnit;
  onChangeLimitUnit: (value: LimitUnit) => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardRowBetween}>
        <View>
          <Text style={styles.cardLabel}>Auto-limit</Text>
          <Text style={styles.cardTitleSmall}>
            Apply limit on session start
          </Text>
        </View>
        <Switch
          value={autoLimitEnabled}
          onValueChange={onToggleAutoLimit}
          trackColor={{ false: '#C7C9D1', true: '#7BB7FF' }}
          thumbColor={autoLimitEnabled ? '#0A5ED7' : '#F4F5F8'}
        />
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Limit value</Text>
          <TextInput
            value={limitValue}
            onChangeText={onChangeLimitValue}
            keyboardType="numeric"
            style={styles.input}
            placeholder="0"
            placeholderTextColor="#9AA0AE"
          />
        </View>
        <View style={styles.unitGroup}>
          <Text style={styles.inputLabel}>Unit</Text>
          <View style={styles.unitToggle}>
            <Pressable
              style={[
                styles.unitOption,
                limitUnit === 'AED' && styles.unitOptionActive,
              ]}
              onPress={() => onChangeLimitUnit('AED')}
            >
              <Text
                style={[
                  styles.unitText,
                  limitUnit === 'AED' && styles.unitTextActive,
                ]}
              >
                AED
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.unitOption,
                limitUnit === 'MIN' && styles.unitOptionActive,
              ]}
              onPress={() => onChangeLimitUnit('MIN')}
            >
              <Text
                style={[
                  styles.unitText,
                  limitUnit === 'MIN' && styles.unitTextActive,
                ]}
              >
                Minutes
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

function PricingRules() {
  return (
    <View style={styles.card}>
      <View style={styles.ruleRow}>
        <Text style={styles.ruleLabel}>Minimum charge</Text>
        <Text style={styles.ruleValue}>AED 0.225</Text>
      </View>
      <View style={styles.ruleRow}>
        <Text style={styles.ruleLabel}>First block</Text>
        <Text style={styles.ruleValue}>15 mins @ 0.75 fils</Text>
      </View>
      <View style={styles.ruleRow}>
        <Text style={styles.ruleLabel}>Subsequent charge</Text>
        <Text style={styles.ruleValue}>AED 0.0075 / minute</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F3F7',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  appBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F2F3F7',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E3E8',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  appBarTopRow: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
  },
  appBarIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  appBarIconText: {
    fontSize: 18,
    color: '#101217',
    fontWeight: '600',
  },
  appBarTitleCondensed: {
    flex: 1,
    marginLeft: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#0C0D12',
  },
  appBarActions: {
    flexDirection: 'row',
    gap: 8,
  },
  appBarAction: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  appBarActionText: {
    fontSize: 12,
    color: '#2E3240',
    fontWeight: '600',
  },
  appBarExpanded: {
    marginTop: 8,
  },
  appBarTitleExpanded: {
    fontSize: 30,
    fontWeight: '700',
    color: '#0C0D12',
    letterSpacing: -0.4,
  },
  appBarSubtitle: {
    marginTop: 4,
    fontSize: 15,
    color: '#6C7280',
  },
  appBarMetaRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appBarMeta: {
    fontSize: 12,
    color: '#5D6576',
  },
  appBarMetaDot: {
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#9AA0AE',
  },
  appBarButtons: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  appBarPrimary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#0A5ED7',
  },
  appBarPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  appBarSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7DAE2',
  },
  appBarSecondaryText: {
    color: '#2E3240',
    fontWeight: '600',
    fontSize: 13,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#171922',
  },
  sectionHint: {
    marginTop: 4,
    fontSize: 14,
    color: '#7A8090',
  },
  cardPrimary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
  },
  cardRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardLabel: {
    fontSize: 13,
    color: '#7A8090',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0C0D12',
    marginTop: 4,
  },
  cardTitleSmall: {
    fontSize: 15,
    color: '#4B5161',
    marginTop: 4,
  },
  pillButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  pillStart: {
    backgroundColor: '#0A5ED7',
  },
  pillStop: {
    backgroundColor: '#E6493A',
  },
  pillPressed: {
    opacity: 0.85,
  },
  pillText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  metricBlock: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#F6F7FB',
  },
  metricLabel: {
    fontSize: 12,
    color: '#7A8090',
  },
  metricValue: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '600',
    color: '#101217',
  },
  remainingCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#EAF2FF',
  },
  remainingCardDisabled: {
    backgroundColor: '#EEF0F4',
  },
  remainingLabel: {
    fontSize: 13,
    color: '#3B4B64',
  },
  remainingLabelDisabled: {
    color: '#7A8090',
  },
  remainingValue: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: '700',
    color: '#0A5ED7',
  },
  remainingValueDisabled: {
    color: '#8C92A3',
  },
  remainingHint: {
    marginTop: 6,
    fontSize: 12,
    color: '#5D6A82',
  },
  remainingHintDisabled: {
    color: '#8C92A3',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#7A8090',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F6F7FB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0C0D12',
  },
  unitGroup: {
    flex: 1,
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: '#F6F7FB',
    borderRadius: 14,
    padding: 4,
    gap: 6,
  },
  unitOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  unitOptionActive: {
    backgroundColor: '#FFFFFF',
  },
  unitText: {
    fontSize: 13,
    color: '#7A8090',
  },
  unitTextActive: {
    color: '#0A5ED7',
    fontWeight: '600',
  },
  ruleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ruleLabel: {
    fontSize: 14,
    color: '#5D6576',
  },
  ruleValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#101217',
  },
});

export default App;
