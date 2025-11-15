// src/database.ts
import { SQLiteDatabase } from "expo-sqlite";
import type { Habit } from "@/types/habit";

export const initTable = async (db: SQLiteDatabase) => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      active INTEGER DEFAULT 1,
      done_today INTEGER DEFAULT 0,
      created_at INTEGER
    );
  `);
};

export const seedSampleHabits = async (db: SQLiteDatabase) => {
  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM habits`
  );

  if (result && result.count === 0) {
    console.log("Bảng trống → Đang thêm 3 thói quen mẫu...");

    const samples = [
      { title: "Uống 2 lít nước", description: "Uống đủ nước mỗi ngày để khỏe mạnh" },
      { title: "Đi bộ 15 phút", description: "Đi bộ buổi sáng hoặc tối" },
      { title: "Đọc sách 30 phút", description: "Đọc sách phát triển bản thân" },
    ];

    for (const item of samples) {
      await db.runAsync(
        `INSERT INTO habits (title, description, created_at) VALUES (?, ?, ?)`,
        [item.title, item.description, Date.now()]
      );
    }
    console.log("Seed 3 thói quen mẫu thành công!");
  } else {
    console.log("Bảng đã có dữ liệu → Bỏ qua seed.");
  }
};

// CREATE
export const createHabit = async (
  db: SQLiteDatabase,
  data: { title: string; description?: string | null }
) => {
  const now = Date.now();
  await db.runAsync(
    `INSERT INTO habits (title, description, created_at) VALUES (?, ?, ?)`,
    [data.title, data.description ?? null, now]
  );
};

// READ
export const getAllHabits = async (db: SQLiteDatabase): Promise<Habit[]> => {
  return await db.getAllAsync<Habit>(
    `SELECT * FROM habits WHERE active = 1 ORDER BY created_at DESC`
  );
};

export const getHabitById = async (db: SQLiteDatabase, id: number) => {
  return await db.getFirstAsync<Habit>(`SELECT * FROM habits WHERE id = ?`, [id]);
};

// UPDATE
export const updateHabit = async (
  db: SQLiteDatabase,
  data: { id: number; title: string; description?: string | null }
) => {
  await db.runAsync(
    `UPDATE habits SET title = ?, description = ? WHERE id = ?`,
    [data.title, data.description ?? null, data.id]
  );
};


export const toggleDoneToday = async (db: SQLiteDatabase, id: number, done: boolean) => {
  await db.runAsync(
    `UPDATE habits SET done_today = ? WHERE id = ?`,
    [done ? 1 : 0, id]
  );
};


export const resetAllDoneToday = async (db: SQLiteDatabase) => {
  await db.runAsync(`UPDATE habits SET done_today = 0`);
};

// ACTIVE
export const setActiveHabit = async (db: SQLiteDatabase, id: number, active: boolean) => {
  await db.runAsync(
    `UPDATE habits SET active = ? WHERE id = ?`,
    [active ? 1 : 0, id]
  );
};

// DELETE
export const deleteHabit = async (db: SQLiteDatabase, id: number) => {
  await db.runAsync(`DELETE FROM habits WHERE id = ?`, [id]);
};