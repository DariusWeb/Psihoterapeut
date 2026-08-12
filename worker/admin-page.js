// Served by the Worker, never built into the site — the public bundle carries no admin code.
// Cloudflare Access gates the route itself; the token below is the second layer.

export const adminPage = () => `<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Anunț live</title>
<style>
  :root { color-scheme: light dark; }
  body { font: 16px/1.5 system-ui, sans-serif; max-width: 32rem; margin: 0 auto; padding: 1.5rem; }
  h1 { font-size: 1.25rem; }
  label { display: block; margin-top: .85rem; font-weight: 600; font-size: .85rem; }
  input, select { width: 100%; padding: .6rem; margin-top: .25rem; font: inherit;
    border: 1px solid currentColor; border-radius: .375rem; background: transparent; color: inherit; }
  .row { display: flex; gap: .75rem; }
  .row > div { flex: 1; }
  .actions { display: flex; gap: .75rem; margin-top: 1.25rem; }
  button { flex: 1; padding: .8rem; font: inherit; font-weight: 600; cursor: pointer;
    border: 1px solid currentColor; border-radius: .375rem; }
  .go { background: #15803d; color: #fff; border-color: #15803d; }
  .stop { background: transparent; }
  #state { margin: 1rem 0 0; padding: .75rem; border-radius: .375rem; background: rgb(128 128 128 / 15%); }
  #result:not(:empty) { margin-top: 1rem; padding: .75rem; border-radius: .375rem;
    background: rgb(128 128 128 / 15%); }
</style>
</head>
<body>
<h1>Anunț live</h1>
<p id="state">Se încarcă…</p>

<form id="form">
  <label>Parolă <input type="password" id="token" autocomplete="current-password" required></label>
  <label>Titlu <input id="title" maxlength="80" required placeholder="Sunt live acum pe YouTube"></label>
  <label>Text <input id="text" maxlength="200" placeholder="Vorbim despre anxietate la copii"></label>
  <div class="row">
    <div><label>Buton <input id="ctaLabel" maxlength="40" placeholder="Vezi acum"></label></div>
    <div><label>Platformă <select id="platform">
      <option value="youtube">YouTube</option>
      <option value="linkedin">LinkedIn</option>
      <option value="instagram">Instagram</option>
      <option value="facebook">Facebook</option>
      <option value="other">Altceva</option>
    </select></label></div>
  </div>
  <label>Link (https://) <input id="url" type="url" maxlength="500" placeholder="https://youtube.com/live/..."></label>
  <div class="row">
    <div><label>Întârziere <select id="delayMinutes">
      <option value="0">Imediat</option>
      <option value="10">Peste 10 min</option>
      <option value="20">Peste 20 min</option>
      <option value="30">Peste 30 min</option>
    </select></label></div>
    <div><label>Durată <select id="durationMinutes">
      <option value="30">30 min</option>
      <option value="60">1 oră</option>
      <option value="120" selected>2 ore</option>
      <option value="240">4 ore</option>
      <option value="0">Până îl opresc</option>
    </select></label></div>
  </div>
  <div class="actions">
    <button type="submit" class="go">SUNT LIVE</button>
    <button type="button" class="stop" id="stop">OPREȘTE</button>
  </div>
</form>

<p id="result"></p>

<script>
const $ = (id) => document.getElementById(id)
// Fields persist so a go-live is "paste the link, press the button"; the token is
// session-only, so closing the browser drops it.
const FIELDS = ['title', 'text', 'ctaLabel', 'platform', 'url', 'delayMinutes', 'durationMinutes']
const say = (message) => { $('result').textContent = message }

for (const id of FIELDS) {
  const saved = localStorage.getItem('live-form-' + id)
  if (saved !== null) $(id).value = saved
}
$('token').value = sessionStorage.getItem('live-token') ?? ''

let current = { state: 'none' }

async function refresh() {
  const token = $('token').value
  if (!token) {
    current = { state: 'unknown' }
    $('state').textContent = 'Introdu parola pentru a vedea starea curentă.'
    return
  }

  try {
    const res = await fetch('/live/admin/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })

    if (res.status === 403) {
      current = { state: 'unknown' }
      $('state').textContent = 'Parolă greșită.'
      return
    }

    current = await res.json()
    $('state').textContent =
      current.state === 'live' ? '🔴 Activ acum: ' + current.announcement.title
      : current.state === 'scheduled'
        ? '⏳ Programat, apare peste ~' + current.minutesUntilVisible + ' min: ' + current.announcement.title
        : '⚪ Niciun anunț activ.'
  } catch {
    current = { state: 'unknown' }
    $('state').textContent = 'Nu am putut citi starea curentă.'
  }
}

// The trap worth catching: replacing a scheduled announcement destroys one that nobody
// has seen yet, and silently pushes the message later than intended.
function confirmReplace() {
  if (current.state === 'scheduled') {
    return confirm('Un anunț este deja programat și încă nu a apărut (peste ~' +
      current.minutesUntilVisible + ' min).\\n\\nÎl înlocuiești? Cel programat se pierde.')
  }
  if (current.state === 'live') {
    return confirm('Un anunț este activ acum.\\n\\nÎl înlocuiești?')
  }
  // State unreadable — ask rather than silently clobber something that may be scheduled.
  if (current.state === 'unknown') {
    return confirm('Nu am putut verifica dacă există deja un anunț.\\n\\nContinui oricum?')
  }
  return true
}

async function send(payload, pending) {
  const token = $('token').value
  if (!token) return say('Introdu parola.')

  say(pending)
  try {
    const res = await fetch('/live', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, ...payload })
    })
    const data = await res.json()

    if (!data.ok) return say('Eroare: ' + (data.error ?? res.status))

    sessionStorage.setItem('live-token', token)
    say(data.cleared ? 'Anunțul a fost oprit.'
      : data.startsAt > Date.now()
        ? 'Programat. Apare peste ~' + Math.ceil((data.startsAt - Date.now()) / 60000) + ' min.'
        : 'Publicat. Apare la toți vizitatorii în ~1 minut.')
    refresh()
  } catch {
    say('Nu am putut trimite. Verifică internetul.')
  }
}

$('form').addEventListener('submit', (event) => {
  event.preventDefault()
  if (!confirmReplace()) return

  const payload = {}
  for (const id of FIELDS) {
    payload[id] = $(id).value
    localStorage.setItem('live-form-' + id, $(id).value)
  }
  send(payload, 'Se publică…')
})

$('stop').addEventListener('click', () => send({ off: true }, 'Se oprește…'))
// input, not change: change only fires on blur, so the state stays stale while typing
let refreshTimer
$('token').addEventListener('input', () => {
  clearTimeout(refreshTimer)
  refreshTimer = setTimeout(refresh, 400)
})

refresh()
</script>
</body>
</html>`
