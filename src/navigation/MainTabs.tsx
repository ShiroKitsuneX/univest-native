import { View, Text, TouchableOpacity } from 'react-native'
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
import { useProfileStore } from '@/stores/profileStore'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { useCoursesStore } from '@/stores/coursesStore'
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
  const fbIcons = useCoursesStore(s => s.fbIcons)
  const getIcon = (id: string, fallback: string): string =>
    fbIcons[id] || fallback
  const { onTabPress } = useMain()

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
        return (
          <TouchableOpacity
            key={route.name}
            onPress={() => {
              onTabPress?.()
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
              <Text style={{ fontSize: 20 }}>
                {getIcon('tab_' + meta.id, meta.ic)}
              </Text>
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
      onSelectUni={(u: unknown) => {
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
        onOpenSettings={h.onOpenSettings}
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
      onSelectUni={(u: unknown) => {
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
