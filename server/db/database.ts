import Database from 'better-sqlite3';
import path from 'path';

// Connect to SQLite DB (creates file if not exists)
// Use DATABASE_PATH env var for cloud deployments, or default to project root
const dbPath = process.env.DATABASE_PATH || path.resolve(process.cwd(), 'jobhub.db');
const db = new Database(dbPath, { verbose: process.env.NODE_ENV === 'production' ? undefined : console.log });

// Initialize Tables
export const initializeDB = () => {
  // Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      google_id TEXT UNIQUE,
      email TEXT UNIQUE,
      name TEXT,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Companies Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sector TEXT,
      location TEXT,
      status TEXT DEFAULT 'Bookmarked',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ES Repository Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS es_repository (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER,
      title TEXT NOT NULL,
      category TEXT,
      words INTEGER,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies (id)
    );
  `);
  
  // Safe migration: Add company_id if the table was created before this version
  try {
    db.exec('ALTER TABLE es_repository ADD COLUMN company_id INTEGER REFERENCES companies(id)');
    console.log('Migrated es_repository: added company_id');
  } catch (err) {
    // Column might already exist, ignore
  }

  // Tasks Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      date TEXT,
      company TEXT,
      completed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Database tables initialized.');
  
  // Optionally seed data if tables are empty
  const companyCount = db.prepare('SELECT COUNT(*) as count FROM companies').get() as { count: number };
  if (companyCount.count === 0) {
    console.log('Seeding initial data...');
    db.prepare(`INSERT INTO companies (name, sector, location, status) VALUES 
      ('Google Japan', 'IT / Web', '東京', '最終面接'),
      ('Sony Group', 'メーカー', '東京', 'ES提出済')`).run();
      
    db.prepare(`INSERT INTO es_repository (title, category, words, content) VALUES 
      ('自己PR', '共通', 400, '私は目標達成に向けて周囲を巻き込みながら粘り強く取り組むことができます...')`).run();
      
    db.prepare(`INSERT INTO tasks (type, title, date, company, completed) VALUES 
      ('面接', 'Google Japan 1次面接', '明日, 14:00', 'Google Japan', 0)`).run();
  }
};

export default db;
