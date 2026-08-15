// Prices come from the Worker, never from the bundle. That is what makes the price on screen and
// the price Stripe charges the same number by construction — there is nothing here to edit.

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
		// A missing price hides the buy button. Guessing one would put a figure on screen that
		// the checkout does not honour, which is worse than showing nothing.
		.catch(() => {})
		.finally(() => (pending = null))

	return pending
}

export const priceOf = (key) => catalogue.value?.[key] ?? null

export const formatPrice = ({ amount }) => priceFormat.format(amount / 100)

// The Worker asks Stripe whether this session really was paid. Landing on the success URL
// proves nothing on its own — anyone can type it.
export async function verifyPayment(sessionId) {
	const response = await fetch(`${ENDPOINT}/resources/access?session_id=${encodeURIComponent(sessionId)}`)
	if (!response.ok) return null

	const data = await response.json()
	return data.ok ? data : null
}
