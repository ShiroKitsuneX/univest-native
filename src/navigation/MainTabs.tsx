import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useState, useEffect } from 'react'
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
import type { University } from '@/stores/universitiesStore'
import { useProfileStore } from '@/stores/profileStore'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { useIcons } from '@/stores/hooks/useIcons'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationsStore } from '@/stores/notificationsStore'
import { FeedScreen } from '@/screens/feed/FeedScreen'
import { NotasScreen } from '@/screens/notas/NotasScreen'
import { PerfilScreen } from '@/screens/perfil/PerfilScreen'
import { InstitutionAdminScreen } from '@/screens/perfil/InstitutionAdminScreen'
import { MainCtx, useMain, type MainHandlers } from '@/navigation/mainContext'
import { ExplorarStack } from '@/navigation/ExplorarStack'
import { NotificationsModal } from '@/modals/NotificationsModal'

const Tab = createBottomTabNavigator()

type TabId = 'feed' | 'explorar' | 'notas' | 'perfil'
type TabMeta = { name: string; id: TabId; ic: string; l: string; path: string }

// Solid-fill icon paths (Ionicons-derived) per tab. Inactive uses muted
// colour, active uses brand violet — kept as a single d-string per tab so
// the TabBar stays compact.
const TAB_META: TabMeta[] = [
  {
    name: 'FeedTab',
    id: 'feed',
    ic: '🏠',
    l: 'Feed',
    path: 'M261.56 101.28a8 8 0 00-11.06 0L66.4 277.15a8 8 0 00-2.47 5.79L63.9 448a32 32 0 0032 32H192a16 16 0 0016-16V328a8 8 0 018-8h80a8 8 0 018 8v136a16 16 0 0016 16h96.06a32 32 0 0032-32V282.94a8 8 0 00-2.47-5.79zM490.91 244.15l-74.8-71.56V64a16 16 0 00-16-16h-48a16 16 0 00-16 16v32l-57.92-55.38C272.77 35.14 264.71 32 256 32c-8.68 0-16.72 3.14-22.14 8.63l-212.7 203.5c-6.22 6-7 15.87-1.34 22.37A16 16 0 0043 267.56L250.5 69.28a8 8 0 0111.06 0l207.52 198.28a16 16 0 0022.59-.44c6.14-6.36 5.63-16.86-.76-22.97z',
  },
  {
    name: 'ExplorarTab',
    id: 'explorar',
    ic: '🔍',
    l: 'Explorar',
    path: 'M456.69 421.39L362.6 327.3a173.81 173.81 0 0034.84-104.58C397.44 126.38 319.06 48 222.72 48S48 126.38 48 222.72s78.38 174.72 174.72 174.72A173.81 173.81 0 00327.3 362.6l94.09 94.09a25 25 0 0035.3-35.3zM97.92 222.72a124.8 124.8 0 11124.8 124.8 124.95 124.95 0 01-124.8-124.8z',
  },
  {
    name: 'NotasTab',
    id: 'notas',
    ic: '📊',
    l: 'Notas',
    path: 'M104 496H72a24 24 0 01-24-24V328a24 24 0 0124-24h32a24 24 0 0124 24v144a24 24 0 01-24 24zM328 496h-32a24 24 0 01-24-24V232a24 24 0 0124-24h32a24 24 0 0124 24v240a24 24 0 01-24 24zM440 496h-32a24 24 0 01-24-24V120a24 24 0 0124-24h32a24 24 0 0124 24v352a24 24 0 01-24 24zM216 496h-32a24 24 0 01-24-24V40a24 24 0 0124-24h32a24 24 0 0124 24v432a24 24 0 01-24 24z',
  },
  {
    name: 'PerfilTab',
    id: 'perfil',
    ic: '👤',
    l: 'Perfil',
    path: 'M332.64 64.58C313.18 43.57 286 32 256 32c-30.16 0-57.43 11.5-76.8 32.38-19.58 21.11-29.12 49.8-26.88 80.78C156.76 206.28 203.27 256 256 256s99.16-49.71 103.67-110.82c2.27-30.7-7.33-59.33-27.03-80.6zM432 480H80a31 31 0 01-24.2-11.13c-6.5-7.77-9.12-18.38-7.18-29.11C57.06 392.94 83.4 353.61 124.8 326c36.78-24.51 83.37-38 131.2-38s94.42 13.5 131.2 38c41.4 27.6 67.74 66.93 76.18 113.75 1.94 10.73-.68 21.34-7.18 29.11A31 31 0 01432 480z',
  },
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
  const { T, brand, typography } = useTheme()
  const { onOpenSettings } = useMain()
  const currentUser = useAuthStore(s => s.currentUser)
  const unreadCount = useNotificationsStore(s => s.unreadCount)
  const loadUnreadCount = useNotificationsStore(s => s.loadUnreadCount)
  const [notificationsVisible, setNotificationsVisible] = useState(false)

  useEffect(() => {
    if (currentUser?.uid) {
      loadUnreadCount(currentUser.uid)
    }
  }, [currentUser?.uid])

  const subtitle =
    route.name === 'ExplorarTab'
      ? 'Encontre sua universidade'
      : route.name === 'NotasTab'
        ? 'Notas de corte & suas provas'
        : null

  const showBell = route.name === 'FeedTab'

  return (
    <View style={{ backgroundColor: T.bg }}>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 6,
          paddingBottom: 10,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View style={{ width: 40 }} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[typography.title, { color: T.text }]}>
            Uni<Text style={{ color: brand.primary }}>Vest</Text>
          </Text>
        </View>
        {route.name === 'PerfilTab' ? (
          <TouchableOpacity
            onPress={onOpenSettings}
            style={[
              styles.headerBtn,
              { backgroundColor: T.card2, borderColor: T.border },
            ]}
          >
            <Text style={{ fontSize: 16 }}>⚙️</Text>
          </TouchableOpacity>
        ) : showBell ? (
          <TouchableOpacity
            onPress={() => setNotificationsVisible(true)}
            style={[
              styles.headerBtn,
              { backgroundColor: T.card2, borderColor: T.border },
            ]}
          >
            <Text style={{ fontSize: 16 }}>🔔</Text>
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: T.accent }]}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>
      {subtitle && (
        <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
          <Text style={[typography.caption, { color: T.sub }]}>{subtitle}</Text>
        </View>
      )}
      <NotificationsModal
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
      />
    </View>
  )
}

