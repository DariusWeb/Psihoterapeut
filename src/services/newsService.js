// Unused until ALERT_FEEDS holds Google Alerts RSS URLs and newsStore calls fetchAllAlerts().
// ponytail: rss2json's free tier allows 10 requests an hour; production needs its own proxy.

const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json'

export const ALERT_FEEDS = {
    'anxietate': '',
    'caut-psiholog-pentru-interviu': '',
    'depresie': '',
    'expert-sanatate-mintala': '',
    'infertility-psychotherapy': '',
    'infertility-workshop': '',
    'interviu-psiholog': '',
    'psiholog-opinie': '',
    'research-infertility': '',
    'research-psychotherapy': '',
    'terapie-de-cuplu-bucuresti': '',
}

export async function fetchAlertFeed(topic, feedUrl) {
    const url = `${RSS2JSON_API}?rss_url=${encodeURIComponent(feedUrl)}`
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error(`Failed to fetch RSS feed for topic "${topic}": ${response.statusText}`)
    }

    const data = await response.json()

    if (data.status !== 'ok') {
        throw new Error(`rss2json error for topic "${topic}": ${data.message}`)
    }

    return data.items.map((item, index) => ({
        id: `${topic}-${index}-${Date.now()}`,
        title: item.title,
        description: item.description?.replace(/<[^>]*>/g, '').slice(0, 200) ?? '',
        source: item.author || extractDomain(item.link),
        url: item.link,
        date: item.pubDate?.split(' ')[0] ?? new Date().toISOString().split('T')[0],
        topic,
        image: item.thumbnail || item.enclosure?.link || null,
    }))
}

export async function fetchAllAlerts() {
    const activeFeed = Object.entries(ALERT_FEEDS).filter(([, url]) => url !== '')

    const results = await Promise.allSettled(
        activeFeed.map(([topic, url]) => fetchAlertFeed(topic, url))
    )

    const items = results
        .filter((r) => r.status === 'fulfilled')
        .flatMap((r) => r.value)

    return items.sort((a, b) => new Date(b.date) - new Date(a.date))
}

function extractDomain(url) {
    try {
        return new URL(url).hostname.replace('www.', '')
    } catch {
        return url
    }
}
