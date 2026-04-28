import { Text, View } from 'react-native'
import { SvgIcon } from '@/shared/components/SvgIcon'

interface PostTagProps {
  tag: string
  colors: {
    bg: string
    tx: string
    b: string
  }
}

const getTagIconName = (tag: string): string => {
  const t = tag?.toLowerCase().trim() || ''
  if (t.includes('inscri')) return 'reader'
  if (t.includes('noticia') || t.includes('news')) return 'create'
  if (t.includes('nota') || t.includes('corte')) return 'statsChart'
  if (t.includes('lista')) return 'bookmark'
  if (t.includes('resultado')) return 'statsChart'
  if (t.includes('alerta') || t.includes('alert')) return 'flag'
  return 'bookmark'
}

export function PostTag({ tag, colors }: PostTagProps) {
  const iconName = getTagIconName(tag)

  return (
    <View
      style={{
        backgroundColor: colors.bg,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.b,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <SvgIcon name={iconName as any} size={8} color={colors.tx} />
      <Text
        style={{
          color: colors.tx,
          fontSize: 9,
          fontWeight: '700',
        }}
      >
        {tag}
      </Text>
    </View>
  )
}
