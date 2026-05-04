import { logger } from '@/core/logging/logger'
import { useAuthStore } from '@/stores/authStore'
import { useUniversitiesStore } from '@/stores/universitiesStore'
import { usePostsStore, type Post } from '@/stores/postsStore'
import {
  createInstitutionPost,
  deleteInstitutionPost,
  listPostsByInstitution,
  INSTITUTION_POST_TAGS,
  type CreateInstitutionPostInput,
  type InstitutionPost,
  type InstitutionPostTag,
} from '@/features/institution/repositories/institutionPostsRepository'

export class NotInstitutionError extends Error {
  constructor() {
    super('Apenas contas institucionais podem publicar.')
    this.name = 'NotInstitutionError'
  }
}

export class WrongInstitutionError extends Error {
  constructor() {
    super('Você não pode publicar em nome de outra universidade.')
    this.name = 'WrongInstitutionError'
  }
}

export class InvalidPostError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidPostError'
  }
}

export type PublishPostInput = {
  uniId: string
  type: InstitutionPostTag
  title: string
  body: string
}

const TITLE_MIN = 6
const TITLE_MAX = 120
const BODY_MIN = 12
const BODY_MAX = 600

function findTag(type: InstitutionPostTag): {
  id: InstitutionPostTag
  label: string
  icon: string
} {
  const found = INSTITUTION_POST_TAGS.find(t => t.id === type)
  if (found) return found
  return INSTITUTION_POST_TAGS[0]
}

// Publishes a post as the current institution. Validates ownership against
// `authStore.linkedUniId` and the basic field constraints, optimistically
// inserts the new post into `postsStore` so the feed shows it immediately,
// and rolls back on failure.
export async function publishInstitutionPost(
  input: PublishPostInput
): Promise<InstitutionPost> {
  const auth = useAuthStore.getState()
  const currentUser = auth.currentUser
  if (!currentUser) throw new InvalidPostError('Sessão expirada.')
  if (!auth.isInstitution()) throw new NotInstitutionError()

  const linkedUniId = auth.getLinkedUniId()
  if (!linkedUniId || String(linkedUniId) !== String(input.uniId)) {
    throw new WrongInstitutionError()
  }

  const title = input.title.trim()
  const body = input.body.trim()
  if (title.length < TITLE_MIN)
    throw new InvalidPostError(
      `O título precisa ter pelo menos ${TITLE_MIN} caracteres.`
    )
  if (title.length > TITLE_MAX)
    throw new InvalidPostError(
      `O título tem no máximo ${TITLE_MAX} caracteres.`
    )
  if (body.length < BODY_MIN)
    throw new InvalidPostError(
      `O conteúdo precisa ter pelo menos ${BODY_MIN} caracteres.`
    )
  if (body.length > BODY_MAX)
    throw new InvalidPostError(
      `O conteúdo tem no máximo ${BODY_MAX} caracteres.`
    )

  const unisStore = useUniversitiesStore.getState()
  const uni = unisStore.unis.find(u => String(u.id) === String(input.uniId))
  const uniName = uni?.name || ''

  const tag = findTag(input.type)

  const repoInput: CreateInstitutionPostInput = {
    uniId: String(input.uniId),
    uniName,
    authorId: currentUser.uid,
    type: tag.id,
    tag: tag.label,
    icon: tag.icon,
    title,
    body,
  }

  // Optimistic insert: place the new post at the top with a temporary id.
  const tempId = `tmp-${Date.now()}`
  const optimistic: Post = {
    id: tempId,
    uniId: String(input.uniId),
    uni: uniName,
    type: tag.id,
    tag: tag.label,
    icon: tag.icon,
    title,
    body,
    authorId: currentUser.uid,
    likesCount: 0,
    sharesCount: 0,
    createdAt: new Date().toISOString(),
  }
  const postsApi = usePostsStore.getState()
  const previousPosts = postsApi.posts
  // postsStore exposes `setPosts` via persist middleware partials — we use a
  // direct store mutation here because there's no dedicated `prependPost`
  // action and adding one would expand the store's API just for this call.
  usePostsStore.setState({ posts: [optimistic, ...previousPosts] })

  try {
    const newId = await createInstitutionPost(repoInput)
    // Replace the temp entry with the real id once the write resolves.
    usePostsStore.setState(state => ({
      posts: state.posts.map(p =>
        p.id === tempId ? { ...p, id: newId } : p
      ),
    }))
    return {
      id: newId,
      uniId: String(input.uniId),
      uni: uniName,
      type: tag.id,
      tag: tag.label,
      icon: tag.icon,
      title,
      body,
      authorId: currentUser.uid,
      createdAt: new Date(),
      likesCount: 0,
      sharesCount: 0,
    }
  } catch (err) {
    // Rollback the optimistic insert.
    usePostsStore.setState({ posts: previousPosts })
    logger.error('publishInstitutionPost:', (err as Error)?.message)
    throw err
  }
}

export async function deleteInstitutionPostById(
  postId: string
): Promise<void> {
  const auth = useAuthStore.getState()
  if (!auth.isInstitution()) throw new NotInstitutionError()

  const postsApi = usePostsStore.getState()
  const previousPosts = postsApi.posts
  usePostsStore.setState({
    posts: previousPosts.filter(p => String(p.id) !== String(postId)),
  })

  try {
    await deleteInstitutionPost(postId)
  } catch (err) {
    usePostsStore.setState({ posts: previousPosts })
    logger.error('deleteInstitutionPostById:', (err as Error)?.message)
    throw err
  }
}

// Convenience read wrapper for InstitutionAdminScreen — keeps the screen
// out of the repository layer per ARCHITECTURE rules.
export async function loadInstitutionPosts(
  uniId: string
): Promise<InstitutionPost[]> {
  return listPostsByInstitution(uniId)
}

export { INSTITUTION_POST_TAGS } from '@/features/institution/repositories/institutionPostsRepository'
export type {
  InstitutionPost,
  InstitutionPostTag,
} from '@/features/institution/repositories/institutionPostsRepository'
