import * as Crypto from 'expo-crypto';
import AsyncStorage from 'expo-sqlite/kv-store';

import { db } from './client';
import { transactions } from './schema';

const SEED_VERSION_KEY = 'db-seed-version';
const SEED_VERSION = '2026-04-04-random-100-v1';

function makeSeedData(count = 100) {
  const names = [
    'John Smith',
    'Emily Johnson',
    'Michael Brown',
    'Jessica Davis',
    'David Wilson',
    'Sarah Miller',
    'James Taylor',
    'Olivia Anderson',
    'Robert Thomas',
    'Sophia Jackson',
    'Daniel White',
    'Ava Harris',
    'Matthew Martin',
    'Isabella Thompson',
    'Joseph Garcia',
    'Mia Martinez',
    'Charles Robinson',
    'Charlotte Clark',
    'Christopher Rodriguez',
    'Amelia Lewis',

    'Andrew Lee',
    'Harper Walker',
    'Joshua Hall',
    'Evelyn Allen',
    'Ryan Young',
    'Abigail King',
    'Nathan Hernandez',
    'Ella Wright',
    'Anthony Lopez',
    'Scarlett Hill',
    'Justin Scott',
    'Grace Green',
    'Brandon Adams',
    'Chloe Baker',
    'Samuel Nelson',
    'Victoria Carter',
    'Benjamin Mitchell',
    'Lily Perez',
    'Jacob Roberts',
    'Hannah Turner',

    'Ethan Phillips',
    'Zoe Campbell',
    'Alexander Parker',
    'Nora Evans',
    'Logan Edwards',
    'Riley Collins',
    'Noah Stewart',
    'Aria Sanchez',
    'Lucas Morris',
    'Aubrey Rogers',
    'Henry Reed',
    'Layla Cook',
    'Sebastian Morgan',
    'Penelope Bell',
    'Jack Murphy',
    'Madison Bailey',
    'Owen Rivera',
    'Luna Cooper',
    'Wyatt Richardson',
    'Ellie Cox',

    'Gabriel Howard',
    'Stella Ward',
    'Julian Torres',
    'Violet Peterson',
    'Levi Gray',
    'Aurora Ramirez',
    'Isaac James',
    'Savannah Watson',
    'Lincoln Brooks',
    'Audrey Kelly',
    'Dylan Sanders',
    'Bella Price',
    'Mateo Bennett',
    'Claire Wood',
    'Hudson Barnes',
    'Skylar Ross',
    'Hunter Henderson',
    'Lucy Coleman',
    'Connor Jenkins',
    'Paisley Perry',

    'Adrian Powell',
    'Everly Long',
    'Thomas Patterson',
    'Anna Hughes',
    'Aaron Flores',
    'Caroline Washington',
    'Christian Butler',
    'Nova Simmons',
    'Jonathan Foster',
    'Genesis Gonzales',
    'Cameron Bryant',
    'Emilia Alexander',
    'Eli Russell',
    'Kennedy Griffin',
    'Nicholas Diaz',
    'Samantha Hayes',
    'Jordan Myers',
    'Allison Ford',
  ];

  function randomPhone() {
    return Math.random() < 0.2 ? null : `+91${Math.floor(9000000000 + Math.random() * 1000000000)}`;
  }

  function randomAmount() {
    return Math.floor(Math.random() * 20000) + 500; // 500 - 20500
  }

  function randomType(): 'given' | 'taken' {
    return Math.random() > 0.5 ? 'given' : 'taken';
  }

  function randomInterest() {
    return Math.random() < 0.5 ? null : Math.floor(Math.random() * 10) + 1; // 1% - 10%
  }

  function randomDate() {
    const now = new Date();
    const past = new Date();
    past.setFullYear(now.getFullYear() - 1);

    const date = new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));

    return date.toISOString();
  }

  return Array.from({ length: count }).map(() => ({
    id: Crypto.randomUUID(),
    personName: names[Math.floor(Math.random() * names.length)],
    phone: randomPhone(),
    amount: randomAmount(),
    type: randomType(),
    interest: randomInterest(),
    date: randomDate(),
    createdAt: randomDate(),
  }));
}

export async function seedDatabase() {
  const appliedVersion = await AsyncStorage.getItem(SEED_VERSION_KEY);
  if (appliedVersion === SEED_VERSION) return;

  await db.delete(transactions);
  await db.insert(transactions).values(makeSeedData());
  await AsyncStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
}
