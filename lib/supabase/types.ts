// Hand-written to match supabase/migrations/0001_init.sql.
// Once a real Supabase project exists, regenerate with:
//   npx supabase gen types typescript --project-id <id> > lib/supabase/types.ts
// and reconcile any drift with this file.

export type Gender = "male" | "female";
export type MaritalStatus = "single" | "divorced" | "widowed";
export type Madhhab =
  | "hanafi"
  | "maliki"
  | "shafii"
  | "hanbali"
  | "no_preference"
  | "other";
export type VerificationStatus = "pending" | "approved" | "rejected";
export type AdminRole = "admin" | "moderator" | "support";
export type ContactRequestStatus = "pending" | "accepted" | "declined";
export type ConversationStatus = "active" | "blocked" | "archived";
export type MessageModerationStatus = "approved" | "flagged" | "blocked";
export type MessageType = "text" | "voice";
export type ModerationFlagType =
  | "inappropriate_content"
  | "contact_info_exchange"
  | "harassment"
  | "spam"
  | "other";
export type ModerationSeverity = "low" | "medium" | "high";
export type ModerationFlagStatus = "pending_review" | "confirmed" | "dismissed";
export type CoachMessageRole = "user" | "assistant";
export type SubscriptionPlan = "free" | "premium_monthly";
export type SubscriptionStatus = "active" | "canceled" | "expired" | "past_due";
export type PaymentTransactionStatus = "pending" | "succeeded" | "failed" | "refunded";
export type ProfileReportReason =
  | "fake_profile"
  | "inappropriate_content"
  | "harassment"
  | "already_married_hidden"
  | "scam"
  | "other";
