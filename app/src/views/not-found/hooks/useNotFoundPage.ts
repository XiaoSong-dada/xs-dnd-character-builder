import { useRouter } from 'vue-router'

export function useNotFoundPage() {
  const router = useRouter()

  const goToCharacterBuilder = () => router.push({ name: 'character-builder' })

  return {
    title: '页面不存在',
    description: '当前地址不存在或已被移动。',
    goToCharacterBuilder,
  } as const
}
