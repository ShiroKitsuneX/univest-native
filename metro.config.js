const { getDefaultConfig } = require('expo/metro-config')

// Wires `react-native-svg-transformer` so `import HeartIcon from
// '@/assets/icons/heart.svg'` resolves to a React component (rendering via
// `react-native-svg`). Removes `svg` from `assetExts` so Metro doesn't
// load SVG files as images, and adds it to `sourceExts` so the transformer
// picks them up.
const config = getDefaultConfig(__dirname)

const { transformer, resolver } = config

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
}
config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter(ext => ext !== 'svg'),
  sourceExts: [...resolver.sourceExts, 'svg'],
}

module.exports = config
