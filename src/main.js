import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import CollapseTransition from 'element-ui/lib/transitions/collapse-transition';
import App from './App.vue';

Vue.use(ElementUI);
Vue.component(CollapseTransition.name, CollapseTransition)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
