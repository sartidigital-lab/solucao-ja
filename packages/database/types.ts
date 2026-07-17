export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          address: string | null
          client_id: string
          created_at: string
          deposit_amount: number
          deposit_status: string
          duration_minutes: number
          id: string
          is_contact_unlocked: boolean
          notes: string | null
          price: number
          professional_id: string
          scheduled_at: string
          service_id: string
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          client_id: string
          created_at?: string
          deposit_amount?: number
          deposit_status?: string
          duration_minutes: number
          id?: string
          is_contact_unlocked?: boolean
          notes?: string | null
          price: number
          professional_id: string
          scheduled_at: string
          service_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          client_id?: string
          created_at?: string
          deposit_amount?: number
          deposit_status?: string
          duration_minutes?: number
          id?: string
          is_contact_unlocked?: boolean
          notes?: string | null
          price?: number
          professional_id?: string
          scheduled_at?: string
          service_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      coins_transactions: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string
          description: string
          id: string
          professional_id: string
          transaction_type: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string
          description: string
          id?: string
          professional_id: string
          transaction_type: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string
          description?: string
          id?: string
          professional_id?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "coins_transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coins_transactions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          room_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          room_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          room_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          booking_id: string | null
          client_id: string
          created_at: string
          id: string
          professional_id: string
        }
        Insert: {
          booking_id?: string | null
          client_id: string
          created_at?: string
          id?: string
          professional_id: string
        }
        Update: {
          booking_id?: string | null
          client_id?: string
          created_at?: string
          id?: string
          professional_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          client_id: string
          created_at: string
          professional_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          professional_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          professional_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string
          id: string
          mercado_pago_payment_id: string | null
          mercado_pago_preference_id: string | null
          payment_method: string
          status: string
          updated_at: string
          professional_id: string | null
          coins_package_id: string | null
          coins_amount: number | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string
          id?: string
          mercado_pago_payment_id?: string | null
          mercado_pago_preference_id?: string | null
          payment_method: string
          status: string
          updated_at?: string
          professional_id?: string | null
          coins_package_id?: string | null
          coins_amount?: number | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string
          id?: string
          mercado_pago_payment_id?: string | null
          mercado_pago_preference_id?: string | null
          payment_method?: string
          status?: string
          updated_at?: string
          professional_id?: string | null
          coins_package_id?: string | null
          coins_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      portfolio_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          professional_id: string
          title: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          professional_id: string
          title?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          professional_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_images_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_schedules: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          professional_id: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          professional_id: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          professional_id?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_schedules_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      professionals: {
        Row: {
          attendance_type: string
          avg_rating: number
          avg_service_time_minutes: number
          bio: string | null
          coins_balance: number
          cpf_cnpj: string | null
          created_at: string
          deposit_fixed_amount: number
          deposit_policy: string
          id: string
          is_available_now: boolean
          is_verified: boolean
          location: unknown
          service_area_radius_km: number
          slug: string | null
          subscription_plan: string
          total_reviews: number
          updated_at: string
          verification_status: string
        }
        Insert: {
          attendance_type: string
          avg_rating?: number
          avg_service_time_minutes?: number
          bio?: string | null
          coins_balance?: number
          cpf_cnpj?: string | null
          created_at?: string
          deposit_fixed_amount?: number
          deposit_policy?: string
          id: string
          is_available_now?: boolean
          is_verified?: boolean
          location?: unknown
          service_area_radius_km?: number
          slug?: string | null
          subscription_plan?: string
          total_reviews?: number
          updated_at?: string
          verification_status?: string
        }
        Update: {
          attendance_type?: string
          avg_rating?: number
          avg_service_time_minutes?: number
          bio?: string | null
          coins_balance?: number
          cpf_cnpj?: string | null
          created_at?: string
          deposit_fixed_amount?: number
          deposit_policy?: string
          id?: string
          is_available_now?: boolean
          is_verified?: boolean
          location?: unknown
          service_area_radius_km?: number
          slug?: string | null
          subscription_plan?: string
          total_reviews?: number
          updated_at?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "professionals_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bairro: string | null
          city: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bairro?: string | null
          city?: string | null
          created_at?: string
          full_name: string
          id: string
          phone?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bairro?: string | null
          city?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          client_id: string
          comment: string | null
          created_at: string
          id: string
          professional_id: string
          rating: number
        }
        Insert: {
          booking_id: string
          client_id: string
          comment?: string | null
          created_at?: string
          id?: string
          professional_id: string
          rating: number
        }
        Update: {
          booking_id?: string
          client_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          professional_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          name: string
          price: number
          professional_id: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          duration_minutes: number
          id?: string
          name: string
          price: number
          professional_id: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          name?: string
          price?: number
          professional_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      search_professionals: {
        Args: {
          client_lat: number
          client_lng: number
          max_radius_meters: number
          only_available_now?: boolean
          search_category_id?: string
          search_query?: string
        }
        Returns: {
          attendance_type: string
          avatar_url: string
          avg_rating: number
          bairro: string
          bio: string
          category_name: string
          city: string
          distance_meters: number
          full_name: string
          id: string
          is_available_now: boolean
          is_verified: boolean
          latitude: number
          longitude: number
          phone: string
          services_list: Json
          subscription_plan: string
          total_reviews: number
        }[]
      }
      unlock_contact: {
        Args: {
          p_booking_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

