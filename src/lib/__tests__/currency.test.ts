import { formatCurrency, formatCurrencyInput, parseCurrencyInput, validateCurrencyInput } from '../currency'

describe('Currency Utilities', () => {
  describe('formatCurrency', () => {
    it('should format positive amounts with EUR currency and German locale', () => {
      const result = formatCurrency(123.45)
      expect(result).toContain('123,45')
      expect(result).toContain('€')
      expect(result).toMatch(/123,45\s*€/)
    })

    it('should format zero with proper decimal places', () => {
      const result = formatCurrency(0)
      expect(result).toContain('0,00')
      expect(result).toContain('€')
    })

    it('should format negative amounts correctly', () => {
      const result = formatCurrency(-50.99)
      expect(result).toContain('-50,99')
      expect(result).toContain('€')
    })

    it('should format large amounts with thousands separator', () => {
      const result = formatCurrency(1234.56)
      expect(result).toContain('1.234,56')
      expect(result).toContain('€')
    })

    it('should handle decimal precision and rounding', () => {
      const result1 = formatCurrency(10.1)
      expect(result1).toContain('10,10')
      
      const result2 = formatCurrency(10.999)
      expect(result2).toContain('11,00') // Should round
    })
  })

  describe('formatCurrencyInput', () => {
    it('should clean non-numeric characters', () => {
      expect(formatCurrencyInput('abc123.45def')).toBe('123.45')
    })

    it('should handle German decimal separator', () => {
      expect(formatCurrencyInput('123,45')).toBe('123.45')
    })

    it('should limit decimal places to 2', () => {
      expect(formatCurrencyInput('123.456')).toBe('123.46')
    })

    it('should return empty string for invalid input', () => {
      expect(formatCurrencyInput('abc')).toBe('')
      expect(formatCurrencyInput('')).toBe('')
    })

    it('should handle mixed separators', () => {
      expect(formatCurrencyInput('1.234,56')).toBe('1234.56')
    })
  })

  describe('parseCurrencyInput', () => {
    it('should parse valid currency strings', () => {
      expect(parseCurrencyInput('123.45')).toBe(123.45)
      expect(parseCurrencyInput('123,45')).toBe(123.45)
    })

    it('should remove currency symbols', () => {
      expect(parseCurrencyInput('€123.45')).toBe(123.45)
      expect(parseCurrencyInput('123.45 €')).toBe(123.45)
    })

    it('should return 0 for invalid input', () => {
      expect(parseCurrencyInput('abc')).toBe(0)
      expect(parseCurrencyInput('')).toBe(0)
    })

    it('should handle negative amounts', () => {
      expect(parseCurrencyInput('-123.45')).toBe(-123.45)
    })
  })

  describe('validateCurrencyInput', () => {
    it('should validate positive amounts', () => {
      expect(validateCurrencyInput('123.45')).toBe(true)
      expect(validateCurrencyInput('0')).toBe(true)
    })

    it('should reject negative amounts', () => {
      expect(validateCurrencyInput('-123.45')).toBe(false)
    })

    it('should reject amounts over limit', () => {
      expect(validateCurrencyInput('1000000')).toBe(false)
    })

    it('should accept amounts at limit', () => {
      expect(validateCurrencyInput('999999.99')).toBe(true)
    })

    it('should reject invalid input', () => {
      expect(validateCurrencyInput('abc')).toBe(false)
    })
  })
})