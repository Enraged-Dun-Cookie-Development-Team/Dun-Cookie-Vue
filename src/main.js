import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import CollapseTransition from 'element-ui/lib/transitions/collapse-transition';
import App from './App.vue';
import VueClipboard from 'vue-clipboard2'

Vue.use(ElementUI).use(VueClipboard);
Vue.component(CollapseTransition.name, CollapseTransition)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
