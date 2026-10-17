import { Button, Group, TextInput } from '@mantine/core'
import { MagnifyingGlassIcon } from '@phosphor-icons/react/MagnifyingGlass'
import { useState, type FormEvent } from 'react'

type AccountSearchFormProps = {
  onSearch: (uid: string) => void
  size?: 'sm' | 'md' | 'lg'
  placeholder?: string
}

export default function AccountSearchForm({
  onSearch,
  size = 'md',
  placeholder = '输入 Bilibili UID',
}: AccountSearchFormProps) {
  const [uid, setUid] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedUid = uid.trim()
    if (!/^\d+$/.test(normalizedUid)) {
      setError('请输入纯数字 UID')
      return
    }
    setError('')
    onSearch(normalizedUid)
  }

  return (
    <form className="account-search" data-size={size} onSubmit={handleSubmit}>
      <Group gap="xs" wrap="nowrap">
        <TextInput
          aria-label="Bilibili UID"
          className="account-search-input"
          error={error || undefined}
          inputMode="numeric"
          leftSection={<MagnifyingGlassIcon size={20} />}
          placeholder={placeholder}
          required
          size={size}
          value={uid}
          onChange={(event) => {
            setUid(event.currentTarget.value)
            setError('')
          }}
        />
        <Button size={size} type="submit">
          查询
        </Button>
      </Group>
    </form>
  )
}
