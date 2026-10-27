const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

// Hides el's children until its top crosses 80% of the view, then plays their entrance once.
// Without playOnScreen, content already on screen at the first check stays still.
function revealOnce(el, playOnScreen) {
	let firstCheck = true
	const observer = new IntersectionObserver(([entry]) => {
		const onScreen = entry.isIntersecting || (firstCheck && entry.boundingClientRect.top < window.innerHeight)
		if (!onScreen) {
			el.classList.add('reveal')
		} else {
			if (playOnScreen || !firstCheck) el.classList.add('revealed')
			observer.disconnect()
		}
		firstCheck = false
	}, { rootMargin: '0px 0px -20% 0px' })
	observer.observe(el)
	return observer
}

// v-reveal: children glide in · v-reveal:cards: cards are set down · v-reveal:sections: on the page root.
export const reveal = {
	mounted(el, { arg }) {
		if (reducedMotion.matches) return
		if (arg === 'sections') {
			el._revealObservers = [...el.children].map((section) =>
				revealOnce(section.childElementCount === 1 ? section.firstElementChild : section, false))
			return
		}
		el.classList.add('reveal')
		if (arg === 'cards') el.classList.add('reveal-cards')
		el._revealObservers = [revealOnce(el, true)]
	},
	unmounted(el) {
		el._revealObservers?.forEach((observer) => observer.disconnect())
	},
}
