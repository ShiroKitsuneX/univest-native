const CLOUDINARY_CLOUD_NAME =
  process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dcugnvxkk'
const CLOUDINARY_UPLOAD_PRESET = 'univest_images'

export async function uploadInstitutionImage(
  universityId: string,
  imageUri: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.open(
      'POST',
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
    )

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText)
          resolve(result.secure_url)
        } catch (e) {
          reject(new Error('Failed to parse Cloudinary response'))
        }
      } else {
        reject(new Error(`Cloudinary upload failed: ${xhr.responseText}`))
      }
    }

    xhr.onerror = () => {
      reject(new Error('Network error during upload'))
    }

    const formData = new FormData()

    // Use the file URI directly - React Native's fetch API handles this
    // The URI from expo-image-picker is like "file:///..."
    const fileName = `logo_${Date.now()}.jpg`

    // @ts-ignore - React Native extends FormData with file support
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: fileName,
    })

    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    formData.append('folder', `institution-images/${universityId}`)

    xhr.send(formData)
  })
}

export async function deleteInstitutionImage(imageUrl: string): Promise<void> {
  console.warn('Image deletion not implemented for Cloudinary')
}

export async function updateInstitutionLogo(
  universityId: string,
  imageUri: string,
  previousLogoUrl?: string
): Promise<string> {
  const newLogoUrl = await uploadInstitutionImage(universityId, imageUri)
  return newLogoUrl
}
