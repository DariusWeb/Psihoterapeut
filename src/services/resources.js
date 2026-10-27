// Prices come from the Worker, never the bundle, so the screen and Stripe charge the same number.

import { ref } from 'vue'

const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT

const priceFormat = new Intl.NumberFormat('ro-RO', {
	style: 'currency',
	currency: 'RON',
	maximumFractionDigits: 0
})

export const catalogue = ref(null)

let pending = null

export function loadCatalogue() {
	if (!ENDPOINT || catalogue.value) return
	if (pending) return pending

	pending = fetch(`${ENDPOINT}/resources/catalogue`)
		.then((response) => (response.ok ? response.json() : null))
		.then((data) => {
			if (data?.ok) catalogue.value = Object.fromEntries(data.resources.map((r) => [r.key, r]))
		})
		// A missing price hides the buy button; a guessed one wouldn't match what checkout charges.
		.catch(() => {})
		.finally(() => (pending = null))

	return pending
}

export const priceOf = (key) => catalogue.value?.[key] ?? null

export const formatPrice = ({ amount }) => priceFormat.format(amount / 100)

// Landing on the success URL proves nothing; the Worker asks Stripe whether it was paid.
export async function verifyPayment(sessionId) {
	const response = await fetch(`${ENDPOINT}/resources/access?session_id=${encodeURIComponent(sessionId)}`)
	if (!response.ok) return null

	const data = await response.json()
	return data.ok ? data : null
}
