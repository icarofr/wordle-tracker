import { useUserAvatar } from '~/hooks/useUserAvatar'
import { useAuth } from '~/lib/auth'
import { getAvatarUrl } from '~/lib/avatar'

export function useAvatarSrc(user: () => { id: number, avatar?: string } | undefined) {
  const { currentAvatar } = useUserAvatar()
  const { user: authUser } = useAuth()

  return () => {
    const u = user()
    if (u && authUser() && u.id === authUser()?.id) {
      return getAvatarUrl(currentAvatar())
    }
    return getAvatarUrl(u?.avatar)
  }
}
