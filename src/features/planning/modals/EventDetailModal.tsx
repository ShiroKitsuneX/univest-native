import { View, Text, TouchableOpacity, Linking } from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { BottomSheet } from '@/components/BottomSheet'

export function EventDetailModal({ event, onClose }) {
  const { T, AT } = useTheme()

  const lbl: {
    color: string
    fontSize: number
    fontWeight: '700'
    textTransform: 'uppercase'
    letterSpacing: number
  } = {
    color: T.muted,
    fontSize: 10,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  }

  return (
    <BottomSheet visible={!!event} onClose={onClose} T={T}>
      {event && (
        <View style={{ padding: 20, paddingBottom: 24 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              marginBottom: 14,
            }}
          >
            <View
              style={{
                backgroundColor: event.cor,
                borderRadius: 12,
                width: 52,
                height: 52,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: 'rgba(255,255,255,.55)',
                  fontSize: 8,
                  fontWeight: '700',
                }}
              >
                {event.month}
              </Text>
              <Text
                style={{
                  color: '#fff',
                  fontSize: event.dayLabel === '—' ? 18 : 15,
                  fontWeight: '800',
                }}
              >
                {event.dayLabel}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,.45)', fontSize: 8 }}>
                {event.year}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: T.text,
                  fontSize: 15,
                  fontWeight: '800',
                  lineHeight: 20,
                }}
              >
                {event.event}
              </Text>
              <TouchableOpacity onPress={() => Linking.openURL(event.site)}>
                <Text
                  style={{ color: T.accent, fontSize: 12, fontWeight: '700' }}
                >
                  {event.uni} ↗
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={{
              backgroundColor: T.card2,
              borderRadius: 14,
              padding: 14,
              marginBottom: 18,
              borderWidth: 1,
              borderColor: T.border,
            }}
          >
            <Text style={[lbl, { marginBottom: 6 }]}>ℹ️ Resumo</Text>
            <Text style={{ color: T.text, fontSize: 13, lineHeight: 22 }}>
              {event.desc}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => Linking.openURL(event.site)}
            style={{
              padding: 14,
              borderRadius: 16,
              backgroundColor: T.accent,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: AT, fontSize: 14, fontWeight: '800' }}>
              🌐 Ver fonte oficial →
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </BottomSheet>
  )
}
