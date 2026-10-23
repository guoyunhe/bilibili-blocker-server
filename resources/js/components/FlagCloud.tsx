import { Alert, Group, Loader, Stack, Text, Tooltip } from '@mantine/core'
import { useEffect, useState } from 'react'

import { getFlags, type PublicFlag } from '../services/flags.js'
import { errorMessage } from '../utils/error_message.js'

export default function FlagCloud() {
  const [flags, setFlags] = useState<PublicFlag[] | null>(null)
  const [error, setError] = useState('')
  const maxUidCount = Math.max(0, ...(flags ?? []).map((flag) => flag.uidCount))

  useEffect(() => {
    let active = true

    getFlags()
      .then((result) => {
        if (active) setFlags(result)
      })
      .catch((reason: unknown) => {
        if (active) setError(errorMessage(reason))
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <Stack align="center" gap="xs" w="100%">
      <Text c="dimmed" fw={600} size="sm">
        规则标签
      </Text>
      {error ? (
        <Alert color="red" role="alert" title="标签加载失败">
          {error}
        </Alert>
      ) : flags ? (
        flags.length > 0 ? (
          <Group gap="xs" justify="center" w="100%" wrap="wrap">
            {flags.map((flag) => {
              const sizeRatio =
                maxUidCount > 0 ? Math.log1p(flag.uidCount) / Math.log1p(maxUidCount) : 0
              const fontSize = `${0.875 + sizeRatio * 0.625}rem`

              return (
                <Tooltip key={flag.code} label={flag.description} maw={280} multiline withArrow>
                  <Text c="bilibili" component="span" fw={600} style={{ fontSize }}>
                    {flag.name}
                  </Text>
                </Tooltip>
              )
            })}
          </Group>
        ) : (
          <Text c="dimmed" size="sm">
            暂无规则标签
          </Text>
        )
      ) : (
        <Group c="dimmed" gap="xs" justify="center">
          <Loader size="xs" />
          <Text size="sm">正在加载规则标签…</Text>
        </Group>
      )}
    </Stack>
  )
}
