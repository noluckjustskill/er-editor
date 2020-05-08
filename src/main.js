import Vue from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import '@/assets/global.css';

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
  vuetify,
}).$mount('#app');
