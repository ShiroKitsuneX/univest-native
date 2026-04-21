import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { BottomSheet } from '@/components/BottomSheet'
import { useProfileStore } from '@/stores/profileStore'

export function AddGradeModal({ visible, onClose }) {
  const { T, isDark, AT } = useTheme()

  const gs = useProfileStore(s => s.gs)
  const setGs = useProfileStore(s => s.setGs)
  const ng = useProfileStore(s => s.ng)
  const setNg = useProfileStore(s => s.setNg)

  const lbl = {
    color: T.muted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} T={T}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ padding: 20, paddingBottom: 24 }}>
          <Text
            style={{
              color: T.text,
              fontSize: 17,
              fontWeight: '800',
              marginBottom: 4,
            }}
          >
            ➕ Adicionar Nota
          </Text>
          <Text style={{ color: T.sub, fontSize: 13, marginBottom: 16 }}>
            Simulado, prova ou vestibular
          </Text>
          <TextInput
            value={ng.ex}
            onChangeText={v => setNg({ ...ng, ex: v })}
            placeholder="Nome da prova (ex: FUVEST Simulado 3)"
            placeholderTextColor={T.muted}
            style={{
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: T.inpB,
              backgroundColor: T.inp,
              color: T.text,
              fontSize: 14,
              marginBottom: 8,
            }}
          />
          <TextInput
            value={ng.dt}
            onChangeText={v => setNg({ ...ng, dt: v })}
            placeholder="Mês/Ano (ex: Jun/2025)"
            placeholderTextColor={T.muted}
            style={{
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: T.inpB,
              backgroundColor: T.inp,
              color: T.text,
              fontSize: 14,
              marginBottom: 14,
            }}
          />
          <Text style={[lbl, { marginBottom: 10 }]}>Tipo</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
            {[
              ['prova', '📝 Prova'],
              ['simulado', '📋 Simulado'],
            ].map(([v, l]) => (
              <TouchableOpacity
                key={v}
                onPress={() => setNg({ ...ng, type: v })}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: ng.type === v ? T.accent : T.card2,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: ng.type === v ? T.accent : T.border,
                }}
              >
                <Text
                  style={{
                    color: ng.type === v ? AT : T.sub,
                    fontSize: 13,
                    fontWeight: '700',
                  }}
                >
                  {l}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[lbl, { marginBottom: 10 }]}>Notas por área</Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8,
              marginBottom: 18,
            }}
          >
            {[
              ['l', 'Linguagens', '0–100'],
              ['h', 'Humanas', '0–100'],
              ['n', 'Natureza', '0–100'],
              ['m', 'Matemática', '0–100'],
              ['r', 'Redação', '0–1000'],
            ].map(([k, l, ph]) => (
              <View key={k} style={{ width: k === 'r' ? '100%' : '48%' }}>
                <Text
                  style={{
                    color: T.muted,
                    fontSize: 10,
                    fontWeight: '700',
                    marginBottom: 4,
                  }}
                >
                  {l}
                </Text>
                <TextInput
                  value={ng[k]}
                  onChangeText={v => setNg({ ...ng, [k]: v })}
                  placeholder={ph}
                  placeholderTextColor={T.muted}
                  keyboardType="numeric"
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: T.inpB,
                    backgroundColor: T.inp,
                    color: T.text,
                    fontSize: 14,
                  }}
                />
              </View>
            ))}
          </View>
          <TouchableOpacity
            onPress={() => {
              if (!ng.ex.trim()) return
              setGs([
                ...gs,
                {
                  id: Date.now(),
                  ex: ng.ex,
                  dt: ng.dt || '2025',
                  type: ng.type || 'prova',
                  s: {
                    l: +ng.l || 0,
                    h: +ng.h || 0,
                    n: +ng.n || 0,
                    m: +ng.m || 0,
                    r: +ng.r || 0,
                  },
                },
              ])
              setNg({
                ex: '',
                dt: '',
                l: '',
                h: '',
                n: '',
                m: '',
                r: '',
                type: 'prova',
              })
              onClose()
            }}
            disabled={!ng.ex.trim()}
            style={{
              padding: 14,
              borderRadius: 16,
              backgroundColor: ng.ex.trim() ? T.accent : T.border,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: ng.ex.trim() ? AT : T.muted,
                fontSize: 15,
                fontWeight: '800',
              }}
            >
              Salvar nota ✓
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  )
}
