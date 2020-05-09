import Vue from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import '@/assets/global.css';
import 'highlight.js/styles/vs2015.css';

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
  vuetify,
}).$mount('#app');
