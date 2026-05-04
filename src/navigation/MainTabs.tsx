import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useEffect, useState } from 'react'
import { useUniversitiesStore } from '@/stores/universitiesStore'
import { ensureExamReminders } from '@/features/planning/services/examRemindersService'
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
import { useAuthStore } from '@/stores/authStore'
import { useNotificationsStore } from '@/stores/notificationsStore'
import { SvgIcon } from '@/shared/components/SvgIcon'
import { FeedScreen } from '@/screens/feed/FeedScreen'
import { NotasScreen } from '@/screens/notas/NotasScreen'
import { PerfilScreen } from '@/screens/perfil/PerfilScreen'
import { InstitutionAdminScreen } from '@/screens/perfil/InstitutionAdminScreen'
import { InstitutionAnalyticsScreen } from '@/features/institution/screens/InstitutionAnalyticsScreen'
import { MainCtx, useMain, type MainHandlers } from '@/navigation/mainContext'
import { ExplorarStack } from '@/navigation/ExplorarStack'
import { NotificationsModal } from '@/features/feed/modals/NotificationsModal'

const Tab = createBottomTabNavigator()

type TabId = 'feed' | 'explorar' | 'notas' | 'analises' | 'perfil'
// Each tab maps to one of our local SVG icons (loaded via `<SvgIcon>`).
// Active vs inactive is communicated by colour alone — the icons are
// solid-fill Ionicons SVGs imported from `src/assets/icons/`.
type TabMeta = {
  name: string
  id: TabId
  l: string
  icon: import('@/shared/components/SvgIcon').IconName
}

// Tab metadata is keyed by tab `name` (the React Navigation route id).
// Both `NotasTab` and `AnalisesTab` use the same `statsChart` glyph and
// occupy the same slot — only one ever renders per account type.
const TAB_META: TabMeta[] = [
  { name: 'FeedTab', id: 'feed', l: 'Feed', icon: 'home' },
  { name: 'ExplorarTab', id: 'explorar', l: 'Explorar', icon: 'search' },
  { name: 'NotasTab', id: 'notas', l: 'Notas', icon: 'statsChart' },
  { name: 'AnalisesTab', id: 'analises', l: 'Análises', icon: 'statsChart' },
  { name: 'PerfilTab', id: 'perfil', l: 'Perfil', icon: 'person' },
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
  const navigation = useNavigation<Nav>()
  const { T, brand } = useTheme()
  const { onOpenSettings, onSelectUni } = useMain()
  const currentUser = useAuthStore(s => s.currentUser)
  const unreadCount = useNotificationsStore(s => s.unreadCount)
  const loadUnreadCount = useNotificationsStore(s => s.loadUnreadCount)
  const goalsUnis = useUniversitiesStore(s => s.goalsUnis)
  const unis = useUniversitiesStore(s => s.unis)
  const [notificationsVisible, setNotificationsVisible] = useState(false)

  // On sign-in (or whenever the user/goal-list changes) refresh the unread
  // badge AND idempotently seed exam-reminder notifications. The reminder
  // generator is dedupe-keyed so re-running this on every change is safe.
  useEffect(() => {
    const uid = currentUser?.uid
    if (!uid) return
    loadUnreadCount(uid)
    ensureExamReminders(uid, goalsUnis).then(() => {
      // Re-pull the badge once reminders may have been created so the user
      // sees the new count without having to open the modal first.
      loadUnreadCount(uid)
    })
  }, [currentUser?.uid, goalsUnis])

  // Every screen owns its own hero ("Olá, Anna 👋", "Explorar", etc.) —
  // the global TabHeader stays minimal: small UniVest wordmark on the left
  // for brand presence, bell or cog on the right.
  const showBell = route.name !== 'PerfilTab'
  const showCog = route.name === 'PerfilTab'

  return (
    <View style={{ backgroundColor: T.bg }}>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 6,
          paddingBottom: 4,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '800',
            color: T.text,
            letterSpacing: -0.3,
          }}
        >
          Uni<Text style={{ color: brand.primary }}>Vest</Text>
        </Text>
        {showCog ? (
          <TouchableOpacity
            onPress={onOpenSettings}
            style={[
              styles.headerBtn,
              { backgroundColor: T.card2, borderColor: T.border },
            ]}
          >
            <SvgIcon name="cog" size={18} color={T.text} />
          </TouchableOpacity>
        ) : showBell ? (
          <TouchableOpacity
            onPress={() => setNotificationsVisible(true)}
            style={[
              styles.headerBtn,
              { backgroundColor: T.card2, borderColor: T.border },
            ]}
          >
            <SvgIcon name="notifications" size={20} color={T.text} />
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
      <NotificationsModal
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
        onSelect={({ uniId }) => {
          if (!uniId) return
          const uni = unis.find(u => String(u.id) === String(uniId))
          if (uni) {
            onSelectUni?.(uni)
            navigation.navigate('ExplorarTab', { screen: 'UniversityDetail' })
          }
        }}
      />
    </View>
  )
}

function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const { T, brand, radius } = useTheme()

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
              {/* Local SVG glyph from `src/assets/icons/`. Active colour
                  is the brand violet; inactive is muted. */}
              <SvgIcon name={meta.icon} size={22} color={tint} />
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
      onOpenCreator={h.onOpenCreator}
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

function AnalisesTab() {
  return <InstitutionAnalyticsScreen />
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
  // The third-tab slot swaps based on account type:
  //   - common user → NotasTab (grades, cut-offs, calculator)
  //   - institution → AnalisesTab (reach, engagement, top posts)
  // Same statsChart glyph either way — only the label and screen change.
  const isInstitution = useAuthStore(s => s.isInstitution)()
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
        {isInstitution ? (
          <Tab.Screen name="AnalisesTab" component={AnalisesTab} />
        ) : (
          <Tab.Screen name="NotasTab" component={NotasTab} />
        )}
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
