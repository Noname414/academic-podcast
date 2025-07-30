export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          role: 'admin' | 'user'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          avatar_url?: string | null
          role?: 'admin' | 'user'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          role?: 'admin' | 'user'
          created_at?: string
          updated_at?: string
        }
      }
      papers: {
        Row: {
          id: string
          title: string
          authors: string[]
          journal: string | null
          publish_date: string | null
          summary: string | null
          full_text: string | null
          audio_url: string | null
          duration_seconds: number
          category: string
          tags: string[]
          views: number
          likes: number
          trending: boolean
          arxiv_url: string | null
          pdf_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          authors: string[]
          journal?: string | null
          publish_date?: string | null
          summary?: string | null
          full_text?: string | null
          audio_url?: string | null
          duration_seconds?: number
          category: string
          tags?: string[]
          views?: number
          likes?: number
          trending?: boolean
          arxiv_url?: string | null
          pdf_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          authors?: string[]
          journal?: string | null
          publish_date?: string | null
          summary?: string | null
          full_text?: string | null
          audio_url?: string | null
          duration_seconds?: number
          category?: string
          tags?: string[]
          views?: number
          likes?: number
          trending?: boolean
          arxiv_url?: string | null
          pdf_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_favorites: {
        Row: {
          id: string
          user_id: string
          paper_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          paper_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          paper_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          user_id: string
          paper_id: string
          parent_id: string | null
          content: string
          likes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          paper_id: string
          parent_id?: string | null
          content: string
          likes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          paper_id?: string
          parent_id?: string | null
          content?: string
          likes?: number
          created_at?: string
          updated_at?: string
        }
      }
      comment_likes: {
        Row: {
          id: string
          user_id: string
          comment_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          comment_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          comment_id?: string
          created_at?: string
        }
      }
      paper_likes: {
        Row: {
          id: string
          user_id: string
          paper_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          paper_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          paper_id?: string
          created_at?: string
        }
      }
      play_history: {
        Row: {
          id: string
          user_id: string
          paper_id: string
          position_seconds: number
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          paper_id: string
          position_seconds?: number
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          paper_id?: string
          position_seconds?: number
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          related_comment_id: string | null
          related_paper_id: string | null
          triggering_user_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          related_comment_id?: string | null
          related_paper_id?: string | null
          triggering_user_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          related_comment_id?: string | null
          related_paper_id?: string | null
          triggering_user_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_comment_id_fkey"
            columns: ["related_comment_id"]
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_paper_id_fkey"
            columns: ["related_paper_id"]
            referencedRelation: "papers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_triggering_user_id_fkey"
            columns: ["triggering_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      pending_uploads: {
        Row: {
          id: string
          user_id: string
          original_filename: string
          file_url: string
          file_size: number
          status: 'pending' | 'processing' | 'completed' | 'failed'
          error_message: string | null
          extracted_title: string | null
          extracted_authors: string[] | null
          extracted_abstract: string | null
          priority: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          original_filename: string
          file_url: string
          file_size: number
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          extracted_title?: string | null
          extracted_authors?: string[] | null
          extracted_abstract?: string | null
          priority?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          original_filename?: string
          file_url?: string
          file_size?: number
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          extracted_title?: string | null
          extracted_authors?: string[] | null
          extracted_abstract?: string | null
          priority?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
  }
}
