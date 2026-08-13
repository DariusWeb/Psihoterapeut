import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import { services } from '@/content/services'
import i18n from '@/i18n'
import { applySeo } from '@/utils/seo'

// `seo` keys into the `seo` block in en.json; `parent` is the breadcrumb trail, walked by route name.
const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { seo: 'home' },
  },
  {
    path: '/despre-mine',
    name: 'about',
    component: () => import('@/views/About.vue'),
    meta: { seo: 'about', parent: 'home' },
  },
  {
    path: '/servicii',
    children: [
      {
        path: '',
        name: 'services',
        component: () => import('@/views/Services.vue'),
        meta: { seo: 'services', parent: 'home' },
      },
      ...services.map((service) => ({
        path: service.slug,
        name: `service-${service.key}`,
        component: () => import('@/components/services/ServiceDetail.vue'),
        meta: { seo: service.key, parent: 'services', slug: service.slug, ogImage: service.image },
      })),
    ],
  },
  {
    path: '/ateliere',
    name: 'events',
    component: () => import('@/views/Events.vue'),
    // flushHero: the hero media runs behind the fixed nav, leaving no room for a breadcrumb bar.
    meta: { seo: 'events', parent: 'home', flushHero: true },
  },
  {
    path: '/ateliere/:slug',
    name: 'event',
    component: () => import('@/components/events/Event.vue'),
    meta: { parent: 'events' },
  },
  {
    path: '/articole',
    name: 'articles',
    component: () => import('@/views/Articles.vue'),
    meta: { seo: 'articles', parent: 'home' },
  },
  {
    path: '/articole/:slug',
    name: 'article',
    component: () => import('@/components/articles/Article.vue'),
    meta: { parent: 'articles' },
  },
  {
    path: '/resurse',
    name: 'resources',
    component: () => import('@/views/Resources.vue'),
    meta: { seo: 'resources', parent: 'home', flushHero: true },
  },
  {
    path: '/noutati',
    name: 'news',
    component: () => import('@/views/News.vue'),
    meta: { seo: 'news', parent: 'home' },
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('@/views/Contact.vue'),
    meta: { seo: 'contact', parent: 'home', flushHero: true },
  },
  {
    path: '/confidentialitate',
    name: 'privacy',
    component: () => import('@/views/Privacy.vue'),
    meta: { seo: 'privacy', parent: 'home' },
  },
  {
    path: '/termeni',
    name: 'terms',
    component: () => import('@/views/Terms.vue'),
    meta: { seo: 'terms', parent: 'home' },
  },
  // No `seo` key, so it stays out of the search index and the breadcrumb trail entirely.
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: 'Dashboard', noindex: true },
  },
  {
    path: '/:catchAll(.*)',
    name: 'not-found',
    component: () => import('@/views/NotFound.vue'),
    meta: { seo: 'notFound' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // Resolves out-in mode jumps the still-visible page to the top first
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition

    const headerHeight = document.querySelector('nav.navigation')?.offsetHeight ?? 0
    const target = to.hash
      ? { el: to.hash, top: headerHeight, behavior: 'smooth' }
      : { top: 0 }

    if (to.path === from.path) return target

    return new Promise((resolve) => {
      window.addEventListener('page-transition-done', () => resolve(target), { once: true })
    })
  }
})

// Detail routes have no `seo` key of their own — they show the list page's copy until their
// lazy chunk lands and the component applies the real title.
router.afterEach((to) => {
  // Private pages carry no shareable metadata — just a title, and never indexed.
  if (to.meta.noindex) {
    document.title = to.meta.title
    return
  }

  const key = to.meta.seo ?? router.resolve({ name: to.meta.parent }).meta.seo
  if (!key) return

  const { t } = i18n.global
  applySeo({
    title: t(`seo.${key}.title`),
    description: t(`seo.${key}.description`),
    path: to.path,
    image: to.meta.ogImage,
  })
})

export default router
