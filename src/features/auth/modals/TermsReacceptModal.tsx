import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme/useTheme'
import {
  checkTermsStatus,
  acceptCurrentTerms,
  DEFAULT_TERMS_CONTENT,
  type TermsStatus,
} from '@/features/auth/services/termsService'
import { useAuthStore } from '@/stores/authStore'

type Props = {
  visible: boolean
  onAccepted: () => void
  onDeclined: () => void
}

export function TermsReacceptModal({ visible, onAccepted, onDeclined }: Props) {
  const insets = useSafeAreaInsets()
  const { T, AT } = useTheme()
  const currentUser = useAuthStore(s => s.currentUser)
  const [termsStatus, setTermsStatus] = useState<TermsStatus>({
    terms: null,
    userAcceptance: null,
    needsReaccept: true,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (visible && currentUser) {
      checkTermsStatus(currentUser.uid).then(setTermsStatus)
    }
  }, [visible, currentUser])

  const handleAccept = async () => {
    if (!currentUser) return
    setLoading(true)
    const success = await acceptCurrentTerms(currentUser.uid)
    setLoading(false)
    if (success) {
      onAccepted()
    } else {
      Alert.alert(
        'Erro',
        'Não foi possível aceitar os termos. Tente novamente.'
      )
    }
  }

  const handleDecline = () => {
    Alert.alert(
      'Termos Obrigatórios',
      'Você precisa aceitar os Termos e Condições para continuar usando o app.',
      [
        { text: 'Ler Termos', onPress: () => {} },
        { text: 'Sair', style: 'destructive', onPress: onDeclined },
      ]
    )
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleDecline}
    >
      <View style={[styles.container, { backgroundColor: T.bg }]}>
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + 20,
              paddingBottom: 16,
              borderBottomColor: T.border,
            },
          ]}
        >
          <Text style={[styles.title, { color: T.text }]}>
            Termos Atualizados
          </Text>
          <Text style={[styles.subtitle, { color: T.sub }]}>
            Nossos Termos e Condições foram atualizados. Por favor, leia e
            aceite para continuar.
          </Text>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        >
          <View
            style={[
              styles.termsBox,
              { backgroundColor: T.card, borderColor: T.border },
            ]}
          >
            <Text style={[styles.termsText, { color: T.sub }]}>
              {termsStatus.terms?.content || DEFAULT_TERMS_CONTENT}
            </Text>
          </View>
          {termsStatus.terms && (
            <Text style={[styles.version, { color: T.muted }]}>
              Versão {termsStatus.terms.version} - Atualizado em{' '}
              {new Date(termsStatus.terms.createdAt).toLocaleDateString(
                'pt-BR'
              )}
            </Text>
          )}
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              paddingBottom: insets.bottom + 16,
              backgroundColor: T.card,
              borderTopColor: T.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleAccept}
            disabled={loading}
            style={[styles.acceptButton, { backgroundColor: T.accent }]}
          >
            <Text style={[styles.acceptText, { color: AT }]}>
              {loading ? 'Aceitando...' : 'Aceitar Termos e Continuar'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDecline}
            style={styles.declineButton}
          >
            <Text style={[styles.declineText, { color: T.sub }]}>
              Sair do App
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  termsBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  termsText: {
    fontSize: 13,
    lineHeight: 22,
  },
  version: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 12,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  acceptButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  acceptText: {
    fontSize: 16,
    fontWeight: '800',
  },
  declineButton: {
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  declineText: {
    fontSize: 14,
  },
})
