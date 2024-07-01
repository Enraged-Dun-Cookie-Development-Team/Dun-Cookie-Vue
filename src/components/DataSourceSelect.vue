<template>
  <div class="datasource-select">
    <!-- 分三列好看点，这里简单粗暴复制粘贴成三个tree -->
    <el-tree
      ref="dataSourceTree1"
      :data="dataSourceTreeData1"
      show-checkbox
      check-on-click-node
      default-expand-all
      node-key="idStr"
      :props="{ children: 'children', label: 'label' }"
    >
      <!--suppress VueUnrecognizedSlot -->
      <template #default="{ node, data }">
        <span class="checkbox-area">
          <img class="icon-img" :style="{ width: data.children?.length ? '22px' : undefined }" :src="data.icon" />
          <span :style="{ 'font-size': data.children?.length ? '1.125em' : undefined }">{{ node.label }}</span>
        </span>
      </template>
    </el-tree>
    <el-tree
      ref="dataSourceTree2"
      :data="dataSourceTreeData2"
      show-checkbox
      check-on-click-node
      default-expand-all
      node-key="idStr"
      :props="{ children: 'children', label: 'label' }"
    >
      <!--suppress VueUnrecognizedSlot -->
      <template #default="{ node, data }">
        <span class="checkbox-area">
          <img class="icon-img" :style="{ width: data.children?.length ? '22px' : undefined }" :src="data.icon" />
          <span :style="{ 'font-size': data.children?.length ? '1.125em' : undefined }">{{ node.label }}</span>
        </span>
      </template>
    </el-tree>
    <el-tree
      ref="dataSourceTree3"
      :data="dataSourceTreeData3"
      show-checkbox
      check-on-click-node
      default-expand-all
      node-key="idStr"
      :props="{ children: 'children', label: 'label' }"
    >
      <!--suppress VueUnrecognizedSlot -->
      <template #default="{ node, data }">
        <span class="checkbox-area">
          <img class="icon-img" :style="{ width: data.children?.length ? '22px' : undefined }" :src="data.icon" />
          <span :style="{ 'font-size': data.children?.length ? '1.125em' : undefined }">{{ node.label }}</span>
          <el-button v-if="data.custom" type="text" size="mini" @click="removeCustomDataSource(data.idStr)"
            >删除</el-button
          >
        </span>
      </template>
    </el-tree>
    <div v-if="showBtn" style="flex-basis: 100%; margin-top: 16px">
      <el-button
        ref="btnDataSourceSelectAll"
        round
        tabindex="-1"
        @click="dataSourceSelectAll(), $refs.btnDataSourceSelectAll.$el.blur()"
        >启用所有数据源
      </el-button>
      <el-button
        ref="btnDataSourceUnselectAll"
        round
        tabindex="-1"
        @click="dataSourceUnselectAll(), $refs.btnDataSourceUnselectAll.$el.blur()"
        >禁用所有数据源
      </el-button>
      <el-tooltip class="item" effect="dark" content="不会影响已选择的数据源" placement="top">
        <el-button
          ref="btnDataSourceSelectAllBilibili"
          round
          tabindex="-1"
          @click="dataSourceSelectAllBilibili(), $refs.btnDataSourceSelectAllBilibili.$el.blur()"
          >启用所有B站数据源
        </el-button>
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="不会影响已选择的数据源" placement="top">
        <el-button
          ref="btnDataSourceSelectAllWeibo"
          round
          tabindex="-1"
          @click="dataSourceSelectAllWeibo(), $refs.btnDataSourceSelectAllWeibo.$el.blur()"
          >启用所有微博数据源
        </el-button>
      </el-tooltip>
      <template v-if="enableCustom">
        <el-button
          ref="btnAddCustomDataSource"
          round
          tabindex="-1"
          @click="(showAddCustomDialog = true), $refs.btnAddCustomDataSource.$el.blur()"
          >新增自定义数据源
        </el-button>
        <el-dialog title="新增自定义数据源" :visible.sync="showAddCustomDialog">
          <el-form ref="customDataSourceDialogForm" :model="addCustomDataSourceDialogFormData" inline>
            <el-form-item label="数据源类型" :rules="[{ required: true, message: '该项不能为空' }]" prop="type">
              <el-select v-model="addCustomDataSourceDialogFormData.type" placeholder="请选择数据源类型">
                <el-option label="B站" value="bilibili:dynamic-by-uid"></el-option>
                <el-option label="微博" value="weibo:dynamic-by-uid"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="数据源ID" :rules="[{ required: true, message: '该项不能为空' }]" prop="dataId">
              <el-input v-model="addCustomDataSourceDialogFormData.dataId" autocomplete="off"></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button :loading="customDataSourceChecking" @click="addCustomDataSource()">确 定 </el-button>
            <el-button @click="showAddCustomDialog = false">取 消</el-button>
          </div>
        </el-dialog>
      </template>
    </div>
  </div>
</template>

