// The only place a price or a file name exists. It is never bundled into the site: the browser
// asks for the catalogue and sends back a key, so nothing a visitor can edit reaches Stripe.
// Amounts are in bani, the minor unit Stripe charges in — no float ever touches money here.

export const CURRENCY = 'ron'

export const RESOURCES = {
    loss: {
        name: 'Vindecarea după o pierdere de sarcină',
        amount: 8900,
        file: 'loss.pdf'
    },
    identity: {
        name: 'Redefinirea identității după infertilitate',
        amount: 12900,
        file: 'identity.pdf'
    },
    balance: {
        name: 'Program de echilibru pentru mame ocupate',
        amount: 19900,
        file: 'balance.pdf'
    }
}

// File names stay on this side; the page only ever needs to render a price.
export const publicCatalogue = () =>
    Object.entries(RESOURCES).map(([key, resource]) => ({
        key,
        amount: resource.amount,
        currency: CURRENCY
    }))
