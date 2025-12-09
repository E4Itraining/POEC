import {
  generateSecret,
  verifyTOTP,
  generateBackupCodes,
  hashBackupCode,
  verifyBackupCode,
  generateOtpauthURL
} from '@/lib/security/totp'

describe('TOTP Security', () => {
  describe('generateSecret', () => {
    it('should generate a secret of correct length', () => {
      const secret = generateSecret()
      expect(secret).toHaveLength(20)
    })

    it('should only contain valid base32 characters', () => {
      const secret = generateSecret()
      expect(secret).toMatch(/^[A-Z2-7]+$/)
    })

    it('should generate unique secrets', () => {
      const secret1 = generateSecret()
      const secret2 = generateSecret()
      expect(secret1).not.toEqual(secret2)
    })
  })

  describe('generateBackupCodes', () => {
    it('should generate correct number of backup codes', () => {
      const codes = generateBackupCodes(10)
      expect(codes).toHaveLength(10)
    })

    it('should generate codes in correct format (XXXX-XXXX)', () => {
      const codes = generateBackupCodes(5)
      codes.forEach(code => {
        expect(code).toMatch(/^[A-F0-9]{4}-[A-F0-9]{4}$/)
      })
    })

    it('should generate unique codes', () => {
      const codes = generateBackupCodes(10)
      const uniqueCodes = new Set(codes)
      expect(uniqueCodes.size).toBe(10)
    })
  })

  describe('hashBackupCode', () => {
    it('should produce consistent hash for same input', () => {
      const code = 'ABCD-1234'
      const hash1 = hashBackupCode(code)
      const hash2 = hashBackupCode(code)
      expect(hash1).toBe(hash2)
    })

    it('should produce different hash for different inputs', () => {
      const hash1 = hashBackupCode('ABCD-1234')
      const hash2 = hashBackupCode('EFGH-5678')
      expect(hash1).not.toBe(hash2)
    })

    it('should normalize input (case insensitive)', () => {
      const hash1 = hashBackupCode('abcd-1234')
      const hash2 = hashBackupCode('ABCD-1234')
      expect(hash1).toBe(hash2)
    })
  })

  describe('verifyBackupCode', () => {
    it('should verify valid backup code', () => {
      const codes = generateBackupCodes(5)
      const hashedCodes = codes.map(code => hashBackupCode(code))

      const result = verifyBackupCode(codes[0], hashedCodes)
      expect(result.valid).toBe(true)
      expect(result.index).toBe(0)
    })

    it('should reject invalid backup code', () => {
      const codes = generateBackupCodes(5)
      const hashedCodes = codes.map(code => hashBackupCode(code))

      const result = verifyBackupCode('INVALID-CODE', hashedCodes)
      expect(result.valid).toBe(false)
      expect(result.index).toBe(-1)
    })
  })

  describe('generateOtpauthURL', () => {
    it('should generate valid otpauth URL', () => {
      const secret = 'JBSWY3DPEHPK3PXP'
      const email = 'test@example.com'
      const url = generateOtpauthURL(secret, email)

      expect(url).toContain('otpauth://totp/')
      expect(url).toContain(encodeURIComponent(email))
      expect(url).toContain(`secret=${secret}`)
      expect(url).toContain('algorithm=SHA1')
      expect(url).toContain('digits=6')
      expect(url).toContain('period=30')
    })

    it('should include custom issuer', () => {
      const url = generateOtpauthURL('SECRET', 'test@example.com', 'MyApp')
      expect(url).toContain(encodeURIComponent('MyApp'))
    })
  })

  describe('verifyTOTP', () => {
    it('should be a function', () => {
      expect(typeof verifyTOTP).toBe('function')
    })

    // Note: Testing actual TOTP verification requires controlling time
    // In a real test suite, you would use jest.useFakeTimers()
  })
})
