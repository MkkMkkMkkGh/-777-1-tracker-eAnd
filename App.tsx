/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  Platform,
  ScrollView,
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

type SmsPayload = {
  sender?: string;
  body?: string;
  timestamp?: number;
};

const SmsModule = NativeModules.SmsModule as
  | {
      getStoredLastSms: () => Promise<SmsPayload | null>;
      getLastSmsFromSender: (sender: string) => Promise<SmsPayload | null>;
    }
  | undefined;

type LimitUnit = 'AED' | 'MIN';

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
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: safeAreaInsets.top + 12 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <HeaderSection title="Pay-as-you-go" subtitle="Session guard" />

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

        <SectionHeader title="SMS detector" hint="Last Etisalat message" />
        <EtisalatSmsDetector />
      </ScrollView>
    </SafeAreaView>
  );
}

function HeaderSection({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
      <Text style={styles.headerSubtitle}>{subtitle}</Text>
    </View>
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

function EtisalatSmsDetector() {
  const [status, setStatus] = useState<'one' | 'two' | 'other' | 'none'>('none');
  const [lastMessage, setLastMessage] = useState<SmsPayload | null>(null);
  const [permissionState, setPermissionState] = useState<
    'unknown' | 'granted' | 'denied'
  >('unknown');

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    let isMounted = true;
    const emitter = SmsModule ? new NativeEventEmitter(SmsModule) : null;

    const requestPermissions = async () => {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
      ];
      if (Number(Platform.Version) >= 33) {
        permissions.push(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      }
      const results = await PermissionsAndroid.requestMultiple(permissions);
      const granted =
        results[PermissionsAndroid.PERMISSIONS.READ_SMS] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        results[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] ===
          PermissionsAndroid.RESULTS.GRANTED;
      setPermissionState(granted ? 'granted' : 'denied');
      return granted;
    };

    const classifyMessage = (message: SmsPayload | null) => {
      if (!message) {
        setStatus('none');
        return;
      }
      const normalized = message.body?.trim().toLowerCase() ?? '';
      if (normalized === 'one') {
        setStatus('one');
      } else if (normalized === 'two') {
        setStatus('two');
      } else {
        setStatus('other');
      }
    };

    const start = async () => {
      const granted = await requestPermissions();
      if (!granted) {
        return;
      }
      if (SmsModule?.getStoredLastSms) {
        const stored = await SmsModule.getStoredLastSms();
        if (isMounted && stored) {
          setLastMessage(stored);
          classifyMessage(stored);
        }
      }
      if (SmsModule?.getLastSmsFromSender) {
        const latest = await SmsModule.getLastSmsFromSender('etisalat');
        if (isMounted && latest) {
          setLastMessage(latest);
          classifyMessage(latest);
        }
      }
    };

    start();

    const subscription = emitter?.addListener(
      'SmsReceived',
      (payload: SmsPayload) => {
        if (!isMounted) {
          return;
        }
        if (payload.sender?.toLowerCase() === 'etisalat') {
          setLastMessage(payload);
          classifyMessage(payload);
        }
      },
    );

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, []);

  return (
    <View style={styles.card}>
      <View style={styles.cardRowBetween}>
        <View>
          <Text style={styles.cardLabel}>Detector status</Text>
          <Text style={styles.cardTitleSmall}>
            {Platform.OS === 'android'
              ? permissionState === 'granted'
                ? 'Listening for Etisalat'
                : permissionState === 'denied'
                  ? 'SMS permission denied'
                  : 'Requesting permission'
              : 'Android only'}
          </Text>
        </View>
        <View
          style={[
            styles.smsStatusBadge,
            status === 'one' && styles.smsStatusGood,
            status === 'two' && styles.smsStatusGoodAlt,
            status === 'other' && styles.smsStatusWarn,
            status === 'none' && styles.smsStatusMuted,
          ]}
        >
          <Text style={styles.smsStatusText}>{status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.smsBodyRow}>
        <Text style={styles.smsBodyLabel}>Last message</Text>
        <Text style={styles.smsBodyText}>
          {lastMessage?.body ?? 'No Etisalat message found.'}
        </Text>
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
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#0C0D12',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 16,
    color: '#6C7280',
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
  smsStatusBadge: {
    minWidth: 64,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#E6E7EC',
  },
  smsStatusGood: {
    backgroundColor: '#D7F5E8',
  },
  smsStatusGoodAlt: {
    backgroundColor: '#DCE9FF',
  },
  smsStatusWarn: {
    backgroundColor: '#FFE8D2',
  },
  smsStatusMuted: {
    backgroundColor: '#E6E7EC',
  },
  smsStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E3240',
  },
  smsBodyRow: {
    marginTop: 12,
  },
  smsBodyLabel: {
    fontSize: 12,
    color: '#7A8090',
  },
  smsBodyText: {
    marginTop: 6,
    fontSize: 14,
    color: '#1A1D27',
  },
});

export default App;
