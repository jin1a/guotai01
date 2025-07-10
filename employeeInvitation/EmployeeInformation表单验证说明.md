# EmployeeInformation 表单验证功能说明

## 概述
在 `EmployeeInformation.vue` 文件中已经实现了完整的 Vant 表单验证功能，包括必填字段验证、格式验证和自定义业务逻辑验证。

## 主要功能

### 1. 表单验证规则

#### 必填字段验证
- **僱員類別**: 必填，不能为空
- **銜接類別**: 必填，必须选择
- **外文姓名**: 必填，只能包含英文字母和空格
- **出生日期**: 必填，必须选择
- **性別**: 必填，必须选择
- **出生地點**: 必填，必须选择
- **國籍/地區**: 必填，必须选择
- **流動電話**: 必填，必须符合手机号格式
- **電郵地址**: 必填，必须符合邮箱格式
- **地址**: 必填，必须选择省市区
- **詳細地址**: 必填，必须填写
- **聘用日期**: 必填，必须选择

#### 格式验证
- **外文姓名**: 只能包含英文字母和空格
- **流動電話**: 必须符合中国大陆手机号格式 (1[3-9]xxxxxxxxx)
- **固定電話**: 可选，但填写时必须符合固定电话格式
- **電郵地址**: 必须符合邮箱格式

### 2. 业务逻辑验证

#### 年龄验证
- 聘用时年龄不能少于16岁
- 聘用时年龄不能超过65岁

### 3. 组件使用

#### Vant 组件
- `van-form`: 表单容器，提供表单验证功能
- `van-field`: 输入字段组件，支持验证规则
- `van-picker`: 选择器组件
- `van-datetime-picker`: 日期时间选择器
- `van-area`: 省市区选择器
- `van-popup`: 弹窗组件
- `van-button`: 按钮组件
- `van-icon`: 图标组件

#### 验证规则配置
```javascript
:rules="[
  { required: true, message: '請輸入僱員類別' },
  { pattern: /^[a-zA-Z\s]+$/, message: '外文姓名只能包含英文字母和空格' }
]"
```

### 4. 使用方法

#### 表单提交
点击"下一步"按钮时会自动触发表单验证：

```javascript
async onSubmit() {
  try {
    const valid = await this.$refs.formRef.validate()
    if (valid) {
      // 验证通过，执行下一步操作
      this.$toast.success('表單驗證通過，正在跳轉...')
    }
  } catch (error) {
    this.$toast.fail('請檢查表單填寫是否正確')
  }
}
```

#### 实时验证
表单字段在失去焦点时会自动验证，错误信息会显示在字段下方。

### 5. 样式定制

表单验证错误时会显示红色错误信息，样式已通过 CSS 深度选择器进行定制：

```scss
:deep(.van-field--error .van-field__control) {
  color: #ee0a24;
}

:deep(.van-field__error-message) {
  color: #ee0a24;
  font-size: 12px;
  margin-top: 4px;
}
```

### 6. 扩展功能

#### 添加新的验证规则
在 `van-field` 组件的 `:rules` 属性中添加新的验证规则：

```javascript
:rules="[
  { required: true, message: '必填字段' },
  { pattern: /regex/, message: '格式错误' },
  { validator: (val) => customValidation(val), message: '自定义验证失败' }
]"
```

#### 自定义验证函数
```javascript
validator: (val) => {
  // 自定义验证逻辑
  return validationResult
}
```

### 7. 注意事项

1. 所有必填字段都有红色星号标识
2. 验证失败时会显示具体的错误信息
3. 表单验证通过后才会执行下一步操作
4. 年龄验证基于出生日期和聘用日期计算
5. 地址选择需要同时选择省市区和填写详细地址

## 技术实现

- 使用 Vant 4.x 版本的表单验证功能
- 支持同步和异步验证
- 自定义验证规则和错误提示
- 响应式表单数据绑定
- 完整的错误处理和用户提示 