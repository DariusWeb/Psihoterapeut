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
      name: 'services',
      component: () => import('@/views/Services.vue'),
    },
    {
      path: '/events',
      name: 'events',
      component: () => import('@/views/Events.vue'),
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
  scrollBehavior(to, from, savedPosition) {
    // always scroll to top when route changes
    return { top: 0 }
  }
})

export default router