<script>
/* IFTRUE_feature__custom_datasource */
import { DefaultLogger } from '@enraged-dun-cookie-development-team/common/logger';
import { DefaultDataSources } from '@enraged-dun-cookie-development-team/cookie-fetcher';
/* FITRUE_feature__custom_datasource */
import AvailableDataSourceMeta from '../common/sync/AvailableDataSourceMeta';
import Settings from '../common/Settings';
import { DataSourceMeta } from '../common/datasource/DataSourceMeta';
import PlatformHelper from '../common/platform/PlatformHelper';
import { MESSAGE_WEIBO_ADD_REFERER } from '../common/Constants';
import { JsonValidator } from '@enraged-dun-cookie-development-team/common/json';

export default {
  name: 'DataSourceSelect',
  props: {
    showBtn: Boolean,
  },
  data() {
    return {
      dataSourceTreeData1: [],
      dataSourceTreeData2: [],
      dataSourceTreeData3: [],
      allDataSourceKeys: [],
      allBilibiliDataSourceKeys: [],
      allWeiboDataSourceKeys: [],
      enableCustom: false,
      showAddCustomDialog: false,
      // 为什么这个组件库不能把值存在自己组件里呢，非要绑定一个v-model才能用
      addCustomDataSourceDialogFormData: { type: '', dataId: '' },
      customDataSourceChecking: false,
    };
  },
  mounted() {
    /* IFTRUE_feature__custom_datasource */
    this.enableCustom = true;
    // TODO 因为ajv用到了eval，所以只能全局禁止验证
    JsonValidator.validate = () => true;
    /* FITRUE_feature__custom_datasource */
    Settings.doAfterInit(() => {
      AvailableDataSourceMeta.doAfterInit(() => this.buildDataSourceTree());
      AvailableDataSourceMeta.doAfterUpdate(() => this.buildDataSourceTree());
    });
  },
  methods: {
    buildDataSourceTree() {
      // noinspection all
      const categoryMap = {
        开拓芯COREBLAZER: '开拓芯',
        CubesCollective: 'Cubes Collective',
        来自星尘ExAstris: '来自星尘',
      };
      const treeData = {};
      for (const item of AvailableDataSourceMeta.getPresetList()) {
        let category = item.name.substring(0, item.name.indexOf('-'));
        category = categoryMap[category] || category;
        if (!treeData[category]) {
          treeData[category] = {
            label: category,
            icon: item.icon,
            children: [],
          };
        }
        treeData[category].children.push({
          label: item.name,
          icon: item.icon,
          idStr: item.idStr,
          type: item.type,
          dataId: item.dataId,
        });
        this.allDataSourceKeys.push(item.idStr);
        if (item.type.startsWith('bilibili:')) {
          this.allBilibiliDataSourceKeys.push(item.idStr);
        } else if (item.type.startsWith('weibo:')) {
          this.allWeiboDataSourceKeys.push(item.idStr);
        }
      }
      const list = Object.values(treeData).sort((a, b) => a.label.localeCompare(b.label));
      /* IFTRUE_feature__custom_datasource */
      list.push({
        label: '自定义',
        icon: this.logo,
        children: AvailableDataSourceMeta.getCustomList().map((item) => ({
          label: item.name,
          icon: item.icon || this.icon,
          idStr: item.idStr,
          type: item.type,
          dataId: item.dataId,
          custom: true,
        })),
      });
      /* FITRUE_feature__custom_datasource */
      const count = Math.floor(list.length / 3);
      this.dataSourceTreeData1 = list.slice(0, count);
      this.dataSourceTreeData2 = list.slice(count, count * 2);
      this.dataSourceTreeData3 = list.slice(count * 2);
      this.updateSelectDataSource(Settings.enableDataSources);
    },
    updateSelectDataSource(enableDataSources) {
      const selectDataSource = enableDataSources.map((it) => DataSourceMeta.id(it));
      this.$refs.dataSourceTree1.setCheckedKeys(selectDataSource);
      this.$refs.dataSourceTree2.setCheckedKeys(selectDataSource);
      this.$refs.dataSourceTree3.setCheckedKeys(selectDataSource);
    },
    dataSourceSelectAll() {
      this.$refs.dataSourceTree1.setCheckedKeys(this.allDataSourceKeys);
      this.$refs.dataSourceTree2.setCheckedKeys(this.allDataSourceKeys);
      this.$refs.dataSourceTree3.setCheckedKeys(this.allDataSourceKeys);
    },
    dataSourceUnselectAll() {
      this.$refs.dataSourceTree1.setCheckedKeys([]);
      this.$refs.dataSourceTree2.setCheckedKeys([]);
      this.$refs.dataSourceTree3.setCheckedKeys([]);
    },
    dataSourceSelectAllBilibili() {
      this.$refs.dataSourceTree1.setCheckedKeys([
        ...this.allBilibiliDataSourceKeys,
        ...this.$refs.dataSourceTree1.getCheckedKeys(),
      ]);
      this.$refs.dataSourceTree2.setCheckedKeys([
        ...this.allBilibiliDataSourceKeys,
        ...this.$refs.dataSourceTree2.getCheckedKeys(),
      ]);
      this.$refs.dataSourceTree3.setCheckedKeys([
        ...this.allBilibiliDataSourceKeys,
        ...this.$refs.dataSourceTree3.getCheckedKeys(),
      ]);
    },
    dataSourceSelectAllWeibo() {
      this.$refs.dataSourceTree1.setCheckedKeys([
        ...this.allWeiboDataSourceKeys,
        ...this.$refs.dataSourceTree1.getCheckedKeys(),
      ]);
      this.$refs.dataSourceTree2.setCheckedKeys([
        ...this.allWeiboDataSourceKeys,
        ...this.$refs.dataSourceTree2.getCheckedKeys(),
      ]);
      this.$refs.dataSourceTree3.setCheckedKeys([
        ...this.allWeiboDataSourceKeys,
        ...this.$refs.dataSourceTree3.getCheckedKeys(),
      ]);
    },
    getSelectDataSourceList() {
      // 因为选择区域变成了三块而且还有自定义部分，所以加一个避免重复的判定，虽然大概率用不到
      const ids = new Set();
      const allSelect = [
        ...this.$refs.dataSourceTree1.getCheckedNodes(),
        ...this.$refs.dataSourceTree2.getCheckedNodes(),
        ...this.$refs.dataSourceTree3.getCheckedNodes(),
      ];
      return allSelect
        .filter((it) => it.idStr && !it.custom)
        .map((it) => {
          const result = { type: it.type, dataId: it.dataId };
          if (ids.has(DataSourceMeta.id(result))) {
            return;
          }
          ids.add(DataSourceMeta.id(result));
          return result;
        })
        .filter((it) => !!it);
    },
    /* IFTRUE_feature__custom_datasource */
    getSelectCustomDataSourceList() {
      return this.$refs.dataSourceTree3
        .getCheckedNodes()
        .filter((it) => it.idStr && it.custom)
        .map((it) => ({ type: it.type, dataId: it.dataId }));
    },
    addCustomDataSource() {
      this.customDataSourceChecking = true;
      this.$refs.customDataSourceDialogForm.validate(async (valid) => {
        if (!valid) {
          this.customDataSourceChecking = false;
          return;
        }
        /**
         * @type {DataSourceMeta}
         */
        const sourceMeta = {
          type: this.addCustomDataSourceDialogFormData.type,
          dataId: this.addCustomDataSourceDialogFormData.dataId,
        };
        try {
          let success = false;
          switch (sourceMeta.type) {
            case 'bilibili:dynamic-by-uid': {
              if (!/^[0-9]{1,16}$/.test(sourceMeta.dataId)) {
                this.$message({
                  center: true,
                  message: '数据源ID不合法！',
                  type: 'error',
                });
                break;
              }
              const source = new DefaultDataSources.BilibiliDataSource({
                uid: sourceMeta.dataId,
                logger: DefaultLogger,
              });
              const info = await source.createDisplayInfo();
              sourceMeta.icon = info.icon;
              sourceMeta.name = '自定义-' + info.name + '-B站';
              success = true;
              break;
            }
            case 'weibo:dynamic-by-uid': {
              if (!/^[0-9]{1,16}$/.test(sourceMeta.dataId)) {
                this.$message({
                  center: true,
                  message: '数据源ID不合法！',
                  type: 'error',
                });
                break;
              }
              const source = new DefaultDataSources.WeiboDataSource({
                uid: sourceMeta.dataId,
                logger: DefaultLogger,
              });
              const info = await source.createDisplayInfo();
              sourceMeta.icon = info.icon;
              sourceMeta.name = '自定义-' + info.name + '-微博';
              PlatformHelper.Message.send(MESSAGE_WEIBO_ADD_REFERER, { urls: [info.icon] });
              success = true;
              break;
            }
            default:
              this.$message({
                center: true,
                message: `未知的数据源类型：${sourceMeta.type}！`,
                type: 'error',
              });
              break;
          }
          if (success) {
            AvailableDataSourceMeta.custom[DataSourceMeta.id(sourceMeta)] = sourceMeta;
            AvailableDataSourceMeta.sendUpdateAtNextTick();
            this.buildDataSourceTree();
            this.showAddCustomDialog = false;
            this.$nextTick(() => this.$refs.customDataSourceDialogForm.resetFields());
          }
        } catch (e) {
          console.log(e);
          this.$message({
            center: true,
            message: `创建自定义数据源失败：${e.message}！`,
            type: 'error',
          });
        } finally {
          this.customDataSourceChecking = false;
        }
      });
    },
    removeCustomDataSource(idStr) {
      delete AvailableDataSourceMeta.custom[idStr];
      setTimeout(() => {
        this.buildDataSourceTree();
        setTimeout(() => {
          this.saveSetting('form');
        }, 100);
      }, 100);
    },
    /* FITRUE_feature__custom_datasource */
  },
};
</script>

<style scoped lang="less">
.datasource-select {
  display: flex;
  flex-wrap: wrap;
  width: 100%;

  .el-tree {
    flex-grow: 1;
  }

  .checkbox-area {
    display: flex;
    align-items: center;
    font-size: 16px;

    .icon-img {
      margin-right: 5px;
      width: 16px;
    }
  }
}
</style>
