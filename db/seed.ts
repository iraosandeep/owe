import * as Crypto from "expo-crypto";
import { db } from "./client";
import { transactions } from "./schema";

function makeSeedData() {
  return [
    {
      id: Crypto.randomUUID(),
      personName: "Rahul Sharma",
      phone: "+919876543210",
      amount: 5000,
      type: "given" as const,
      interest: null,
      date: new Date("2025-12-01").toISOString(),
      createdAt: new Date("2025-12-01").toISOString(),
    },
    {
      id: Crypto.randomUUID(),
      personName: "Rahul Sharma",
      phone: "+919876543210",
      amount: 2000,
      type: "taken" as const,
      interest: null,
      date: new Date("2026-01-15").toISOString(),
      createdAt: new Date("2026-01-15").toISOString(),
    },
    {
      id: Crypto.randomUUID(),
      personName: "Priya Patel",
      phone: "+919876543211",
      amount: 10000,
      type: "given" as const,
      interest: 5,
      date: new Date("2026-02-10").toISOString(),
      createdAt: new Date("2026-02-10").toISOString(),
    },
    {
      id: Crypto.randomUUID(),
      personName: "Amit Kumar",
      phone: "+919876543212",
      amount: 3000,
      type: "taken" as const,
      interest: null,
      date: new Date("2026-03-01").toISOString(),
      createdAt: new Date("2026-03-01").toISOString(),
    },
    {
      id: Crypto.randomUUID(),
      personName: "Amit Kumar",
      phone: "+919876543212",
      amount: 1500,
      type: "taken" as const,
      interest: 2,
      date: new Date("2026-03-15").toISOString(),
      createdAt: new Date("2026-03-15").toISOString(),
    },
    {
      id: Crypto.randomUUID(),
      personName: "Sneha Reddy",
      phone: null,
      amount: 7500,
      type: "given" as const,
      interest: null,
      date: new Date("2026-03-20").toISOString(),
      createdAt: new Date("2026-03-20").toISOString(),
    },
  ];
}

export async function seedDatabase() {
  const existing = await db.select().from(transactions);
  if (existing.length > 0) return;
  await db.insert(transactions).values(makeSeedData());
}
