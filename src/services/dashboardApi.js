import { idToken } from '@/services/auth'

const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT

// Every dashboard call carries the signed-in user's ID token; the Worker re-verifies it
// against Google and its own allowlist, so nothing here is trusted on the client's word.
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
