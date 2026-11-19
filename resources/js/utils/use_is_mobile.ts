import { useMediaQuery } from '@mantine/hooks'

export const MOBILE_MEDIA_QUERY = '(max-width: 62em)'

export function useIsMobile() {
  return useMediaQuery(MOBILE_MEDIA_QUERY, false, { getInitialValueInEffect: false })
}
