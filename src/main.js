import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import {
  applyPolyfills,
  defineCustomElements,
} from '@aws-amplify/ui-components/loader';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
Amplify.configure(awsExports);

applyPolyfills().then(() => {
  defineCustomElements(window);
});

Vue.config.productionTip = false;
Vue.config.ignoredElements = [/amplify-\w*/];

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
