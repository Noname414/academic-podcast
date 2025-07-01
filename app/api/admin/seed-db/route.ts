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

async function seedDatabase() {
  try {
    // Insert sample users
    await query(`
      INSERT INTO users (email, name, avatar_url)
      VALUES 
        ('user1@example.com', '張三', '/placeholder-avatar.jpg'),
        ('user2@example.com', '李四', '/placeholder-avatar.jpg'),
        ('user3@example.com', '王五', '/placeholder-avatar.jpg')
      ON CONFLICT (email) DO NOTHING
    `)

    // Insert sample papers
    await query(`
      INSERT INTO papers (
        title, 
        authors, 
        journal, 
        publish_date, 
        summary, 
        full_text, 
        audio_url, 
        duration_seconds, 
        category, 
        tags, 
        views, 
        likes, 
        trending
      )
      VALUES 
        (
          '大型語言模型在醫療診斷中的應用與挑戰', 
          ARRAY['李明', '王華', '張三'], 
          'Nature AI', 
          '2025-05-15', 
          '本研究探討了大型語言模型（LLMs）在醫療診斷領域的應用潛力與面臨的挑戰。研究表明，經過特定醫療數據微調的LLMs在某些診斷任務上已接近專科醫生水平，但在複雜病例和稀有疾病識別方面仍存在顯著差距。', 
          '本研究探討了大型語言模型（LLMs）在醫療診斷領域的應用潛力與面臨的挑戰。隨著人工智能技術的快速發展，大型語言模型在各個領域都展現出了驚人的能力。醫療診斷作為一個高度專業化和複雜的領域，對AI技術的應用提出了更高的要求。', 
          '/sample-podcast.mp3', 
          1080, 
          'medical', 
          ARRAY['醫療AI', '大型語言模型', '診斷', '醫學應用', '可解釋AI'], 
          2456, 
          189, 
          TRUE
        ),
        (
          '多模態學習在自然語言處理中的新進展', 
          ARRAY['陳明', '林華', '黃偉'], 
          'ACL Conference', 
          '2025-04-10', 
          '本研究提出了一種新的多模態學習框架，能夠同時處理文本、圖像和音頻數據，並在多個基準測試中取得了最先進的結果。', 
          '多模態學習是指AI系統能夠同時處理和理解多種不同類型的數據，如文本、圖像、音頻等。本研究提出了一種新的多模態學習框架，能夠更有效地融合不同模態的信息，並在多個基準測試中取得了最先進的結果。', 
          '/sample-podcast.mp3', 
          1320, 
          'nlp', 
          ARRAY['多模態學習', '自然語言處理', '深度學習', '表示學習'], 
          1856, 
          142, 
          TRUE
        ),
        (
          '自監督學習在電腦視覺中的應用', 
          ARRAY['張偉', '劉明', '趙華'], 
          'CVPR', 
          '2025-03-20', 
          '本研究探討了自監督學習在電腦視覺任務中的應用，提出了一種新的預訓練方法，能夠在無標籤數據上學習更好的視覺表示。', 
          '自監督學習是一種無需人工標註數據就能學習有用表示的方法。本研究探討了自監督學習在電腦視覺任務中的應用，提出了一種新的預訓練方法，能夠在無標籤數據上學習更好的視覺表示，並在多個下游任務中展現出優異的性能。', 
          '/sample-podcast.mp3', 
          960, 
          'cv', 
          ARRAY['自監督學習', '電腦視覺', '表示學習', '遷移學習'], 
          1542, 
          98, 
          FALSE
        ),
        (
          '強化學習在機器人控制中的最新進展', 
          ARRAY['李強', '王剛', '張明'], 
          'Robotics and Automation Letters', 
          '2025-02-15', 
          '本研究提出了一種新的強化學習算法，能夠讓機器人在複雜環境中學習更高效的控制策略，並展示了在多個實際任務中的應用。', 
          '強化學習是一種通過與環境互動來學習最優策略的方法。本研究提出了一種新的強化學習算法，能夠讓機器人在複雜環境中學習更高效的控制策略，並展示了在多個實際任務中的應用，如物體抓取、導航和人機協作。', 
          '/sample-podcast.mp3', 
          1140, 
          'rl', 
          ARRAY['強化學習', '機器人學', '控制理論', '人工智能'], 
          1235, 
          76, 
          FALSE
        ),
        (
          '圖神經網絡在分子設計中的應用', 
          ARRAY['陳剛', '林強', '黃明'], 
          'Journal of Chemical Information and Modeling', 
          '2025-01-10', 
          '本研究探討了圖神經網絡在藥物分子設計中的應用，提出了一種新的分子生成模型，能夠設計具有特定藥理學特性的新分子。', 
          '圖神經網絡是一種能夠處理圖結構數據的深度學習模型。本研究探討了圖神經網絡在藥物分子設計中的應用，提出了一種新的分子生成模型，能夠設計具有特定藥理學特性的新分子，並通過實驗驗證了這些分子的有效性。', 
          '/sample-podcast.mp3', 
          1020, 
          'theory', 
          ARRAY['圖神經網絡', '分子設計', '藥物發現', '生物信息學'], 
          987, 
          65, 
          FALSE
        )
      ON CONFLICT DO NOTHING
    `)

    console.log("Database seeded successfully")
    return true
  } catch (error) {
    console.error("Error seeding database:", error)
    throw error
  }
}

export async function POST() {
  try {
    await seedDatabase()
    return NextResponse.json({ success: true, message: "Database seeded successfully" })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json(
      { success: false, message: "Failed to seed database", error: String(error) },
      { status: 500 },
    )
  } finally {
    // Close the pool
    await pool.end()
  }
}
