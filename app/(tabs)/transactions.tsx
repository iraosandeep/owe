import { useFocusEffect, useRouter } from 'expo-router';
import { Button, Card, Chip, SearchField, useThemeColor } from 'heroui-native';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTransactions } from '@/hooks/use-transactions';
import { formatCurrency, formatDate } from '@/utils/format';

export default function TransactionsScreen() {
  const accent = useThemeColor('accent');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  const { transactions, loading, reload, deleteTransaction } = useTransactions();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return transactions;

    return transactions.filter((txn) => {
      const personMatch = txn.personName.toLowerCase().includes(normalizedQuery);
      const phoneMatch = (txn.phone ?? '').toLowerCase().includes(normalizedQuery);
      return personMatch || phoneMatch;
    });
  }, [searchQuery, transactions]);

  const handleDeleteTransaction = useCallback(
    (transactionId: string, personName: string) => {
      Alert.alert('Delete transaction?', `This transaction for ${personName} will be removed.`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (deletingTransactionId) return;
            setDeletingTransactionId(transactionId);
            try {
              await deleteTransaction(transactionId);
            } catch {
              Alert.alert('Error', 'Failed to delete transaction. Please try again.');
            } finally {
              setDeletingTransactionId(null);
            }
          },
        },
      ]);
    },
    [deleteTransaction, deletingTransactionId]
  );

  const renderRightActions = useCallback(
    (transactionId: string, personName: string) => (
      <View className="my-1 justify-center">
        <Pressable
          className="h-full w-24 items-center justify-center rounded-2xl bg-danger px-3"
          onPress={() => handleDeleteTransaction(transactionId, personName)}
          disabled={deletingTransactionId !== null}>
          <Text className="text-sm font-semibold text-danger-foreground">
            {deletingTransactionId === transactionId ? 'Deleting...' : 'Delete'}
          </Text>
        </Pressable>
      </View>
    ),
    [deletingTransactionId, handleDeleteTransaction]
  );

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustContentInsets>
      <View className="p-4 pb-8 bg-background">
        <View className="flex-row items-center justify-between mb-5">
          <Text className="text-[28px] font-extrabold text-foreground">Transactions</Text>
          <Button variant="ghost" size="sm" onPress={() => router.push('/add-entry')}>
            <IconSymbol name="plus.circle" size={28} color={accent} />
          </Button>
        </View>

        <SearchField value={searchQuery} onChange={setSearchQuery} className="pb-2">
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Search by person or phone" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>

        {filteredTransactions.length === 0 && !loading && (
          <Text className="mt-10 text-center text-sm text-muted">No transactions found.</Text>
        )}

        {filteredTransactions.map((txn) => (
          <View key={txn.id} className="my-1">
            <Swipeable
              overshootRight={false}
              renderRightActions={() => renderRightActions(txn.id, txn.personName)}>
              <Card variant="default">
                <Card.Body>
                  <Pressable
                    onPress={() => router.push(`/person/${encodeURIComponent(txn.personName)}`)}>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground">
                          {txn.personName}
                        </Text>
                        <Text className="mt-0.5 text-[13px] text-muted">
                          {formatDate(txn.date)}
                        </Text>
                      </View>

                      <View className="items-end gap-1">
                        <Text
                          className={`text-[17px] font-bold ${
                            txn.type === 'given' ? 'text-success' : 'text-danger'
                          }`}>
                          {txn.type === 'given' ? '+' : '-'} {formatCurrency(txn.amount)}
                        </Text>
                        <Chip
                          variant="soft"
                          size="sm"
                          color={txn.type === 'given' ? 'success' : 'danger'}>
                          <Chip.Label>{txn.type === 'given' ? 'Given' : 'Taken'}</Chip.Label>
                        </Chip>
                      </View>
                    </View>

                    {txn.interest !== null && txn.interest > 0 && (
                      <Text className="mt-1.5 text-xs text-muted">
                        {txn.interest}% annual interest
                      </Text>
                    )}
                  </Pressable>
                </Card.Body>
              </Card>
            </Swipeable>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
