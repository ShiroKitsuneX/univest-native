import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useTheme } from '@/theme/useTheme'
import { updateInstitutionLogo } from '@/features/institution/repositories/institutionImageRepository'
import { saveUniversityUpdates } from '@/features/explorar/services/universityService'

interface InstitutionPhotoModalProps {
  visible: boolean
  universityId: string
  currentLogoUrl?: string
  universityName: string
  onClose: () => void
  onSuccess: (newLogoUrl: string) => void
}

export function InstitutionPhotoModal({
  visible,
  universityId,
  currentLogoUrl,
  universityName,
  onClose,
  onSuccess,
}: InstitutionPhotoModalProps) {
  const { T, brand } = useTheme()
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à sua galeria para selecionar uma foto.'
      )
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setPreview(result.assets[0].uri)
    }
  }

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à câmera para tirar uma foto.'
      )
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setPreview(result.assets[0].uri)
    }
  }

  const handleSave = async () => {
    if (!preview) return

    setLoading(true)
    try {
      const newLogoUrl = await updateInstitutionLogo(
        universityId,
        preview,
        currentLogoUrl
      )

      await saveUniversityUpdates(universityId, { logoUrl: newLogoUrl })

      onSuccess(newLogoUrl)
      onClose()
    } catch (error) {
      console.error('Failed to save logo:', error)
      Alert.alert('Erro', 'Não foi possível salvar a foto. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    Alert.alert(
      'Remover foto',
      'Tem certeza que deseja remover a foto do perfil?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            setLoading(true)
            try {
              await saveUniversityUpdates(universityId, { logoUrl: '' })
              onSuccess('')
              onClose()
            } catch (error) {
              console.error('Failed to remove logo:', error)
              Alert.alert('Erro', 'Não foi possível remover a foto.')
            } finally {
              setLoading(false)
            }
          },
        },
      ]
    )
  }

  const handleClose = () => {
    setPreview(null)
    onClose()
  }

  const displayImage = preview || currentLogoUrl

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: T.bg, borderColor: T.border },
          ]}
        >
          <Text style={[styles.title, { color: T.text }]}>Foto de Perfil</Text>
          <Text style={[styles.subtitle, { color: T.sub }]}>
            {universityName}
          </Text>

          <View style={styles.previewContainer}>
            {displayImage ? (
              <Image
                source={{ uri: displayImage }}
                style={styles.preview}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[styles.previewPlaceholder, { backgroundColor: T.card }]}
              >
                <Text style={{ fontSize: 40, color: T.sub }}>
                  {universityName.slice(0, 2).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: T.card }]}
              onPress={pickImage}
              disabled={loading}
            >
              <Text style={[styles.buttonText, { color: T.text }]}>
                Galeria
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: T.card }]}
              onPress={takePhoto}
              disabled={loading}
            >
              <Text style={[styles.buttonText, { color: T.text }]}>Câmera</Text>
            </TouchableOpacity>
          </View>

          {displayImage && (
            <TouchableOpacity
              style={[styles.removeButton, { borderColor: T.muted }]}
              onPress={handleRemove}
              disabled={loading}
            >
              <Text style={[styles.removeText, { color: T.muted }]}>
                Remover foto
              </Text>
            </TouchableOpacity>
          )}

          {preview && (
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: brand.primary }]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveText}>Salvar</Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleClose}
            disabled={loading}
          >
            <Text style={[styles.cancelText, { color: T.sub }]}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  preview: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  previewPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  removeButton: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 12,
  },
  removeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
  },
})