function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const { T, brand, radius } = useTheme()
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
        paddingTop: 8,
      }}
    >
      {state.routes.map((route, idx) => {
        const meta = TAB_META.find(m => m.name === route.name)
        if (!meta) return null
        const active = state.index === idx
        const tint = active ? brand.primary : T.muted
        return (
          <Pressable
            key={route.name}
            onPress={() => {
              if (!active) navigation.navigate(route.name)
            }}
            style={({ pressed }) => [
              styles.tabItem,
              pressed && { opacity: 0.85 },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <View
              style={{
                paddingHorizontal: active ? 16 : 12,
                paddingVertical: 6,
                borderRadius: radius.full,
                backgroundColor: active ? T.acBg : 'transparent',
                flexDirection: 'row',
                alignItems: 'center',
                gap: active ? 8 : 0,
              }}
            >
              {/* Solid-fill SVG glyph for the four core tabs; emoji fallback otherwise. */}
              {meta.path ? (
                <Svg width={20} height={20} viewBox="0 0 512 512">
                  <Path fill={tint} d={meta.path} />
                </Svg>
              ) : (
                <Text style={{ fontSize: 20 }}>
                  {getIcon('tab_' + meta.id, meta.ic)}
                </Text>
              )}
              {/* Active label sits inline with the icon (pill shape grows). */}
              {active && (
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: brand.primary,
                  }}
                >
                  {meta.l}
                </Text>
              )}
            </View>
          </Pressable>
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

const styles = StyleSheet.create({
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
})
