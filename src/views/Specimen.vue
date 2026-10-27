<script setup>
	// Dev-only kit page mirroring Design System v4, so the primitives are judged against the mock. Removed in redesign Phase 19.
	import { ref } from 'vue'
	import {
		ArrowRight, BadgeCheck, BatteryLow, Check, ChevronLeft, ChevronRight, CircleAlert, Clock, Heart,
		HeartHandshake, LifeBuoy, LoaderCircle, Mail, MessageCircle, Phone, RotateCcw, Search, ShieldCheck,
		Sprout, Unlink, UserRoundSearch,
	} from '@lucide/vue'
	import SegmentedControl from '@/components/common/SegmentedControl.vue'
	import infertilityCard from '@/assets/images/home/infertility-card.webp'
	import infertilityHero from '@/assets/images/services/infertility-hero.webp'
	import livingRoom from '@/assets/images/contact/contact-living-room.webp'

	const strip = [
		{ icon: Sprout, title: 'Fără judecată', text: 'Un spațiu sigur în care poți fi tu însăți.' },
		{ icon: Clock, title: 'În ritmul tău', text: 'Nu există presiunea de a „fi gata”.' },
		{ icon: HeartHandshake, title: 'Cu empatie', text: 'Te ajut să înțelegi ce trăiești.' },
		{ icon: ShieldCheck, title: 'Bazat pe dovezi', text: 'Abordare integrativă, cognitiv-comportamentală.' },
	]
	const rows = [
		{ icon: Phone, label: 'Telefon', value: '+40 700 000 000' },
		{ icon: Mail, label: 'Email', value: 'contact@andreeabutacu.ro' },
		{ icon: MessageCircle, label: 'WhatsApp', value: 'Scrie-mi pe WhatsApp' },
	]

	const name = ref('')
	const message = ref('')
	const mode = ref('online')
	const consent = ref(true)
	const modes = [{ value: 'online', label: 'Online' }, { value: 'cabinet', label: 'La cabinet' }]
	const formSpec = [
		['Field', '40 pill · paper · 1px #d9d1c2 · text 15 · label moves up 9px and scales to .72'],
		['Focus', 'Ring 3px #ccd3b9 and label in olive 700. Try the first field'],
		['Error', 'Border rose, ring 3px #eadde2, label rose 700'],
		['Message', 'The same field at radius 24, 120–148 high, text 16'],
		['Two options', 'A sliding segmented control, 34 inside a 3px stone track. Use a select only for 3+ options'],
	]
	const faq = [
		['Cum decurge prima ședință?', 'Prima întâlnire este despre cunoaștere. Vom vorbi despre ceea ce te-a adus în terapie, fără presiunea de a spune totul din prima.'],
		['Cât durează și cât costă o ședință?', 'O ședință durează 50 de minute. Prețul unei ședințe este de 250 lei.'],
		['Lucrezi online sau doar în București?', 'Ședințele pot avea loc atât în cabinet, în București, cât și online.'],
	]
	const revealRun = ref(0)
	const revealItems = [
		{ icon: BatteryLow, text: 'te simți epuizată' },
		{ icon: UserRoundSearch, text: 'nu te mai recunoști' },
		{ icon: Unlink, text: 'ai pierdut legătura cu tine' },
		{ icon: Heart, text: 'ai obosit să fii puternică' },
	]
</script>

