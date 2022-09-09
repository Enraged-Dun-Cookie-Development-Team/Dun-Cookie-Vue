<template>
  <li class="el-timeline-item">
    <div class="el-timeline-item__tail"></div>

    <div
      v-if="!$slots.dot"
      class="el-timeline-item__node"
      :class="[`el-timeline-item__node--${size || ''}`, `el-timeline-item__node--${type || ''}`]"
      :style="{
        backgroundColor: color,
      }"
    >
      <i v-if="icon || iconStyle" class="el-timeline-item__icon" :class="icon" :style="iconStyle"></i>
    </div>
    <div v-if="$slots.dot" class="el-timeline-item__dot">
      <slot name="dot"></slot>
    </div>

    <div class="el-timeline-item__wrapper">
      <div v-if="!hideTimestamp && placement === 'top'" class="el-timeline-item__timestamp is-top">
        {{ timestamp }}
      </div>

      <div class="el-timeline-item__content">
        <slot></slot>
      </div>

      <div v-if="!hideTimestamp && placement === 'bottom'" class="el-timeline-item__timestamp is-bottom">
        {{ timestamp }}
      </div>
    </div>
  </li>
</template>

<script>
// 因为el它的icon不支持绑定动态样式，所以copy一份源码并做小修改(支持绑定动态样式)
export default {
  name: 'MyElTimelineItem',

  inject: ['timeline'],

  props: {
    timestamp: {
      type: String,
      required: true,
    },

    hideTimestamp: {
      type: Boolean,
      default: false,
    },

    placement: {
      type: String,
      default: 'bottom',
    },

    type: {
      type: String,
      default: '',
    },

    color: {
      type: String,
      default: '',
    },

    size: {
      type: String,
      default: 'normal',
    },

    icon: {
      type: [String, Array, Object],
      required: true,
    },
    iconStyle: {
      type: [String, Array, Object],
      required: true,
    },
  },
};
</script>
