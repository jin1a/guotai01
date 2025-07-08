const { endsWith } = require("core-js/core/string")

module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ['plugin:vue/essential', '@vue/prettier'],
  rules: {
    //'off'或'0'：关闭   'warn'或'1'：警告   "error"或者"2"：报错
    // 'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'error',
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'error',
    'prettier/prettier': ['error',
      {
        singleQuote: true, //单引号
        semi: false, //分号
        printWidth: 120, //一行的字符数，如果超过会进行换行，默认为80
        trailingComma: 'none',  //是否使用尾逗号，有三个可选值"<none|es5|all>"
        endOfLine: 'auto' //结尾是 \n \r \n\r auto win 和 mac 不一致
      }
    ]
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
