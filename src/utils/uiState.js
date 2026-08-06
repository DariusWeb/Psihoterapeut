// Deters casual copying only. The prose is decoded into the DOM at runtime, so anyone with a
// console open can still read it — that is a ceiling of the platform, not a gap to be closed here.

const guardEnabled = import.meta.env.VITE_PROTECT_CONTENT === 'true'
const viewportWatchEnabled = import.meta.env.VITE_PROTECT_DEVTOOLS === 'true'

const COPYABLE = '.u-text, input, textarea, select, [contenteditable]'
const SILENCED_CONSOLE_METHODS = ['log', 'warn', 'error', 'info', 'debug', 'table', 'dir']
const VEIL = 'blur(0.5rem)'

function preventOnImages(event) {
	if (event.target.closest('img')) event.preventDefault()
}

function preventCopyOutsideExemptions(event) {
	if (!event.target.closest?.(COPYABLE)) event.preventDefault()
}

function preventViewSourceAndDevtoolsKeys(event) {
	const key = event.key.toUpperCase()
	const opensDevtools = event.ctrlKey && event.shiftKey && ['I', 'J', 'C'].includes(key)
	const viewsOrSavesSource = event.ctrlKey && !event.shiftKey && (key === 'U' || key === 'S')

	if (event.key === 'F12' || opensDevtools || viewsOrSavesSource) event.preventDefault()
}

// ponytail: docked-devtools heuristic. Undocked panels are invisible to it and the dpr correction
// makes it under-detect on high-DPI screens — deliberate, since a false positive hits a real visitor.
function watchViewportRatio() {
	const root = document.documentElement
	let veiled = false

	const applyVeil = () => {
		if (veiled && root.style.filter !== VEIL) root.style.setProperty('filter', VEIL, 'important')
		if (!veiled && root.style.filter) root.style.removeProperty('filter')
	}

	// Re-asserts the veil, so clearing the rule in the styles panel does not survive the next tick.
	new MutationObserver(applyVeil).observe(root, { attributeFilter: ['style'] })

	const measure = () => {
		const scale = window.devicePixelRatio || 1
		veiled =
			window.outerWidth - window.innerWidth * scale > 160 ||
			window.outerHeight - window.innerHeight * scale > 160
		applyVeil()
	}

	window.addEventListener('resize', measure)
	measure()
}

export function initUiState() {
	if (!guardEnabled) return

	// Gates the stylesheet off the same flag, so one variable controls CSS and JS together.
	document.documentElement.classList.add('ui-ready')

	document.addEventListener('contextmenu', preventOnImages)
	document.addEventListener('dragstart', preventOnImages)
	document.addEventListener('copy', preventCopyOutsideExemptions)
	document.addEventListener('keydown', preventViewSourceAndDevtoolsKeys)

	for (const method of SILENCED_CONSOLE_METHODS) {
		console[method] = () => {}
	}

	if (viewportWatchEnabled) watchViewportRatio()
}
