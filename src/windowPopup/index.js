import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import 'element-ui/lib/theme-chalk/base.css';
import VueClipboard from 'vue-clipboard2'
import VueLazyload from 'vue-lazyload'

Vue.use(VueLazyload, {
    loading: '/assets/image/icon.png',
    error: '/assets/image/icon.png',
})

Vue.config.productionTip = false
Vue.use(ElementUI).use(VueClipboard).use({
    install(Vue) {
        Vue.prototype.chrome = chrome; // eslint-disable-line
    }
})

new Vue({
    render: h => h(App),
}).$mount('#app')