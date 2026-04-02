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
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          last_login: string | null
          role: string
          status: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          last_login?: string | null
          role?: string
          status?: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_login?: string | null
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      agents: {
        Row: {
          avatar: string | null
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          name: string
          name_en: string | null
          perspective: string | null
          system_prompt: string | null
          tags: string[] | null
          updated_at: string
          usage_count: number
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          name: string
          name_en?: string | null
          perspective?: string | null
          system_prompt?: string | null
          tags?: string[] | null
          updated_at?: string
          usage_count?: number
        }
        Update: {
          avatar?: string | null
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          name?: string
          name_en?: string | null
          perspective?: string | null
          system_prompt?: string | null
          tags?: string[] | null
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      conversations: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          created_at: string
          id: string
          last_message: string | null
          message_count: number
          status: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          agent_id?: string | null
          agent_name?: string | null
          created_at?: string
          id?: string
          last_message?: string | null
          message_count?: number
          status?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          agent_id?: string | null
          agent_name?: string | null
          created_at?: string
          id?: string
          last_message?: string | null
          message_count?: number
          status?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      memory_configs: {
        Row: {
          auto_extract: boolean
          created_at: string
          id: string
          last_updated: string
          max_memory: number
          memory_count: number
          retention_days: number
          user_id: string
          username: string | null
        }
        Insert: {
          auto_extract?: boolean
          created_at?: string
          id?: string
          last_updated?: string
          max_memory?: number
          memory_count?: number
          retention_days?: number
          user_id: string
          username?: string | null
        }
        Update: {
          auto_extract?: boolean
          created_at?: string
          id?: string
          last_updated?: string
          max_memory?: number
          memory_count?: number
          retention_days?: number
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memory_configs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      messages: {
        Row: {
          coach_id: string | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          coach_id?: string | null
          content?: string
          conversation_id: string
          created_at?: string
          id?: string
          role?: string
        }
        Update: {
          coach_id?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          status: string
          title: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          created_at: string
          id: string
          pay_method: string | null
          plan_name: string | null
          status: string
          user_id: string
          username: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          pay_method?: string | null
          plan_name?: string | null
          status?: string
          user_id: string
          username?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          pay_method?: string | null
          plan_name?: string | null
          status?: string
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          duration: string | null
          features: string[] | null
          id: string
          name: string
          price: number
          status: string
          subscribers: number
          tokens: number
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration?: string | null
          features?: string[] | null
          id?: string
          name: string
          price?: number
          status?: string
          subscribers?: number
          tokens?: number
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration?: string | null
          features?: string[] | null
          id?: string
          name?: string
          price?: number
          status?: string
          subscribers?: number
          tokens?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string
          email: string | null
          id: string
          phone: string | null
          status: string
          token_balance: number
          token_used: number
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          status?: string
          token_balance?: number
          token_used?: number
          updated_at?: string
          user_id: string
          username?: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          status?: string
          token_balance?: number
          token_used?: number
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          member_count: number
          name: string
          permissions: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          member_count?: number
          name: string
          permissions?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          member_count?: number
          name?: string
          permissions?: Json
          updated_at?: string
        }
        Relationships: []
      }
      token_prices: {
        Row: {
          created_at: string
          id: string
          input_price: number
          model: string
          output_price: number
          type: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          input_price?: number
          model: string
          output_price?: number
          type: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          input_price?: number
          model?: string
          output_price?: number
          type?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      usage_records: {
        Row: {
          agent_name: string | null
          cost: number
          created_at: string
          id: string
          tokens_input: number
          tokens_output: number
          type: string
          user_id: string
          username: string | null
        }
        Insert: {
          agent_name?: string | null
          cost?: number
          created_at?: string
          id?: string
          tokens_input?: number
          tokens_output?: number
          type?: string
          user_id: string
          username?: string | null
        }
        Update: {
          agent_name?: string | null
          cost?: number
          created_at?: string
          id?: string
          tokens_input?: number
          tokens_output?: number
          type?: string
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_dashboard_stats: { Args: never; Returns: Json }
      is_admin: { Args: never; Returns: boolean }
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
