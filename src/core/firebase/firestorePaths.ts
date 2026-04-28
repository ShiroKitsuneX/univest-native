export const firestorePaths = {
  user: (userId: string) => ['usuarios', userId] as const,
  users: () => ['usuarios'] as const,
  userTermsAcceptance: (userId: string) =>
    ['usuarios', userId, 'termsAcceptance'] as const,

  terms: () => ['TERMS_AND_CONDITIONS'] as const,
  termsDocument: (termsId: string) =>
    ['TERMS_AND_CONDITIONS', String(termsId)] as const,

  universities: () => ['universidades'] as const,
  university: (universityId: string) =>
    ['universidades', String(universityId)] as const,
  universityStories: (universityId: string) =>
    ['universidades', String(universityId), 'stories'] as const,
  universityStory: (universityId: string, storyId: string) =>
    ['universidades', String(universityId), 'stories', storyId] as const,

  posts: () => ['posts'] as const,
  post: (postId: string) => ['posts', String(postId)] as const,
  postLikes: (postId: string) => ['posts', String(postId), 'likes'] as const,
  postLike: (postId: string, userId: string) =>
    ['posts', String(postId), 'likes', userId] as const,

  reports: () => ['reports'] as const,

  notifications: () => ['notifications'] as const,
  // Notifications are a single flat collection with a `userId` field, not a
  // user-scoped subcollection. The previous 3-segment helper produced an
  // invalid path (`notifications/{uid}/{id}` = collection/doc/field) and
  // silently broke every write that used it.
  notification: (notificationId: string) =>
    ['notifications', notificationId] as const,

  courses: () => ['cursos'] as const,
  icons: () => ['icones'] as const,

  countries: () => ['countries'] as const,
  country: (id: string) => ['countries', id] as const,
  states: () => ['states'] as const,
  state: (id: string) => ['states', id] as const,
  cities: () => ['cities'] as const,
  city: (id: string) => ['cities', id] as const,
}

export const getPath = (...segments: (string | number)[]): string => {
  return segments.join('/')
}
