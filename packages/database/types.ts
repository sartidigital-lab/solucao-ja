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
      profiles: {
        Row: {
          id: string
          role: 'client' | 'professional' | 'admin'
          full_name: string
          phone: string | null
          avatar_url: string | null
          city: string | null
          bairro: string | null
          created_at: string
          updated_at: string
        }
      }
    }
  }
}
