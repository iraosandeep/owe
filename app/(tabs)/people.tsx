import { useFocusEffect, useRouter } from 'expo-router';
import { Card, Chip, useThemeColor } from 'heroui-native';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSummary } from '@/hooks/use-summary';
import { formatCurrency, getInitials } from '@/utils/format';

export default function PeopleScreen() {
  const { people, loading, reload } = useSummary();
  const router = useRouter();
  const [background, foreground, muted, accent, accentForeground, danger, success] = useThemeColor([
    'background',
    'foreground',
    'muted',
    'accent',
    'accent-foreground',
    'danger',
    'success',
  ]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
      <Text style={[styles.title, { color: foreground }]}>People</Text>
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {people.length === 0 && !loading && (
          <Text style={[styles.emptyText, { color: muted }]}>No people yet.</Text>
        )}
        {people.map((person) => (
          <Pressable
            key={person.personName}
            onPress={() => router.push(`/person/${encodeURIComponent(person.personName)}`)}>
            <Card variant="default" style={styles.personCard}>
              <Card.Body>
                <View style={styles.personRow}>
                  <View style={[styles.avatar, { backgroundColor: accent }]}>
                    <Text style={[styles.avatarText, { color: accentForeground }]}>
                      {getInitials(person.personName)}
                    </Text>
                  </View>
                  <View style={styles.personInfo}>
                    <Text style={[styles.personName, { color: foreground }]}>
                      {person.personName}
                    </Text>
                    {person.phone && (
                      <Text style={[styles.personPhone, { color: muted }]}>{person.phone}</Text>
                    )}
                    <Text style={[styles.personMeta, { color: muted }]}>
                      {person.transactionCount} transaction
                      {person.transactionCount !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={styles.personBalance}>
                    <Text
                      style={[
                        styles.personAmount,
                        {
                          color:
                            person.netBalance > 0
                              ? danger
                              : person.netBalance < 0
                                ? success
                                : muted,
                        },
                      ]}>
                      {formatCurrency(Math.abs(person.netBalance))}
                    </Text>
                    <Chip
                      variant="soft"
                      size="sm"
                      color={
                        person.netBalance > 0
                          ? 'danger'
                          : person.netBalance < 0
                            ? 'success'
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
  },
  personCard: {
    marginBottom: 8,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: '600',
  },
  personPhone: {
    fontSize: 13,
    marginTop: 1,
  },
  personMeta: {
    fontSize: 12,
    marginTop: 1,
  },
  personBalance: {
    alignItems: 'flex-end',
    gap: 4,
  },
  personAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
});
