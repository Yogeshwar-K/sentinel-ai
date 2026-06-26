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
      alerts: {
        Row: {
          ai_summary: string | null
          asset_id: string | null
          assigned_to: string | null
          country: string | null
          created_at: string
          description: string | null
          dest_ip: string | null
          hostname: string | null
          id: string
          mitre_techniques: string[] | null
          raw: Json | null
          severity: string
          source: string | null
          source_ip: string | null
          status: string
          title: string
          updated_at: string
          username: string | null
        }
        Insert: {
          ai_summary?: string | null
          asset_id?: string | null
          assigned_to?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          dest_ip?: string | null
          hostname?: string | null
          id?: string
          mitre_techniques?: string[] | null
          raw?: Json | null
          severity?: string
          source?: string | null
          source_ip?: string | null
          status?: string
          title: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          ai_summary?: string | null
          asset_id?: string | null
          assigned_to?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          dest_ip?: string | null
          hostname?: string | null
          id?: string
          mitre_techniques?: string[] | null
          raw?: Json | null
          severity?: string
          source?: string | null
          source_ip?: string | null
          status?: string
          title?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          created_at: string
          criticality: string
          department: string | null
          hostname: string
          id: string
          ip: string | null
          last_seen: string
          online: boolean
          os: string | null
          owner: string | null
          risk_score: number
        }
        Insert: {
          created_at?: string
          criticality?: string
          department?: string | null
          hostname: string
          id?: string
          ip?: string | null
          last_seen?: string
          online?: boolean
          os?: string | null
          owner?: string | null
          risk_score?: number
        }
        Update: {
          created_at?: string
          criticality?: string
          department?: string | null
          hostname?: string
          id?: string
          ip?: string | null
          last_seen?: string
          online?: boolean
          os?: string | null
          owner?: string | null
          risk_score?: number
        }
        Relationships: []
      }
      chat_history: {
        Row: {
          content: string | null
          created_at: string
          id: string
          parts: Json | null
          role: string
          thread_id: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          parts?: Json | null
          role: string
          thread_id: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          parts?: Json | null
          role?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: []
      }
      cves: {
        Row: {
          cve_id: string
          cvss: number | null
          description: string | null
          id: string
          kev: boolean | null
          product: string | null
          published_at: string | null
          severity: string | null
          title: string | null
          vendor: string | null
        }
        Insert: {
          cve_id: string
          cvss?: number | null
          description?: string | null
          id?: string
          kev?: boolean | null
          product?: string | null
          published_at?: string | null
          severity?: string | null
          title?: string | null
          vendor?: string | null
        }
        Update: {
          cve_id?: string
          cvss?: number | null
          description?: string | null
          id?: string
          kev?: boolean | null
          product?: string | null
          published_at?: string | null
          severity?: string | null
          title?: string | null
          vendor?: string | null
        }
        Relationships: []
      }
      incidents: {
        Row: {
          ai_rca: string | null
          ai_summary: string | null
          alert_ids: string[] | null
          assignee: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          notes: string | null
          severity: string
          status: string
          timeline: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_rca?: string | null
          ai_summary?: string | null
          alert_ids?: string[] | null
          assignee?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          severity?: string
          status?: string
          timeline?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_rca?: string | null
          ai_summary?: string | null
          alert_ids?: string[] | null
          assignee?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          severity?: string
          status?: string
          timeline?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      logs: {
        Row: {
          ai_finding: string | null
          event_id: string | null
          hostname: string | null
          id: string
          ip: string | null
          message: string | null
          mitre_techniques: string[] | null
          process: string | null
          raw: Json | null
          severity: string | null
          source_type: string | null
          ts: string
          upload_batch: string | null
          uploaded_by: string | null
          username: string | null
        }
        Insert: {
          ai_finding?: string | null
          event_id?: string | null
          hostname?: string | null
          id?: string
          ip?: string | null
          message?: string | null
          mitre_techniques?: string[] | null
          process?: string | null
          raw?: Json | null
          severity?: string | null
          source_type?: string | null
          ts?: string
          upload_batch?: string | null
          uploaded_by?: string | null
          username?: string | null
        }
        Update: {
          ai_finding?: string | null
          event_id?: string | null
          hostname?: string | null
          id?: string
          ip?: string | null
          message?: string | null
          mitre_techniques?: string[] | null
          process?: string | null
          raw?: Json | null
          severity?: string | null
          source_type?: string | null
          ts?: string
          upload_batch?: string | null
          uploaded_by?: string | null
          username?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          channel: string
          created_at: string
          id: string
          payload: Json | null
          read: boolean
          severity: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          channel?: string
          created_at?: string
          id?: string
          payload?: Json | null
          read?: boolean
          severity?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          channel?: string
          created_at?: string
          id?: string
          payload?: Json | null
          read?: boolean
          severity?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      playbooks: {
        Row: {
          ai_generated: boolean | null
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          mitre_techniques: string[] | null
          steps: Json | null
          title: string
        }
        Insert: {
          ai_generated?: boolean | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          mitre_techniques?: string[] | null
          steps?: Json | null
          title: string
        }
        Update: {
          ai_generated?: boolean | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          mitre_techniques?: string[] | null
          steps?: Json | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          content: string | null
          created_at: string
          format: string | null
          generated_by: string | null
          id: string
          report_type: string
          title: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          format?: string | null
          generated_by?: string | null
          id?: string
          report_type: string
          title: string
        }
        Update: {
          content?: string | null
          created_at?: string
          format?: string | null
          generated_by?: string | null
          id?: string
          report_type?: string
          title?: string
        }
        Relationships: []
      }
      threat_intel: {
        Row: {
          asn: string | null
          country: string | null
          description: string | null
          first_seen: string | null
          id: string
          ioc: string
          ioc_type: string
          last_seen: string | null
          malware_family: string | null
          mitre_techniques: string[] | null
          risk_score: number
          sources: string[] | null
          tags: string[] | null
          threat_actor: string | null
        }
        Insert: {
          asn?: string | null
          country?: string | null
          description?: string | null
          first_seen?: string | null
          id?: string
          ioc: string
          ioc_type: string
          last_seen?: string | null
          malware_family?: string | null
          mitre_techniques?: string[] | null
          risk_score?: number
          sources?: string[] | null
          tags?: string[] | null
          threat_actor?: string | null
        }
        Update: {
          asn?: string | null
          country?: string | null
          description?: string | null
          first_seen?: string | null
          id?: string
          ioc?: string
          ioc_type?: string
          last_seen?: string | null
          malware_family?: string | null
          mitre_techniques?: string[] | null
          risk_score?: number
          sources?: string[] | null
          tags?: string[] | null
          threat_actor?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "analyst"
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
    Enums: {
      app_role: ["admin", "manager", "analyst"],
    },
  },
} as const
