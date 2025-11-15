// db/init.ts
import { db } from './database';

export const initDatabase = async () => {
  try {
    // Tạo bảng contacts
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        favorite INTEGER DEFAULT 0,
        created_at INTEGER
      );
    `);

    // Kiểm tra dữ liệu
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM contacts'
    );

    if (result && result.count === 0) {
      const now = Date.now();

      await db.runAsync(
        'INSERT INTO contacts (name, phone, email, favorite, created_at) VALUES (?, ?, ?, ?, ?)',
        ['Nguyễn Văn A', '0901234567', 'vana@email.com', 0, now]
      );

      await db.runAsync(
        'INSERT INTO contacts (name, phone, email, favorite, created_at) VALUES (?, ?, ?, ?, ?)',
        ['Trần Thị B', '0912345678', 'thib@email.com', 1, now]
      );

      await db.runAsync(
        'INSERT INTO contacts (name, phone, email, favorite, created_at) VALUES (?, ?, ?, ?, ?)',
        ['Lê Văn C', '0923456789', 'vanc@email.com', 0, now]
      );

      console.log('✅ Seed data completed');
    }
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
};
