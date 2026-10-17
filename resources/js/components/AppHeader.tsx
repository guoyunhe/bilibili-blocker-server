import { AppShell, Button, Group, Menu, Text } from '@mantine/core'
import { SignInIcon } from '@phosphor-icons/react/SignIn'
import { SignOutIcon } from '@phosphor-icons/react/SignOut'
import { ShieldCheckIcon } from '@phosphor-icons/react/ShieldCheck'
import { UserCircleIcon } from '@phosphor-icons/react/UserCircle'
import { UserPlusIcon } from '@phosphor-icons/react/UserPlus'
import type { MouseEvent } from 'react'

import AccountSearchForm from './AccountSearchForm.js'
import type { AuthUser } from '../services/auth.js'

type AppHeaderProps = {
  authReady: boolean
  logoutBusy: boolean
  user: AuthUser | null
  onLogout: () => void
  onNavigate: (path: string) => void
  onSearch: (uid: string) => void
}

export default function AppHeader({
  authReady,
  logoutBusy,
  user,
  onLogout,
  onNavigate,
  onSearch,
}: AppHeaderProps) {
  function handleNavigate(event: MouseEvent<HTMLAnchorElement>, path: string) {
    event.preventDefault()
    onNavigate(path)
  }

  return (
    <AppShell.Header className="site-header">
      <Group className="site-header-inner" gap="lg" wrap="nowrap">
        <Text
          className="brand"
          component="a"
          href="/"
          fw={800}
          onClick={(event) => handleNavigate(event, '/')}
        >
          <ShieldCheckIcon size={28} weight="fill" />
          Bilibili Blocker
        </Text>
        <div className="header-search">
          <AccountSearchForm onSearch={onSearch} placeholder="按 UID 查询" size="sm" />
        </div>
        <Group className="header-actions" gap="xs" wrap="nowrap">
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
                  component="a"
                  href="/login"
                  leftSection={<SignInIcon size={18} />}
                  size="sm"
                  variant="default"
                  onClick={(event) => handleNavigate(event, '/login')}
                >
                  登录
                </Button>
                <Button
                  component="a"
                  href="/register"
                  leftSection={<UserPlusIcon size={18} />}
                  size="sm"
                  onClick={(event) => handleNavigate(event, '/register')}
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
