import { type Addon } from "@/types";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(amount);
}

export function formatPricing(pricing: Addon['pricing']): string {
  if (pricing.type === 'inquire') {
    return 'Inquire';
  }

  const prefix = pricing.type === 'monthly' ? '/month' : ' one-time';
  return `${formatCurrency(pricing.amount!)}${prefix}`;
}