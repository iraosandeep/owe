import { View, ScrollView, Text, StyleSheet, Pressable } from 'react-native';
import { Card, Chip, Separator } from 'heroui-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTransactions } from '@/hooks/use-transactions';
import { formatCurrency, formatDate, getInitials } from '@/utils/format';
import { getAmountWithInterest } from '@/utils/interest';

export default function PersonDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const decodedName = decodeURIComponent(name ?? '');
  const { transactions, loading, reload } = useTransactions(decodedName);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const totalGiven = transactions
    .filter((t) => t.type === 'given')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalTaken = transactions
    .filter((t) => t.type === 'taken')
    .reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalGiven - totalTaken;
  const phone = transactions.find((t) => t.phone)?.phone ?? null;

  // Calculate total with interest
  const totalWithInterest = transactions.reduce((sum, t) => {
    const effectiveAmount = getAmountWithInterest(t.amount, t.interest, t.date);
    return t.type === 'given' ? sum + effectiveAmount : sum - effectiveAmount;
  }, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Person Detail</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Person Info */}
        <View style={styles.personHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(decodedName)}</Text>
          </View>
          <Text style={styles.personName}>{decodedName}</Text>
          {phone && <Text style={styles.personPhone}>{phone}</Text>}
        </View>

        {/* Summary Cards */}
        <View style={styles.cardsRow}>
          <Card variant="default" style={styles.summaryCard}>
            <Card.Body>
              <Text style={styles.cardLabel}>Given</Text>
              <Text style={[styles.cardAmount, { color: '#E53935' }]}>
                {formatCurrency(totalGiven)}
              </Text>
            </Card.Body>
          </Card>
          <Card variant="default" style={styles.summaryCard}>
            <Card.Body>
              <Text style={styles.cardLabel}>Taken</Text>
              <Text style={[styles.cardAmount, { color: '#43A047' }]}>
                {formatCurrency(totalTaken)}
              </Text>
            </Card.Body>
          </Card>
        </View>

        <Card variant="secondary" style={styles.netCard}>
          <Card.Body>
            <Text style={styles.netLabel}>Net Balance</Text>
            <Text style={[styles.netAmount, { color: netBalance >= 0 ? '#E53935' : '#43A047' }]}>
              {formatCurrency(netBalance)}
            </Text>
            <Text style={styles.netHint}>
              {netBalance > 0 ? 'They owe you' : netBalance < 0 ? 'You owe them' : 'All settled'}
            </Text>
          </Card.Body>
        </Card>

        {totalWithInterest !== netBalance && (
          <Card variant="default" style={styles.interestCard}>
            <Card.Body>
              <Text style={styles.cardLabel}>With Interest</Text>
              <Text
                style={[
                  styles.cardAmount,
                  {
                    color: totalWithInterest >= 0 ? '#E53935' : '#43A047',
                  },
                ]}>
                {formatCurrency(totalWithInterest)}
              </Text>
              <Text style={styles.interestHint}>Including accrued interest to date</Text>
            </Card.Body>
          </Card>
        )}

        <Separator orientation="horizontal" />

        {/* Transactions */}
        <Text style={styles.sectionTitle}>Transactions</Text>
        {transactions.length === 0 && !loading && (
          <Text style={styles.emptyText}>No transactions found.</Text>
        )}
        {transactions.map((txn) => (
          <Card key={txn.id} variant="default" style={styles.txnCard}>
            <Card.Body>
              <View style={styles.txnRow}>
                <View style={styles.txnInfo}>
                  <Chip
                    variant="soft"
                    size="sm"
                    color={txn.type === 'given' ? 'danger' : 'success'}>
                    <Chip.Label>{txn.type === 'given' ? 'Given' : 'Taken'}</Chip.Label>
                  </Chip>
                  <Text style={styles.txnDate}>{formatDate(txn.date)}</Text>
                </View>
                <Text
                  style={[
                    styles.txnAmount,
                    {
                      color: txn.type === 'given' ? '#E53935' : '#43A047',
                    },
                  ]}>
                  {formatCurrency(txn.amount)}
                </Text>
              </View>
              {txn.interest !== null && txn.interest > 0 && (
                <View style={styles.interestRow}>
                  <Text style={styles.interestNote}>{txn.interest}% interest</Text>
                  <Text style={styles.interestNote}>
                    Current:{' '}
                    {formatCurrency(getAmountWithInterest(txn.amount, txn.interest, txn.date))}
                  </Text>
                </View>
              )}
            </Card.Body>
          </Card>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backText: {
    fontSize: 16,
    color: '#0066FF',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  personHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0066FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  personName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
  },
  personPhone: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
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
    marginBottom: 16,
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
  interestCard: {
    marginBottom: 16,
  },
  interestHint: {
    fontSize: 12,
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
  txnCard: {
    marginBottom: 8,
  },
  txnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txnInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  txnDate: {
    fontSize: 13,
    color: '#999',
  },
  txnAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  interestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  interestNote: {
    fontSize: 12,
    color: '#888',
  },
});
