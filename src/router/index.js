import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/About.vue'),
    },
    {
      path: '/services',
      children: [
        {
          path: '',
          name: 'services',
          component: () => import('@/views/Services.vue'),
        },
        {
          path: ':slug',
          name: 'service',
          component: () => import('@/components/services/ServiceDetail.vue'),
        },
      ],
    },
    {
      path: '/events',
      name: 'events',
      component: () => import('@/views/Events.vue'),
    },
    {
      path: '/events/:id',
      name: 'event',
      component: () => import('@/components/events/Event.vue'),
    },
    {
      path: '/articles',
      name: 'articles',
      component: () => import('@/views/Articles.vue'),
    },
    {
      path: '/articles/:id',
      name: 'article',
      component: () => import('@/components/articles/Article.vue'),
    },
    {
      path: '/news',
      name: 'news',
      component: () => import('@/views/News.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('@/views/Contact.vue'),
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('@/views/Privacy.vue'),
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('@/views/Terms.vue'),
    },
    {
      path: '/:catchAll(.*)',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue'),
    },
  ],
  // Resolves out-in mode jumps the still-visible page to the top first
  scrollBehavior(to, from, savedPosition) {
    const target = savedPosition || (to.hash ? { el: to.hash } : { top: 0 })
    if (to.path === from.path) return target

    return new Promise((resolve) => {
      window.addEventListener('page-transition-done', () => resolve(target), { once: true })
    })
  }
})

export default router
