import { View, Text, TouchableOpacity } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs'
import {
  useNavigation,
  getFocusedRouteNameFromRoute,
  type RouteProp,
} from '@react-navigation/native'
import { useTheme } from '@/theme/useTheme'
import { AVATAR_COLORS } from '@/theme/avatar'
import type { University } from '@/stores/universitiesStore'
import { useProfileStore } from '@/stores/profileStore'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { useIcons } from '@/stores/hooks/useIcons'
import { useAuthStore } from '@/stores/authStore'
import { FeedScreen } from '@/screens/feed/FeedScreen'
import { NotasScreen } from '@/screens/notas/NotasScreen'
import { PerfilScreen } from '@/screens/perfil/PerfilScreen'
import { InstitutionAdminScreen } from '@/screens/perfil/InstitutionAdminScreen'
import { MainCtx, useMain, type MainHandlers } from '@/navigation/mainContext'
import { ExplorarStack } from '@/navigation/ExplorarStack'

const Tab = createBottomTabNavigator()

type TabMeta = { name: string; id: string; ic: string; l: string }

const TAB_META: TabMeta[] = [
  { name: 'FeedTab', id: 'feed', ic: '🏠', l: 'Feed' },
  { name: 'ExplorarTab', id: 'explorar', ic: '🔍', l: 'Explorar' },
  { name: 'NotasTab', id: 'notas', ic: '📊', l: 'Notas' },
  { name: 'PerfilTab', id: 'perfil', ic: '👤', l: 'Perfil' },
]

type Nav = {
  navigate: (name: string, params?: object) => void
}

function TabHeader({
  route,
}: {
  route: RouteProp<Record<string, object | undefined>, string>
}) {
  const insets = useSafeAreaInsets()
  const { T } = useTheme()
  const { onOpenSettings } = useMain()
  const av = useProfileStore(s => s.av)
  const avBgIdx = useProfileStore(s => s.avBgIdx)
  const uType = useOnboardingStore(s => s.uType) as
    | { emoji?: string; label?: string }
    | null
    | undefined

  const subtitle =
    route.name === 'ExplorarTab'
      ? 'Encontre sua universidade'
      : route.name === 'NotasTab'
        ? 'Notas de corte & suas provas'
        : route.name === 'PerfilTab'
          ? `${uType?.emoji || '👤'} ${uType?.label || 'Meu Perfil'}`
          : null

  return (
    <View style={{ backgroundColor: T.bg }}>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 4,
          paddingBottom: 10,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View style={{ width: 36 }} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: T.text }}>
            Uni<Text style={{ color: T.accent }}>Vest</Text>
          </Text>
        </View>
        {route.name === 'PerfilTab' ? (
          <TouchableOpacity
            onPress={onOpenSettings}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: T.card2,
              borderWidth: 1,
              borderColor: T.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 14 }}>⚙️</Text>
          </TouchableOpacity>
        ) : route.name === 'FeedTab' ? (
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: AVATAR_COLORS[avBgIdx][0],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 18 }}>{av}</Text>
          </View>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>
      {subtitle && (
        <View
          style={{ paddingHorizontal: 20, paddingTop: 0, paddingBottom: 6 }}
        >
          <Text style={{ color: T.sub, fontSize: 11 }}>{subtitle}</Text>
        </View>
      )}
    </View>
  )
}

