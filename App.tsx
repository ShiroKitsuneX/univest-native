import { useState, useCallback } from 'react'
import { View, Alert, StatusBar } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native'

import { useTheme } from '@/theme/useTheme'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { logout } from '@/services/auth'
import { toggleUniversityFollow } from '@/features/explorar/services/universityService'
import { usePostsStore } from '@/stores/postsStore'
import { useUniversitiesStore } from '@/stores/universitiesStore'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { useAuthStore } from '@/stores/authStore'
import { RootNavigator } from '@/navigation/RootNavigator'
import { MainTabs } from '@/navigation/MainTabs'
import { ShareModal } from '@/modals/ShareModal'
import { UniSortModal } from '@/modals/UniSortModal'
import { AddGradeModal } from '@/modals/AddGradeModal'
import { SavedPostsModal } from '@/modals/SavedPostsModal'
import { EventDetailModal } from '@/modals/EventDetailModal'
import { ExamDetailModal } from '@/modals/ExamDetailModal'
import { DiscoverCoursesModal } from '@/modals/DiscoverCoursesModal'
import { AvatarPickerModal } from '@/modals/AvatarPickerModal'
import { EditNameModal } from '@/modals/EditNameModal'
import { EditCoursesModal } from '@/modals/EditCoursesModal'
import { LocationSettingsModal } from '@/modals/LocationSettingsModal'
import { GoalsModal } from '@/modals/GoalsModal'
import { SettingsModal } from '@/modals/SettingsModal'
import { logger } from '@/services/logger'

