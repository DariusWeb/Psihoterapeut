// Shared by every handler, so a field is capped and trimmed the same way whichever form it
// arrived on. The browser's own validation is a convenience, not a check.

export const LIMITS = { email: 254, name: 100, phone: 40, message: 5000, consentText: 500, pageUrl: 500 }

export function cleanString(value, max) {
    return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

// Deliberately permissive — the authoritative check is Brevo's double opt-in, not a regex.
export function isEmail(value) {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)
}
