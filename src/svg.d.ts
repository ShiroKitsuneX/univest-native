// Type shim for `.svg` imports — `react-native-svg-transformer` converts
// each `.svg` file into a React component that accepts the same props as
// `react-native-svg`'s `<Svg>` (width, height, fill, stroke, …). This
// declaration lets TypeScript resolve those imports as components.
declare module '*.svg' {
  import type { FC } from 'react'
  import type { SvgProps } from 'react-native-svg'

  const SvgComponent: FC<SvgProps>
  export default SvgComponent
}
