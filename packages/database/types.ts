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
        Insert: {
          id: string
          role: 'client' | 'professional' | 'admin'
          full_name: string
          phone?: string | null
          avatar_url?: string | null
          city?: string | null
          bairro?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'client' | 'professional' | 'admin'
          full_name?: string
          phone?: string | null
          avatar_url?: string | null
          city?: string | null
          bairro?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      professionals: {
        Row: {
          id: string
          bio: string | null
          location: string | null
          service_area_radius_km: number
          attendance_type: 'home' | 'salon' | 'both'
          avg_service_time_minutes: number
          is_verified: boolean
          is_available_now: boolean
          cpf_cnpj: string | null
          verification_status: 'pending' | 'approved' | 'rejected'
          deposit_policy: 'no_deposit' | 'fixed_amount' | 'percentage'
          deposit_fixed_amount: number
          subscription_plan: string
          avg_rating: number
          total_reviews: number
          slug: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          bio?: string | null
          location?: string | null
          service_area_radius_km?: number
          attendance_type: 'home' | 'salon' | 'both'
          avg_service_time_minutes?: number
          is_verified?: boolean
          is_available_now?: boolean
          cpf_cnpj?: string | null
          verification_status?: 'pending' | 'approved' | 'rejected'
          deposit_policy?: 'no_deposit' | 'fixed_amount' | 'percentage'
          deposit_fixed_amount?: number
          subscription_plan?: string
          avg_rating?: number
          total_reviews?: number
          slug?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bio?: string | null
          location?: string | null
          service_area_radius_km?: number
          attendance_type?: 'home' | 'salon' | 'both'
          avg_service_time_minutes?: number
          is_verified?: boolean
          is_available_now?: boolean
          cpf_cnpj?: string | null
          verification_status?: 'pending' | 'approved' | 'rejected'
          deposit_policy?: 'no_deposit' | 'fixed_amount' | 'percentage'
          deposit_fixed_amount?: number
          subscription_plan?: string
          avg_rating?: number
          total_reviews?: number
          slug?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          created_at?: string
        }
      }
      services: {
        Row: {
          id: string
          professional_id: string
          category_id: string
          name: string
          description: string | null
          price: number
          duration_minutes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          professional_id: string
          category_id: string
          name: string
          description?: string | null
          price: number
          duration_minutes: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          professional_id?: string
          category_id?: string
          name?: string
          description?: string | null
          price?: number
          duration_minutes?: number
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          client_id: string
          professional_id: string
          service_id: string
          status: 'pending_confirmation' | 'awaiting_deposit' | 'confirmed' | 'completed' | 'cancelled'
          scheduled_at: string
          duration_minutes: number
          price: number
          deposit_amount: number
          deposit_status: 'pending' | 'paid' | 'refunded' | 'none'
          address: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          professional_id: string
          service_id: string
          status?: 'pending_confirmation' | 'awaiting_deposit' | 'confirmed' | 'completed' | 'cancelled'
          scheduled_at: string
          duration_minutes: number
          price: number
          deposit_amount?: number
          deposit_status?: 'pending' | 'paid' | 'refunded' | 'none'
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          professional_id?: string
          service_id?: string
          status?: 'pending_confirmation' | 'awaiting_deposit' | 'confirmed' | 'completed' | 'cancelled'
          scheduled_at?: string
          duration_minutes?: number
          price?: number
          deposit_amount?: number
          deposit_status?: 'pending' | 'paid' | 'refunded' | 'none'
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          booking_id: string
          client_id: string
          professional_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          client_id: string
          professional_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          client_id?: string
          professional_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      portfolio_images: {
        Row: {
          id: string
          professional_id: string
          image_url: string
          title: string | null
          created_at: string
        }
        Insert: {
          id?: string
          professional_id: string
          image_url: string
          title?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          professional_id?: string
          image_url?: string
          title?: string | null
          created_at?: string
        }
      }
      favorites: {
        Row: {
          client_id: string
          professional_id: string
          created_at: string
        }
        Insert: {
          client_id: string
          professional_id: string
          created_at?: string
        }
        Update: {
          client_id?: string
          professional_id?: string
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          amount: number
          status: 'pending' | 'approved' | 'rejected' | 'refunded'
          payment_method: string
          mercado_pago_payment_id: string | null
          mercado_pago_preference_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          amount: number
          status: 'pending' | 'approved' | 'rejected' | 'refunded'
          payment_method: string
          mercado_pago_payment_id?: string | null
          mercado_pago_preference_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          amount?: number
          status?: 'pending' | 'approved' | 'rejected' | 'refunded'
          payment_method?: string
          mercado_pago_payment_id?: string | null
          mercado_pago_preference_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
