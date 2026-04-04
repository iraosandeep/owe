import { useCallback, useEffect, useState } from "react";
import * as Crypto from "expo-crypto";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db/client";
import { transactions } from "@/db/schema";
import type { Transaction, TransactionType } from "@/types";

type NewTransaction = {
  personName: string;
  phone: string | null;
  amount: number;
  type: TransactionType;
  interest: number | null;
  date: string;
};

export function useTransactions(personFilter?: string) {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      let query = db.select().from(transactions).orderBy(desc(transactions.date));
      let results;
      if (personFilter) {
        results = await db
          .select()
          .from(transactions)
          .where(eq(transactions.personName, personFilter))
          .orderBy(desc(transactions.date));
      } else {
        results = await query;
      }
      setData(
        results.map((r) => ({
          id: r.id,
          personName: r.personName,
          phone: r.phone,
          amount: r.amount,
          type: r.type as TransactionType,
          interest: r.interest,
          date: r.date,
          createdAt: r.createdAt,
        }))
      );
    } finally {
      setLoading(false);
    }
  }, [personFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const addTransaction = useCallback(
    async (entry: NewTransaction) => {
      const now = new Date().toISOString();
      await db.insert(transactions).values({
        id: Crypto.randomUUID(),
        personName: entry.personName,
        phone: entry.phone,
        amount: entry.amount,
        type: entry.type,
        interest: entry.interest,
        date: entry.date,
        createdAt: now,
      });
      await load();
    },
    [load]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      await db.delete(transactions).where(eq(transactions.id, id));
      await load();
    },
    [load]
  );

  return { transactions: data, loading, reload: load, addTransaction, deleteTransaction };
}
