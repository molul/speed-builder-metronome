import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import DialogService from 'primevue/dialogservice'
import { definePreset } from '@primeuix/themes'

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}',
      color: '{yellow.700}'
    },
    button: {
      primary: {
        background: '{yellow.700}',
        color: '{blue.50}'
      }
    }
  }
})

const app = createApp(App)
app.use(createPinia())
app.use(PrimeVue, {
  ripple: true,
  // unstyled: true

  theme: {
    preset: MyPreset
  }
})
app.use(DialogService)

app.mount('#app')
