import { logger } from '@/core/logging/logger'
import { useAuthStore } from '@/stores/authStore'
import { useUniversitiesStore } from '@/stores/universitiesStore'
import { useStoriesStore } from '@/stores/storiesStore'
import {
  createStory,
  deleteUniStory,
  listStoriesForUni,
  type StoryDoc,
} from '@/features/feed/repositories/storiesRepository'

export class NotInstitutionError extends Error {
  constructor() {
    super('Apenas contas institucionais podem publicar stories.')
    this.name = 'NotInstitutionError'
  }
}

export class WrongInstitutionError extends Error {
  constructor() {
    super('Você só pode publicar stories em nome da sua universidade.')
    this.name = 'WrongInstitutionError'
  }
}

export class InvalidStoryError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidStoryError'
  }
}

export type PublishStoryInput = {
  uniId: string
  imageUrl: string
}

const URL_RX = /^https?:\/\/[^\s]+$/i

// Publishes a 24h story for an institution. Validates ownership against
// `authStore.linkedUniId` and the image URL shape, then refreshes the
// stories store so the feed strip picks the new story up immediately.
export async function publishInstitutionStory(
  input: PublishStoryInput
): Promise<StoryDoc> {
  const auth = useAuthStore.getState()
  if (!auth.currentUser) throw new InvalidStoryError('Sessão expirada.')
  if (!auth.isInstitution()) throw new NotInstitutionError()

  const linkedUniId = auth.getLinkedUniId()
  if (!linkedUniId || String(linkedUniId) !== String(input.uniId)) {
    throw new WrongInstitutionError()
  }

  const imageUrl = input.imageUrl.trim()
  if (!URL_RX.test(imageUrl)) {
    throw new InvalidStoryError(
      'Informe uma URL pública (https://…) para a imagem.'
    )
  }

  const unisStore = useUniversitiesStore.getState()
  const uni = unisStore.unis.find(u => String(u.id) === String(input.uniId))
  if (!uni) throw new InvalidStoryError('Universidade não encontrada.')

  try {
    const story = await createStory({
      uniId: String(input.uniId),
      uniName: uni.name || '',
      uniColor: String(uni.color || '#7C5CFF'),
      imageUrl,
    })
    // Reload the strip so the just-published story appears in the feed.
    useStoriesStore.getState().load()
    return story
  } catch (err) {
    logger.error('publishInstitutionStory:', (err as Error)?.message)
    throw err
  }
}

export async function deleteInstitutionStory(
  uniId: string,
  storyId: string
): Promise<void> {
  const auth = useAuthStore.getState()
  if (!auth.isInstitution()) throw new NotInstitutionError()
  if (String(auth.getLinkedUniId()) !== String(uniId)) {
    throw new WrongInstitutionError()
  }

  try {
    await deleteUniStory(uniId, storyId)
    useStoriesStore.getState().load()
  } catch (err) {
    logger.error('deleteInstitutionStory:', (err as Error)?.message)
    throw err
  }
}

export async function loadInstitutionStories(
  uniId: string
): Promise<StoryDoc[]> {
  return listStoriesForUni(uniId)
}

export type { StoryDoc } from '@/features/feed/repositories/storiesRepository'
