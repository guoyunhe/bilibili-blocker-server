import {
  Alert,
  Anchor,
  Badge,
  Container,
  Group,
  Loader,
  Pagination,
  Paper,
  Rating,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'
import { WarningCircleIcon } from '@phosphor-icons/react/WarningCircle'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'wouter'

import {
  getUserProfile,
  type PublicUserProfile,
  type PublicUserRating,
  type PublicUserVote,
  type UserProfilePagination,
} from '../services/users.js'
import { errorMessage } from '../utils/error_message.js'
import styles from './UserProfilePage.module.css'

function formatDate(value: string) {
  return new Date(value).toLocaleString()
}

export default function UserProfilePage() {
  const { userId = '' } = useParams<{ userId?: string }>()
  const [profile, setProfile] = useState<PublicUserProfile | null>(null)
  const [votes, setVotes] = useState<PublicUserVote[]>([])
  const [ratings, setRatings] = useState<PublicUserRating[]>([])
  const [pagination, setPagination] = useState<UserProfilePagination | null>(null)
  const [ratingPagination, setRatingPagination] = useState<UserProfilePagination | null>(null)
  const [page, setPage] = useState(1)
  const [ratingPage, setRatingPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setProfile(null)
    setVotes([])
    setRatings([])
    setError('')
    setLoading(true)

    getUserProfile(userId, page, ratingPage)
      .then((result) => {
        if (!active) return
        setProfile(result.user)
        setVotes(result.votes)
        setRatings(result.ratings)
        setPagination(result.pagination)
        setRatingPagination(result.ratingPagination)
        setPage(result.pagination.currentPage)
        setRatingPage(result.ratingPagination.currentPage)
      })
      .catch((reason: unknown) => {
        if (active) setError(errorMessage(reason))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [userId, page, ratingPage])

  return (
    <Container className={styles.profilePage} size="lg">
      <Stack gap="lg">
        {loading && !profile && (
          <Group c="dimmed" gap="sm">
            <Loader size="sm" />
            <Text>正在加载用户主页…</Text>
          </Group>
        )}
        {error && (
          <Alert color="red" icon={<WarningCircleIcon size={20} />} title="加载失败">
            {error}
          </Alert>
        )}
        {profile && (
          <>
            <Paper className={styles.profileCard} p="xl" radius="lg" withBorder>
              <Stack gap="sm">
                <Text c="dimmed" fw={600} size="sm">
                  用户主页
                </Text>
                <Title order={1} size="h2">
                  {profile.name}
                </Title>
                <Group gap="lg">
                  <Text c="dimmed" size="sm">
                    注册于 {formatDate(profile.createdAt)}
                  </Text>
                  <Text c="dimmed" size="sm">
                    当前有效投票：{profile.voteCount}
                  </Text>
                  <Text c="dimmed" size="sm">
                    评分记录：{profile.ratingCount}
                  </Text>
                </Group>
              </Stack>
            </Paper>

            <Paper className={styles.profileCard} p="lg" radius="lg" withBorder>
              <Stack gap="md">
                <div>
                  <Title order={2} size="h3">
                    评分记录
                  </Title>
                  <Text c="dimmed" mt={4} size="sm">
                    显示该用户最近提交的账号评分。
                  </Text>
                </div>
                <div className={styles.tableScroll}>
                  <Table highlightOnHover miw={560} striped>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>账号 UID</Table.Th>
                        <Table.Th>评分</Table.Th>
                        <Table.Th>最后变更</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {ratings.map((rating) => (
                        <Table.Tr key={rating.id}>
                          <Table.Td>
                            <Anchor component={Link} href={`/accounts/${rating.uid}`}>
                              {rating.uid}
                            </Anchor>
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs" wrap="nowrap">
                              <Rating
                                aria-label={`${(rating.rating / 20).toFixed(1)} 星`}
                                color="yellow"
                                fractions={5}
                                readOnly
                                size="sm"
                                value={rating.rating / 20}
                              />
                              <Text>{(rating.rating / 20).toFixed(1)}</Text>
                            </Group>
                          </Table.Td>
                          <Table.Td>{formatDate(rating.updatedAt)}</Table.Td>
                        </Table.Tr>
                      ))}
                      {!loading && ratings.length === 0 && (
                        <Table.Tr>
                          <Table.Td colSpan={3}>
                            <Text c="dimmed" py="md" ta="center">
                              暂无评分记录
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      )}
                    </Table.Tbody>
                  </Table>
                </div>
                {ratingPagination && ratingPagination.lastPage > 1 && (
                  <Group justify="flex-end">
                    <Pagination
                      total={ratingPagination.lastPage}
                      value={ratingPage}
                      onChange={setRatingPage}
                    />
                  </Group>
                )}
              </Stack>
            </Paper>

            <Paper className={styles.profileCard} p="lg" radius="lg" withBorder>
              <Stack gap="md">
                <div>
                  <Title order={2} size="h3">
                    投票记录
                  </Title>
                  <Text c="dimmed" mt={4} size="sm">
                    显示该用户最近的投票状态；邮箱等个人信息不会公开。
                  </Text>
                </div>
                <div className={styles.tableScroll}>
                  <Table highlightOnHover miw={680} striped>
                    <Table.Thead>
                      <Table.Tr>
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
                              color={
                                vote.vote === 1 ? 'bilibili' : vote.vote === -1 ? 'red' : 'gray'
                              }
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
                          <Table.Td colSpan={4}>
                            <Text c="dimmed" py="md" ta="center">
                              暂无投票记录
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      )}
                    </Table.Tbody>
                  </Table>
                </div>
                {pagination && pagination.lastPage > 1 && (
                  <Group justify="flex-end">
                    <Pagination total={pagination.lastPage} value={page} onChange={setPage} />
                  </Group>
                )}
              </Stack>
            </Paper>
          </>
        )}
      </Stack>
    </Container>
  )
}
