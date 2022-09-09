import Vue from 'vue';
import App from './App.vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import 'element-ui/lib/theme-chalk/base.css';
import VueClipboard from 'vue-clipboard2';
import VueLazyload from 'vue-lazyload';
import TerraHistoricusItem from '../components/timeline/items/TerraHistoricusItem';
import NeteaseCloudMusicItem from '../components/timeline/items/NeteaseCloudMusicItem';
import { TerraHistoricusDataSource } from '../common/datasource/def/TerraHistoricusDataSource';
import { NeteaseCloudMusicDataSource } from '../common/datasource/def/NeteaseCloudMusicDataSource';
import Settings from '../common/Settings';

Vue.use(VueLazyload, {
  loading: '/assets/image/' + Settings.logo,
  error: '/assets/image/' + Settings.logo,
});

Vue.config.productionTip = false;
Vue.use(ElementUI).use(VueClipboard);

// 注意这里不能使用链式调用，否则只有第一个注册的会生效
Vue.component(TerraHistoricusDataSource.typeInfo.typeName, TerraHistoricusItem);
Vue.component(NeteaseCloudMusicDataSource.typeInfo.typeName, NeteaseCloudMusicItem);

new Vue({
  render: (h) => h(App),
}).$mount('#app');
