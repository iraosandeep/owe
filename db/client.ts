import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';
import * as schema from './schema';

export const expoSQLite = SQLite.openDatabaseSync('owe.db');
export const db = drizzle(expoSQLite, { schema });
