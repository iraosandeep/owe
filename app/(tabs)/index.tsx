import { useFocusEffect, useRouter } from 'expo-router';
import { Button, Card, Chip, Separator } from 'heroui-native';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSummary } from '@/hooks/use-summary';
import { formatCurrency } from '@/utils/format';

export default function DashboardScreen() {
  const { summary, people, loading, reload } = useSummary();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Owe</Text>
          <Button variant="primary" size="md" onPress={() => router.push('/add-entry')}>
            + Add Entry
          </Button>
        </View>

        <View style={styles.cardsRow}>
          <Card variant="default" style={styles.summaryCard}>
            <Card.Body>
              <Text style={styles.cardLabel}>Given</Text>
              <Text style={[styles.cardAmount, { color: '#E53935' }]}>
                {formatCurrency(summary.totalGiven)}
              </Text>
            </Card.Body>
          </Card>
          <Card variant="default" style={styles.summaryCard}>
            <Card.Body>
              <Text style={styles.cardLabel}>Taken</Text>
              <Text style={[styles.cardAmount, { color: '#43A047' }]}>
                {formatCurrency(summary.totalTaken)}
              </Text>
            </Card.Body>
          </Card>
        </View>

        <Card variant="secondary" style={styles.netCard}>
          <Card.Body>
            <Text style={styles.netLabel}>Net Balance</Text>
            <Text
              style={[
                styles.netAmount,
                { color: summary.netBalance >= 0 ? '#E53935' : '#43A047' },
              ]}>
              {formatCurrency(summary.netBalance)}
            </Text>
            <Text style={styles.netHint}>
              {summary.netBalance > 0
                ? 'Others owe you'
                : summary.netBalance < 0
                  ? 'You owe others'
                  : 'All settled up'}
            </Text>
          </Card.Body>
        </Card>

        <Separator orientation="horizontal" />

        <Text style={styles.sectionTitle}>People</Text>
        {people.length === 0 && !loading && (
          <Text style={styles.emptyText}>No transactions yet. Tap + Add Entry to get started.</Text>
        )}
        {people.map((person) => (
          <Pressable
            key={person.personName}
            onPress={() => router.push(`/person/${encodeURIComponent(person.personName)}`)}>
            <Card variant="default" style={styles.personCard}>
              <Card.Body>
                <View style={styles.personRow}>
                  <View style={styles.personInfo}>
                    <Text style={styles.personName}>{person.personName}</Text>
                    <Text style={styles.personMeta}>
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
                              ? '#E53935'
                              : person.netBalance < 0
                                ? '#43A047'
                                : '#666',
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
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111',
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  cardAmount: {
    fontSize: 22,
    fontWeight: '700',
  },
  netCard: {
    marginBottom: 20,
  },
  netLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  netAmount: {
    fontSize: 28,
    fontWeight: '800',
  },
  netHint: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginTop: 16,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 24,
  },
  personCard: {
    marginBottom: 8,
  },
  personRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  personMeta: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
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
