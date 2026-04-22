import { View, Text, TouchableOpacity } from 'react-native'
import { BottomSheet } from '@/components/BottomSheet'
import { useTheme } from '@/theme/useTheme'
import { useProfileStore, type Theme } from '@/stores/profileStore'
import { useAuthStore } from '@/stores/authStore'

export function SettingsModal({
  visible,
  onClose,
  onOpenName,
  onOpenPhoto,
  onOpenEditCourses,
  onOpenLocation,
  onOpenGoals,
  onLogout,
}) {
  const { T, AT } = useTheme()
  const theme = useProfileStore(s => s.theme)
  const setTheme = useProfileStore(s => s.setTheme)

  const nome = useProfileStore(s => s.nome)
  const sobrenome = useProfileStore(s => s.sobrenome)
  const currentUser = useAuthStore(s => s.currentUser)

  const lbl = {
    color: T.muted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} T={T}>
      <View style={{ padding: 20, paddingBottom: 24 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Text style={{ color: T.text, fontSize: 18, fontWeight: '800' }}>
            ⚙️ Configurações
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: T.card2,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: T.sub, fontSize: 14 }}>✕</Text>
          </TouchableOpacity>
        </View>
        <Text style={[lbl, { marginBottom: 10 }]}>Tema</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
          {[
            ['dark', '🌙 Escuro'],
            ['light', '☀️ Claro'],
            ['auto', '🔄 Auto'],
          ].map(([v, l]) => (
            <TouchableOpacity
              key={v}
              onPress={() => setTheme(v as Theme)}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 12,
                backgroundColor: theme === v ? T.accent : T.card2,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme === v ? T.accent : T.border,
              }}
            >
              <Text
                style={{
                  color: theme === v ? AT : T.sub,
                  fontSize: 12,
                  fontWeight: '700',
                }}
              >
                {l}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[lbl, { marginBottom: 10 }]}>Conta</Text>
        {[
          [
            'Nome',
            nome && sobrenome ? nome + ' ' + sobrenome : nome || 'Não definido',
            () => {
              onClose()
              onOpenName()
            },
          ],
          [
            'Alterar foto de perfil',
            'Ícone e cor',
            () => {
              onClose()
              onOpenPhoto()
            },
          ],
          [
            'Editar opções de curso',
            'Altere suas preferências',
            () => {
              onClose()
              onOpenEditCourses()
            },
          ],
          [
            'Localização',
            'Sua cidade e destino de estudos',
            () => {
              onClose()
              onOpenLocation()
            },
          ],
          [
            'Metas de vestibular',
            'Universidades que você vai fazer',
            () => {
              onClose()
              onOpenGoals()
            },
          ],
          ['E-mail', currentUser?.email || '—', () => {}],
        ].map(([ti, su, fn]) => (
          <TouchableOpacity
            key={ti}
            onPress={fn}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: T.card2,
              borderRadius: 14,
              padding: 15,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: T.border,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: T.text, fontSize: 14, fontWeight: '700' }}>
                {ti}
              </Text>
              <Text style={{ color: T.sub, fontSize: 12 }}>{su}</Text>
            </View>
            <Text style={{ color: T.muted, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        ))}
        <View
          style={{ height: 1, backgroundColor: T.border, marginVertical: 16 }}
        />
        <TouchableOpacity
          onPress={() => {
            onClose()
            onLogout()
          }}
          style={{
            backgroundColor: '#dc2626',
            borderRadius: 14,
            padding: 15,
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
            Sair
          </Text>
        </TouchableOpacity>
        <Text
          style={{
            color: T.muted,
            fontSize: 12,
            textAlign: 'center',
            marginTop: 8,
            marginBottom: 24,
          }}
        >
          UniVest v4.0 · Feito com
        </Text>
      </View>
    </BottomSheet>
  )
}
