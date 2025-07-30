import { config } from 'dotenv'
import { Pool } from "pg"

// 加載環境變量
config({ path: '.env.local' })

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

// Helper function to execute SQL queries
async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log("Executed query", { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error("Error executing query", { text, error })
    throw error
  }
}

export async function initDatabase() {
  // Temporarily disable SSL certificate verification for this operation
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

  try {
    // Create users table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    // Add role column to existing users table if it doesn't exist
    await query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
          ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user'));
        END IF;
      END $$;
    `)

    // Create papers table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS papers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        authors TEXT[] NOT NULL,
        journal VARCHAR(255),
        publish_date DATE,
        summary TEXT,
        full_text TEXT,
        audio_url TEXT,
        duration_seconds INTEGER DEFAULT 0,
        category VARCHAR(50) NOT NULL,
        tags TEXT[],
        views INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        trending BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    // Create user_favorites table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS user_favorites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, paper_id)
      )
    `)

    // Create comments table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
        parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        likes INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    // Create comment_likes table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS comment_likes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, comment_id)
      )
    `)

    // Create paper_likes table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS paper_likes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, paper_id)
      )
    `)

    // Create play_history table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS play_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
        position_seconds INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, paper_id)
      )
    `)

    // Create newsletter_subscriptions table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        unsubscribed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    // Create function to increment paper views
    await query(`
      CREATE OR REPLACE FUNCTION increment_paper_views(paper_id UUID)
      RETURNS VOID AS $$
      BEGIN
        UPDATE papers
        SET views = views + 1
        WHERE id = paper_id;
      END;
      $$ LANGUAGE plpgsql;
    `)

    // Create function to toggle paper like status
    await query(`
      CREATE OR REPLACE FUNCTION toggle_paper_like(p_paper_id UUID, p_user_id UUID)
      RETURNS BOOLEAN AS $$
      DECLARE
        is_liked BOOLEAN;
      BEGIN
        -- Check if the user already liked the paper
        SELECT EXISTS (
          SELECT 1 FROM paper_likes WHERE paper_id = p_paper_id AND user_id = p_user_id
        ) INTO is_liked;

        IF is_liked THEN
          -- Unlike the paper
          DELETE FROM paper_likes WHERE paper_id = p_paper_id AND user_id = p_user_id;
          UPDATE papers SET likes = likes - 1 WHERE id = p_paper_id AND likes > 0;
          RETURN FALSE;
        ELSE
          -- Like the paper
          INSERT INTO paper_likes (paper_id, user_id) VALUES (p_paper_id, p_user_id);
          UPDATE papers SET likes = likes + 1 WHERE id = p_paper_id;
          RETURN TRUE;
        END IF;
      END;
      $$ LANGUAGE plpgsql;
    `)

    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Error initializing database:", error)
    throw error
  } finally {
    // Re-enable SSL certificate verification
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1"
    // Close the pool
    await pool.end()
  }
}

// Execute the function if this script is run directly
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log("Database initialization completed")
      process.exit(0)
    })
    .catch((error) => {
      console.error("Database initialization failed:", error)
      process.exit(1)
    })
}
