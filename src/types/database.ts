export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      recruiters: {
        Row: {
          id: string;
          email: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          created_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          recruiter_id: string;
          title: string;
          description: string | null;
          status: "draft" | "published" | "closed";
          created_at: string;
        };
        Insert: {
          id?: string;
          recruiter_id: string;
          title: string;
          description?: string | null;
          status?: "draft" | "published" | "closed";
          created_at?: string;
        };
        Update: {
          id?: string;
          recruiter_id?: string;
          title?: string;
          description?: string | null;
          status?: "draft" | "published" | "closed";
          created_at?: string;
        };
      };
      candidates: {
        Row: {
          id: string;
          job_id: string;
          name: string;
          email: string;
          cv_url: string | null;
          raw_cv_data: Json | null;
          status: "new" | "screening" | "interview" | "technical_test" | "offer" | "hired" | "rejected";
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          name: string;
          email: string;
          cv_url?: string | null;
          raw_cv_data?: Json | null;
          status?: "new" | "screening" | "interview" | "technical_test" | "offer" | "hired" | "rejected";
          created_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          name?: string;
          email?: string;
          cv_url?: string | null;
          raw_cv_data?: Json | null;
          status?: "new" | "screening" | "interview" | "technical_test" | "offer" | "hired" | "rejected";
          created_at?: string;
        };
      };
      interviews: {
        Row: {
          id: string;
          candidate_id: string;
          interview_date: string;
          status: "scheduled" | "completed" | "cancelled";
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          interview_date: string;
          status?: "scheduled" | "completed" | "cancelled";
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          interview_date?: string;
          status?: "scheduled" | "completed" | "cancelled";
          notes?: string | null;
          created_at?: string;
        };
      };
      scores: {
        Row: {
          id: string;
          candidate_id: string;
          summary: string;
          classification: string;
          suggestions: Json;
          risk_level: "low" | "medium" | "high";
          score: number;
          suggested_next_step: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          summary: string;
          classification: string;
          suggestions?: Json;
          risk_level: "low" | "medium" | "high";
          score: number;
          suggested_next_step?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          summary?: string;
          classification?: string;
          suggestions?: Json;
          risk_level?: "low" | "medium" | "high";
          score?: number;
          suggested_next_step?: string | null;
          created_at?: string;
        };
      };
      ai_logs: {
        Row: {
          id: string;
          event_type: string;
          prompt: string;
          response: string;
          model_version: string;
          tokens_used: number | null;
          latency_ms: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          prompt: string;
          response: string;
          model_version: string;
          tokens_used?: number | null;
          latency_ms?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_type?: string;
          prompt?: string;
          response?: string;
          model_version?: string;
          tokens_used?: number | null;
          latency_ms?: number | null;
          created_at?: string;
        };
      };
    };
  };
}
