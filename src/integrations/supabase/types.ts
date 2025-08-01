export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      ai_insights: {
        Row: {
          clickable: boolean
          created_at: string
          description: string
          id: string
          impact: string
          title: string
          user_id: string
        }
        Insert: {
          clickable?: boolean
          created_at?: string
          description: string
          id?: string
          impact: string
          title: string
          user_id: string
        }
        Update: {
          clickable?: boolean
          created_at?: string
          description?: string
          id?: string
          impact?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      correction_exercises: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          description: string
          duration: string
          effectiveness: number
          exercises: string[]
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description: string
          duration: string
          effectiveness: number
          exercises: string[]
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string
          duration?: string
          effectiveness?: number
          exercises?: string[]
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      neural_patterns: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          impact: string[]
          neural_pathway: string | null
          origin: string | null
          severity: number
          status: string
          symptoms: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          impact: string[]
          neural_pathway?: string | null
          origin?: string | null
          severity: number
          status: string
          symptoms?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          impact?: string[]
          neural_pathway?: string | null
          origin?: string | null
          severity?: number
          status?: string
          symptoms?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payouts: {
        Row: {
          amount: number
          created_at: string
          id: string
          trivia_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          trivia_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          trivia_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_trivia_id_fkey"
            columns: ["trivia_id"]
            isOneToOne: false
            referencedRelation: "trivias"
            referencedColumns: ["id"]
          },
        ]
      }
      trivias: {
        Row: {
          correct_answer: string
          created_at: string
          description: string
          ends_at: string
          entry_price: number
          id: string
          oppose_count: number
          oppose_pool: number
          resolved_at: string | null
          status: string
          support_count: number
          support_pool: number
          title: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          description: string
          ends_at: string
          entry_price?: number
          id?: string
          oppose_count?: number
          oppose_pool?: number
          resolved_at?: string | null
          status?: string
          support_count?: number
          support_pool?: number
          title: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          description?: string
          ends_at?: string
          entry_price?: number
          id?: string
          oppose_count?: number
          oppose_pool?: number
          resolved_at?: string | null
          status?: string
          support_count?: number
          support_pool?: number
          title?: string
        }
        Relationships: []
      }
      user_answers: {
        Row: {
          amount_paid: number
          answer: string
          created_at: string
          id: string
          trivia_id: string
          user_id: string
        }
        Insert: {
          amount_paid: number
          answer: string
          created_at?: string
          id?: string
          trivia_id: string
          user_id: string
        }
        Update: {
          amount_paid?: number
          answer?: string
          created_at?: string
          id?: string
          trivia_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_answers_trivia_id_fkey"
            columns: ["trivia_id"]
            isOneToOne: false
            referencedRelation: "trivias"
            referencedColumns: ["id"]
          },
        ]
      }
      user_balances: {
        Row: {
          available_balance: number
          id: string
          total_winnings: number
          total_withdrawn: number
          updated_at: string
          user_id: string
        }
        Insert: {
          available_balance?: number
          id?: string
          total_winnings?: number
          total_withdrawn?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          available_balance?: number
          id?: string
          total_winnings?: number
          total_withdrawn?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          detection_progress: number
          emotional_regulation: number
          id: string
          neural_pathway_strength: number
          success_pattern_rewiring: number
          updated_at: string
          user_id: string
        }
        Insert: {
          detection_progress?: number
          emotional_regulation?: number
          id?: string
          neural_pathway_strength?: number
          success_pattern_rewiring?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          detection_progress?: number
          emotional_regulation?: number
          id?: string
          neural_pathway_strength?: number
          success_pattern_rewiring?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          id: string
          status: string
          transaction_hash: string | null
          user_id: string
          wallet_address: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          id?: string
          status?: string
          transaction_hash?: string | null
          user_id: string
          wallet_address: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          status?: string
          transaction_hash?: string | null
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
