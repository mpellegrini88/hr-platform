import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

import Dashboard     from './views/Dashboard.vue'
import Anagrafica    from './views/Anagrafica.vue'
import Onboarding    from './views/Onboarding.vue'
import PeopleCulture from './views/PeopleCulture.vue'
import PeopleCultureAnalytics from './views/PeopleCultureAnalytics.vue'
import FerieMalattie from './views/FerieMalattie.vue'
import Dimissioni    from './views/Dimissioni.vue'
import Analytics     from './views/Analytics.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard',      component: Dashboard },
    { path: '/anagrafica',     component: Anagrafica },
    { path: '/onboarding',     component: Onboarding },
    { path: '/people-culture', component: PeopleCulture },
    { path: '/people-culture-analytics', component: PeopleCultureAnalytics },
    { path: '/ferie',          component: FerieMalattie },
    { path: '/dimissioni',     component: Dimissioni },
    { path: '/analytics',      component: Analytics },
  ]
})

createApp(App).use(createPinia()).use(router).mount('#app')
