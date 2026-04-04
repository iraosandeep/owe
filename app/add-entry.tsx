import { ContactPickerInput } from '@/components/contact-picker-input';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAddEntryFormState } from '@/hooks/use-add-entry-form-state';
import { useTransactions } from '@/hooks/use-transactions';
import type { TransactionType } from '@/types';
import { useRouter } from 'expo-router';
import {
  Button,
  Description,
  Input,
  Label,
  Radio,
  RadioGroup,
  Spinner,
  useThemeColor,
} from 'heroui-native';
import { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function AddEntryScreen() {
  const router = useRouter();
  const { addTransaction } = useTransactions();
  const { state, setFormField } = useAddEntryFormState();
  const [accentForeground] = useThemeColor(['accent-foreground']);
  const [saving, setSaving] = useState<boolean>(false);

  const handleSave = useCallback(async () => {
    if (!state.personName.trim()) {
      Alert.alert('Error', 'Please enter a person name.');
      return;
    }

    const parsedAmount = parseFloat(state.amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    setSaving(true);
    try {
      const parsedInterest = state.interest ? parseFloat(state.interest) : null;
      await addTransaction({
        personName: state.personName.trim(),
        phone: state.phone.trim() || null,
        amount: parsedAmount,
        type: state.type,
        interest:
          parsedInterest !== null && !Number.isNaN(parsedInterest) && parsedInterest > 0
            ? parsedInterest
            : null,
        date: new Date(state.date).toISOString(),
      });

      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save transaction.');
    } finally {
      setSaving(false);
    }
  }, [state, addTransaction, router, setSaving]);

  return (
    <View className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1 bg-background"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          className="flex-1 bg-background"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View className="flex-row items-center justify-between px-4 py-4">
            <Pressable onPress={() => router.back()}>
              <Text className="text-base font-medium text-accent">Cancel</Text>
            </Pressable>
            <Text className="text-lg font-bold text-foreground">New Entry</Text>
            <Button
              variant={saving ? 'ghost' : 'primary'}
              size="sm"
              onPress={handleSave}
              isDisabled={saving}>
              {saving ? <Spinner size="md" /> : 'Save'}
            </Button>
          </View>
          <View className="min-h-full gap-2 bg- px-4 pb-10">
            <Label className="mt-2 text-sm" isRequired>
              Type
            </Label>
            <RadioGroup
              className="mb-1 gap-2"
              value={state.type}
              onValueChange={(value) => {
                setFormField({ field: 'type', value: value as TransactionType });
              }}>
              <RadioGroup.Item value="given">
                {({ isSelected }) => (
                  <View
                    className={`flex-1 flex-row items-center justify-between rounded-2xl border-2 p-3 ${
                      isSelected
                        ? 'border-accent bg-surface-secondary'
                        : 'border-transparent bg-surface'
                    }`}>
                    <View className="flex-1">
                      <Label className="text-base font-bold text-success">Given</Label>
                      <Description className="mt-0.5 text-xs text-muted">
                        Money you gave
                      </Description>
                    </View>
                    <Radio>
                      <Radio.Indicator className={isSelected ? 'border-accent bg-accent' : ''}>
                        {isSelected && (
                          <Animated.View entering={FadeIn}>
                            <IconSymbol
                              name="checkmark"
                              color={accentForeground}
                              size={10}
                              weight="black"
                            />
                          </Animated.View>
                        )}
                      </Radio.Indicator>
                    </Radio>
                  </View>
                )}
              </RadioGroup.Item>
              <RadioGroup.Item value="taken">
                {({ isSelected }) => (
                  <View
                    className={`flex-1 flex-row items-center justify-between rounded-2xl border-2 p-3 ${
                      isSelected
                        ? 'border-accent bg-surface-secondary'
                        : 'border-transparent bg-surface'
                    }`}>
                    <View className="flex-1">
                      <Label className="text-base font-bold text-danger">Taken</Label>
                      <Description className="mt-0.5 text-xs text-muted">
                        Money you received
                      </Description>
                    </View>
                    <Radio>
                      <Radio.Indicator className={isSelected ? 'border-accent bg-accent' : ''}>
                        {isSelected && (
                          <Animated.View entering={FadeIn}>
                            <IconSymbol
                              name="checkmark"
                              color={accentForeground}
                              size={10}
                              weight="black"
                            />
                          </Animated.View>
                        )}
                      </Radio.Indicator>
                    </Radio>
                  </View>
                )}
              </RadioGroup.Item>
            </RadioGroup>

            <Label className="mt-2 text-sm" isRequired>
              Person
            </Label>
            <ContactPickerInput
              placeholder="Search contacts or type a name..."
              value={state.personName}
              onChangeText={(value) =>
                setFormField({
                  field: 'contact',
                  value: { name: value, phone: '' },
                })
              }
              onContactSelected={(contact) =>
                setFormField({
                  field: 'contact',
                  value: contact,
                })
              }
            />

            <Label className="mt-2 text-sm" isRequired>
              Amount
            </Label>
            <Input
              placeholder="0"
              value={state.amount}
              onChangeText={(value) =>
                setFormField({
                  field: 'amount',
                  value,
                })
              }
              keyboardType="numeric"
            />

            <Label className="mt-2 text-sm">Interest % (optional)</Label>
            <Input
              placeholder="e.g., 5"
              value={state.interest}
              onChangeText={(value) => setFormField({ field: 'interest', value })}
              keyboardType="numeric"
            />

            <Label className="mt-2 text-sm" isRequired>
              Date
            </Label>
            <Input
              placeholder="YYYY-MM-DD"
              value={state.date}
              onChangeText={(value) =>
                setFormField({
                  field: 'date',
                  value,
                })
              }
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