function MainApp() {
  const { T, isDark } = useTheme()

  const currentUser = useAuthStore(s => s.currentUser)
  const setUserData = useAuthStore(s => s.setUserData)

  const setStep = useOnboardingStore(s => s.setStep)
  const setDone = useOnboardingStore(s => s.setDone)
  const setC1 = useOnboardingStore(s => s.setC1)
  const setC2 = useOnboardingStore(s => s.setC2)

  const setUnis = useUniversitiesStore(s => s.setUnis)
  const selUni = useUniversitiesStore(s => s.selUni)
  const setSU = useUniversitiesStore(s => s.setSelUni)
  const [goalsModal, setGoalsModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const [mCfg, setMcfg] = useState(false)
  const [mPho, setMpho] = useState(false)
  const [mEdit, setMedit] = useState(false)
  const [mNome, setMnome] = useState(false)
  const [mEv, setMev] = useState(null)
  const [mExam, setMexam] = useState(null)
  const [mGr, setMgr] = useState(false)
  const [mShr, setMshr] = useState(null)
  const [mDisc, setMdisc] = useState(false)
  const [mUni, setMUni] = useState(false)
  const [mLoc, setMloc] = useState(false)
  const [mSaved, setMSaved] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        useUniversitiesStore.getState().load(),
        usePostsStore.getState().load(),
      ])
      if (currentUser) {
        await usePostsStore.getState().loadLikesFor(currentUser.uid)
      }
    } catch (e) {
      logger.warn('onRefresh:', e?.message)
    }
    setRefreshing(false)
  }, [currentUser])

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout()
          setDone(false)
          setStep(0)
        },
      },
    ])
  }

  const toggleFollow = async (uni, isFollowing) => {
    if (!currentUser) {
      Alert.alert('Atenção', 'Faça login para seguir universidades')
      return
    }
    setUnis(prev =>
      prev.map(u =>
        u.name === uni.name
          ? {
              ...u,
              followed: isFollowing,
              followersCount: (u.followersCount || 0) + (isFollowing ? 1 : -1),
            }
          : u
      )
    )
    if (selUni?.name === uni.name)
      setSU(p => ({
        ...p,
        followed: isFollowing,
        followersCount: (p.followersCount || 0) + (isFollowing ? 1 : -1),
      }))
    setUserData(prev => {
      const cur = prev?.followedUnis || []
      const next = isFollowing
        ? [...new Set([...cur, uni.name])]
        : cur.filter(n => n !== uni.name)
      return { ...(prev || {}), followedUnis: next }
    })
    try {
      await toggleUniversityFollow(
        currentUser.uid,
        String(uni.id),
        uni.name,
        isFollowing
      )
    } catch (err) {
      logger.warn('toggleFollow error:', err?.message)
      setUnis(prev =>
        prev.map(u =>
          u.name === uni.name
            ? {
                ...u,
                followed: !isFollowing,
                followersCount:
                  (u.followersCount || 0) + (isFollowing ? -1 : 1),
              }
            : u
        )
      )
      if (selUni?.name === uni.name)
        setSU(p => ({ ...p, followed: !isFollowing }))
      setUserData(prev => {
        const cur = prev?.followedUnis || []
        const next = !isFollowing
          ? [...new Set([...cur, uni.name])]
          : cur.filter(n => n !== uni.name)
        return { ...(prev || {}), followedUnis: next }
      })
      Alert.alert('Erro', 'Não foi possível seguir. ' + (err?.message || ''))
    }
  }

  const handlers = {
    refreshing,
    onRefresh,
    onOpenSettings: () => setMcfg(true),
    onShare: item => setMshr(item),
    onOpenLocation: () => setMloc(true),
    onOpenDiscover: () => setMdisc(true),
    onOpenSort: () => setMUni(true),
    onEditCourses: () => setMedit(true),
    onAddGrade: () => setMgr(true),
    onChangePhoto: () => setMpho(true),
    onChangeName: () => {
      setMcfg(false)
      setMnome(true)
    },
    onShowSaved: () => setMSaved(true),
    onAddGoal: () => setGoalsModal(true),
    onOpenEvent: ev => setMev(ev),
    onOpenExam: exam => setMexam(exam),
    onSelectUni: u => setSU(u),
    onToggleFollow: toggleFollow,
  }

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <MainTabs handlers={handlers} />

      <SettingsModal
        visible={mCfg}
        onClose={() => setMcfg(false)}
        onOpenName={() => setMnome(true)}
        onOpenPhoto={() => setMpho(true)}
        onOpenEditCourses={() => setMedit(true)}
        onOpenLocation={() => setMloc(true)}
        onOpenGoals={() => setGoalsModal(true)}
        onLogout={handleLogout}
      />

      <AvatarPickerModal visible={mPho} onClose={() => setMpho(false)} />

      <EditNameModal visible={mNome} onClose={() => setMnome(false)} />

      {/* Edit course */}
      <EditCoursesModal
        visible={mEdit}
        onClose={() => setMedit(false)}
        onSave={(a, b) => {
          setC1(a)
          setC2(b)
        }}
      />

      <EventDetailModal event={mEv} onClose={() => setMev(null)} />

      <AddGradeModal visible={mGr} onClose={() => setMgr(false)} />

      <ShareModal item={mShr} onClose={() => setMshr(null)} />

      <DiscoverCoursesModal
        visible={mDisc}
        onClose={() => setMdisc(false)}
        onPickCourse={setC1}
      />

      <UniSortModal visible={mUni} onClose={() => setMUni(false)} />

      <ExamDetailModal exam={mExam} onClose={() => setMexam(null)} />

      <LocationSettingsModal visible={mLoc} onClose={() => setMloc(false)} />

      <GoalsModal visible={goalsModal} onClose={() => setGoalsModal(false)} />

      {/* Saved posts */}
      <SavedPostsModal visible={mSaved} onClose={() => setMSaved(false)} />
    </View>
  )
}

function ThemedNavigation() {
  const { T, isDark } = useTheme()
  const navTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: T.bg,
          card: T.bg,
          text: T.text,
          border: T.border,
          primary: T.accent,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: T.bg,
          card: T.bg,
          text: T.text,
          border: T.border,
          primary: T.accent,
        },
      }
  return (
    <NavigationContainer theme={navTheme}>
      <RootNavigator Main={MainApp} />
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemedNavigation />
      </SafeAreaProvider>
    </ErrorBoundary>
  )
}
