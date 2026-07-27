export function getAvatarUrl(avatar?: string): string {
  return `/assets/avatars/${avatar || '01'}.webp`
}
