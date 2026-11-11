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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      android_live_score_tokens: {
        Row: {
          last_started_game_id: string | null
          team_id: number | null
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          last_started_game_id?: string | null
          team_id?: number | null
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          last_started_game_id?: string | null
          team_id?: number | null
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "android_live_score_tokens_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      app_version_requirement: {
        Row: {
          android_play_store_url: string | null
          body_message: string | null
          id: number
          ios_app_store_url: string | null
          min_android_version: string | null
          min_ios_version: string | null
          updated_at: string
        }
        Insert: {
          android_play_store_url?: string | null
          body_message?: string | null
          id?: number
          ios_app_store_url?: string | null
          min_android_version?: string | null
          min_ios_version?: string | null
          updated_at?: string
        }
        Update: {
          android_play_store_url?: string | null
          body_message?: string | null
          id?: number
          ios_app_store_url?: string | null
          min_android_version?: string | null
          min_ios_version?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      checklist_items: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          kind: Database["public"]["Enums"]["checklist_item_kind"]
          label: string
          normalized_label: string
          usage_count: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["checklist_item_kind"]
          label: string
          normalized_label: string
          usage_count?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["checklist_item_kind"]
          label?: string
          normalized_label?: string
          usage_count?: number
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          app_version: string | null
          breadcrumbs: Json | null
          context: Json | null
          created_at: string
          fingerprint: string | null
          id: string
          level: string
          message: string
          platform: string | null
          source: string | null
          stack: string | null
          user_id: string | null
        }
        Insert: {
          app_version?: string | null
          breadcrumbs?: Json | null
          context?: Json | null
          created_at?: string
          fingerprint?: string | null
          id?: string
          level?: string
          message: string
          platform?: string | null
          source?: string | null
          stack?: string | null
          user_id?: string | null
        }
        Update: {
          app_version?: string | null
          breadcrumbs?: Json | null
          context?: Json | null
          created_at?: string
          fingerprint?: string | null
          id?: string
          level?: string
          message?: string
          platform?: string | null
          source?: string | null
          stack?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      game_logs: {
        Row: {
          created_at: string
          game_log_images: string[]
          game_record_id: number
          id: number
          is_private: boolean
          note: string | null
          seat: string | null
          support_team_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          game_log_images?: string[]
          game_record_id: number
          id?: number
          is_private?: boolean
          note?: string | null
          seat?: string | null
          support_team_id: number
          user_id?: string
        }
        Update: {
          created_at?: string
          game_log_images?: string[]
          game_record_id?: number
          id?: number
          is_private?: boolean
          note?: string | null
          seat?: string | null
          support_team_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_logs_game_record_id_fkey"
            columns: ["game_record_id"]
            isOneToOne: false
            referencedRelation: "game_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_logs_support_team_id_fkey"
            columns: ["support_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_logs_user_id_fkey2"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      game_records: {
        Row: {
          away_team_id: number
          away_team_score: number | null
          created_at: string
          game_type: string
          home_team_id: number
          home_team_score: number | null
          id: number
          match_date: string
          stadium_id: number
          status: string
          youtube_url: string | null
        }
        Insert: {
          away_team_id: number
          away_team_score?: number | null
          created_at?: string
          game_type?: string
          home_team_id: number
          home_team_score?: number | null
          id?: number
          match_date: string
          stadium_id: number
          status: string
          youtube_url?: string | null
        }
        Update: {
          away_team_id?: number
          away_team_score?: number | null
          created_at?: string
          game_type?: string
          home_team_id?: number
          home_team_score?: number | null
          id?: number
          match_date?: string
          stadium_id?: number
          status?: string
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_records_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_records_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_records_stadium_id_fkey"
            columns: ["stadium_id"]
            isOneToOne: false
            referencedRelation: "stadium"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          admin_answer_at: string | null
          answer: string | null
          content: string
          created_at: string
          id: number
          title: string
          user_id: string
        }
        Insert: {
          admin_answer_at?: string | null
          answer?: string | null
          content: string
          created_at?: string
          id?: number
          title: string
          user_id: string
        }
        Update: {
          admin_answer_at?: string | null
          answer?: string | null
          content?: string
          created_at?: string
          id?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      kbo_events_cache: {
        Row: {
          data: Json
          id: string
        }
        Insert: {
          data: Json
          id: string
        }
        Update: {
          data?: Json
          id?: string
        }
        Relationships: []
      }
      live_activities: {
        Row: {
          created_at: string
          game_id: string | null
          id: string
          last_urgent_key: string | null
          push_token: string
          status: string
          team_id: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          game_id?: string | null
          id?: string
          last_urgent_key?: string | null
          push_token: string
          status?: string
          team_id?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          game_id?: string | null
          id?: string
          last_urgent_key?: string | null
          push_token?: string
          status?: string
          team_id?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_activities_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      live_score_channels: {
        Row: {
          channel_id: string
          created_at: string
          ended_at: string | null
          environment: string
          game_key: string
          last_urgent_key: string | null
        }
        Insert: {
          channel_id: string
          created_at?: string
          ended_at?: string | null
          environment: string
          game_key: string
          last_urgent_key?: string | null
        }
        Update: {
          channel_id?: string
          created_at?: string
          ended_at?: string | null
          environment?: string
          game_key?: string
          last_urgent_key?: string | null
        }
        Relationships: []
      }
      live_score_source_state: {
        Row: {
          consecutive_naver_failures: number
          id: number
          updated_at: string
        }
        Insert: {
          consecutive_naver_failures?: number
          id: number
          updated_at?: string
        }
        Update: {
          consecutive_naver_failures?: number
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      login_logs: {
        Row: {
          app_version: string | null
          created_at: string
          event: string
          id: string
          platform: string | null
          provider: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          app_version?: string | null
          created_at?: string
          event: string
          id?: string
          platform?: string | null
          provider?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          app_version?: string | null
          created_at?: string
          event?: string
          id?: string
          platform?: string | null
          provider?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notices: {
        Row: {
          content: string
          created_at: string
          id: number
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      push_to_start_tokens: {
        Row: {
          last_recovery_at: string | null
          last_started_game_id: string | null
          last_started_via_channel: boolean
          team_id: number | null
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          last_recovery_at?: string | null
          last_started_game_id?: string | null
          last_started_via_channel?: boolean
          team_id?: number | null
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          last_recovery_at?: string | null
          last_started_game_id?: string | null
          last_started_via_channel?: boolean
          team_id?: number | null
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_to_start_tokens_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          game_log_id: number
          id: string
          reason: string
          reported_user_id: string
          reporter_id: string
          status: string
        }
        Insert: {
          created_at?: string
          game_log_id: number
          id?: string
          reason: string
          reported_user_id: string
          reporter_id: string
          status?: string
        }
        Update: {
          created_at?: string
          game_log_id?: number
          id?: string
          reason?: string
          reported_user_id?: string
          reporter_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_game_log_id_fkey"
            columns: ["game_log_id"]
            isOneToOne: false
            referencedRelation: "game_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      stadium: {
        Row: {
          home_order: number | null
          id: number
          league_level: Database["public"]["Enums"]["league_level_enum"] | null
          name: string | null
        }
        Insert: {
          home_order?: number | null
          id?: number
          league_level?: Database["public"]["Enums"]["league_level_enum"] | null
          name?: string | null
        }
        Update: {
          home_order?: number | null
          id?: number
          league_level?: Database["public"]["Enums"]["league_level_enum"] | null
          name?: string | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          id: number
          short_team_name: string | null
          stadium_id: number | null
          team_logo: string | null
          team_name: string | null
          team_name_en: string | null
          thesportsdb_team_id: string
        }
        Insert: {
          id?: number
          short_team_name?: string | null
          stadium_id?: number | null
          team_logo?: string | null
          team_name?: string | null
          team_name_en?: string | null
          thesportsdb_team_id: string
        }
        Update: {
          id?: number
          short_team_name?: string | null
          stadium_id?: number | null
          team_logo?: string | null
          team_name?: string | null
          team_name_en?: string | null
          thesportsdb_team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_stadium_id_fkey"
            columns: ["stadium_id"]
            isOneToOne: false
            referencedRelation: "stadium"
            referencedColumns: ["id"]
          },
        ]
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      user_checklist_entries: {
        Row: {
          created_at: string
          id: string
          is_checked: boolean
          item_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_checked?: boolean
          item_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_checked?: boolean
          item_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_checklist_entries_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "checklist_items"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar: string | null
          character: Json | null
          created_at: string
          id: string
          nickname: string
          team_id: number | null
        }
        Insert: {
          avatar?: string | null
          character?: Json | null
          created_at?: string
          id: string
          nickname: string
          team_id?: number | null
        }
        Update: {
          avatar?: string | null
          character?: Json | null
          created_at?: string
          id?: string
          nickname?: string
          team_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "users_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      territory_scored_logs: {
        Row: {
          has_photo: boolean | null
          is_home: boolean | null
          is_private: boolean | null
          stadium_id: number | null
          team_id: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_logs_support_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_logs_user_id_fkey2"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_records_stadium_id_fkey"
            columns: ["stadium_id"]
            isOneToOne: false
            referencedRelation: "stadium"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      generate_random_nickname: { Args: never; Returns: string }
      get_my_territory_contribution: {
        Args: never
        Returns: {
          away_photo_count: number
          away_private_count: number
          away_public_count: number
          home_photo_count: number
          home_private_count: number
          home_public_count: number
          log_count: number
          stadium_id: number
          team_id: number
        }[]
      }
      get_territory_stats: {
        Args: never
        Returns: {
          away_photo_count: number
          away_private_count: number
          away_public_count: number
          home_photo_count: number
          home_private_count: number
          home_public_count: number
          log_count: number
          stadium_id: number
          team_id: number
        }[]
      }
      get_user_count: { Args: never; Returns: number }
      promote_checklist_item: { Args: { target_id: string }; Returns: string }
      territory_season_year: { Args: never; Returns: number }
    }
    Enums: {
      checklist_item_kind: "official" | "unofficial"
      league_level_enum: "first" | "second"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      checklist_item_kind: ["official", "unofficial"],
      league_level_enum: ["first", "second"],
    },
  },
} as const
