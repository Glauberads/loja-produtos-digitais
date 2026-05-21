export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string
          user_id: string
          email: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          organization_id: string | null
          slug: string
          name: string
          category_id: string | null
          category: string
          short_description: string | null
          long_description: string | null
          price: number
          rating: number
          sales_count: number
          badge: string | null
          features: Json
          tech_stack: Json
          gradient: string | null
          icon_name: string | null
          image_url: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          slug: string
          name: string
          category_id?: string | null
          category: string
          short_description?: string | null
          long_description?: string | null
          price?: number
          rating?: number
          sales_count?: number
          badge?: string | null
          features?: Json
          tech_stack?: Json
          gradient?: string | null
          icon_name?: string | null
          image_url?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          // ... update types
        }
      }
      // Add other tables as needed based on the new schema migrations
    }
  }
}
