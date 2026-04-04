import { View, ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { Card, Chip, Button, Separator, useThemeColor } from 'heroui-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTransactions } from '@/hooks/use-transactions';
import { useSummary } from '@/hooks/use-summary';
import { formatCurrency, formatDate } from '@/utils/format';

export default function TransactionsScreen() {
  const [filterPerson, setFilterPerson] = useState<string | undefined>();
  const { transactions, loading, reload } = useTransactions(filterPerson);
  const { people, reload: reloadPeople } = useSummary();
  const router = useRouter();
  const [background, foreground, muted, danger, success] = useThemeColor([
    'background',
    'foreground',
    'muted',
    'danger',
    'success',
  ]);

  useFocusEffect(
    useCallback(() => {
      reload();
      reloadPeople();
    }, [reload, reloadPeople])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: foreground }]}>Transactions</Text>
        <Button variant="primary" size="md" onPress={() => router.push('/add-entry')}>
          + Add
        </Button>
      </View>

      {people.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}>
          <Pressable onPress={() => setFilterPerson(undefined)}>
            <Chip variant={filterPerson === undefined ? 'primary' : 'secondary'} size="sm">
              <Chip.Label>All</Chip.Label>
            </Chip>
          </Pressable>
          {people.map((p) => (
            <Pressable
              key={p.personName}
              onPress={() =>
                setFilterPerson(filterPerson === p.personName ? undefined : p.personName)
              }>
              <Chip variant={filterPerson === p.personName ? 'primary' : 'secondary'} size="sm">
                <Chip.Label>{p.personName}</Chip.Label>
              </Chip>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {transactions.length === 0 && !loading && (
          <Text style={[styles.emptyText, { color: muted }]}>No transactions found.</Text>
        )}
        {transactions.map((txn, i) => (
          <View key={txn.id}>
            <Pressable onPress={() => router.push(`/person/${encodeURIComponent(txn.personName)}`)}>
              <Card variant="default" style={styles.txnCard}>
                <Card.Body>
                  <View style={styles.txnRow}>
                    <View style={styles.txnInfo}>
                      <Text style={[styles.txnPerson, { color: foreground }]}>{txn.personName}</Text>
                      <Text style={[styles.txnDate, { color: muted }]}>{formatDate(txn.date)}</Text>
                    </View>
                    <View style={styles.txnRight}>
                      <Text
                        style={[
                          styles.txnAmount,
                          {
                            color: txn.type === 'given' ? danger : success,
                          },
                        ]}>
                        {txn.type === 'given' ? '-' : '+'} {formatCurrency(txn.amount)}
                      </Text>
                      <Chip
                        variant="soft"
                        size="sm"
                        color={txn.type === 'given' ? 'danger' : 'success'}>
                        <Chip.Label>{txn.type === 'given' ? 'Given' : 'Taken'}</Chip.Label>
                      </Chip>
                    </View>
                  </View>
                  {txn.interest !== null && txn.interest > 0 && (
                    <Text style={[styles.interestNote, { color: muted }]}>
                      {txn.interest}% annual interest
                    </Text>
                  )}
                </Card.Body>
              </Card>
            </Pressable>
            {i < transactions.length - 1 && <Separator orientation="horizontal" />}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  filterRow: {
    paddingHorizontal: 16,
    gap: 8,
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
  txnCard: {
    marginVertical: 4,
  },
  txnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txnInfo: {
    flex: 1,
  },
  txnPerson: {
    fontSize: 16,
    fontWeight: '600',
  },
  txnDate: {
    fontSize: 13,
    marginTop: 2,
  },
  txnRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  txnAmount: {
    fontSize: 17,
    fontWeight: '700',
  },
  interestNote: {
    fontSize: 12,
    marginTop: 6,
  },
});
