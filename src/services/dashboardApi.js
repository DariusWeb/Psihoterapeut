import { idToken } from '@/services/auth'

const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT

// The Worker re-verifies this ID token against Google and its allowlist; nothing here is trusted.
async function request(path, options = {}) {
	const token = await idToken()
	if (!token) throw new Error('not_signed_in')

	const response = await fetch(`${ENDPOINT}${path}`, {
		...options,
		headers: {
			...options.headers,
			Authorization: `Bearer ${token}`
		}
	})

	const data = await response.json().catch(() => ({}))

	if (!response.ok) throw new Error(data.error ?? `request_failed_${response.status}`)

	return data
}

export const fetchLiveState = () => request('/live/state', { method: 'POST' })

export const publishLive = (announcement) =>
	request('/live', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(announcement)
	})

export const clearLive = () =>
	request('/live', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ off: true })
	})
