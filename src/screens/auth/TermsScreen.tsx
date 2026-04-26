import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme/useTheme'
import {
  checkTermsStatus,
  DEFAULT_TERMS_CONTENT,
} from '@/features/auth/services/termsService'

export function TermsScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets()
  const { T, AT } = useTheme()
  const [terms, setTerms] = useState<{
    content: string
    version: number
    createdAt: string
  } | null>(null)

  useEffect(() => {
    checkTermsStatus(null).then(status => {
      if (status.terms) {
        setTerms({
          content: status.terms.content,
          version: status.terms.version,
          createdAt: status.terms.createdAt,
        })
      }
    })
  }, [])

  const handleBack = () => {
    navigation.goBack()
  }

  const handleAccept = () => {
    navigation.goBack()
  }

  return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={[styles.backText, { color: T.sub }]}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: T.text }]}>
          Termos e Condições
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        <View
          style={[
            styles.termsBox,
            { backgroundColor: T.card, borderColor: T.border },
          ]}
        >
          <Text style={[styles.termsText, { color: T.sub }]}>
            {terms?.content || DEFAULT_TERMS_CONTENT}
          </Text>
          {terms && (
            <Text style={[styles.version, { color: T.muted }]}>
              Versão {terms.version} - Atualizado em{' '}
              {new Date(terms.createdAt).toLocaleDateString('pt-BR')}
            </Text>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          onPress={handleAccept}
          style={[styles.acceptBtn, { backgroundColor: T.accent }]}
        >
          <Text style={[styles.acceptText, { color: AT }]}>Entendi</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backBtn: { padding: 8 },
  backText: { fontSize: 16 },
  title: { fontSize: 18, fontWeight: '700' },
  content: { flex: 1, padding: 16 },
  termsBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  termsText: { fontSize: 13, lineHeight: 22 },
  version: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 16,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  acceptBtn: { padding: 16, borderRadius: 16, alignItems: 'center' },
  acceptText: { fontSize: 16, fontWeight: '800' },
})
