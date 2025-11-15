import * as SQLite from 'expo-sqlite';

const DB_NAME = 'contacts.db';

export const openDatabase = () => {
  return SQLite.openDatabaseSync(DB_NAME);
};

export const db = openDatabase();