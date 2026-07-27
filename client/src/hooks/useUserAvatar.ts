import { createSignal } from 'solid-js'
import { authApi } from '~/lib/api'
import { authStore, useAuth } from '~/lib/auth'
import { showToast } from '~/lib/toast'

export function useUserAvatar() {
  const auth = useAuth()
  const [isUpdating, setIsUpdating] = createSignal(false)

  const currentAvatar = () => auth.user()?.avatar || '01'

  const updateAvatar = async (avatarId: string) => {
    setIsUpdating(true)
    try {
      const data = await authApi.updateAvatar({ avatar: avatarId })
      if (data) {
        authStore.setUser(data)
      }
      showToast('Avatar updated successfully!', 'success')
    }
    catch {
      showToast('Failed to update avatar. Please try again.', 'error')
    }
    finally {
      setIsUpdating(false)
    }
  }

  return {
    currentAvatar,
    updateAvatar,
    isUpdating,
  }
}
