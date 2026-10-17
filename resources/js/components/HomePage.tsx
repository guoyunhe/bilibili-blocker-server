import {
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

import AccountSearchForm from './AccountSearchForm.js'
import styles from './HomePage.module.css'

const extensionDownloads = [
  {
    browser: 'Chrome',
    iconPath: '/browser-logos/chrome.svg',
    url: 'https://chromewebstore.google.com/detail/bilibili-blocker/egfeldkfhdbjcmpjbipdaafnopgpglje',
  },
  {
    browser: 'Firefox',
    iconPath: '/browser-logos/firefox.svg',
    url: 'https://addons.mozilla.org/zh-CN/firefox/addon/bilibili-blocker/',
  },
  {
    browser: 'Edge',
    iconPath: '/browser-logos/edge.svg',
    url: 'https://microsoftedge.microsoft.com/addons/detail/bilibili-blocker/opmgomhndfglgnbkbiijnknljnopfahc',
  },
]

type HomePageProps = {
  onSearch: (uid: string) => void
}

export default function HomePage({ onSearch }: HomePageProps) {
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
          <AccountSearchForm onSearch={onSearch} size="lg" />
        </div>

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
          {extensionDownloads.map(({ browser, iconPath, url }) => (
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
              {browser} 插件
            </Button>
          ))}
        </Group>
      </Stack>
    </Container>
  )
}
