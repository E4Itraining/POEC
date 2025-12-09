import { randomBytes, createHmac } from 'crypto'

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

// Generate a random base32 secret
export function generateSecret(length = 20): string {
  const buffer = randomBytes(length)
  let secret = ''

  for (let i = 0; i < buffer.length; i++) {
    secret += BASE32_CHARS[buffer[i] % 32]
  }

  return secret
}

// Decode base32 to buffer
function base32Decode(encoded: string): Buffer {
  const cleaned = encoded.toUpperCase().replace(/[^A-Z2-7]/g, '')
  const buffer = Buffer.alloc(Math.floor(cleaned.length * 5 / 8))

  let bits = 0
  let value = 0
  let index = 0

  for (const char of cleaned) {
    value = (value << 5) | BASE32_CHARS.indexOf(char)
    bits += 5

    if (bits >= 8) {
      buffer[index++] = (value >>> (bits - 8)) & 255
      bits -= 8
    }
  }

  return buffer
}

// Generate TOTP code
function generateTOTP(secret: string, counter: number): string {
  const key = base32Decode(secret)
  const buffer = Buffer.alloc(8)

  // Write counter as big-endian 64-bit integer
  for (let i = 7; i >= 0; i--) {
    buffer[i] = counter & 0xff
    counter = Math.floor(counter / 256)
  }

  const hmac = createHmac('sha1', key)
  hmac.update(buffer)
  const hash = hmac.digest()

  // Dynamic truncation
  const offset = hash[hash.length - 1] & 0xf
  const code = (
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff)
  ) % 1000000

  return code.toString().padStart(6, '0')
}

// Verify TOTP code with time window tolerance
export function verifyTOTP(secret: string, token: string, window = 1): boolean {
  const counter = Math.floor(Date.now() / 30000)

  // Check current time slot and surrounding windows
  for (let i = -window; i <= window; i++) {
    const expectedToken = generateTOTP(secret, counter + i)
    if (token === expectedToken) {
      return true
    }
  }

  return false
}

// Generate current TOTP (for testing/display)
export function getCurrentTOTP(secret: string): string {
  const counter = Math.floor(Date.now() / 30000)
  return generateTOTP(secret, counter)
}

// Generate backup codes
export function generateBackupCodes(count = 10): string[] {
  const codes: string[] = []

  for (let i = 0; i < count; i++) {
    const bytes = randomBytes(4)
    const code = bytes.toString('hex').toUpperCase()
    // Format: XXXX-XXXX
    codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`)
  }

  return codes
}

// Generate otpauth URL for QR code
export function generateOtpauthURL(
  secret: string,
  email: string,
  issuer = 'Erythix Campus'
): string {
  const encodedIssuer = encodeURIComponent(issuer)
  const encodedEmail = encodeURIComponent(email)

  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`
}

// Hash backup code for storage
export function hashBackupCode(code: string): string {
  const hmac = createHmac('sha256', process.env.NEXTAUTH_SECRET || 'fallback-secret')
  hmac.update(code.toUpperCase().replace(/-/g, ''))
  return hmac.digest('hex')
}

// Verify backup code
export function verifyBackupCode(inputCode: string, hashedCodes: string[]): { valid: boolean; index: number } {
  const inputHash = hashBackupCode(inputCode)
  const index = hashedCodes.indexOf(inputHash)

  return {
    valid: index !== -1,
    index
  }
}

// Generate QR code data URL (using a simple SVG-based approach)
export function generateQRCodeSVG(data: string, size = 200): string {
  // This is a simplified QR code generator
  // In production, use a proper library like 'qrcode'
  // For now, we'll return the URL that can be used with an external QR service
  const encodedData = encodeURIComponent(data)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}`
}

export interface TwoFactorSetupData {
  secret: string
  backupCodes: string[]
  otpauthUrl: string
  qrCodeUrl: string
}

// Complete 2FA setup helper
export function setupTwoFactor(email: string): TwoFactorSetupData {
  const secret = generateSecret()
  const backupCodes = generateBackupCodes()
  const otpauthUrl = generateOtpauthURL(secret, email)
  const qrCodeUrl = generateQRCodeSVG(otpauthUrl)

  return {
    secret,
    backupCodes,
    otpauthUrl,
    qrCodeUrl
  }
}
