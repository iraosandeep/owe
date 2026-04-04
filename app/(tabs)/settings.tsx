import { Card, Chip, Separator, useThemeColor } from 'heroui-native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type ThemeMode, useThemePreference } from '@/hooks/use-theme-preference';

const THEME_OPTIONS: { value: ThemeMode; label: string; description: string }[] = [
  {
    value: 'system',
    label: 'System',
    description: 'Follows your phone appearance settings automatically.',
  },
  {
    value: 'light',
    label: 'Light',
    description: 'Always use light colors.',
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Always use dark colors.',
  },
];

export default function SettingsScreen() {
  const { mode, resolvedTheme, setMode } = useThemePreference();
  const [background, foreground, muted] = useThemeColor(['background', 'foreground', 'muted']);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
      <Text style={[styles.title, { color: foreground }]}>Settings</Text>

      <Card variant="default">
        <Card.Body>
          <Text style={[styles.sectionTitle, { color: foreground }]}>Appearance</Text>
          <Text style={[styles.subtitle, { color: muted }]}>
            Choose how the app looks on your device.
          </Text>

          <View style={styles.options}>
            {THEME_OPTIONS.map((option, index) => {
              const isSelected = mode === option.value;
              return (
                <View key={option.value}>
                  <View style={styles.optionRow}>
                    <View style={styles.optionText}>
                      <Text style={[styles.optionLabel, { color: foreground }]}>
                        {option.label}
                      </Text>
                      <Text style={[styles.optionDescription, { color: muted }]}>
                        {option.description}
                      </Text>
                    </View>
                    <Chip
                      variant={isSelected ? 'primary' : 'secondary'}
                      size="sm"
                      onPress={() => setMode(option.value)}>
                      <Chip.Label>{isSelected ? 'Selected' : 'Select'}</Chip.Label>
                    </Chip>
                  </View>
                  {index < THEME_OPTIONS.length - 1 && <Separator orientation="horizontal" />}
                </View>
              );
            })}
          </View>
        </Card.Body>
      </Card>

      <Text style={[styles.currentMode, { color: muted }]}>
        Active theme:{' '}
        <Text style={[styles.currentModeValue, { color: foreground }]}>{resolvedTheme}</Text>
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 12,
  },
  options: {
    gap: 10,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  optionText: {
    flex: 1,
    paddingRight: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  currentMode: {
    fontSize: 14,
    marginTop: 16,
  },
  currentModeValue: {
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
