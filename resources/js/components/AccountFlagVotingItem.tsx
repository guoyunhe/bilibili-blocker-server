import { Badge, Button, Grid, Group, Paper, Text } from '@mantine/core'
import { ThumbsDownIcon } from '@phosphor-icons/react/ThumbsDown'
import { ThumbsUpIcon } from '@phosphor-icons/react/ThumbsUp'

import { type AccountFlag, type VoteDirection } from '../services/accounts.js'
import styles from './AccountFlagVotingItem.module.css'

type AccountFlagVotingItemProps = {
  flag: AccountFlag
  voteDisabled: boolean
  votingDirection: VoteDirection | null
  onVote: (direction: VoteDirection) => void
}

export default function AccountFlagVotingItem({
  flag,
  voteDisabled,
  votingDirection,
  onVote,
}: AccountFlagVotingItemProps) {
  return (
    <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
      <Paper className={styles.flagItem} p="md" radius="md" withBorder>
        <div className={styles.flagCardContent}>
          <div>
            <Group gap="sm">
              <Text fw={600}>{flag.name}</Text>
              <Badge
                color={
                  flag.status === 'approved'
                    ? 'bilibili'
                    : flag.status === 'rejected'
                      ? 'bilibiliPink'
                      : 'gray'
                }
                variant="light"
              >
                {flag.status === 'approved'
                  ? '认可'
                  : flag.status === 'rejected'
                    ? '不认可'
                    : '待定'}
              </Badge>
            </Group>
            <Text className={styles.flagDescription} c="dimmed" mt={4} size="sm">
              {flag.description}
            </Text>
          </div>
          <Group className={styles.flagVoteGroup} gap="xs">
            <Button
              aria-label={`赞成 ${flag.name}，${flag.upVotes} 票`}
              aria-pressed={flag.userVote === 'up'}
              color="bilibili"
              disabled={voteDisabled}
              loading={votingDirection === 'up'}
              leftSection={<ThumbsUpIcon size={18} />}
              size="sm"
              variant={flag.userVote === 'up' ? 'filled' : 'light'}
              onClick={() => onVote('up')}
            >
              {flag.upVotes}
            </Button>
            <Button
              aria-label={`反对 ${flag.name}，${flag.downVotes} 票`}
              aria-pressed={flag.userVote === 'down'}
              color="bilibiliPink"
              disabled={voteDisabled}
              loading={votingDirection === 'down'}
              leftSection={<ThumbsDownIcon size={18} />}
              size="sm"
              variant={flag.userVote === 'down' ? 'filled' : 'light'}
              onClick={() => onVote('down')}
            >
              {flag.downVotes}
            </Button>
            <Text
              aria-label={`净得分 ${flag.score}`}
              c={flag.score < 0 ? 'red' : 'bilibili'}
              component="span"
              ml="sm"
              size="sm"
            >
              {flag.score > 0 ? `+${flag.score}` : flag.score}
            </Text>
          </Group>
        </div>
      </Paper>
    </Grid.Col>
  )
}
