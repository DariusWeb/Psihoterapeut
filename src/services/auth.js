import { ref } from 'vue'

// Public by design, like the Turnstile sitekey: these identify the project, they do not
// grant anything. Access is decided by the Worker against a uid allowlist.
const CONFIG = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
}

export const authUser = ref(null)
export const authReady = ref(false)

let auth = null

// Imported on demand so the SDK (~34KB gzipped) ships only to the dashboard route,
// and a visitor who never opens it downloads none of it.
async function getAuth() {
	if (auth) return auth

	const [{ initializeApp, getApps }, firebaseAuth] = await Promise.all([
		import('firebase/app'),
		import('firebase/auth')
	])

	const app = getApps()[0] ?? initializeApp(CONFIG)
	auth = firebaseAuth.getAuth(app)
	auth.useDeviceLanguage()

	return auth
}

export function isAuthConfigured() {
	return Boolean(CONFIG.apiKey && CONFIG.authDomain && CONFIG.projectId)
}

export async function watchAuth() {
	if (!isAuthConfigured()) {
		authReady.value = true
		return
	}

	const [instance, { onAuthStateChanged }] = await Promise.all([getAuth(), import('firebase/auth')])

	onAuthStateChanged(instance, (user) => {
		authUser.value = user
		authReady.value = true
	})
}

export async function signIn() {
	const [instance, { GoogleAuthProvider, signInWithPopup }] = await Promise.all([
		getAuth(),
		import('firebase/auth')
	])

	await signInWithPopup(instance, new GoogleAuthProvider())
}

export async function signOutUser() {
	const [instance, { signOut }] = await Promise.all([getAuth(), import('firebase/auth')])
	await signOut(instance)
}

// Refreshed automatically when the hour-long token is close to expiring.
export async function idToken() {
	return authUser.value ? authUser.value.getIdToken() : null
}
