import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { BottomSheet } from '@/components/BottomSheet'

export function ShareModal({ item, onClose }) {
  const { T, isDark } = useTheme()

  return (
    <BottomSheet visible={!!item} onClose={onClose} T={T}>
      {item && (
        <View style={{ padding: 20, paddingBottom: 24 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                color: T.text,
                fontSize: 17,
                fontWeight: '800',
              }}
            >
              Compartilhar
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: T.card2,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: T.sub, fontSize: 18, fontWeight: '600' }}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>
          <Text
            style={{
              color: T.sub,
              fontSize: 13,
              marginBottom: 18,
              lineHeight: 20,
            }}
          >
            {item.title}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              {
                l: 'WhatsApp',
                i: '💬',
                c: '#25D366',
                href: `https://api.whatsapp.com/send?text=${encodeURIComponent(item.title + '\n\nVia UniVest 🎓')}`,
              },
              {
                l: 'Twitter',
                i: '🐦',
                c: '#1DA1F2',
                href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(item.title)}`,
              },
              { l: 'Copiar', i: '🔗', c: T.accent, href: 'copy' },
            ].map(o => (
              <TouchableOpacity
                key={o.l}
                onPress={() => {
                  if (o.href === 'copy') {
                    Alert.alert('Copiado!', 'Texto copiado.')
                  } else {
                    Linking.openURL(o.href)
                  }
                  onClose()
                }}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 11,
                  borderRadius: 13,
                  backgroundColor: T.card2,
                  borderWidth: 1,
                  borderColor: T.border,
                }}
              >
                <Text style={{ fontSize: 22, marginBottom: 4 }}>{o.i}</Text>
                <Text style={{ fontSize: 10, fontWeight: '700', color: o.c }}>
                  {o.l}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </BottomSheet>
  )
}
