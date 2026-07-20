/**
 * newsService.js — Future Google Alerts RSS integration via rss2json.com
 *
 * HOW TO ACTIVATE:
 * 1. Go to https://www.google.com/alerts and set "Deliver to" → RSS feed for each alert.
 * 2. Copy each feed URL (format: https://www.google.com/alerts/feeds/{userId}/{feedId}).
 * 3. Fill in the ALERT_FEEDS map below.
 * 4. In newsStore.js, call `loadFromRSS()` action on app mount instead of using static data.
 *
 * NOTE: rss2json.com has a free tier (10 req/hour). For production, use a self-hosted
 * RSS-to-JSON proxy or a serverless function to avoid CORS and rate limits.
 * 
 * To activate live RSS later: open src/services/newsService.js and fill in the ALERT_FEEDS map with your Google Alerts RSS URLs.
 */

const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json'

/**
 * Map topic slugs → your Google Alerts RSS feed URLs.
 * Replace the placeholder strings with your actual feed URLs.
 */
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

/**
 * Fetch and normalise a single Google Alerts RSS feed for a given topic.
 * @param {string} topic  - One of the TOPICS slugs from newsStore.js
 * @param {string} feedUrl - The Google Alerts RSS URL for that topic
 * @returns {Promise<Array>} Array of normalised news items
 */
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

/**
 * Fetch all configured alert feeds and merge them into a flat sorted array.
 * Skips feeds whose URL is empty (not yet configured).
 * @returns {Promise<Array>} Combined and date-sorted news items
 */
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
