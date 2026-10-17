import {
  Badge,
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

type HomePageProps = {
  onSearch: (uid: string) => void
}

export default function HomePage({ onSearch }: HomePageProps) {
  return (
    <Container className="home-page" size="lg">
      <Stack align="center" gap="xl">
        <Stack align="center" className="home-hero" gap="md">
          <ThemeIcon className="hero-icon" color="bilibili" radius="xl" size={76} variant="light">
            <ShieldCheckIcon size={42} weight="duotone" />
          </ThemeIcon>
          <Badge color="bilibiliPink" radius="xl" size="lg" variant="light">
            Bilibili Blocker
          </Badge>
          <Title className="home-title" order={1} ta="center">
            输入 UID，了解账号内容标签
          </Title>
          <Text c="dimmed" className="home-description" size="lg" ta="center">
            查询账号关联的屏蔽规则，帮助你快速了解创作者内容。
          </Text>
        </Stack>

        <div className="home-search">
          <AccountSearchForm onSearch={onSearch} size="lg" />
        </div>

        <SimpleGrid className="home-features" cols={{ base: 1, sm: 3 }} spacing="md" w="100%">
          <Paper className="feature-card" p="lg" radius="lg" withBorder>
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
          <Paper className="feature-card" p="lg" radius="lg" withBorder>
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
          <Paper className="feature-card" p="lg" radius="lg" withBorder>
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
      </Stack>
    </Container>
  )
}
