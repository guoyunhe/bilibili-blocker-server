import { Group, Rating, Text } from '@mantine/core'
import { useEffect, useState } from 'react'
import { useLocation, useSearch } from 'wouter'

import { useAuth } from '../contexts/AuthContext.js'
import { getUserAccountRating, type AccountDetails, rateAccount } from '../services/accounts.js'
import { errorMessage } from '../utils/error_message.js'
import { createReturnPath, saveReturnPath } from '../utils/return_path.js'

type AccountRatingSectionProps = {
  account: AccountDetails
  uid: string
  onAccountUpdated: (account: AccountDetails) => void
}

export default function AccountRatingSection({
  account,
  uid,
  onAccountUpdated,
}: AccountRatingSectionProps) {
  const [pathname, navigate] = useLocation()
  const search = useSearch()
  const { authReady, user } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [userRating, setUserRating] = useState<number | null>(null)
  const returnTo = createReturnPath(pathname, search, window.location.hash)
  const { rating, ratingCount } = account

  useEffect(() => {
    let active = true
    setUserRating(null)

    if (!authReady || !user) {
      return () => {
        active = false
      }
    }

    getUserAccountRating(uid)
      .then((rating) => {
        if (active) setUserRating(rating)
      })
      .catch((reason: unknown) => {
        if (active) setError(errorMessage(reason))
      })

    return () => {
      active = false
    }
  }, [authReady, uid, user?.id])

  async function handleRatingChange(stars: number) {
    if (!user) {
      if (returnTo) saveReturnPath(returnTo)
      navigate('/login')
      return
    }
    if (!user.emailVerifiedAt) {
      if (returnTo) saveReturnPath(returnTo)
      navigate('/email/verification/send')
      return
    }

    setError('')
    setSubmitting(true)
    try {
      const rating = Math.round(stars * 20)
      onAccountUpdated(await rateAccount(uid, rating))
      setUserRating(rating)
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Group align="center" gap="lg" wrap="wrap">
      <Group align="center" gap="xs">
        <Rating
          aria-label="账号平均评分"
          color="yellow"
          fractions={5}
          readOnly
          size="md"
          value={rating === null ? 0 : rating / 20}
        />
        <Text fw={600}>{rating === null ? '—' : (rating / 20).toFixed(1)}</Text>
        <Text c="dimmed">({ratingCount})</Text>
      </Group>
      <Group align="center" gap="xs">
        <Text c="dimmed">我的评分</Text>
        <Rating
          aria-label="我的评分，点击星星提交评分"
          color="yellow"
          fractions={2}
          readOnly={!authReady || submitting}
          size="md"
          value={userRating === null ? 0 : userRating / 20}
          onChange={(stars) => void handleRatingChange(stars)}
        />
      </Group>
      {error && (
        <Text c="red" role="alert" size="sm">
          {error}
        </Text>
      )}
    </Group>
  )
}
