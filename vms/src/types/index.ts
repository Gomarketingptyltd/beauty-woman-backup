// ============================================================
// Core Entity Types
// ============================================================

export type Role = "admin" | "manager" | "staff" | "agent";

export type TechnicianStatus = "available" | "busy" | "break" | "off";

export type MemberTier = "Casual" | "Standard" | "VIP" | "Board";

export type RoomStatus = "free" | "occupied" | "cleaning" | "maintenance";

export type OrderStatus = "draft" | "paid" | "voided";

export type PaymentMethod = "cash" | "member_account" | "split";

export type CommissionType = "percentage" | "flat";

export type TransactionType =
  | "topup"
  | "spend"
  | "cashback"
  | "referral"
  | "void"
  | "adjust"
  | "annual_fee";

// ============================================================
// Package Definitions (static)
// ============================================================

export type PackageKey =
  | "QUICK_BLISS"
  | "STEAM_SANCTUARY"
  | "SILK_ROAD_AQUA"
  | "DEEP_SPA_RITUAL"
  | "BLACK_GOLD_SOVEREIGN";

export interface PackageDuration {
  minutes: number;
  price: number; // AUD
}

export interface Package {
  key: PackageKey;
  nameEn: string;
  nameCn: string;
  durations: PackageDuration[];
  requiresBooking: boolean;
  description?: string;
}

// ============================================================
// Database Types (matching Supabase schema)
// ============================================================

export interface Profile {
  id: string; // UUID matching auth.users
  username: string;
  display_name: string | null;
  role: Role;
  agent_id: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Agent {
  id: string;
  name: string;
  bio: string | null;
  contact: AgentContact;
  default_commission: number; // AUD cents
  is_active: boolean;
  created_at: string;
}

export interface AgentContact {
  phone?: string;
  wechat?: string;
  line?: string;
  email?: string;
  notes?: string;
}

export interface AgentPackageCommission {
  id: string;
  agent_id: string;
  package_key: PackageKey;
  commission_amount: number; // AUD cents
}

export interface Technician {
  id: string;
  code: string; // T001, T002...
  name: string;
  age: number | null;
  body: string | null;
  cup_size: string | null;
  height: string | null;
  language: string[];
  type: string | null;
  speciality: string | null;
  starting_price: string | null; // e.g. "$200起"
  holder_description: string | null;
  photos: string[]; // Supabase Storage URLs (up to 4)
  status: TechnicianStatus;
  agent_id: string | null; // hidden from staff/public
  is_active: boolean;
  created_at: string;
}

// Public-safe version (no agent_id)
export interface TechnicianPublic
  extends Omit<Technician, "agent_id" | "is_active"> {}

export interface TechnicianWithAgent extends Technician {
  agent?: Agent | null;
}

export interface TechnicianShift {
  id: string;
  technician_id: string;
  technician?: Technician;
  checked_in_at: string;
  checked_out_at: string | null;
  paused_at: string | null;
  resumed_at: string | null;
  status: "working" | "paused" | "completed";
  created_by: string;
  business_day: string; // YYYY-MM-DD
}

export interface Room {
  id: string;
  code: string; // S01-S15, W1, PUB
  room_type: "service" | "waiting" | "public";
  status: RoomStatus;
  updated_at: string;
  updated_by: string | null;
}

export interface Member {
  id: string;
  code: string; // 4-digit zero-padded
  display_name: string;
  phone: string | null;
  contact_other: string | null;
  tier: MemberTier;
  principal_cents: number;
  reward_cents: number;
  annual_fee_paid: boolean;
  annual_fee_expires_at: string | null;
  notes: string | null;
  created_at: string;
  created_by: string | null;
}

export interface MemberTransaction {
  id: string;
  member_id: string;
  member?: Member;
  tx_type: TransactionType;
  principal_delta: number; // cents, positive=credit, negative=debit
  reward_delta: number; // cents
  order_id: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_no: string; // ON-YYYYMMDD-NNNN
  business_day: string; // YYYY-MM-DD
  member_id: string | null;
  member?: Member | null;
  is_new_customer: boolean;
  technician_id: string;
  technician?: Technician;
  room_id: string;
  room?: Room;
  staff_id: string;
  package_key: PackageKey;
  duration_minutes: number;
  total_cents: number;
  commission_cents: number; // technician 60%
  agent_id: string | null; // hidden from staff
  agent_commission_cents: number; // hidden from staff
  principal_used_cents: number;
  reward_used_cents: number;
  cash_paid_cents: number;
  payment_method: PaymentMethod;
  status: OrderStatus;
  note: string | null;
  created_at: string;
  paid_at: string | null;
  voided_by: string | null;
  void_reason: string | null;
  voided_at: string | null;
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
}

// ============================================================
// Dashboard / Report Types
// ============================================================

export interface DailyReport {
  business_day: string;
  total_revenue_cents: number;
  order_count: number;
  new_customer_count: number;
  member_order_count: number;
  cash_revenue_cents: number;
  member_revenue_cents: number;
  tech_commission_cents: number;
  agent_commission_cents: number;
  net_revenue_cents: number;
}

export interface TechnicianCommissionReport {
  technician_id: string;
  technician_name: string;
  technician_code: string;
  order_count: number;
  total_service_cents: number;
  commission_cents: number;
}

export interface AgentCommissionReport {
  agent_id: string;
  agent_name: string;
  order_count: number;
  total_commission_cents: number;
  technicians: {
    technician_id: string;
    technician_name: string;
    order_count: number;
    commission_cents: number;
  }[];
}

export interface DailyTrafficPoint {
  date: string;
  orders: number;
  revenue: number;
}

// ============================================================
// Form Types
// ============================================================

export interface OrderFormData {
  package_key: PackageKey;
  duration_minutes: number;
  technician_id: string;
  room_id: string;
  member_id: string | null;
  payment_method: PaymentMethod;
  note: string;
}

export interface MemberFormData {
  display_name: string;
  phone: string;
  contact_other: string;
  tier: MemberTier;
  notes: string;
}

export interface TopupFormData {
  member_id: string;
  amount: number;
  account: "principal" | "reward";
  note: string;
}

export interface AgentFormData {
  name: string;
  bio: string;
  contact: AgentContact;
  default_commission: number;
}
