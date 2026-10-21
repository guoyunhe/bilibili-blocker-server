import { AppShell, Button, Group, Menu, Text } from '@mantine/core'
import { SignInIcon } from '@phosphor-icons/react/SignIn'
import { SignOutIcon } from '@phosphor-icons/react/SignOut'
import { ShieldCheckIcon } from '@phosphor-icons/react/ShieldCheck'
import { UserCircleIcon } from '@phosphor-icons/react/UserCircle'
import { UserPlusIcon } from '@phosphor-icons/react/UserPlus'
import { Link } from 'wouter'

import { useAuth } from '../contexts/AuthContext.js'
import AccountSearchForm from './AccountSearchForm.js'
import styles from './AppHeader.module.css'

type AppHeaderProps = {
  logoutBusy: boolean
  onLogout: () => void
}

export default function AppHeader({ logoutBusy, onLogout }: AppHeaderProps) {
  const { authReady, user } = useAuth()

  return (
    <AppShell.Header className={styles.siteHeader}>
      <Group className={styles.siteHeaderInner} gap="lg" wrap="nowrap">
        <Text className={styles.brand} component={Link} href="/" fw={800}>
          <ShieldCheckIcon size={28} weight="fill" />
          Bilibili Blocker
        </Text>
        <div className={styles.headerSearch}>
          <AccountSearchForm placeholder="按 UID 查询" size="sm" />
        </div>
        <Group className={styles.headerActions} gap="xs" wrap="nowrap">
          {authReady &&
            (user ? (
              <Menu position="bottom-end" shadow="md" width={220}>
                <Menu.Target>
                  <Button leftSection={<UserCircleIcon size={19} />} size="sm" variant="subtle">
                    {user.name}
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>
                    {user.name}
                    <Text c="dimmed" size="xs">
                      {user.email}
                    </Text>
                  </Menu.Label>
                  {user.role === 'admin' && (
                    <Menu.Item component={Link} href="/admin">
                      管理员后台
                    </Menu.Item>
                  )}
                  <Menu.Item
                    color="red"
                    disabled={logoutBusy}
                    leftSection={<SignOutIcon size={17} />}
                    onClick={onLogout}
                  >
                    {logoutBusy ? '正在退出…' : '退出登录'}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <>
                <Button
                  component={Link}
                  href="/login"
                  leftSection={<SignInIcon size={18} />}
                  size="sm"
                  variant="default"
                >
                  登录
                </Button>
                <Button
                  component={Link}
                  href="/register"
                  leftSection={<UserPlusIcon size={18} />}
                  size="sm"
                >
                  注册
                </Button>
              </>
            ))}
        </Group>
      </Group>
    </AppShell.Header>
  )
}
