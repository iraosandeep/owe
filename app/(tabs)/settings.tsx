import { db } from '@/db/client';
import { transactions } from '@/db/schema';
import { type ThemeMode, useThemePreference } from '@/hooks/use-theme-preference';
import { Button, Card, Description, Label, Radio, RadioGroup } from 'heroui-native';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

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
  const { mode, setMode } = useThemePreference();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAllData = useCallback(() => {
    Alert.alert('Delete all data?', 'This will remove all transactions from this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Continue',
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            'Are you absolutely sure?',
            'This action cannot be undone.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete everything',
                style: 'destructive',
                onPress: async () => {
                  if (isDeleting) return;
                  setIsDeleting(true);
                  try {
                    await db.delete(transactions);
                    Alert.alert('Done', 'All transaction data has been deleted.');
                  } catch {
                    Alert.alert('Error', 'Failed to delete data. Please try again.');
                  } finally {
                    setIsDeleting(false);
                  }
                },
              },
            ],
            { cancelable: true }
          );
        },
      },
    ]);
  }, [isDeleting]);

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustContentInsets>
      <View className="bg-background p-4 pb-8">
        <View className="mb-5">
          <Text className="text-[28px] font-extrabold text-foreground">Settings</Text>
        </View>

        <Card variant="default">
          <Card.Body>
            <Text className="text-lg font-bold text-foreground">Appearance</Text>
            <Text className="mb-3 mt-1 text-sm text-muted">
              Choose how the app looks on your device.
            </Text>

            <RadioGroup value={mode} onValueChange={(value) => setMode(value as ThemeMode)}>
              {THEME_OPTIONS.map((option, index) => (
                <RadioGroup.Item key={option.value} value={option.value}>
                  <View
                    className={`flex-row items-center justify-between py-2 ${
                      index < THEME_OPTIONS.length - 1 ? 'border-b border-separator' : ''
                    }`}>
                    <View className="flex-1 pr-3">
                      <Label className="text-base font-semibold text-foreground">
                        {option.label}
                      </Label>
                      <Description className="mt-0.5 text-[13px] text-muted">
                        {option.description}
                      </Description>
                    </View>
                    <Radio>
                      <Radio.Indicator>
                        <Radio.IndicatorThumb />
                      </Radio.Indicator>
                    </Radio>
                  </View>
                </RadioGroup.Item>
              ))}
            </RadioGroup>
          </Card.Body>
        </Card>

        <Card variant="default" className="mt-4">
          <Card.Body>
            <Text className="text-lg font-bold text-foreground">Danger Zone</Text>
            <Text className="mb-3 mt-1 text-sm text-muted">
              Permanently delete all locally stored transactions.
            </Text>
            <Button
              variant="danger"
              size="md"
              onPress={handleDeleteAllData}
              isDisabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete all data'}
            </Button>
          </Card.Body>
        </Card>
      </View>
    </ScrollView>
  );
}
