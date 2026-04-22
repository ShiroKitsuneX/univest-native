import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { useUniversitiesStore } from '@/stores/universitiesStore'
import { saveUniversityUpdates } from '@/features/explorar/services/universityService'
import { logger } from '@/services/logger'

type Props = {
  universityId: string
  onOpenSettings: () => void
}

export function InstitutionAdminScreen({
  universityId,
  onOpenSettings,
}: Props) {
  const { T, isDark, AT } = useTheme()

  const unis = useUniversitiesStore(s => s.unis)
  const selUni = useUniversitiesStore(s => s.selUni)
  const setSelUni = useUniversitiesStore(s => s.setSelUni)

  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [description, setDescription] = useState('')
  const [vestibular, setVestibular] = useState('')
  const [inscricao, setInscricao] = useState('')
  const [prova, setProva] = useState('')
  const [site, setSite] = useState('')

  useEffect(() => {
    const uni = unis.find(
      u => String(u.id) === universityId || u.name === universityId
    )
    if (uni) {
      setSelUni(uni)
      setDescription(String(uni.description || ''))
      setVestibular(String(uni.vestibular || ''))
      setInscricao(String(uni.inscricao || ''))
      setProva(String(uni.prova || ''))
      setSite(String(uni.site || ''))
    }
  }, [universityId, unis])

  const handleSave = async () => {
    if (!selUni) return

    setLoading(true)
    try {
      const updates = {
        description,
        vestibular,
        inscricao,
        prova,
        site,
      }
      await saveUniversityUpdates(String(selUni.id), updates)
      setEditing(false)
      Alert.alert('Sucesso', 'Dados atualizados!')
    } catch (error) {
      logger.warn('handleSave error:', error)
      Alert.alert('Erro', 'Não foi possível salvar.')
    } finally {
      setLoading(false)
    }
  }

  const cd = (st = {}) => ({
    backgroundColor: T.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.border,
    ...st,
  })

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ padding: 16, paddingBottom: 24 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: '800', color: T.text }}>
            Painel da Universidade
          </Text>
          <TouchableOpacity onPress={onOpenSettings}>
            <Text style={{ fontSize: 20 }}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {selUni && (
          <>
            <View
              style={{
                marginHorizontal: 16,
                borderRadius: 22,
                padding: 22,
                backgroundColor: selUni.color,
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 30, marginBottom: 8 }}>
                {String(selUni.name).slice(0, 2)}
              </Text>
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>
                {String(selUni.name)}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,.65)', fontSize: 12 }}>
                {String(selUni.fullName)}
              </Text>
            </View>

            <View style={{ ...cd(), padding: 16, marginBottom: 16 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    color: T.muted,
                    fontSize: 11,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                  }}
                >
                  Informações
                </Text>
                <TouchableOpacity onPress={() => setEditing(!editing)}>
                  <Text style={{ color: T.accent, fontWeight: '700' }}>
                    {editing ? 'Cancelar' : 'Editar'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={{ color: T.sub, fontSize: 10, marginBottom: 4 }}>
                Descrição
              </Text>
              {editing ? (
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  style={{
                    backgroundColor: T.card2,
                    borderRadius: 12,
                    padding: 12,
                    color: T.text,
                    minHeight: 80,
                    textAlignVertical: 'top',
                  }}
                />
              ) : (
                <Text
                  style={{ color: T.text, lineHeight: 20, marginBottom: 16 }}
                >
                  {description || 'Sem descrição'}
                </Text>
              )}

              <Text style={{ color: T.sub, fontSize: 10, marginBottom: 4 }}>
                Vestibular
              </Text>
              {editing ? (
                <TextInput
                  value={vestibular}
                  onChangeText={setVestibular}
                  style={{
                    ...cd(),
                    padding: 12,
                    marginBottom: 12,
                    color: T.text,
                  }}
                  placeholder="Ex: COMVEST 2026"
                />
              ) : (
                <Text style={{ color: T.text, marginBottom: 12 }}>
                  {vestibular || '-'}
                </Text>
              )}

              <Text style={{ color: T.sub, fontSize: 10, marginBottom: 4 }}>
                Inscrição
              </Text>
              {editing ? (
                <TextInput
                  value={inscricao}
                  onChangeText={setInscricao}
                  style={{
                    ...cd(),
                    padding: 12,
                    marginBottom: 12,
                    color: T.text,
                  }}
                  placeholder="Ex: Ago/2025"
                />
              ) : (
                <Text style={{ color: T.text, marginBottom: 12 }}>
                  {inscricao || '-'}
                </Text>
              )}

              <Text style={{ color: T.sub, fontSize: 10, marginBottom: 4 }}>
                Prova
              </Text>
              {editing ? (
                <TextInput
                  value={prova}
                  onChangeText={setProva}
                  style={{
                    ...cd(),
                    padding: 12,
                    marginBottom: 12,
                    color: T.text,
                  }}
                  placeholder="Ex: Dez/2025"
                />
              ) : (
                <Text style={{ color: T.text, marginBottom: 12 }}>
                  {prova || '-'}
                </Text>
              )}

              <Text style={{ color: T.sub, fontSize: 10, marginBottom: 4 }}>
                Site
              </Text>
              {editing ? (
                <TextInput
                  value={site}
                  onChangeText={setSite}
                  style={{
                    ...cd(),
                    padding: 12,
                    marginBottom: 12,
                    color: T.text,
                  }}
                  placeholder="https://..."
                />
              ) : (
                <Text style={{ color: T.text, marginBottom: 12 }}>
                  {site || '-'}
                </Text>
              )}
            </View>

            {editing && (
              <TouchableOpacity
                onPress={handleSave}
                disabled={loading}
                style={{
                  backgroundColor: T.accent,
                  paddingVertical: 16,
                  borderRadius: 14,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{ color: isDark ? '#000' : '#fff', fontWeight: '800' }}
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Text>
              </TouchableOpacity>
            )}

            <View style={{ ...cd(), padding: 16, marginTop: 16 }}>
              <Text
                style={{
                  color: T.muted,
                  fontSize: 11,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  marginBottom: 12,
                }}
              >
                Estatísticas
              </Text>
              <View style={{ flexDirection: 'row', gap: 20 }}>
                <View>
                  <Text
                    style={{ fontSize: 24, fontWeight: '900', color: T.text }}
                  >
                    {selUni.followersCount || selUni.followers || '0'}
                  </Text>
                  <Text style={{ color: T.muted, fontSize: 11 }}>
                    Seguidores
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        {!selUni && (
          <View style={{ ...cd(), padding: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 32, marginBottom: 12 }}>🏛️</Text>
            <Text style={{ color: T.text, fontWeight: '800', marginBottom: 8 }}>
              Universidade não encontrada
            </Text>
            <Text style={{ color: T.muted, textAlign: 'center' }}>
              ID: {universityId}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}
