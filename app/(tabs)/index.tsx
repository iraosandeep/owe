import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSummary } from '@/hooks/use-summary';
import { formatCurrency } from '@/utils/format';
import { useFocusEffect, useRouter } from 'expo-router';
import { Button, Card, Chip, Separator, useThemeColor } from 'heroui-native';
import { useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

export default function DashboardScreen() {
  const { summary, people, loading, reload } = useSummary();
  const router = useRouter();
  const accent = useThemeColor('accent');

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustContentInsets>
      <View className="p-4 pb-8 bg-background">
        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-3xl font-extrabold text-foreground">Owe</Text>
          <Button variant="ghost" size="sm" onPress={() => router.push('/add-entry')}>
            <IconSymbol name="plus.circle" size={28} color={accent} />
          </Button>
        </View>

        <View className="mb-3 flex-row gap-3">
          <Card variant="default" className="flex-1">
            <Card.Body>
              <Text className="mb-1 text-sm font-medium text-muted">Given</Text>
              <Text className="text-[22px] font-bold text-success">
                {formatCurrency(summary.totalGiven)}
              </Text>
            </Card.Body>
          </Card>
          <Card variant="default" className="flex-1">
            <Card.Body>
              <Text className="mb-1 text-sm font-medium text-muted">Taken</Text>
              <Text className="text-[22px] font-bold text-danger">
                {formatCurrency(summary.totalTaken)}
              </Text>
            </Card.Body>
          </Card>
        </View>

        <Card variant="tertiary" className="mb-5">
          <Card.Body>
            <Text className="mb-1 text-sm font-medium text-muted">Net Balance</Text>
            <Text
              className={`text-[28px] font-extrabold ${
                summary.netBalance >= 0 ? 'text-success' : 'text-danger'
              }`}>
              {formatCurrency(summary.netBalance)}
            </Text>
            <Text className="mt-0.5 text-[13px] text-muted">
              {summary.netBalance > 0
                ? 'Others owe you'
                : summary.netBalance < 0
                  ? 'You owe others'
                  : 'All settled up'}
            </Text>
          </Card.Body>
        </Card>

        <Separator orientation="horizontal" />

        <Text className="mb-3 mt-4 text-xl font-bold text-foreground">People</Text>
        {people.length === 0 && !loading && (
          <Text className="mt-6 text-center text-sm text-muted">No transactions yet.</Text>
        )}
        {people.map((person) => (
          <Pressable
            key={person.personName}
            onPress={() => router.push(`/person/${encodeURIComponent(person.personName)}`)}>
            <Card variant="default" className="mb-2">
              <Card.Body>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">
                      {person.personName}
                    </Text>
                    <Text className="mt-0.5 text-[13px] text-muted">
                      {person.transactionCount} transaction
                      {person.transactionCount !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View className="items-end gap-1">
                    <Text
                      className={`text-lg font-bold ${
                        person.netBalance > 0
                            ? 'text-success'
                            : person.netBalance < 0
                              ? 'text-danger'
                            : 'text-muted'
                      }`}>
                      {formatCurrency(Math.abs(person.netBalance))}
                    </Text>
                    <Chip
                      variant="soft"
                      size="sm"
                      color={
                        person.netBalance > 0
                            ? 'success'
                            : person.netBalance < 0
                              ? 'danger'
                              : 'default'
                      }>
                      <Chip.Label>
                        {person.netBalance > 0
                          ? 'Owes you'
                          : person.netBalance < 0
                            ? 'You owe'
                            : 'Settled'}
                      </Chip.Label>
                    </Chip>
                  </View>
                </View>
              </Card.Body>
            </Card>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