function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const { T } = useTheme()
  const getIcon = useIcons()

  return (
    <View
      style={{
        backgroundColor: T.nav,
        borderTopWidth: 1,
        borderColor: T.border,
        paddingBottom: insets.bottom,
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingTop: 6,
      }}
    >
      {state.routes.map((route, idx) => {
        const meta = TAB_META.find(m => m.name === route.name)
        if (!meta) return null
        const active = state.index === idx
        const iconId = meta.id
        return (
          <TouchableOpacity
            key={route.name}
            onPress={() => {
              if (!active) navigation.navigate(route.name)
            }}
            style={{ flex: 1, alignItems: 'center', paddingVertical: 6 }}
          >
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 5,
                borderRadius: 20,
                backgroundColor: active ? T.acBg : 'transparent',
                alignItems: 'center',
                marginBottom: 2,
              }}
            >
              {iconId === 'feed' && (
                <Svg width={20} height={20} viewBox="0 0 512 512">
                  <Path
                    fill={active ? T.accent : T.muted}
                    d="M261.56 101.28a8 8 0 00-11.06 0L66.4 277.15a8 8 0 00-2.47 5.79L63.9 448a32 32 0 0032 32H192a16 16 0 0016-16V328a8 8 0 018-8h80a8 8 0 018 8v136a16 16 0 0016 16h96.06a32 32 0 0032-32V282.94a8 8 0 00-2.47-5.79zM490.91 244.15l-74.8-71.56V64a16 16 0 00-16-16h-48a16 16 0 00-16 16v32l-57.92-55.38C272.77 35.14 264.71 32 256 32c-8.68 0-16.72 3.14-22.14 8.63l-212.7 203.5c-6.22 6-7 15.87-1.34 22.37A16 16 0 0043 267.56L250.5 69.28a8 8 0 0111.06 0l207.52 198.28a16 16 0 0022.59-.44c6.14-6.36 5.63-16.86-.76-22.97z"
                  />
                </Svg>
              )}
              {iconId === 'explorar' && (
                <Svg width={20} height={20} viewBox="0 0 512 512">
                  <Path
                    fill={active ? T.accent : T.muted}
                    d="M456.69 421.39L362.6 327.3a173.81 173.81 0 0034.84-104.58C397.44 126.38 319.06 48 222.72 48S48 126.38 48 222.72s78.38 174.72 174.72 174.72A173.81 173.81 0 00327.3 362.6l94.09 94.09a25 25 0 0035.3-35.3zM97.92 222.72a124.8 124.8 0 11124.8 124.8 124.95 124.95 0 01-124.8-124.8z"
                  />
                </Svg>
              )}
              {iconId === 'notas' && (
                <Svg width={20} height={20} viewBox="0 0 512 512">
                  <Path
                    fill={active ? T.accent : T.muted}
                    d="M104 496H72a24 24 0 01-24-24V328a24 24 0 0124-24h32a24 24 0 0124 24v144a24 24 0 01-24 24zM328 496h-32a24 24 0 01-24-24V232a24 24 0 0124-24h32a24 24 0 0124 24v240a24 24 0 01-24 24zM440 496h-32a24 24 0 01-24-24V120a24 24 0 0124-24h32a24 24 0 0124 24v352a24 24 0 01-24 24zM216 496h-32a24 24 0 01-24-24V40a24 24 0 0124-24h32a24 24 0 0124 24v432a24 24 0 01-24 24z"
                  />
                </Svg>
              )}
              {iconId === 'perfil' && (
                <Svg width={20} height={20} viewBox="0 0 512 512">
                  <Path
                    fill={active ? T.accent : T.muted}
                    d="M332.64 64.58C313.18 43.57 286 32 256 32c-30.16 0-57.43 11.5-76.8 32.38-19.58 21.11-29.12 49.8-26.88 80.78C156.76 206.28 203.27 256 256 256s99.16-49.71 103.67-110.82c2.27-30.7-7.33-59.33-27.03-80.6zM432 480H80a31 31 0 01-24.2-11.13c-6.5-7.77-9.12-18.38-7.18-29.11C57.06 392.94 83.4 353.61 124.8 326c36.78-24.51 83.37-38 131.2-38s94.42 13.5 131.2 38c41.4 27.6 67.74 66.93 76.18 113.75 1.94 10.73-.68 21.34-7.18 29.11A31 31 0 01432 480z"
                  />
                </Svg>
              )}
              {!['feed', 'explorar', 'notas', 'perfil'].includes(iconId) && (
                <Text style={{ fontSize: 20 }}>
                  {getIcon('tab_' + meta.id, meta.ic)}
                </Text>
              )}
            </View>
            <Text
              style={{
                fontSize: 10,
                fontWeight: active ? '800' : '500',
                color: active ? T.accent : T.muted,
              }}
            >
              {meta.l}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const goUniDetail = (navigation: Nav): void =>
  navigation.navigate('ExplorarTab', { screen: 'UniversityDetail' })

function FeedTab() {
  const navigation = useNavigation<Nav>()
  const h = useMain()
  return (
    <FeedScreen
      refreshing={h.refreshing}
      onRefresh={h.onRefresh}
      goExplorar={() => navigation.navigate('ExplorarTab')}
      onSelectUni={(u: University) => {
        h.onSelectUni?.(u)
        goUniDetail(navigation)
      }}
      onShare={h.onShare}
    />
  )
}

function NotasTab() {
  const h = useMain()
  return (
    <NotasScreen onEditCourses={h.onEditCourses} onAddGrade={h.onAddGrade} />
  )
}

function PerfilTab() {
  const navigation = useNavigation<Nav>()
  const h = useMain()
  const isInstitution = useAuthStore(s => s.isInstitution)
  const linkedUniId = useAuthStore(s => s.getLinkedUniId)

  if (isInstitution() && linkedUniId()) {
    return (
      <InstitutionAdminScreen
        universityId={linkedUniId()!}
        onChangePhoto={h.onChangePhoto}
      />
    )
  }

  return (
    <PerfilScreen
      onChangePhoto={h.onChangePhoto}
      onChangeName={h.onChangeName}
      onEditCourses={h.onEditCourses}
      onShowFollowing={() =>
        navigation.navigate('ExplorarTab', { screen: 'Following' })
      }
      onShowSaved={h.onShowSaved}
      onShowBooks={() =>
        navigation.navigate('ExplorarTab', { screen: 'BooksList' })
      }
      onAddGoal={h.onAddGoal}
      onOpenEvent={h.onOpenEvent}
      onSelectUni={(u: University) => {
        h.onSelectUni?.(u)
        goUniDetail(navigation)
      }}
      goNotas={() => navigation.navigate('NotasTab')}
    />
  )
}

type Props = {
  handlers: MainHandlers
}

export function MainTabs({ handlers }: Props) {
  const { T } = useTheme()
  return (
    <MainCtx.Provider value={handlers}>
      <Tab.Navigator
        id="MainTabs"
        screenOptions={{
          header: ({ route }) => <TabHeader route={route} />,
          sceneStyle: { backgroundColor: T.bg },
        }}
        tabBar={props => <TabBar {...props} />}
      >
        <Tab.Screen name="FeedTab" component={FeedTab} />
        <Tab.Screen
          name="ExplorarTab"
          component={ExplorarStack}
          options={({ route }) => {
            const focused =
              getFocusedRouteNameFromRoute(route) ?? 'UniversityList'
            return { headerShown: focused === 'UniversityList' }
          }}
        />
        <Tab.Screen name="NotasTab" component={NotasTab} />
        <Tab.Screen name="PerfilTab" component={PerfilTab} />
      </Tab.Navigator>
    </MainCtx.Provider>
  )
}
