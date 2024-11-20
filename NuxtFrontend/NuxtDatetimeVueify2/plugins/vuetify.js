import { createVuetify } from 'vuetify'
import { VTimePicker } from 'vuetify/labs/VTimePicker'

// export default createVuetify({
//   components: {
//     VTimePicker,
//   },
// })

export default defineNuxtPlugin((app) => {
    const vuetify = createVuetify({
      // ... your configuration
      components: {
        VTimePicker
      }
    })
    app.vueApp.use(vuetify)
  })