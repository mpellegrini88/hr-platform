import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

import Dashboard from './views/Dashboard.vue'
import Anagrafica from './views/Anagrafica.vue'
import AnagraficaDetail from './views/AnagraficaDetail.vue'
import Onboarding from './views/Onboarding.vue'
import PeopleCulture from './views/PeopleCulture.vue'
import PeopleCultureAnalytics from './views/PeopleCultureAnalytics.vue'
import ValutazioneProva from './views/ValutazioneProva.vue'
import VisualiMediche from './views/VisualiMediche.vue'
import FerieMalattie from './views/FerieMalattie.vue'
import Uscite from './views/Uscite.vue'
import Analytics from './views/Analytics.vue'
import ContrattiTermine from './views/ContrattiTermine.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: Dashboard },
    { path: '/anagrafica', component: Anagrafica },
    { path: '/anagrafica/:id', component: AnagraficaDetail },
    { path: '/onboarding', component: Onboarding },
    { path: '/valutazione-prova', component: ValutazioneProva },
    { path: '/people-culture', component: PeopleCulture },
    { path: '/people-culture-analytics', component: PeopleCultureAnalytics },
    { path: '/visite-mediche', component: VisualiMediche },
    { path: '/contratti-termine', component: ContrattiTermine },
    { path: '/ferie', component: FerieMalattie },
    { path: '/uscite', component: Uscite },
    { path: '/analytics', component: Analytics }
  ]
})

createApp(App).use(createPinia()).use(router).mount('#app')
