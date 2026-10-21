import {
  Alert,
  Badge,
  Button,
  Container,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'
import { LockKeyOpenIcon } from '@phosphor-icons/react/LockKeyOpen'
import { MagnifyingGlassIcon } from '@phosphor-icons/react/MagnifyingGlass'
import { ShieldCheckIcon } from '@phosphor-icons/react/ShieldCheck'
import { TagIcon } from '@phosphor-icons/react/Tag'
import { ThumbsUpIcon } from '@phosphor-icons/react/ThumbsUp'
import { UsersIcon } from '@phosphor-icons/react/Users'
import { useEffect, useState } from 'react'

import AccountSearchForm from '../components/AccountSearchForm.js'
import {
  getCommunityStats,
  getExtensionStoreStats,
  type CommunityStats,
  type ExtensionStoreStats,
} from '../services/extension_store_stats.js'
import { errorMessage } from '../utils/error_message.js'
import styles from './HomePage.module.css'

const extensionDownloads = [
  {
    browser: 'Chrome',
    store: 'chrome',
    iconPath: '/browser-logos/chrome.svg',
    url: 'https://chromewebstore.google.com/detail/bilibili-blocker/egfeldkfhdbjcmpjbipdaafnopgpglje',
    userCountLabel: 'ChromeStats 用户数',
  },
  {
    browser: 'Firefox',
    store: 'firefox',
    iconPath: '/browser-logos/firefox.svg',
    url: 'https://addons.mozilla.org/zh-CN/firefox/addon/bilibili-blocker/',
    userCountLabel: 'Firefox 日均活跃用户',
  },
  {
    browser: 'Edge',
    store: 'edge',
    iconPath: '/browser-logos/edge.svg',
    url: 'https://microsoftedge.microsoft.com/addons/detail/bilibili-blocker/opmgomhndfglgnbkbiijnknljnopfahc',
    userCountLabel: 'Edge 商店用户',
  },
] as const

export default function HomePage() {
  const [storeStats, setStoreStats] = useState<ExtensionStoreStats | null>(null)
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null)
  const [statsError, setStatsError] = useState('')
  const [communityStatsError, setCommunityStatsError] = useState('')

  useEffect(() => {
    let active = true

    getExtensionStoreStats()
      .then((stats) => {
        if (active) setStoreStats(stats)
      })
      .catch((reason: unknown) => {
        if (active) setStatsError(errorMessage(reason))
      })

    getCommunityStats()
      .then((stats) => {
        if (active) setCommunityStats(stats)
      })
      .catch((reason: unknown) => {
        if (active) setCommunityStatsError(errorMessage(reason))
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <Container className={styles.homePage} size="lg">
      <Stack align="center" gap="xl">
        <Stack align="center" className={styles.homeHero} gap="md">
          <ThemeIcon
            className={styles.heroIcon}
            color="bilibili"
            radius="xl"
            size={76}
            variant="light"
          >
            <ShieldCheckIcon size={42} weight="duotone" />
          </ThemeIcon>
          <Badge color="bilibiliPink" radius="xl" size="lg" variant="light">
            Bilibili Blocker
          </Badge>
          <Title className={styles.homeTitle} order={1} ta="center">
            输入 UID，了解账号内容标签
          </Title>
          <Text c="dimmed" className={styles.homeDescription} size="lg" ta="center">
            查询账号关联的屏蔽规则，帮助你快速了解创作者内容。
          </Text>
        </Stack>

        <div className={styles.homeSearch}>
          <AccountSearchForm size="lg" />
        </div>

        <SimpleGrid className={styles.homeFeatures} cols={{ base: 1, sm: 3 }} spacing="md" w="100%">
          <Paper className={styles.featureCard} p="lg" radius="lg" withBorder>
            <Group align="center" gap="sm" wrap="nowrap">
              <ThemeIcon color="bilibili" radius="md" variant="light">
                <UsersIcon size={19} />
              </ThemeIcon>
              <div>
                <Text c="dimmed" size="sm">
                  贡献用户
                </Text>
                <Text fw={700} size="xl">
                  {communityStats?.contributors.toLocaleString() ?? '—'} 人
                </Text>
              </div>
            </Group>
          </Paper>
          <Paper className={styles.featureCard} p="lg" radius="lg" withBorder>
            <Group align="center" gap="sm" wrap="nowrap">
              <ThemeIcon color="bilibiliPink" radius="md" variant="light">
                <TagIcon size={19} />
              </ThemeIcon>
              <div>
                <Text c="dimmed" size="sm">
                  标记账号
                </Text>
                <Text fw={700} size="xl">
                  {communityStats?.markedAccounts.toLocaleString() ?? '—'} 个
                </Text>
              </div>
            </Group>
          </Paper>
          <Paper className={styles.featureCard} p="lg" radius="lg" withBorder>
            <Group align="center" gap="sm" wrap="nowrap">
              <ThemeIcon color="bilibili" radius="md" variant="light">
                <ThumbsUpIcon size={19} />
              </ThemeIcon>
              <div>
                <Text c="dimmed" size="sm">
                  贡献投票
                </Text>
                <Text fw={700} size="xl">
                  {communityStats?.votes.toLocaleString() ?? '—'} 票
                </Text>
              </div>
            </Group>
          </Paper>
        </SimpleGrid>

        <SimpleGrid className={styles.homeFeatures} cols={{ base: 1, sm: 3 }} spacing="md" w="100%">
          <Paper className={styles.featureCard} p="lg" radius="lg" withBorder>
            <Group align="flex-start" gap="sm" wrap="nowrap">
              <ThemeIcon color="bilibili" radius="md" variant="light">
                <MagnifyingGlassIcon size={19} />
              </ThemeIcon>
              <div>
                <Text fw={700}>UID 精确查询</Text>
                <Text c="dimmed" mt={4} size="sm">
                  直接按账号 UID 查看匹配结果。
                </Text>
              </div>
            </Group>
          </Paper>
          <Paper className={styles.featureCard} p="lg" radius="lg" withBorder>
            <Group align="flex-start" gap="sm" wrap="nowrap">
              <ThemeIcon color="bilibiliPink" radius="md" variant="light">
                <LockKeyOpenIcon size={19} />
              </ThemeIcon>
              <div>
                <Text fw={700}>公开查询</Text>
                <Text c="dimmed" mt={4} size="sm">
                  查询账号不需要登录或注册。
                </Text>
              </div>
            </Group>
          </Paper>
          <Paper className={styles.featureCard} p="lg" radius="lg" withBorder>
            <Group align="flex-start" gap="sm" wrap="nowrap">
              <ThemeIcon color="bilibili" radius="md" variant="light">
                <ShieldCheckIcon size={19} />
              </ThemeIcon>
              <div>
                <Text fw={700}>查看规则标签</Text>
                <Text c="dimmed" mt={4} size="sm">
                  了解账号命中的屏蔽规则。
                </Text>
              </div>
            </Group>
          </Paper>
        </SimpleGrid>

        <Group gap="md" justify="center" wrap="wrap">
          {extensionDownloads.map(({ browser, store, iconPath, url, userCountLabel }) => {
            const userCount = storeStats?.[store]

            return (
              <Button
                component="a"
                className={styles.extensionDownloadButton}
                href={url}
                key={browser}
                px="xl"
                leftSection={
                  <img
                    alt=""
                    aria-hidden="true"
                    className={styles.browserLogo}
                    height="24"
                    src={iconPath}
                    width="24"
                  />
                }
                rel="noopener noreferrer"
                size="lg"
                target="_blank"
                variant="default"
              >
                <Group gap="xs" wrap="nowrap">
                  {browser} 插件
                  {userCount != null && (
                    <Badge aria-label={userCountLabel} color="gray" size="sm" variant="light">
                      <Group gap={4} wrap="nowrap">
                        <UsersIcon aria-hidden="true" size={14} />
                        {userCount}
                      </Group>
                    </Badge>
                  )}
                </Group>
              </Button>
            )
          })}
        </Group>
        {statsError && (
          <Alert color="red" role="alert" title="用户数加载失败">
            {statsError}
          </Alert>
        )}
        {communityStatsError && (
          <Alert color="red" role="alert" title="社区统计加载失败">
            {communityStatsError}
          </Alert>
        )}
      </Stack>
    </Container>
  )
}