<template>
	<div class="specimen">
		<section id="ds-07" class="specimen-section">
			<div class="specimen-head">
				<h2 class="specimen-title"><span class="specimen-number">07</span>Buttons and links</h2>
				<p class="specimen-intro">There is one primary button per block. The pair is always primary + outline. Buttons carry no icons, except "Replay" and the sign-out icon on the private dashboard.</p>
			</div>
			<div class="specimen-frame specimen-buttons">
				<div class="specimen-cell">
					<a href="#ds-07" class="button-primary">Programează o ședință</a>
					<span class="specimen-note">Primary · 40 · 0 20 · #5b6643 → #4a5337</span>
				</div>
				<div class="specimen-cell">
					<a href="#ds-07" class="button-outline">Scrie-mi un mesaj</a>
					<span class="specimen-note">Outline · inset 1.5 olive · hover tint</span>
				</div>
				<div class="specimen-cell">
					<span class="button-primary" aria-busy="true"><LoaderCircle :size="16" class="button-spinner" />Se trimite…</span>
					<span class="specimen-note">Busy · opacity .7 + spinner</span>
				</div>
				<div class="specimen-cell">
					<span class="button-primary button-full">Trimite mesajul</span>
					<span class="specimen-note">Submit · full width in forms</span>
				</div>
				<div class="specimen-cell">
					<a href="#ds-07" class="link-arrow">Află mai multe despre mine<ArrowRight :size="17" /></a>
					<span class="specimen-note">Arrow link · gap 6 → 10</span>
				</div>
				<div class="specimen-cell">
					<span class="card-action">
						Citește articolul
						<span class="card-action-icon"><ArrowRight :size="17" /></span>
						<span class="card-action-icon specimen-hovered"><ArrowRight :size="17" /></span>
					</span>
					<span class="specimen-note">Card action · 36 circle · rest → hover</span>
				</div>
				<div class="specimen-cell">
					<span class="specimen-pair">
						<button type="button" class="icon-button" aria-label="Înapoi"><ChevronLeft :size="18" /></button>
						<span class="icon-button icon-button-bare"><Search :size="18" /></span>
					</span>
					<span class="specimen-note">Icon button · bordered / bare · 40</span>
				</div>
				<div class="specimen-cell">
					<p class="text-body-s">Vezi <a href="#ds-07" class="text-link">Politica de confidențialitate</a>.</p>
					<span class="specimen-note">Inline link · olive 700 · underline offset 3</span>
				</div>
			</div>
		</section>

		<section id="ds-11" class="specimen-section">
			<div class="specimen-head">
				<h2 class="specimen-title"><span class="specimen-number">11</span>Forms and feedback</h2>
				<p class="specimen-intro">Every field uses a floating label, never a label and a placeholder together. Focus shows as a ring only. Errors put a rose ring on each field at fault and one rose block under the submit button.</p>
			</div>
			<div class="specimen-two specimen-top">
				<form class="form-panel" @submit.prevent>
					<div class="form-group">
						<input id="specimen-name" v-model="name" type="text" placeholder=" " />
						<label for="specimen-name">Prenume</label>
					</div>
					<div class="form-group">
						<input id="specimen-email" type="email" value="andreea@" readonly aria-invalid="true" placeholder=" " />
						<label for="specimen-email">Email</label>
					</div>
					<select aria-label="Mod">
						<option>Online</option>
						<option>La cabinet</option>
						<option>Oricare</option>
					</select>
					<div class="form-group">
						<textarea id="specimen-message" v-model="message" placeholder=" "></textarea>
						<label for="specimen-message">Mesaj</label>
					</div>
					<SegmentedControl v-model="mode" label="Cum preferi să ne vedem" :options="modes" />
					<div class="checkbox-field">
						<input id="specimen-consent" v-model="consent" type="checkbox" />
						<label for="specimen-consent">Am citit și sunt de acord cu <a href="#ds-11" class="text-link">politica de confidențialitate</a>.</label>
					</div>
					<button type="button" class="button-primary button-full">Trimite mesajul</button>
					<p class="form-note">Datele tale rămân confidențiale.</p>
				</form>
				<div class="specimen-column">
					<div class="specimen-spec">
						<p v-for="row in formSpec" :key="row[0]"><b>{{ row[0] }}</b><span>{{ row[1] }}</span></p>
					</div>
					<div class="alert" role="status">
						<span class="alert-icon"><Check :size="17" /></span>
						<p class="alert-text">Mulțumesc pentru mesaj. L-am primit și voi reveni în cel mai scurt timp.</p>
					</div>
					<div class="alert alert-error" role="alert">
						<span class="alert-icon"><CircleAlert :size="17" /></span>
						<p class="alert-text">Te rog completează câmpurile marcate.</p>
					</div>
					<aside class="crisis-note" role="note">
						<span class="crisis-note-icon"><LifeBuoy :size="20" /></span>
						<div class="crisis-note-body">
							<h3 class="crisis-note-title">Dacă ești în criză</h3>
							<p class="crisis-note-text">Sună la <a href="tel:112">112</a> sau la linia antisuicid <a href="tel:0800801200">0800 801 200</a>.</p>
						</div>
					</aside>
					<p class="status-line">
						<LoaderCircle :size="14" class="button-spinner" />
						Se încarcă orele disponibile…
						<span class="specimen-aside">(the status line; skeletons use sand blocks)</span>
					</p>
				</div>
			</div>
		</section>

		<section id="ds-12" class="specimen-section">
			<div class="specimen-head">
				<h2 class="specimen-title"><span class="specimen-number">12</span>Cards</h2>
				<p class="specimen-intro">Home v5's article card is the reference. Radius 28, the image runs edge to edge, and the body is 22 26 26. When the whole card is a link, the action sits bottom right, above a hairline. The arrow circle fills olive on hover and never moves.</p>
			</div>
			<div class="specimen-cards">
				<a href="#ds-12" class="paper-card paper-card-link">
					<img :src="infertilityCard" alt="Vază cu flori uscate pe o masă rotundă de lemn" class="paper-card-media" width="800" height="533">
					<div class="paper-card-body">
						<h3 class="paper-card-title">În fața infertilității</h3>
						<p class="paper-card-text">Când fiecare lună pare să înceapă cu speranță și să se termine cu o nouă pierdere.</p>
						<div class="paper-card-footer">
							<span class="card-action">Află mai mult<span class="card-action-icon"><ArrowRight :size="17" /></span></span>
						</div>
					</div>
				</a>
				<article class="paper-card">
					<div role="img" aria-label="Copertă ghid" class="paper-card-media specimen-cover"><span>guide cover</span></div>
					<div class="paper-card-body">
						<h3 class="paper-card-title">Primele luni după naștere</h3>
						<p class="paper-card-text">Un ghid pentru zilele în care nu te mai recunoști.</p>
						<div class="paper-card-footer">
							<span class="paper-card-price">149 lei</span>
							<button type="button" class="button-primary">Cumpără ghidul</button>
						</div>
					</div>
				</article>
				<a href="#ds-12" class="all-tile">
					<h3 class="paper-card-title">Toate articolele</h3>
					<p class="all-tile-text">Despre infertilitate, maternitate, carieră și emoțiile care vin odată cu ele.</p>
					<span class="card-action">Vezi toate articolele<span class="card-action-icon"><ArrowRight :size="17" /></span></span>
				</a>
			</div>
		</section>

		<section id="ds-13" class="specimen-section">
			<div class="specimen-head">
				<h2 class="specimen-title"><span class="specimen-number">13</span>Headings, lists and section patterns</h2>
				<p class="specimen-intro">These are the building blocks every band is made from.</p>
			</div>
			<div class="specimen-two">
				<div class="specimen-frame statement specimen-panel">
					<nav aria-label="Breadcrumb" class="breadcrumb">
						<a href="#ds-13">Pentru tine</a>
						<ChevronRight :size="14" />
						<span aria-current="page">Infertilitate</span>
					</nav>
					<h1 class="statement-title">Nu trebuie să aștepți să îți fie mai greu.</h1>
					<p class="text-lead">Poate fi suficient faptul că simți că ai obosit să duci totul singură.</p>
					<p class="heart-line">Sunt aici să te ascult, să te înțeleg și să te însoțesc cu blândețe.</p>
					<span class="specimen-note">Statement: breadcrumb (service pages) → H1 → hairline 72 × 1.5 → lead → actions → heart line (always rose)</span>
				</div>
				<div class="specimen-frame specimen-panel">
					<h2 class="section-title">Despre parcursul meu</h2>
					<ul class="icon-list">
						<li class="icon-list-item"><BadgeCheck :size="17" />Membră a Colegiului Psihologilor din România</li>
						<li class="icon-list-item"><BadgeCheck :size="17" />Reproductive Mental Health Specialist</li>
						<li class="icon-list-item"><Clock :size="17" />O ședință durează 50 de minute.</li>
					</ul>
					<div>
						<p class="quote-row">„Nu mă mai recunosc.”</p>
						<p class="quote-row">„Toată lumea pare să meargă înainte.”</p>
					</div>
					<span class="specimen-note">H2 with the leaf (22, top 6.5) · icon list: badge-check for credentials, a matching Lucide icon for facts (17, text 15, gap 10) · quotes in hairline rows</span>
				</div>
			</div>
			<div class="specimen-sand specimen-strip">
				<div class="strip">
					<div v-for="item in strip" :key="item.title" class="strip-item">
						<component :is="item.icon" :size="22" />
						<h3 class="text-strip-title">{{ item.title }}</h3>
						<p class="strip-text">{{ item.text }}</p>
					</div>
				</div>
				<span class="specimen-note">Strip: icon + title rule, 4 columns, 1px hairlines, 28 inset. Used for "Cum lucrez", the Contact strip and "Ce se pierde"</span>
			</div>
			<div class="specimen-two">
				<div class="specimen-sand specimen-rows">
					<a v-for="row in rows" :key="row.label" href="#ds-13" class="hover-row">
						<span class="hover-row-label"><component :is="row.icon" :size="17" />{{ row.label }}</span>
						<span class="hover-row-value">{{ row.value }}</span>
					</a>
					<span class="specimen-note specimen-rows-note">Hover rows (Contact): 20 radius, paper on hover, no arrows</span>
				</div>
				<div class="help-card">
					<div class="help-card-head">
						<span class="help-card-icon"><MessageCircle :size="17" /></span>
						<span>Nu ai găsit răspunsul?</span>
						<p class="help-card-text">Scrie-mi întrebarea ta. Îți răspund în maximum 48 de ore.</p>
					</div>
					<a href="#ds-13" class="link-arrow">Trimite o întrebare<ArrowRight :size="17" /></a>
					<span class="specimen-note">Help card: 24 radius, 24 padding, a 32 paper icon circle, then an arrow link</span>
				</div>
			</div>
		</section>

		<section id="ds-15" class="specimen-section">
			<div class="specimen-head">
				<h2 class="specimen-title"><span class="specimen-number">15</span>FAQ and long documents</h2>
				<p class="specimen-intro">The FAQ is a hairline list where the plus turns into a minus. Legal pages use the pinned contents list this page uses on the left: an olive marker slides to the section you are reading, and numbers hang in the margin.</p>
			</div>
			<div class="specimen-faq-legal">
				<div class="faq-list">
					<details v-for="(item, index) in faq" :key="item[0]" name="specimen-faq" class="faq-item" :open="index === 0">
						<summary class="faq-question">{{ item[0] }}<span class="faq-icon" aria-hidden="true"></span></summary>
						<p class="faq-answer">{{ item[1] }}</p>
					</details>
				</div>
				<div class="specimen-legal">
					<div class="legal-section">
						<h3 class="legal-title"><span class="legal-number">01</span>Cine este responsabil</h3>
						<p>Operatorul datelor tale personale este Andreea Butacu, cu sediul în București.</p>
						<div class="hairline-rows">
							<p class="hairline-row"><b>Programări.</b> Păstrate cât durează relația terapeutică.</p>
							<p class="hairline-row"><b>Newsletter.</b> Până te dezabonezi. Cheia <code>ab_consent</code> rămâne în browser.</p>
						</div>
					</div>
					<span class="specimen-note">Section 40 / 40 · H3 22 · number 600 13 olive 400, 48 into the margin · hairline rows with bold leads · code chip on stone</span>
				</div>
			</div>
		</section>

		<section id="reveal" class="specimen-section">
			<div class="specimen-sand specimen-reveal">
				<div class="specimen-reveal-head">
					<b>Reveal, live</b>
					<button type="button" class="button-outline" @click="revealRun++"><RotateCcw :size="16" />Replay</button>
				</div>
				<div :key="revealRun" v-reveal class="specimen-reveal-grid">
					<div v-for="item in revealItems" :key="item.text" class="specimen-reveal-item">
						<span class="specimen-reveal-icon"><component :is="item.icon" :size="22" /></span>
						<span class="text-serif-s">{{ item.text }}</span>
					</div>
				</div>
			</div>
		</section>

		<section id="layout" class="specimen-section">
			<div class="specimen-head">
				<h2 class="specimen-title"><span class="specimen-number">L</span>Layout primitives (app only)</h2>
				<p class="specimen-intro">Bands, hero grid, splits and grid-3, checked by measurement rather than against a DS frame.</p>
			</div>
			<div class="bands specimen-bands">
				<div class="hero-grid">
					<div class="hero-grid-text statement">
						<h1 class="statement-title">Poți continua să mergi înainte.</h1>
						<p class="text-lead">Există un loc în care poți să te oprești și să ai grijă și de tine.</p>
						<div class="actions">
							<a href="#layout" class="button-primary">Programează o ședință</a>
							<a href="#layout" class="button-outline">Descoperă cum lucrez</a>
						</div>
						<p class="heart-line">Sunt aici să te ascult.</p>
					</div>
					<img :src="infertilityHero" alt="" class="hero-grid-media" width="1600" height="1067">
				</div>
				<div class="band">
					<h2 class="section-title">Arii în care te pot însoți</h2>
					<div class="grid-3">
						<div v-for="n in 3" :key="n" class="paper-card"><div class="paper-card-body">Card {{ n }}</div></div>
					</div>
				</div>
				<div class="band">
					<div class="split-5-7">
						<p class="sticky-side">5 / 7 · sticky side</p>
						<div class="paper-card"><div class="paper-card-body">7 columns</div></div>
					</div>
				</div>
				<div class="hero-grid hero-grid-mirrored">
					<img :src="livingRoom" alt="" class="hero-grid-media" width="1600" height="1067">
					<div class="hero-grid-text statement">
						<h2 class="statement-title">Nu trebuie să faci asta singură.</h2>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<style lang="scss" scoped>
	// DS v4 page chrome, copied from the mock so each frame can be pixel-compared; the left pad stands in for its 200px contents column.
	.specimen {
		max-width: 1520px;
		margin-inline: auto;
		padding: 0 var(--s-48) 0 calc(var(--s-48) + 200px + var(--s-48));
	}

	.specimen-section {
		display: flex;
		flex-direction: column;
		gap: var(--s-28);
		padding: 40px 0 var(--s-56) var(--s-56);
		border-top: 1px solid var(--hairline);
	}

	.specimen-head {
		display: flex;
		flex-direction: column;
		gap: var(--s-8);
		max-width: 680px;
	}

	.specimen-title {
		position: relative;
		margin: 0;
	}

	.specimen-number {
		position: absolute;
		left: -56px;
		top: 9px;
		font: 600 13px var(--font-sans);
		letter-spacing: normal;
		color: var(--olive-400);
	}

	.specimen-intro {
		color: var(--ink-muted);
	}

	.specimen-frame {
		padding: var(--s-32);
		border: 1px solid var(--stone);
		border-radius: var(--r-card);
		background: var(--cream);
	}

	.specimen-buttons {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: var(--s-28) var(--s-24);
	}

	.specimen-cell {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--s-12);
	}

	.specimen-note {
		font: 500 12px / 1.5 ui-monospace, Menlo, monospace;
		color: var(--ink-muted);
	}

	.specimen-hovered {
		background: var(--primary);
		color: var(--on-primary);
	}

	.specimen-pair {
		display: flex;
		gap: var(--s-8);
	}

	.specimen-cards {
		--card-border: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--s-24);
		padding: var(--s-24);
		border-radius: var(--r-card);
		background: var(--sand);
	}

	.specimen-cover {
		display: flex;
		align-items: flex-end;
		padding: var(--s-12);
		background: repeating-linear-gradient(135deg, var(--stone) 0 8px, #efe9de 8px 16px);
		font: 500 11px / 1.4 ui-monospace, Menlo, monospace;
		color: var(--ink-muted);
	}

	.specimen-two {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: var(--s-24);
	}

	.specimen-top {
		align-items: start;
	}

	.specimen-column {
		display: flex;
		flex-direction: column;
		gap: var(--s-16);
	}

	.specimen-spec {
		border-top: 1px solid var(--hairline);

		p {
			display: grid;
			grid-template-columns: 96px 1fr;
			gap: var(--s-16);
			padding: var(--s-12) 0;
			border-bottom: 1px solid var(--hairline);
			font-size: var(--fs-small);
			line-height: 1.5;
		}
	}

	.specimen-aside {
		color: var(--label);
	}

	.specimen-faq-legal {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 40px;
		align-items: start;
	}

	.specimen-legal {
		display: flex;
		flex-direction: column;
	}

	.specimen-reveal {
		display: flex;
		flex-direction: column;
		gap: var(--s-16);
		padding: var(--s-28);

		b {
			font-size: var(--fs-small);
			color: var(--olive-800);
		}
	}

	.specimen-reveal-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.specimen-reveal-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--s-20) var(--s-24);
	}

	.specimen-reveal-item {
		display: grid;
		grid-template-columns: 44px 1fr;
		gap: var(--s-16);
		align-items: center;
	}

	.specimen-reveal-icon {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: var(--olive-tint);
		color: var(--olive-600);
	}

	.specimen-panel {
		display: flex;
		flex-direction: column;
		gap: var(--s-20);
	}

	.specimen-sand {
		border-radius: var(--r-card);
		background: var(--sand);
	}

	.specimen-strip {
		display: flex;
		flex-direction: column;
		gap: var(--s-12);
		padding: var(--s-32);
	}

	.specimen-rows {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
		padding: var(--s-32) var(--s-14);
	}

	.specimen-rows-note {
		padding: var(--s-8) 18px 0;
	}

	.help-card {
		align-self: start;
	}

	// The demo sits inside the specimen's padded column; bleed it to the viewport like a page root.
	.specimen-bands {
		margin-inline: calc(-2 * var(--s-48) - 200px - var(--s-56)) calc(-1 * var(--s-48));
	}
</style>
