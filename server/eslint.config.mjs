import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  stylistic: {
    indent: 2,
    semi: true,
    quotes: 'double',
  },
})
