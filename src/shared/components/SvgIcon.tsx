// Icons are loaded from local SVG files under `src/assets/icons/`. The
// `react-native-svg-transformer` Metro plugin (configured in
// `metro.config.js`) converts each `.svg` file into a React component that
// accepts standard `<Svg>` props (width, height, fill, stroke). The
// declarations in `src/svg.d.ts` let TypeScript resolve the imports.
//
// `react-native-svg` 15.12.1 is new-arch compatible — earlier versions had
// the infamous `topSvgLayout` crash with RN 0.81 + Fabric, but it was
// resolved in v14+. We render every glyph through this single component
// so the import surface stays small and theme colours are applied
// consistently.

import { type ComponentType } from 'react'
import type { SvgProps } from 'react-native-svg'

import HeartSvg from '@/assets/icons/heart.svg'
import BookmarkSvg from '@/assets/icons/bookmark.svg'
import ShareSocialSvg from '@/assets/icons/share-social.svg'
import FlagSvg from '@/assets/icons/flag.svg'
import CreateSvg from '@/assets/icons/create.svg'
import HomeSvg from '@/assets/icons/home.svg'
import SearchSvg from '@/assets/icons/search.svg'
import StatsChartSvg from '@/assets/icons/stats-chart.svg'
import PersonSvg from '@/assets/icons/person.svg'
import NotificationsSvg from '@/assets/icons/notifications.svg'
import ReaderSvg from '@/assets/icons/reader.svg'
import RocketSvg from '@/assets/icons/rocket.svg'
import CogSvg from '@/assets/icons/cog.svg'

export type IconName =
  | 'heart'
  | 'bookmark'
  | 'shareSocial'
  | 'flag'
  | 'create'
  | 'home'
  | 'search'
  | 'statsChart'
  | 'person'
  | 'notifications'
  | 'reader'
  | 'rocket'
  | 'cog'

const COMPONENTS: Record<IconName, ComponentType<SvgProps>> = {
  heart: HeartSvg,
  bookmark: BookmarkSvg,
  shareSocial: ShareSocialSvg,
  flag: FlagSvg,
  create: CreateSvg,
  home: HomeSvg,
  search: SearchSvg,
  statsChart: StatsChartSvg,
  person: PersonSvg,
  notifications: NotificationsSvg,
  reader: ReaderSvg,
  rocket: RocketSvg,
  cog: CogSvg,
}

interface SvgIconProps {
  name: IconName
  size?: number
  color?: string
}

export function SvgIcon({ name, size = 20, color = '#fff' }: SvgIconProps) {
  const Icon = COMPONENTS[name]
  if (!Icon) return null
  return <Icon width={size} height={size} fill={color} />
}
