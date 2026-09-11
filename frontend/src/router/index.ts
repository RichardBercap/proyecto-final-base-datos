import { createRouter, createWebHistory } from 'vue-router'
import ProtectedLayout from '@/layouts/ProtectedLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/catalog', component: () => import('@/pages/CustomerCatalogPage.vue') },
    {
      path: '/',
      component: ProtectedLayout,
      meta: { requiresAuth: true },
      children: [
        { path: 'dashboard', component: () => import('@/modules/dashboard/DashboardPage.vue') },
        { path: 'movies', component: () => import('@/modules/movies/MoviesPage.vue') },
        { path: 'movies/new', component: () => import('@/modules/movies/MovieFormPage.vue') },
        { path: 'movies/:id', component: () => import('@/modules/movies/MovieDetailPage.vue') },
        { path: 'movies/:id/edit', component: () => import('@/modules/movies/MovieFormPage.vue') },
        { path: 'clients', component: () => import('@/modules/clients/ClientsPage.vue') },
        { path: 'clients/new', component: () => import('@/modules/clients/ClientFormPage.vue') },
        { path: 'clients/:id', component: () => import('@/modules/clients/ClientDetailPage.vue') },
        { path: 'clients/:id/edit', component: () => import('@/modules/clients/ClientFormPage.vue') },
        { path: 'loans', component: () => import('@/modules/loans/LoansPage.vue') },
        { path: 'loans/new', component: () => import('@/modules/loans/LoanWizardPage.vue') },
        { path: 'loans/:id', component: () => import('@/modules/loans/LoanDetailPage.vue') },
        { path: 'settings', component: () => import('@/modules/settings/SettingsPage.vue') }
      ]
    },
    { path: '/:pathMatch(.*)*', component: () => import('@/pages/NotFoundPage.vue') }
  ]
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    return true
  }

  return true
})

export default router
