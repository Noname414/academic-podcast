import { NextResponse } from "next/server"
import { Pool } from "pg"

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

async function initDatabase() {
  try {
    // Create users table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
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

    // Create notifications table
    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL, -- e.g., 'new_reply', 'comment_like'
        related_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
        related_paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
        triggering_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        CONSTRAINT check_related_ids CHECK (
          (type = 'new_reply' AND related_comment_id IS NOT NULL AND related_paper_id IS NOT NULL AND triggering_user_id IS NOT NULL) OR
          (type = 'comment_like' AND related_comment_id IS NOT NULL AND related_paper_id IS NOT NULL AND triggering_user_id IS NOT NULL)
        )
      )
    `)

    // Create function and trigger to handle user deletion
    await query(`
      CREATE OR REPLACE FUNCTION public.handle_user_delete()
      RETURNS TRIGGER AS $$
      BEGIN
        DELETE FROM public.users WHERE id = old.id;
        RETURN old;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `)

    await query(`
      DROP TRIGGER IF EXISTS on_user_deleted ON auth.users;
      CREATE TRIGGER on_user_deleted
        AFTER DELETE ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_user_delete();
    `)

    // Create function and trigger to handle new user creation
    await query(`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO public.users (id, email, name, avatar_url)
        VALUES (
          new.id,
          new.email,
          new.raw_user_meta_data->>'full_name',
          new.raw_user_meta_data->>'avatar_url'
        );
        RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `)

    await query(`
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_new_user();
    `)

    console.log("Database initialized successfully")
    return true
  } catch (error) {
    console.error("Error initializing database:", error)
    throw error
  }
}

export async function POST() {
  // Temporarily disable SSL certificate verification for this operation
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

  try {
    await initDatabase()
    return NextResponse.json({ success: true, message: "Database initialized successfully" })
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json(
      { success: false, message: "Failed to initialize database", error: String(error) },
      { status: 500 },
    )
  } finally {
    // Re-enable SSL certificate verification
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1"
    // Close the pool
    await pool.end()
  }
}
