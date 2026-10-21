import {
  Alert,
  Badge,
  Button,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'
import { GithubLogoIcon } from '@phosphor-icons/react/GithubLogo'
import { TelegramLogoIcon } from '@phosphor-icons/react/TelegramLogo'
import { TagIcon } from '@phosphor-icons/react/Tag'
import { ThumbsUpIcon } from '@phosphor-icons/react/ThumbsUp'
import { UsersIcon } from '@phosphor-icons/react/Users'
import { Odometer } from '@guoyunhe/react-odometer'
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
        <SimpleGrid
          className={styles.communityStats}
          cols={{ base: 1, xs: 3 }}
          spacing="md"
          w="100%"
        >
          <div className={styles.statItem}>
            <ThemeIcon
              className={styles.statIcon}
              color="bilibili"
              radius="md"
              size={42}
              variant="light"
            >
              <UsersIcon size={22} />
            </ThemeIcon>
            <div className={styles.statContent}>
              <Text className={styles.statValue} c="bilibili" fw={800}>
                {communityStats ? (
                  <Odometer value={communityStats.contributors} duration={2000} separator="," />
                ) : (
                  '—'
                )}
                <span className={styles.statSuffix}>人</span>
              </Text>
              <Text c="dimmed" fw={600} size="sm">
                贡献用户
              </Text>
            </div>
          </div>
          <div className={styles.statItem}>
            <ThemeIcon
              className={styles.statIcon}
              color="bilibiliPink"
              radius="md"
              size={42}
              variant="light"
            >
              <TagIcon size={22} />
            </ThemeIcon>
            <div className={styles.statContent}>
              <Text className={styles.statValue} c="bilibiliPink" fw={800}>
                {communityStats ? (
                  <Odometer value={communityStats.markedAccounts} duration={2000} separator="," />
                ) : (
                  '—'
                )}
                <span className={styles.statSuffix}>个</span>
              </Text>
              <Text c="dimmed" fw={600} size="sm">
                标记账号
              </Text>
            </div>
          </div>
          <div className={styles.statItem}>
            <ThemeIcon
              className={styles.statIcon}
              color="bilibili"
              radius="md"
              size={42}
              variant="light"
            >
              <ThumbsUpIcon size={22} />
            </ThemeIcon>
            <div className={styles.statContent}>
              <Text className={styles.statValue} c="bilibili" fw={800}>
                {communityStats ? (
                  <Odometer value={communityStats.votes} duration={2000} separator="," />
                ) : (
                  '—'
                )}
                <span className={styles.statSuffix}>票</span>
              </Text>
              <Text c="dimmed" fw={600} size="sm">
                贡献投票
              </Text>
            </div>
          </div>
        </SimpleGrid>

        <Stack align="center" className={styles.homeHero} gap="md">
          <Title className={styles.homeTitle} order={1} ta="center">
            屏蔽低质量与不合你喜好的账号
          </Title>
          <Text c="dimmed" className={styles.homeDescription} size="lg" ta="center">
            社群开放协作维护，软件开源透明，尊重并保护你的隐私。
          </Text>
        </Stack>

        <div className={styles.homeSearch}>
          <AccountSearchForm size="lg" />
        </div>

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

        <Group className={styles.communityLinks} gap="md" justify="center" wrap="wrap">
          <Button
            component="a"
            href="https://github.com/guoyunhe/bilibili-blocker"
            leftSection={<GithubLogoIcon aria-hidden="true" size={20} />}
            rel="noopener noreferrer"
            size="lg"
            target="_blank"
            variant="default"
          >
            GitHub 源代码
          </Button>
          <Button
            component="a"
            href="https://t.me/bilibili_blocker"
            leftSection={<TelegramLogoIcon aria-hidden="true" size={20} />}
            rel="noopener noreferrer"
            size="lg"
            target="_blank"
            variant="default"
          >
            Telegram 讨论群
          </Button>
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
