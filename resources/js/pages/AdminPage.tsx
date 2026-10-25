import {
  Alert,
  Anchor,
  Badge,
  Button,
  Container,
  Group,
  Loader,
  Pagination,
  Paper,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'
import { ArrowClockwiseIcon } from '@phosphor-icons/react/ArrowClockwise'
import { TrashIcon } from '@phosphor-icons/react/Trash'
import { WarningCircleIcon } from '@phosphor-icons/react/WarningCircle'
import { useEffect, useState } from 'react'
import { Link } from 'wouter'

import { useAuth } from '../contexts/AuthContext.js'
import AdminFlagsSection from './AdminFlagsSection.js'
import {
  deleteAdminUser,
  getAdminUsers,
  getRecentVotes,
  type AdminUser,
  type RecentVote,
  type UserPagination,
} from '../services/admin.js'
import { errorMessage } from '../utils/error_message.js'
import styles from './AdminPage.module.css'

function formatDate(value: string) {
  return new Date(value).toLocaleString()
}

export default function AdminPage() {
  const { authReady, user } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [votes, setVotes] = useState<RecentVote[]>([])
  const [userPagination, setUserPagination] = useState<UserPagination | null>(null)
  const [votePagination, setVotePagination] = useState<UserPagination | null>(null)
  const [userPage, setUserPage] = useState(1)
  const [votePage, setVotePage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null)
  const [error, setError] = useState('')

  async function loadUsers(nextPage: number) {
    const result = await getAdminUsers(nextPage)
    setUsers(result.data)
    setUserPagination(result.meta)
    setUserPage(result.meta.currentPage)
  }

  async function loadDashboard(nextUserPage = userPage, nextVotePage = votePage) {
    setError('')
    setLoading(true)
    try {
      const [userResult, voteResult] = await Promise.all([
        getAdminUsers(nextUserPage),
        getRecentVotes(nextVotePage),
      ])
      setUsers(userResult.data)
      setUserPagination(userResult.meta)
      setVotes(voteResult.votes)
      setVotePagination(voteResult.pagination)
      setUserPage(userResult.meta.currentPage)
      setVotePage(voteResult.pagination.currentPage)
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authReady && user?.role === 'admin') void loadDashboard()
  }, [authReady, user])

  async function handleUserPageChange(nextPage: number) {
    setLoading(true)
    setError('')
    try {
      await loadUsers(nextPage)
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setLoading(false)
    }
  }

  async function handleVotePageChange(nextPage: number) {
    setLoading(true)
    setError('')
    try {
      const result = await getRecentVotes(nextPage)
      setVotes(result.votes)
      setVotePagination(result.pagination)
      setVotePage(result.pagination.currentPage)
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(userToDelete: AdminUser) {
    if (!window.confirm(`确定删除用户「${userToDelete.name}」及其投票记录吗？此操作无法撤销。`)) {
      return
    }

    setDeletingUserId(userToDelete.id)
    setError('')
    try {
      await deleteAdminUser(userToDelete.id)
      await loadDashboard(1, 1)
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setDeletingUserId(null)
    }
  }

  if (!authReady) {
    return (
      <Container className={styles.adminPage} size="xl">
        <Group c="dimmed" gap="sm">
          <Loader size="sm" />
          <Text>正在验证管理员权限…</Text>
        </Group>
      </Container>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <Container className={styles.adminPage} size="sm">
        <Paper p="xl" radius="lg" withBorder>
          <Stack align="center" gap="md">
            <Title order={1} size="h2">
              管理员后台
            </Title>
            <Text c="dimmed" ta="center">
              {!user ? '请先登录管理员账户。' : '当前账户没有管理员权限。'}
            </Text>
            {!user && (
              <Button component={Link} href="/login">
                登录
              </Button>
            )}
          </Stack>
        </Paper>
      </Container>
    )
  }

  return (
    <Container className={styles.adminPage} size="xl">
      <Stack gap="xl">
        <Group align="flex-end" justify="space-between">
          <div>
            <Text c="dimmed" fw={600} size="sm">
              管理控制台
            </Text>
            <Title order={1} size="h2">
              管理员后台
            </Title>
          </div>
          <Button
            disabled={loading}
            leftSection={<ArrowClockwiseIcon size={18} />}
            loading={loading}
            variant="default"
            onClick={() => void loadDashboard()}
          >
            刷新数据
          </Button>
        </Group>

        {error && (
          <Alert color="red" icon={<WarningCircleIcon size={20} />} title="操作失败">
            {error}
          </Alert>
        )}

        <AdminFlagsSection />

        <Paper className={styles.section} p="lg" radius="lg" withBorder>
          <Stack gap="md">
            <div>
              <Title order={2} size="h3">
                用户管理
              </Title>
              <Text c="dimmed" mt={4} size="sm">
                用户投票数统计当前有效投票；删除用户会同时删除其投票记录。
                {userPagination ? ` 共 ${userPagination.total} 位用户。` : ''}
              </Text>
            </div>
            <div className={styles.tableScroll}>
              <Table highlightOnHover miw={760} striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>用户</Table.Th>
                    <Table.Th>邮箱</Table.Th>
                    <Table.Th>邮箱验证</Table.Th>
                    <Table.Th>角色</Table.Th>
                    <Table.Th ta="right">有效投票</Table.Th>
                    <Table.Th>注册时间</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {users.map((item) => (
                    <Table.Tr key={item.id}>
                      <Table.Td>
                        <Anchor component={Link} href={`/users/${item.id}`} fw={600}>
                          {item.name}
                        </Anchor>
                        <Text c="dimmed" size="xs">
                          ID {item.id}
                        </Text>
                      </Table.Td>
                      <Table.Td>{item.email}</Table.Td>
                      <Table.Td>
                        <Badge color={item.emailVerifiedAt ? 'green' : 'yellow'} variant="light">
                          {item.emailVerifiedAt ? '已验证' : '未验证'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={item.role === 'admin' ? 'bilibili' : 'gray'} variant="light">
                          {item.role === 'admin' ? '管理员' : '用户'}
                        </Badge>
                      </Table.Td>
                      <Table.Td ta="right">{item.voteCount}</Table.Td>
                      <Table.Td>{formatDate(item.createdAt)}</Table.Td>
                      <Table.Td>
                        {item.id !== user.id && (
                          <Button
                            color="red"
                            disabled={deletingUserId !== null}
                            loading={deletingUserId === item.id}
                            leftSection={<TrashIcon size={17} />}
                            size="xs"
                            variant="light"
                            onClick={() => void handleDelete(item)}
                          >
                            删除
                          </Button>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  {!loading && users.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={7}>
                        <Text c="dimmed" py="md" ta="center">
                          暂无用户
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </div>
            {userPagination && userPagination.lastPage > 1 && (
              <Group justify="flex-end">
                <Pagination
                  total={userPagination.lastPage}
                  value={userPage}
                  onChange={(nextPage) => void handleUserPageChange(nextPage)}
                />
              </Group>
            )}
          </Stack>
        </Paper>

        <Paper className={styles.section} p="lg" radius="lg" withBorder>
          <Stack gap="md">
            <div>
              <Title order={2} size="h3">
                全站最近投票
              </Title>
              <Text c="dimmed" mt={4} size="sm">
                按最后投票变更时间排序，共 {votePagination?.total ?? 0} 条记录；取消的投票也会显示。
              </Text>
            </div>
            <div className={styles.tableScroll}>
              <Table highlightOnHover miw={800} striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>投票用户</Table.Th>
                    <Table.Th>账号 UID</Table.Th>
                    <Table.Th>标记</Table.Th>
                    <Table.Th>投票</Table.Th>
                    <Table.Th>最后变更</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {votes.map((vote) => (
                    <Table.Tr key={vote.id}>
                      <Table.Td>
                        <Anchor component={Link} href={`/users/${vote.userId}`} fw={600}>
                          {vote.userName}
                        </Anchor>
                        <Text c="dimmed" size="xs">
                          {vote.userEmail}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Anchor component={Link} href={`/accounts/${vote.uid}`}>
                          {vote.uid}
                        </Anchor>
                      </Table.Td>
                      <Table.Td>
                        <Text fw={600}>{vote.flagName}</Text>
                        <Text c="dimmed" size="xs">
                          {vote.flagCode}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={vote.vote === 1 ? 'bilibili' : vote.vote === -1 ? 'red' : 'gray'}
                          variant="light"
                        >
                          {vote.vote === 1 ? '赞成' : vote.vote === -1 ? '反对' : '已撤销'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{formatDate(vote.updatedAt)}</Table.Td>
                    </Table.Tr>
                  ))}
                  {!loading && votes.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={5}>
                        <Text c="dimmed" py="md" ta="center">
                          暂无投票记录
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </div>
            {votePagination && votePagination.lastPage > 1 && (
              <Group justify="flex-end">
                <Pagination
                  total={votePagination.lastPage}
                  value={votePage}
                  onChange={(nextPage) => void handleVotePageChange(nextPage)}
                />
              </Group>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}
