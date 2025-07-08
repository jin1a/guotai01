<template>
  <el-popover
    placement="bottom-start"
    :width="width"
    trigger="click"
    v-model:visible="visible"
  >
    <template #reference>
      <el-input
        v-model="selectedLabel"
        :placeholder="placeholder"
        readonly
        :clearable="clearable"
        @clear="handleClear"
      >
        <template #suffix>
          <el-icon class="el-input__icon" :class="{ 'is-reverse': visible }">
            <arrow-down />
          </el-icon>
        </template>
      </el-input>
    </template>

    <el-tree
      ref="treeRef"
      class="tree-select"
      :data="options"
      :props="defaultProps"
      :show-checkbox="multiple"
      :check-strictly="checkStrictly"
      :default-expand-all="defaultExpandAll"
      :expand-on-click-node="false"
      :node-key="defaultProps.value"
      :default-checked-keys="multiple ? modelValue : []"
      @node-click="handleNodeClick"
      @check="handleCheck"
    />
  </el-popover>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Array],
    default: ''
  },
  options: {
    type: Array,
    required: true
  },
  props: {
    type: Object,
    default: () => ({})
  },
  placeholder: {
    type: String,
    default: '请选择'
  },
  clearable: {
    type: Boolean,
    default: true
  },
  multiple: {
    type: Boolean,
    default: false
  },
  checkStrictly: {
    type: Boolean,
    default: false
  },
  defaultExpandAll: {
    type: Boolean,
    default: true
  },
  width: {
    type: [String, Number],
    default: 220
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// 组件内部状态
const visible = ref(false)
const selectedLabel = ref('')
const treeRef = ref(null)

// 树形组件属性
const defaultProps = computed(() => ({
  children: props.props.children || 'children',
  label: props.props.label || 'label',
  value: props.props.value || 'id',
  disabled: props.props.disabled || 'disabled'
}))

// 查找节点的标签
const findNodeLabel = (value, nodes = props.options) => {
  for (const node of nodes) {
    if (node[defaultProps.value.value] === value) {
      return node[defaultProps.value.label]
    }
    if (node[defaultProps.value.children]) {
      const label = findNodeLabel(value, node[defaultProps.value.children])
      if (label) return label
    }
  }
  return ''
}

// 处理节点点击
const handleNodeClick = (data) => {
  if (props.multiple) return
  
  const value = data[defaultProps.value.value]
  const label = data[defaultProps.value.label]
  
  selectedLabel.value = label
  visible.value = false
  emit('update:modelValue', value)
  emit('change', value)
}

// 处理多选
const handleCheck = (data, { checkedNodes, checkedKeys }) => {
  if (!props.multiple) return
  
  const values = checkedKeys
  const labels = checkedNodes.map(node => node[defaultProps.value.label]).join(', ')
  
  selectedLabel.value = labels
  emit('update:modelValue', values)
  emit('change', values)
}

// 处理清除
const handleClear = () => {
  selectedLabel.value = ''
  emit('update:modelValue', props.multiple ? [] : '')
  emit('change', props.multiple ? [] : '')
}

// 监听值变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (props.multiple) {
      if (Array.isArray(newVal) && newVal.length > 0) {
        const labels = newVal.map(value => findNodeLabel(value)).filter(Boolean)
        selectedLabel.value = labels.join(', ')
      } else {
        selectedLabel.value = ''
      }
    } else {
      selectedLabel.value = findNodeLabel(newVal) || ''
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.tree-select {
  max-height: 300px;
  overflow-y: auto;
}

.el-input__icon.is-reverse {
  transform: rotate(180deg);
}
</style> 