import {
  Alert,
  Button,
  Group,
  Modal,
  Paper,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { PencilSimpleIcon } from '@phosphor-icons/react/PencilSimple'
import { PlusIcon } from '@phosphor-icons/react/Plus'
import { TrashIcon } from '@phosphor-icons/react/Trash'
import { WarningCircleIcon } from '@phosphor-icons/react/WarningCircle'
import { useEffect, useState } from 'react'

import {
  createAdminFlag,
  deleteAdminFlag,
  getAdminFlags,
  updateAdminFlag,
  type AdminFlag,
} from '../services/admin.js'
import { errorMessage } from '../utils/error_message.js'
import styles from './AdminPage.module.css'

type AdminFlagValues = Omit<AdminFlag, 'id'>

const emptyValues: AdminFlagValues = { code: '', name: '', description: '' }

export default function AdminFlagsSection() {
  const [flags, setFlags] = useState<AdminFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingFlagId, setDeletingFlagId] = useState<number | null>(null)
  const [editingFlag, setEditingFlag] = useState<AdminFlag | null>(null)
  const [modalOpened, setModalOpened] = useState(false)
  const [error, setError] = useState('')
  const form = useForm<AdminFlagValues>({
    initialValues: emptyValues,
    validate: {
      code: (value) =>
        /^[a-z0-9_-]{1,32}$/.test(value.trim())
          ? null
          : '代码只能包含小写英文字母、数字、连字符和下划线，长度为 1–32 个字符',
      name: (value) =>
        value.trim() && value.trim().length <= 128 ? null : '请输入名称（最多 128 字）',
      description: (value) => (value.trim() ? null : '请输入描述'),
    },
  })

  async function loadFlags() {
    setError('')
    setLoading(true)
    try {
      setFlags((await getAdminFlags()).flags)
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadFlags()
  }, [])

  function openCreateModal() {
    setEditingFlag(null)
    form.setValues(emptyValues)
    form.clearErrors()
    setError('')
    setModalOpened(true)
  }

  function openEditModal(flag: AdminFlag) {
    setEditingFlag(flag)
    form.setValues({ code: flag.code, name: flag.name, description: flag.description })
    form.clearErrors()
    setError('')
    setModalOpened(true)
  }

  const handleSubmit = form.onSubmit(async (values) => {
    setError('')
    setSaving(true)
    const data = {
      code: values.code.trim(),
      name: values.name.trim(),
      description: values.description.trim(),
    }

    try {
      if (editingFlag) {
        await updateAdminFlag(editingFlag.id, data)
      } else {
        await createAdminFlag(data)
      }
      setModalOpened(false)
      await loadFlags()
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setSaving(false)
    }
  })

  async function handleDelete(flag: AdminFlag) {
    if (
      !window.confirm(
        `确定删除「${flag.name}」吗？此操作会同时删除该 flag 在所有账号上的关联和相关投票，且无法撤销。`
      )
    ) {
      return
    }

    setError('')
    setDeletingFlagId(flag.id)
    try {
      await deleteAdminFlag(flag.id)
      setFlags((currentFlags) => currentFlags.filter((currentFlag) => currentFlag.id !== flag.id))
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setDeletingFlagId(null)
    }
  }

  return (
    <>
      <Paper className={styles.section} p="lg" radius="lg" withBorder>
        <Stack gap="md">
          <Group align="flex-end" justify="space-between">
            <div>
              <Title order={2} size="h3">
                Flag 管理
              </Title>
              <Text c="dimmed" mt={4} size="sm">
                管理标签代码、名称和描述。删除标签会同时删除其账号关联与投票记录。共 {flags.length}{' '}
                个。
              </Text>
            </div>
            <Button leftSection={<PlusIcon size={18} />} onClick={openCreateModal}>
              新增 Flag
            </Button>
          </Group>

          {error && !modalOpened && (
            <Alert color="red" icon={<WarningCircleIcon size={20} />} title="操作失败">
              {error}
            </Alert>
          )}

          <div className={styles.tableScroll}>
            <Table highlightOnHover miw={760} striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>代码</Table.Th>
                  <Table.Th>名称</Table.Th>
                  <Table.Th>描述</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {flags.map((flag) => (
                  <Table.Tr key={flag.id}>
                    <Table.Td>{flag.code}</Table.Td>
                    <Table.Td>{flag.name}</Table.Td>
                    <Table.Td>{flag.description}</Table.Td>
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <Button
                          leftSection={<PencilSimpleIcon size={16} />}
                          size="xs"
                          variant="light"
                          onClick={() => openEditModal(flag)}
                        >
                          编辑
                        </Button>
                        <Button
                          color="red"
                          disabled={deletingFlagId !== null}
                          loading={deletingFlagId === flag.id}
                          leftSection={<TrashIcon size={16} />}
                          size="xs"
                          variant="light"
                          onClick={() => void handleDelete(flag)}
                        >
                          删除
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
                {!loading && flags.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={4}>
                      <Text c="dimmed" py="md" ta="center">
                        暂无 Flag
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
                {loading && (
                  <Table.Tr>
                    <Table.Td colSpan={4}>
                      <Text c="dimmed" py="md" ta="center">
                        正在加载 Flag…
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </div>
        </Stack>
      </Paper>

      <Modal
        opened={modalOpened}
        title={editingFlag ? '编辑 Flag' : '新增 Flag'}
        onClose={() => setModalOpened(false)}
      >
        <form onSubmit={handleSubmit}>
          <Stack>
            {error && (
              <Alert color="red" icon={<WarningCircleIcon size={20} />} title="操作失败">
                {error}
              </Alert>
            )}
            <TextInput
              description="用于 API 和投票关联，只允许小写英文字母、数字、连字符和下划线。"
              label="代码"
              maxLength={32}
              {...form.getInputProps('code')}
            />
            <TextInput label="名称" maxLength={128} {...form.getInputProps('name')} />
            <Textarea autosize label="描述" minRows={3} {...form.getInputProps('description')} />
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setModalOpened(false)}>
                取消
              </Button>
              <Button loading={saving} type="submit">
                保存
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  )
}
