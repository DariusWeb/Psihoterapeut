// News items curated from Google Alerts
// Topics: anxietate | caut-psiholog-pentru-interviu | depresie | expert-sanatate-mintala
//         infertility-psychotherapy | infertility-workshop | interviu-psiholog
//         psiholog-opinie | research-infertility | research-psychotherapy | terapie-de-cuplu-bucuresti
//
// To add a new item, copy the shape below and prepend it to the array.
// Keep `id` unique and `date` in YYYY-MM-DD format.

export const news = [
    // ── anxietate ────────────────────────────────────────────────────────────
    {
        id: 1,
        title: 'Cum să gestionezi anxietatea în viața de zi cu zi',
        description:
            'Experții recomandă tehnici simple de respirație și mindfulness pentru a reduce nivelul de anxietate cotidiană. Studiile arată că doar 10 minute de practică zilnică pot face diferența.',
        source: 'Digi24',
        url: 'https://www.digi24.ro',
        date: '2026-04-25',
        topic: 'anxietate',
        image: null,
    },
    {
        id: 2,
        title: 'Anxietatea la adolescenți — semne pe care părinții nu trebuie să le ignore',
        description:
            'Un studiu recent arată că unul din patru adolescenți din România prezintă simptome moderate sau severe de anxietate. Psihologii atrag atenția asupra importanței comunicării deschise.',
        source: 'ProTV',
        url: 'https://stirileprotv.ro',
        date: '2026-04-20',
        topic: 'anxietate',
        image: null,
    },
    {
        id: 3,
        title: 'Legătura dintre anxietate și stilul de viață modern',
        description:
            'Notificările constante, orele de somn neregulate și suprasolicitarea profesională sunt principalii factori care alimentează anxietatea cronică, potrivit psihologilor clinicieni.',
        source: 'Libertatea',
        url: 'https://www.libertatea.ro',
        date: '2026-04-15',
        topic: 'anxietate',
        image: null,
    },

    // ── caut-psiholog-pentru-interviu ────────────────────────────────────────
    {
        id: 4,
        title: 'De ce tot mai mulți candidați apelează la psiholog înainte de interviu',
        description:
            'Pregătirea psihologică pentru un interviu de angajare devine o practică din ce în ce mai răspândită în marile orașe. Psihologii ajută candidații să gestioneze frica de eșec și să comunice autentic.',
        source: 'Ziarul Financiar',
        url: 'https://www.zf.ro',
        date: '2026-04-22',
        topic: 'caut-psiholog-pentru-interviu',
        image: null,
    },
    {
        id: 5,
        title: 'Coaching vs. psihoterapie — ce alegem înainte de un interviu important?',
        description:
            'Specialiștii clarifică diferența dintre coaching și terapie în contextul pregătirii pentru interviu, ajutând candidații să facă alegerea potrivită nevoilor lor.',
        source: 'Business Magazin',
        url: 'https://www.businessmagazin.ro',
        date: '2026-04-10',
        topic: 'caut-psiholog-pentru-interviu',
        image: null,
    },

    // ── depresie ─────────────────────────────────────────────────────────────
    {
        id: 6,
        title: 'Depresia — boala secolului XXI. Ce spun cifrele din România',
        description:
            'Potrivit OMS, depresia afectează peste 1 milion de români. Specialiștii avertizează că stigmatizarea și lipsa accesului la servicii de sănătate mintală rămân barierele principale.',
        source: 'Digi24',
        url: 'https://www.digi24.ro',
        date: '2026-04-26',
        topic: 'depresie',
        image: null,
    },
    {
        id: 7,
        title: 'Cum recunoști depresia mascată și de ce este periculoasă',
        description:
            'Depresia mascată se ascunde adesea în spatele unui zâmbet și al performanțelor profesionale ridicate. Psihologii explică semnalele subtile pe care le putem rata.',
        source: 'Adevărul',
        url: 'https://adevarul.ro',
        date: '2026-04-18',
        topic: 'depresie',
        image: null,
    },
    {
        id: 8,
        title: 'Terapia cognitiv-comportamentală — prima linie în tratamentul depresiei',
        description:
            'Un nou raport european confirmă eficiența TCC în tratamentul depresiei ușoare și moderate, recomandând-o ca primă opțiune terapeutică înainte de medicație.',
        source: 'Medlife Blog',
        url: 'https://www.medlife.ro',
        date: '2026-04-12',
        topic: 'depresie',
        image: null,
    },

    // ── expert-sanatate-mintala ───────────────────────────────────────────────
    {
        id: 9,
        title: 'Expertul în sănătate mintală, o profesie în creștere în România',
        description:
            'Cererea pentru psihologi și psihoterapeuți a crescut cu 40% față de 2020, conform datelor Colegiului Psihologilor din România. Specialiștii sunt din ce în ce mai prezenți în spații publice și media.',
        source: 'G4Media',
        url: 'https://www.g4media.ro',
        date: '2026-04-23',
        topic: 'expert-sanatate-mintala',
        image: null,
    },
    {
        id: 10,
        title: 'Cum alegi un expert în sănătate mintală potrivit pentru tine',
        description:
            'Nu toți specialiștii în sănătate mintală sunt la fel. Psihologul, psihiatrul și psihoterapeutul au roluri distincte — iată ghidul complet pentru a face alegerea corectă.',
        source: 'Viața Medicală',
        url: 'https://www.viata-medicala.ro',
        date: '2026-04-08',
        topic: 'expert-sanatate-mintala',
        image: null,
    },

    // ── infertility-psychotherapy ─────────────────────────────────────────────
    {
        id: 11,
        title: 'Psychotherapy as a pillar of infertility treatment — new clinical guidelines',
        description:
            'The European Society of Human Reproduction recommends integrating psychotherapy into infertility treatment protocols, recognising the profound emotional impact of the journey.',
        source: 'ESHRE News',
        url: 'https://www.eshre.eu',
        date: '2026-04-24',
        topic: 'infertility-psychotherapy',
        image: null,
    },
    {
        id: 12,
        title: 'How therapy helps couples cope with IVF failure',
        description:
            'A longitudinal study finds that couples who receive psychotherapy during IVF cycles report significantly lower anxiety and higher resilience after failed attempts.',
        source: 'Fertility and Sterility',
        url: 'https://www.fertstert.org',
        date: '2026-04-17',
        topic: 'infertility-psychotherapy',
        image: null,
    },
    {
        id: 13,
        title: 'Suportul psihologic în infertilitate — de ce este esențial',
        description:
            'Psihologul clinician Andreea Ionescu explică de ce femeile care urmează tratamente de fertilizare in vitro au nevoie de sprijin emoțional specializat pe tot parcursul procesului.',
        source: 'Gândul',
        url: 'https://www.gandul.ro',
        date: '2026-04-05',
        topic: 'infertility-psychotherapy',
        image: null,
    },

    // ── infertility-workshop ──────────────────────────────────────────────────
    {
        id: 14,
        title: 'Workshop gratuit pentru cuplurile care trec prin infertilitate — București, mai 2026',
        description:
            'Un workshop intensiv de weekend dedicat cuplurilor care se confruntă cu infertilitatea oferă instrumente practice de comunicare și gestionare a stresului emoțional.',
        source: 'Events.ro',
        url: 'https://www.events.ro',
        date: '2026-04-21',
        topic: 'infertility-workshop',
        image: null,
    },
    {
        id: 15,
        title: 'Infertility Support Group — online workshop series starting May 2026',
        description:
            'A six-session online workshop series for individuals and couples dealing with infertility, led by certified psychotherapists with experience in reproductive health.',
        source: 'PsychologyToday',
        url: 'https://www.psychologytoday.com',
        date: '2026-04-14',
        topic: 'infertility-workshop',
        image: null,
    },

    // ── interviu-psiholog ─────────────────────────────────────────────────────
    {
        id: 16,
        title: 'Interviu cu psiholog clinician: „Emoțiile nu sunt slăbiciuni"',
        description:
            'Într-un interviu exclusiv, psihologul clinician dr. Elena Radu vorbește despre cum societatea românească a început să accepte sănătatea mintală ca parte integrantă a sănătății generale.',
        source: 'Libertatea',
        url: 'https://www.libertatea.ro',
        date: '2026-04-27',
        topic: 'interviu-psiholog',
        image: null,
    },
    {
        id: 17,
        title: 'Psiholog despre burnout: „Corpul trimite semnale pe care le ignorăm ani de zile"',
        description:
            'Un psiholog cu expertiză în burnout profesional explică mecanismele epuizării și de ce mulți oameni ajung la cabinet abia atunci când situația devine critică.',
        source: 'HotNews',
        url: 'https://www.hotnews.ro',
        date: '2026-04-19',
        topic: 'interviu-psiholog',
        image: null,
    },
    {
        id: 18,
        title: 'Interviu psiholog — cum arată o primă ședință de terapie',
        description:
            'Mulți oameni nu știu la ce să se aștepte la prima întâlnire cu un psiholog. O specialistă demistifică procesul și explică ce se întâmplă în prima ședință.',
        source: 'Avantaje',
        url: 'https://www.avantaje.ro',
        date: '2026-04-09',
        topic: 'interviu-psiholog',
        image: null,
    },

    // ── psiholog-opinie ───────────────────────────────────────────────────────
    {
        id: 19,
        title: 'Opinia psihologului: ce ne spune criza locuinței despre sănătatea mintală a tinerilor',
        description:
            'Psihologul sociolog Dan Mureșan analizează legătura dintre instabilitatea locativă, anxietatea financiară și deteriorarea sănătății mintale în rândul tinerilor sub 35 de ani.',
        source: 'Scena9',
        url: 'https://www.scena9.ro',
        date: '2026-04-28',
        topic: 'psiholog-opinie',
        image: null,
    },
    {
        id: 20,
        title: 'De ce românii ajung mai greu la psiholog — opinia specialiștilor',
        description:
            'Stigma, costurile și lipsa de educație în domeniul sănătății mintale sunt principalele obstacole identificate de psihologi în accesarea serviciilor terapeutice în România.',
        source: 'Recorder',
        url: 'https://recorder.ro',
        date: '2026-04-13',
        topic: 'psiholog-opinie',
        image: null,
    },

    // ── research-infertility ──────────────────────────────────────────────────
    {
        id: 21,
        title: 'New research links chronic stress to reduced fertility in women under 35',
        description:
            'A study published in Human Reproduction found a significant correlation between chronic psychological stress and reduced ovarian reserve in women aged 28–35.',
        source: 'Human Reproduction',
        url: 'https://academic.oup.com/humrep',
        date: '2026-04-16',
        topic: 'research-infertility',
        image: null,
    },
    {
        id: 22,
        title: 'Cercetare românească privind infertilitatea și calitatea vieții — rezultate preliminare',
        description:
            'O echipă de la Universitatea de Medicină din Cluj prezintă date preliminare care arată că intervențiile psihosociale îmbunătățesc semnificativ calitatea vieții pacientelor cu infertilitate.',
        source: 'Revista Română de Fertilitate',
        url: 'https://example.com',
        date: '2026-04-07',
        topic: 'research-infertility',
        image: null,
    },
    {
        id: 23,
        title: 'Mind-body interventions improve IVF outcomes, meta-analysis shows',
        description:
            'A new meta-analysis of 28 randomised controlled trials shows that mind-body programmes — including CBT, yoga, and meditation — are associated with higher IVF success rates.',
        source: 'The Lancet',
        url: 'https://www.thelancet.com',
        date: '2026-04-02',
        topic: 'research-infertility',
        image: null,
    },

    // ── research-psychotherapy ────────────────────────────────────────────────
    {
        id: 24,
        title: 'Integrative psychotherapy shows long-term benefits beyond symptom reduction',
        description:
            'A 5-year follow-up study in the Journal of Psychotherapy Research confirms that integrative approaches produce durable gains in emotional regulation and relational functioning.',
        source: 'Journal of Psychotherapy Research',
        url: 'https://www.tandfonline.com',
        date: '2026-04-22',
        topic: 'research-psychotherapy',
        image: null,
    },
    {
        id: 25,
        title: 'Eficacitatea psihoterapiei online confirmată de studii recente',
        description:
            'O meta-analiză publicată în Psychotherapy Journal confirmă că terapia online are eficacitate comparabilă cu cea față în față pentru anxietate, depresie și tulburări de stres.',
        source: 'Psychotherapy Journal',
        url: 'https://doi.org/10.1037',
        date: '2026-04-11',
        topic: 'research-psychotherapy',
        image: null,
    },
    {
        id: 26,
        title: 'Early therapeutic alliance predicts treatment outcomes across modalities',
        description:
            'Regardless of the psychotherapy model used, the quality of the therapeutic alliance formed in the first three sessions is the strongest predictor of positive outcomes.',
        source: 'American Psychologist',
        url: 'https://www.apa.org',
        date: '2026-04-03',
        topic: 'research-psychotherapy',
        image: null,
    },

    // ── terapie-de-cuplu-bucuresti ────────────────────────────────────────────
    {
        id: 27,
        title: 'Terapia de cuplu în București — cum găsești specialistul potrivit',
        description:
            'Tot mai multe cupluri din București apelează la terapie preventiv, nu doar în momentele de criză. Specialiștii explică la ce să te aștepți și cum să alegi un psihoterapeut de cuplu.',
        source: 'Gândul',
        url: 'https://www.gandul.ro',
        date: '2026-04-29',
        topic: 'terapie-de-cuplu-bucuresti',
        image: null,
    },
    {
        id: 28,
        title: 'Comunicarea în cuplu — ateliere și terapie de grup în București, vara 2026',
        description:
            'Câteva centre terapeutice din București lansează programe de vară dedicate cuplurilor: ateliere de comunicare, terapie de grup și sesiuni individuale intensive.',
        source: 'PressOne',
        url: 'https://pressone.ro',
        date: '2026-04-20',
        topic: 'terapie-de-cuplu-bucuresti',
        image: null,
    },
    {
        id: 29,
        title: 'Ce ne spune rata divorțurilor din București despre nevoile de terapie de cuplu',
        description:
            'Statisticile INS arată că Bucureștiul are cea mai mare rată a divorțurilor din țară. Psihoterapeuții de cuplu vorbesc despre ce se poate face înainte ca relația să se destrame.',
        source: 'Digi24',
        url: 'https://www.digi24.ro',
        date: '2026-04-06',
        topic: 'terapie-de-cuplu-bucuresti',
        image: null,
    },
]
