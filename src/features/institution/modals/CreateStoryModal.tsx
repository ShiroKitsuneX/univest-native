import { useEffect, useState } from 'react'
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { BottomSheet } from '@/components/BottomSheet'
import { Button } from '@/shared/components'
import {
  publishInstitutionStory,
  InvalidStoryError,
  NotInstitutionError,
  WrongInstitutionError,
} from '@/features/institution/services/institutionStoriesService'
import { logger } from '@/core/logging/logger'

type Props = {
  visible: boolean
  onClose: () => void
  uniId: string
  onPublished?: () => void
}

export function CreateStoryModal({
  visible,
  onClose,
  uniId,
  onPublished,
}: Props) {
  const { T, brand, radius, typography } = useTheme()
  const [imageUrl, setImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (visible) {
      setImageUrl('')
      setSubmitting(false)
    }
  }, [visible])

  const valid = /^https?:\/\/[^\s]+$/i.test(imageUrl.trim())

  const handleSubmit = async () => {
    if (!valid || submitting) return
    setSubmitting(true)
    try {
      await publishInstitutionStory({ uniId, imageUrl: imageUrl.trim() })
      onPublished?.()
      onClose()
    } catch (err) {
      if (
        err instanceof InvalidStoryError ||
        err instanceof NotInstitutionError ||
        err instanceof WrongInstitutionError
      ) {
        Alert.alert('Não foi possível publicar', err.message)
      } else {
        logger.warn('CreateStoryModal:', (err as Error)?.message)
        Alert.alert('Erro', 'Não foi possível publicar agora.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} T={T}>
      <View style={{ padding: 20, paddingBottom: 24 }}>
        <View style={styles.headerRow}>
          <Text style={[typography.headline, { color: T.text, fontSize: 18 }]}>
            Nova story (24h)
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.iconBtn,
              { backgroundColor: T.card2, borderColor: T.border },
            ]}
          >
            <Text style={{ color: T.sub, fontSize: 16, fontWeight: '700' }}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[typography.eyebrow, { color: T.muted, marginTop: 6 }]}>
          URL DA IMAGEM
        </Text>
        <TextInput
          value={imageUrl}
          onChangeText={setImageUrl}
          placeholder="https://exemplo.com/foto.jpg"
          placeholderTextColor={T.muted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          style={[
            styles.input,
            {
              backgroundColor: T.inp,
              borderColor: T.inpB,
              color: T.text,
              borderRadius: radius.md,
            },
          ]}
        />
        <Text
          style={{ color: T.muted, fontSize: 11, marginTop: 4, lineHeight: 16 }}
        >
          Use uma URL pública (https). Em uma versão futura você poderá fazer
          upload direto pela câmera.
        </Text>

        {valid && (
          <View
            style={{
              marginTop: 14,
              borderRadius: radius.lg,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: T.border,
              aspectRatio: 9 / 16,
              backgroundColor: T.card2,
            }}
          >
            <Image
              source={{ uri: imageUrl.trim() }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>
        )}

        <View style={{ marginTop: 18, flexDirection: 'row', gap: 10 }}>
          <Button
            onPress={onClose}
            variant="secondary"
            size="md"
            style={{ flex: 1 }}
          >
            Cancelar
          </Button>
          <Button
            onPress={handleSubmit}
            variant="primary"
            size="md"
            loading={submitting}
            disabled={!valid}
            style={{ flex: 1 }}
          >
            Publicar
          </Button>
        </View>

        <Text
          style={{
            color: T.muted,
            fontSize: 11,
            marginTop: 12,
            lineHeight: 16,
          }}
        >
          Stories expiram automaticamente em 24 horas. Quem segue a {brand && ''}
          universidade vê no topo do feed.
        </Text>
      </View>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '500',
    borderWidth: 1,
    marginTop: 6,
  },
})
