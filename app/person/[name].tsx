import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, Chip, Separator } from 'heroui-native';
import { eq } from 'drizzle-orm';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { db } from '@/db/client';
import { transactions as transactionsTable } from '@/db/schema';
import { useTransactions } from '@/hooks/use-transactions';
import { getAmountWithInterest } from '@/utils/interest';
import { formatCurrency, formatDate, getInitials } from '@/utils/format';

export default function PersonDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const decodedName = decodeURIComponent(name ?? '');
  const { transactions, loading, reload } = useTransactions(decodedName);
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

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

  const totalWithInterest = transactions.reduce((sum, t) => {
    const effectiveAmount = getAmountWithInterest(t.amount, t.interest, t.date);
    return t.type === 'given' ? sum + effectiveAmount : sum - effectiveAmount;
  }, 0);

  const handleDeletePerson = useCallback(() => {
    if (!decodedName) return;

    Alert.alert(
      'Delete this person?',
      `This will delete "${decodedName}" and all related transactions.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Confirm delete', 'This action cannot be undone.', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete person',
                style: 'destructive',
                onPress: async () => {
                  if (isDeleting) return;
                  setIsDeleting(true);

                  try {
                    await db
                      .delete(transactionsTable)
                      .where(eq(transactionsTable.personName, decodedName));
                    Alert.alert('Deleted', `"${decodedName}" was removed.`, [
                      { text: 'OK', onPress: () => router.back() },
                    ]);
                  } catch {
                    Alert.alert('Error', 'Failed to delete person data. Please try again.');
                  } finally {
                    setIsDeleting(false);
                  }
                },
              },
            ]);
          },
        },
      ]
    );
  }, [decodedName, isDeleting, router]);

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustContentInsets>
      <View className="bg-background p-4 pb-8">
        <View className="mb-5 flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <Text className="text-base font-medium text-accent">Back</Text>
          </Pressable>
          <Text className="text-lg font-bold text-foreground">Person info</Text>
          <Button
            variant="danger-soft"
            size="sm"
            onPress={handleDeletePerson}
            isDisabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </View>

        <View className="mb-5 items-center">
          <View className="mb-2 h-16 w-16 items-center justify-center rounded-full bg-accent">
            <Text className="text-2xl font-bold text-accent-foreground">
              {getInitials(decodedName)}
            </Text>
          </View>
          <Text className="text-2xl font-extrabold text-foreground">{decodedName}</Text>
          {phone ? <Text className="mt-0.5 text-sm text-muted">{phone}</Text> : null}
        </View>

        <View className="mb-3 flex-row gap-3">
          <Card variant="default" className="flex-1">
            <Card.Body>
              <Text className="mb-1 text-sm font-medium text-muted">Given</Text>
              <Text className="text-[22px] font-bold text-success">
                {formatCurrency(totalGiven)}
              </Text>
            </Card.Body>
          </Card>
          <Card variant="default" className="flex-1">
            <Card.Body>
              <Text className="mb-1 text-sm font-medium text-muted">Taken</Text>
              <Text className="text-[22px] font-bold text-danger">
                {formatCurrency(totalTaken)}
              </Text>
            </Card.Body>
          </Card>
        </View>

        <Card variant="secondary" className="mb-4">
          <Card.Body>
            <Text className="mb-1 text-sm font-medium text-muted">Net Balance</Text>
            <Text
              className={`text-[28px] font-extrabold ${
                netBalance >= 0 ? 'text-success' : 'text-danger'
              }`}>
              {formatCurrency(netBalance)}
            </Text>
            <Text className="mt-0.5 text-[13px] text-muted">
              {netBalance > 0 ? 'They owe you' : netBalance < 0 ? 'You owe them' : 'All settled'}
            </Text>
          </Card.Body>
        </Card>

        {totalWithInterest !== netBalance ? (
          <Card variant="default" className="mb-4">
            <Card.Body>
              <Text className="mb-1 text-sm font-medium text-muted">With Interest</Text>
              <Text
                className={`text-[22px] font-bold ${
                  totalWithInterest >= 0 ? 'text-success' : 'text-danger'
                }`}>
                {formatCurrency(totalWithInterest)}
              </Text>
              <Text className="mt-0.5 text-xs text-muted">Including accrued interest to date</Text>
            </Card.Body>
          </Card>
        ) : null}

        <Separator orientation="horizontal" />

        <Text className="mb-3 mt-4 text-xl font-bold text-foreground">Transactions</Text>
        {transactions.length === 0 && !loading ? (
          <Text className="mt-6 text-center text-sm text-muted">No transactions found.</Text>
        ) : null}

        {transactions.map((txn) => (
          <Card key={txn.id} variant="default" className="mb-2">
            <Card.Body>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Chip
                    variant="soft"
                    size="sm"
                    color={txn.type === 'given' ? 'success' : 'danger'}>
                    <Chip.Label>{txn.type === 'given' ? 'Given' : 'Taken'}</Chip.Label>
                  </Chip>
                  <Text className="text-[13px] text-muted">{formatDate(txn.date)}</Text>
                </View>
                <Text
                  className={`text-lg font-bold ${
                    txn.type === 'given' ? 'text-success' : 'text-danger'
                  }`}>
                  {formatCurrency(txn.amount)}
                </Text>
              </View>

              {txn.interest !== null && txn.interest > 0 ? (
                <View className="mt-1.5 flex-row items-center justify-between">
                  <Text className="text-xs text-muted">{txn.interest}% interest</Text>
                  <Text className="text-xs text-muted">
                    Current:{' '}
                    {formatCurrency(getAmountWithInterest(txn.amount, txn.interest, txn.date))}
                  </Text>
                </View>
              ) : null}
            </Card.Body>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
