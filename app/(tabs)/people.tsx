import { useFocusEffect, useRouter } from 'expo-router';
import { Card, Chip } from 'heroui-native';
import { useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useSummary } from '@/hooks/use-summary';
import { formatCurrency, getInitials } from '@/utils/format';

export default function PeopleScreen() {
  const { people, loading, reload } = useSummary();
  const router = useRouter();

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
        <View className="mb-5">
          <Text className="text-[28px] font-extrabold text-foreground">Users</Text>
        </View>

        {people.length === 0 && !loading && (
          <Text className="mt-10 text-center text-sm text-muted">No people yet.</Text>
        )}

        {people.map((person) => (
          <View key={person.personName} className="my-1">
            <Pressable
              onPress={() => router.push(`/person/${encodeURIComponent(person.personName)}`)}>
              <Card variant="default">
                <Card.Body>
                  <View className="flex-row items-center gap-3">
                    <View className="h-11 w-11 items-center justify-center rounded-full bg-accent">
                      <Text className="text-base font-bold text-accent-foreground">
                        {getInitials(person.personName)}
                      </Text>
                    </View>

                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">
                        {person.personName}
                      </Text>
                      {person.phone ? (
                        <Text className="mt-px text-[13px] text-muted">{person.phone}</Text>
                      ) : null}
                      <Text className="mt-px text-xs text-muted">
                        {person.transactionCount} transaction
                        {person.transactionCount !== 1 ? 's' : ''}
                      </Text>
                    </View>

                    <View className="items-end gap-1">
                      <Text
                        className={`text-[17px] font-bold ${
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
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
