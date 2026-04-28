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
      clientes: {
        Row: {
          cpf_cnpj: string | null
          created_at: string
          created_by: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          municipio: string | null
          nome: string
          obs: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cpf_cnpj?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          municipio?: string | null
          nome: string
          obs?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cpf_cnpj?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          municipio?: string | null
          nome?: string
          obs?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      documentos: {
        Row: {
          categoria: string | null
          created_at: string
          created_by: string | null
          data: string | null
          id: string
          imovel_id: string | null
          nome: string
          status: string | null
          storage_path: string | null
          tamanho: string | null
          tipo: string | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          created_by?: string | null
          data?: string | null
          id?: string
          imovel_id?: string | null
          nome: string
          status?: string | null
          storage_path?: string | null
          tamanho?: string | null
          tipo?: string | null
        }
        Update: {
          categoria?: string | null
          created_at?: string
          created_by?: string | null
          data?: string | null
          id?: string
          imovel_id?: string | null
          nome?: string
          status?: string | null
          storage_path?: string | null
          tamanho?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documentos_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
        ]
      }
      historico: {
        Row: {
          acao: string
          created_by: string | null
          data: string
          id: string
          imovel_id: string
          obs: string | null
          usuario: string | null
        }
        Insert: {
          acao: string
          created_by?: string | null
          data?: string
          id?: string
          imovel_id: string
          obs?: string | null
          usuario?: string | null
        }
        Update: {
          acao?: string
          created_by?: string | null
          data?: string
          id?: string
          imovel_id?: string
          obs?: string | null
          usuario?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
        ]
      }
      imoveis: {
        Row: {
          area_ha: number
          area_m2: number
          ccir: string | null
          centro_lat: number | null
          centro_lng: number | null
          cliente_id: string | null
          codigo_incra: string | null
          comarca: string | null
          confrontantes: Json | null
          conjuge: string | null
          cpf_cnpj: string | null
          cpf_conjuge: string | null
          created_at: string
          created_by: string | null
          data_inicio: string | null
          data_previsao: string | null
          equipe_campo: Json | null
          estado: string | null
          id: string
          matricula: string
          municipio: string | null
          nome: string
          notas_internas: string | null
          obs: string | null
          poligono: Json | null
          progresso: number
          proprietario_nome: string | null
          responsavel_tecnico: string | null
          situacao: string | null
          status: string
          updated_at: string
          vertices: Json | null
        }
        Insert: {
          area_ha?: number
          area_m2?: number
          ccir?: string | null
          centro_lat?: number | null
          centro_lng?: number | null
          cliente_id?: string | null
          codigo_incra?: string | null
          comarca?: string | null
          confrontantes?: Json | null
          conjuge?: string | null
          cpf_cnpj?: string | null
          cpf_conjuge?: string | null
          created_at?: string
          created_by?: string | null
          data_inicio?: string | null
          data_previsao?: string | null
          equipe_campo?: Json | null
          estado?: string | null
          id?: string
          matricula?: string
          municipio?: string | null
          nome: string
          notas_internas?: string | null
          obs?: string | null
          poligono?: Json | null
          progresso?: number
          proprietario_nome?: string | null
          responsavel_tecnico?: string | null
          situacao?: string | null
          status?: string
          updated_at?: string
          vertices?: Json | null
        }
        Update: {
          area_ha?: number
          area_m2?: number
          ccir?: string | null
          centro_lat?: number | null
          centro_lng?: number | null
          cliente_id?: string | null
          codigo_incra?: string | null
          comarca?: string | null
          confrontantes?: Json | null
          conjuge?: string | null
          cpf_cnpj?: string | null
          cpf_conjuge?: string | null
          created_at?: string
          created_by?: string | null
          data_inicio?: string | null
          data_previsao?: string | null
          equipe_campo?: Json | null
          estado?: string | null
          id?: string
          matricula?: string
          municipio?: string | null
          nome?: string
          notas_internas?: string | null
          obs?: string | null
          poligono?: Json | null
          progresso?: number
          proprietario_nome?: string | null
          responsavel_tecnico?: string | null
          situacao?: string | null
          status?: string
          updated_at?: string
          vertices?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "imoveis_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      pontos: {
        Row: {
          altitude: number | null
          categoria: string | null
          codigo: string
          created_at: string
          created_by: string | null
          data: string | null
          datum: string | null
          descricao: string | null
          equipamento: string | null
          id: string
          imovel_id: string | null
          latitude: number | null
          leste: number | null
          longitude: number | null
          metodo: string | null
          municipio: string | null
          nome: string | null
          norte: number | null
          obs: string | null
          operador: string | null
          precisao_h: number | null
          precisao_v: number | null
          sistema: string | null
          tipo: string | null
          updated_at: string
        }
        Insert: {
          altitude?: number | null
          categoria?: string | null
          codigo: string
          created_at?: string
          created_by?: string | null
          data?: string | null
          datum?: string | null
          descricao?: string | null
          equipamento?: string | null
          id?: string
          imovel_id?: string | null
          latitude?: number | null
          leste?: number | null
          longitude?: number | null
          metodo?: string | null
          municipio?: string | null
          nome?: string | null
          norte?: number | null
          obs?: string | null
          operador?: string | null
          precisao_h?: number | null
          precisao_v?: number | null
          sistema?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          altitude?: number | null
          categoria?: string | null
          codigo?: string
          created_at?: string
          created_by?: string | null
          data?: string | null
          datum?: string | null
          descricao?: string | null
          equipamento?: string | null
          id?: string
          imovel_id?: string | null
          latitude?: number | null
          leste?: number | null
          longitude?: number | null
          metodo?: string | null
          municipio?: string | null
          nome?: string | null
          norte?: number | null
          obs?: string | null
          operador?: string | null
          precisao_h?: number | null
          precisao_v?: number | null
          sistema?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pontos_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          nome?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          updated_at?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "tecnico" | "visualizador"
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
      app_role: ["admin", "tecnico", "visualizador"],
    },
  },
} as const
