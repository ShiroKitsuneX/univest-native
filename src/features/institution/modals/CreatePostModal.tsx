import { useEffect, useState } from 'react'
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { TAG_D, TAG_L } from '@/theme/palette'
import { BottomSheet } from '@/components/BottomSheet'
import { Button } from '@/shared/components'
import {
  publishInstitutionPost,
  INSTITUTION_POST_TAGS,
  InvalidPostError,
  NotInstitutionError,
  WrongInstitutionError,
  type InstitutionPostTag,
} from '@/features/institution/services/institutionPostsService'
import { logger } from '@/core/logging/logger'

type Props = {
  visible: boolean
  onClose: () => void
  uniId: string
  // Fired after a successful publish so the parent can refresh local
  // listings or dismiss surrounding UI.
  onPublished?: () => void
}

const TITLE_MAX = 120
const BODY_MAX = 600

export function CreatePostModal({ visible, onClose, uniId, onPublished }: Props) {
  const { T, isDark, brand, radius, typography } = useTheme()
  const tagPalette = isDark ? TAG_D : TAG_L

  const [type, setType] = useState<InstitutionPostTag>('news')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Reset on each open so the composer always starts clean (matches
  // AddGradeModal pattern). Without this, the previous draft leaks into the
  // next session even after a successful publish.
  useEffect(() => {
    if (visible) {
      setType('news')
      setTitle('')
      setBody('')
      setSubmitting(false)
    }
  }, [visible])

  const titleTooShort = title.trim().length > 0 && title.trim().length < 6
  const bodyTooShort = body.trim().length > 0 && body.trim().length < 12
  const canSubmit =
    title.trim().length >= 6 && body.trim().length >= 12 && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await publishInstitutionPost({
        uniId,
        type,
        title: title.trim(),
        body: body.trim(),
      })
      onPublished?.()
      onClose()
    } catch (err) {
      if (
        err instanceof InvalidPostError ||
        err instanceof NotInstitutionError ||
        err instanceof WrongInstitutionError
      ) {
        Alert.alert('Não foi possível publicar', err.message)
      } else {
        logger.warn('CreatePostModal submit:', (err as Error)?.message)
        Alert.alert(
          'Erro',
          'Não foi possível publicar agora. Tente novamente em instantes.'
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} T={T}>
      <View style={{ padding: 20, paddingBottom: 24 }}>
        <View style={styles.headerRow}>
          <Text
            style={[typography.headline, { color: T.text, fontSize: 18 }]}
          >
            Nova publicação
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

        <Text style={[typography.eyebrow, { color: T.muted, marginTop: 4 }]}>
          CATEGORIA
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 10, gap: 8 }}
          keyboardShouldPersistTaps="handled"
        >
          {INSTITUTION_POST_TAGS.map(t => {
            const tag = tagPalette[t.id]
            const active = type === t.id
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => setType(t.id)}
                style={[
                  styles.tagChip,
                  {
                    backgroundColor: active ? tag.bg : T.card2,
                    borderColor: active ? tag.b : T.border,
                    borderRadius: radius.full,
                  },
                ]}
              >
                <Text style={{ fontSize: 13 }}>{t.icon}</Text>
                <Text
                  style={{
                    color: active ? tag.tx : T.sub,
                    fontSize: 12,
                    fontWeight: '700',
                  }}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        <Text
          style={[typography.eyebrow, { color: T.muted, marginTop: 6 }]}
        >
          TÍTULO
        </Text>
        <TextInput
          value={title}
          onChangeText={t => setTitle(t.slice(0, TITLE_MAX))}
          placeholder="Ex.: FUVEST 2026 — Inscrições abertas"
          placeholderTextColor={T.muted}
          style={[
            styles.input,
            {
              backgroundColor: T.inp,
              borderColor: titleTooShort ? '#f87171' : T.inpB,
              color: T.text,
              borderRadius: radius.md,
            },
          ]}
        />
        <Text
          style={{
            color: titleTooShort ? '#f87171' : T.muted,
            fontSize: 11,
            marginTop: 4,
          }}
        >
          {titleTooShort
            ? 'Pelo menos 6 caracteres'
            : `${title.length}/${TITLE_MAX}`}
        </Text>

        <Text
          style={[typography.eyebrow, { color: T.muted, marginTop: 14 }]}
        >
          CONTEÚDO
        </Text>
        <TextInput
          value={body}
          onChangeText={t => setBody(t.slice(0, BODY_MAX))}
          placeholder="Detalhes do anúncio, datas, links e o que mais for relevante."
          placeholderTextColor={T.muted}
          multiline
          textAlignVertical="top"
          style={[
            styles.textarea,
            {
              backgroundColor: T.inp,
              borderColor: bodyTooShort ? '#f87171' : T.inpB,
              color: T.text,
              borderRadius: radius.md,
            },
          ]}
        />
        <Text
          style={{
            color: bodyTooShort ? '#f87171' : T.muted,
            fontSize: 11,
            marginTop: 4,
          }}
        >
          {bodyTooShort
            ? 'Pelo menos 12 caracteres'
            : `${body.length}/${BODY_MAX}`}
        </Text>

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
            disabled={!canSubmit}
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
          Sua publicação aparece no feed de quem segue {brand && '🎓'} a
          universidade.
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
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '600',
    borderWidth: 1,
    marginTop: 6,
  },
  textarea: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    lineHeight: 20,
    borderWidth: 1,
    marginTop: 6,
    minHeight: 130,
  },
})
