/**
 * Currency formatting utilities for Euro (EUR) with German locale
 */

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatCurrencyInput(value: string): string {
  // Remove non-numeric characters except decimal separator
  const cleaned = value.replace(/[^\d,.-]/g, '')
  
  // Handle German decimal separator (comma)
  const normalized = cleaned.replace(',', '.')
  
  // Parse as float and limit to 2 decimal places
  const num = parseFloat(normalized)
  
  if (isNaN(num)) return ''
  
  return num.toFixed(2)
}

export function parseCurrencyInput(value: string): number {
  // Remove currency symbols and normalize decimal separator
  const cleaned = value.replace(/[€\s]/g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  
  return isNaN(num) ? 0 : num
}

export function validateCurrencyInput(value: string): boolean {
  const num = parseCurrencyInput(value)
  return num >= 0 && num <= 999999.99 // Reasonable limits for teen budget
}