import { Anchor, Container, Group, Text } from '@mantine/core'

const externalLinks = [
  { label: '作者', href: 'https://guoyunhe.me' },
  { label: 'GitHub', href: 'https://github.com/guoyunhe/bilibili-blocker' },
  { label: 'Telegram 群组', href: 'https://t.me/bilibili_blocker' },
]

export default function AppFooter() {
  return (
    <footer className="site-footer">
      <Container className="site-footer-inner" size="lg">
        <Text c="dimmed" size="sm">
          Bilibili Blocker
        </Text>
        <Group gap="lg" justify="center" wrap="wrap">
          {externalLinks.map(({ label, href }) => (
            <Anchor
              c="dimmed"
              href={href}
              key={href}
              rel="noopener noreferrer"
              size="sm"
              target="_blank"
            >
              {label}
            </Anchor>
          ))}
        </Group>
      </Container>
    </footer>
  )
}
