import { db } from "@/db/client";
import { transactions } from "@/db/schema";
import type { DashboardSummary, PersonSummary } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function useSummary() {
  const [summary, setSummary] = useState<DashboardSummary>({
    totalGiven: 0,
    totalTaken: 0,
    netBalance: 0,
  });
  const [people, setPeople] = useState<PersonSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const rows = await db.select().from(transactions);
      let totalGiven = 0;
      let totalTaken = 0;
      const personMap = new Map<
        string,
        { phone: string | null; given: number; taken: number; count: number }
      >();

      for (const row of rows) {
        const amount = row.amount;
        if (row.type === "given") {
          totalGiven += amount;
        } else {
          totalTaken += amount;
        }

        const key = row.personName;
        const existing = personMap.get(key) ?? {
          phone: row.phone,
          given: 0,
          taken: 0,
          count: 0,
        };
        if (row.type === "given") {
          existing.given += amount;
        } else {
          existing.taken += amount;
        }
        existing.count += 1;
        if (row.phone && !existing.phone) {
          existing.phone = row.phone;
        }
        personMap.set(key, existing);
      }

      setSummary({
        totalGiven,
        totalTaken,
        netBalance: totalGiven - totalTaken,
      });

      const personList: PersonSummary[] = [];
      personMap.forEach((value, key) => {
        personList.push({
          personName: key,
          phone: value.phone,
          totalGiven: value.given,
          totalTaken: value.taken,
          netBalance: value.given - value.taken,
          transactionCount: value.count,
        });
      });
      personList.sort(
        (a, b) => Math.abs(b.netBalance) - Math.abs(a.netBalance),
      );
      setPeople(personList);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { summary, people, loading, reload: load };
}