export type ProfileReportStatus = "pending_review" | "confirmed" | "dismissed";
export type NotificationType =
  | "contact_request_received"
  | "contact_request_accepted"
  | "profile_approved"
  | "profile_rejected"
  | "premium_activated";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          phone_number: string | null;
          first_name: string;
          gender: Gender;
          date_of_birth: string;
          country: string;
          city: string;
          nationality: string | null;
          marital_status: MaritalStatus;
          has_children: boolean;
          wants_children: boolean | null;
          madhhab: Madhhab;
          religious_practice_level: string | null;
          profession: string | null;
          education_level: string | null;
          height_cm: number | null;
          bio: string | null;
          interests: string | null;
          life_goals: string | null;
          seeking_criteria: Record<string, unknown>;
          is_anonymous: boolean;
          blur_photos: boolean;
          verification_status: VerificationStatus;
          verification_reviewed_by: string | null;
          verification_rejection_reason: string | null;
          is_premium: boolean;
          premium_until: string | null;
          boost_credits: number;
          boosted_until: string | null;
          terms_accepted_at: string | null;
          last_active_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          user_id: string;
          email: string;
          first_name: string;
          gender: Gender;
          date_of_birth: string;
          country: string;
          city: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      profile_photos: {
        Row: {
          id: string;
          profile_id: string;
          storage_path: string;
          position: number;
          is_primary: boolean;
          moderation_status: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profile_photos"]["Row"]> & {
          profile_id: string;
          storage_path: string;
        };
        Update: Partial<Database["public"]["Tables"]["profile_photos"]["Row"]>;
        Relationships: [];
      };
      admin_users: {
        Row: {
          id: string;
          user_id: string;
          role: AdminRole;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["admin_users"]["Row"]> & {
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_users"]["Row"]>;
        Relationships: [];
      };
      verification_history: {
        Row: {
          id: string;
          profile_id: string;
          previous_status: VerificationStatus | null;
          new_status: VerificationStatus;
          reason: string | null;
          changed_by: string | null;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["verification_history"]["Row"]
        > & {
          profile_id: string;
          new_status: VerificationStatus;
        };
        Update: Partial<
          Database["public"]["Tables"]["verification_history"]["Row"]
        >;
        Relationships: [];
      };
      daily_usage_counters: {
        Row: {
          id: string;
          profile_id: string;
          counter_date: string;
          contact_requests_sent: number;
          coach_questions_asked: number;
        };
        Insert: Partial<
          Database["public"]["Tables"]["daily_usage_counters"]["Row"]
        > & {
          profile_id: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["daily_usage_counters"]["Row"]
        >;
        Relationships: [];
      };
      contact_requests: {
        Row: {
          id: string;
          sender_profile_id: string;
          recipient_profile_id: string;
          status: ContactRequestStatus;
          message: string | null;
          created_at: string;
          responded_at: string | null;
        };
        Insert: Partial<
          Database["public"]["Tables"]["contact_requests"]["Row"]
        > & {
          sender_profile_id: string;
          recipient_profile_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["contact_requests"]["Row"]>;
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          contact_request_id: string;
          profile_a_id: string;
          profile_b_id: string;
          status: ConversationStatus;
          archived_by_a: boolean;
          archived_by_b: boolean;
          last_message_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["conversations"]["Row"]> & {
          contact_request_id: string;
          profile_a_id: string;
          profile_b_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["conversations"]["Row"]>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_profile_id: string;
          content: string | null;
          message_type: MessageType;
          voice_storage_path: string | null;
          voice_duration_seconds: number | null;
          moderation_status: MessageModerationStatus;
          is_read: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["messages"]["Row"]> & {
          conversation_id: string;
          sender_profile_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Row"]>;
        Relationships: [];
      };
      moderation_flags: {
        Row: {
          id: string;
          message_id: string;
          profile_id: string;
          flag_type: ModerationFlagType;
          severity: ModerationSeverity;
          ai_reasoning: string | null;
          status: ModerationFlagStatus;
          reviewed_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["moderation_flags"]["Row"]> & {
          message_id: string;
          profile_id: string;
          flag_type: ModerationFlagType;
          severity: ModerationSeverity;
        };
        Update: Partial<Database["public"]["Tables"]["moderation_flags"]["Row"]>;
        Relationships: [];
      };
      favorites: {
        Row: {
          id: string;
          profile_id: string;
          favorited_profile_id: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["favorites"]["Row"]> & {
          profile_id: string;
          favorited_profile_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["favorites"]["Row"]>;
        Relationships: [];
      };
      profile_visits: {
        Row: {
          id: string;
          visitor_profile_id: string;
          visited_profile_id: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profile_visits"]["Row"]> & {
          visitor_profile_id: string;
          visited_profile_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profile_visits"]["Row"]>;
        Relationships: [];
      };
      coach_conversations: {
        Row: {
          id: string;
          profile_id: string;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["coach_conversations"]["Row"]
        > & {
          profile_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["coach_conversations"]["Row"]>;
        Relationships: [];
      };
      coach_messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: CoachMessageRole;
          content: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["coach_messages"]["Row"]> & {
          conversation_id: string;
          role: CoachMessageRole;
          content: string;
        };
        Update: Partial<Database["public"]["Tables"]["coach_messages"]["Row"]>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          profile_id: string;
          plan: SubscriptionPlan;
          status: SubscriptionStatus;
          provider_subscription_id: string | null;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]> & {
          profile_id: string;
          current_period_end: string;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]>;
        Relationships: [];
      };
      payment_transactions: {
        Row: {
          id: string;
          profile_id: string;
          subscription_id: string | null;
          provider_transaction_id: string;
          amount_fcfa: number;
          currency: string;
          status: PaymentTransactionStatus;
          payment_method: string | null;
          plan_id: string | null;
          raw_payload: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["payment_transactions"]["Row"]
        > & {
          profile_id: string;
          provider_transaction_id: string;
          amount_fcfa: number;
        };
        Update: Partial<Database["public"]["Tables"]["payment_transactions"]["Row"]>;
        Relationships: [];
      };
      compatibility_scores: {
        Row: {
          id: string;
          profile_id: string;
          candidate_id: string;
          score: number;
          reasoning: string | null;
          computed_at: string;
          analysis: Record<string, unknown> | null;
        };
        Insert: Partial<Database["public"]["Tables"]["compatibility_scores"]["Row"]> & {
          profile_id: string;
          candidate_id: string;
          score: number;
        };
        Update: Partial<Database["public"]["Tables"]["compatibility_scores"]["Row"]>;
        Relationships: [];
      };
      blocked_profiles: {
        Row: {
          id: string;
          blocker_profile_id: string;
          blocked_profile_id: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["blocked_profiles"]["Row"]> & {
          blocker_profile_id: string;
          blocked_profile_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["blocked_profiles"]["Row"]>;
        Relationships: [];
      };
      profile_reports: {
        Row: {
          id: string;
          reporter_profile_id: string;
          reported_profile_id: string;
          reason: ProfileReportReason;
          details: string | null;
          status: ProfileReportStatus;
          reviewed_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profile_reports"]["Row"]> & {
          reporter_profile_id: string;
          reported_profile_id: string;
          reason: ProfileReportReason;
        };
        Update: Partial<Database["public"]["Tables"]["profile_reports"]["Row"]>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          profile_id: string;
          type: NotificationType;
          title: string;
          body: string | null;
          link: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["notifications"]["Row"]> & {
          profile_id: string;
          type: NotificationType;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
        Relationships: [];
      };
      app_settings: {
        Row: {
          id: boolean;
          meta_pixel_id: string | null;
          meta_access_token: string | null;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["app_settings"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["app_settings"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: { uid: string };
        Returns: boolean;
      };
      increment_and_check_counter: {
        Args: { p_profile_id: string; p_column: string; p_limit: number };
        Returns: boolean;
      };
    };
  };
}
