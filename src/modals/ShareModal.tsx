import { View, Text, TouchableOpacity, Linking, Share } from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { BottomSheet } from '@/components/BottomSheet'
import { Button } from '@/shared/components'
import { logger } from '@/core/logging/logger'

type Item = { title: string }

type Props = {
  item: Item | null | undefined | unknown
  onClose: () => void
  // Fires when the user picks a real share target (an external app or the
  // system share sheet). Lets callers bump share counters only when the
  // user actually intends to share, not just when the sheet opens.
  onShared?: () => void
}

export function ShareModal({ item, onClose, onShared }: Props) {
  const { T } = useTheme()
  const post = (item as Item) ?? null
  const title = post?.title ?? ''

  const text = title ? `${title}\n\nVia UniVest 🎓` : 'Via UniVest 🎓'

  const openSystemShare = async () => {
    try {
      const result = await Share.share({ message: text })
      if (result.action !== Share.dismissedAction) onShared?.()
    } catch (e) {
      logger.warn('Share.share:', (e as Error)?.message)
    } finally {
      onClose()
    }
  }

  const openExternal = (href: string) => {
    Linking.openURL(href).catch(() => {})
    onShared?.()
    onClose()
  }

  return (
    <BottomSheet visible={!!post} onClose={onClose} T={T}>
      {post && (
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
            {title}
          </Text>

          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            {[
              {
                l: 'WhatsApp',
                i: '💬',
                c: '#25D366',
                href: `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
              },
              {
                l: 'Twitter',
                i: '🐦',
                c: '#1DA1F2',
                href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}`,
              },
              {
                l: 'Telegram',
                i: '✈️',
                c: '#0088cc',
                href: `https://t.me/share/url?url=${encodeURIComponent('https://univest.app')}&text=${encodeURIComponent(title)}`,
              },
            ].map(o => (
              <TouchableOpacity
                key={o.l}
                onPress={() => openExternal(o.href)}
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

          <Button onPress={openSystemShare} variant="primary" fullWidth>
            Mais opções…
          </Button>
        </View>
      )}
    </BottomSheet>
  )
}
