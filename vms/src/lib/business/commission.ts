// Technician commission: 60% of total order
export const TECH_COMMISSION_RATE = 0.6;

export function calcTechCommission(totalCents: number): number {
  return Math.round(totalCents * TECH_COMMISSION_RATE);
}

export function calcVenueShare(totalCents: number): number {
  return totalCents - calcTechCommission(totalCents);
}

// VIP cashback: $10 per $200 spent
export const CASHBACK_THRESHOLD_CENTS = 20000; // $200
export const CASHBACK_REWARD_CENTS = 1000; // $10

export function calcVipCashback(totalCents: number): number {
  const steps = Math.floor(totalCents / CASHBACK_THRESHOLD_CENTS);
  return steps * CASHBACK_REWARD_CENTS;
}

// Member balance deduction: principal first, then reward
export interface DeductionResult {
  principal_deducted: number;
  reward_deducted: number;
  cash_required: number;
  sufficient: boolean;
}

export function calcMemberDeduction(
  totalCents: number,
  principalCents: number,
  rewardCents: number
): DeductionResult {
  const principalDeducted = Math.min(principalCents, totalCents);
  const remaining = totalCents - principalDeducted;
  const rewardDeducted = Math.min(rewardCents, remaining);
  const cashRequired = remaining - rewardDeducted;

  return {
    principal_deducted: principalDeducted,
    reward_deducted: rewardDeducted,
    cash_required: cashRequired,
    sufficient: cashRequired === 0,
  };
}

// Annual fee amounts
export const STANDARD_ANNUAL_FEE_CENTS = 5000; // $50
export const VIP_PRECHARGE_CENTS = 1000000; // $10,000
export const BOARD_PRECHARGE_CENTS = 10000000; // $100,000

// Default agent commission
export const DEFAULT_AGENT_COMMISSION_CENTS = 2000; // $20
