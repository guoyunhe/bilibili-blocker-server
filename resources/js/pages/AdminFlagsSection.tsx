import {
  Alert,
  Button,
  Group,
  Modal,
  Paper,
  Select,
  Stack,
  Switch,
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

import { voteForFlag } from '../services/accounts.js'
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

const emptyValues: AdminFlagValues = {
  code: '',
  name: '',
  description: '',
  recommended: true,
}

export default function AdminFlagsSection() {
  const [flags, setFlags] = useState<AdminFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingFlagId, setDeletingFlagId] = useState<number | null>(null)
  const [editingFlag, setEditingFlag] = useState<AdminFlag | null>(null)
  const [modalOpened, setModalOpened] = useState(false)
  const [importModalOpened, setImportModalOpened] = useState(false)
  const [importFlagCode, setImportFlagCode] = useState<string | null>(null)
  const [importUids, setImportUids] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [importResult, setImportResult] = useState<{
    succeeded: string[]
    failed: Array<{ uid: string; message: string }>
  } | null>(null)
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
    form.setValues({
      code: flag.code,
      name: flag.name,
      description: flag.description,
      recommended: flag.recommended,
    })
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
      recommended: values.recommended,
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

  function openImportModal() {
    setImportFlagCode(null)
    setImportUids('')
    setImportError('')
    setImportResult(null)
    setImportModalOpened(true)
  }

  async function handleImportVotes() {
    setImportError('')
    setImportResult(null)

    if (!importFlagCode) {
      setImportError('请选择 Flag')
      return
    }

    const pastedUids = importUids.split(/[\s,，;；]+/).filter(Boolean)
    if (pastedUids.length === 0) {
      setImportError('请粘贴至少一个 UID')
      return
    }

    const invalidUids = pastedUids.filter((uid) => !/^\d+$/.test(uid))
    if (invalidUids.length > 0) {
      setImportError(`以下内容不是纯数字 UID：${[...new Set(invalidUids)].join('、')}`)
      return
    }

    const uniqueUids = [...new Set(pastedUids)]
    const succeeded: string[] = []
    const failed: Array<{ uid: string; message: string }> = []
    setImporting(true)

    try {
      for (const uid of uniqueUids) {
        try {
          await voteForFlag(uid, importFlagCode, 'up')
          succeeded.push(uid)
        } catch (reason) {
          failed.push({ uid, message: errorMessage(reason) })
        }
      }

      setImportResult({ succeeded, failed })
      setImportUids(failed.map(({ uid }) => uid).join('\n'))
    } finally {
      setImporting(false)
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
            <Group gap="xs">
              <Button variant="default" onClick={openImportModal}>
                批量导入 UID
              </Button>
              <Button leftSection={<PlusIcon size={18} />} onClick={openCreateModal}>
                新增 Flag
              </Button>
            </Group>
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
                  <Table.Th>推荐屏蔽</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {flags.map((flag) => (
                  <Table.Tr key={flag.id}>
                    <Table.Td>{flag.code}</Table.Td>
                    <Table.Td>{flag.name}</Table.Td>
                    <Table.Td>{flag.description}</Table.Td>
                    <Table.Td>{flag.recommended ? '是' : '否'}</Table.Td>
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
                    <Table.Td colSpan={5}>
                      <Text c="dimmed" py="md" ta="center">
                        暂无 Flag
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
                {loading && (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
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
            <Switch
              label="浏览器插件中推荐屏蔽此规则"
              {...form.getInputProps('recommended', { type: 'checkbox' })}
            />
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

      <Modal
        opened={importModalOpened}
        size="lg"
        title="批量导入 UID"
        onClose={() => setImportModalOpened(false)}
      >
        <Stack>
          <Text c="dimmed" size="sm">
            为每个 UID 提交 up vote。支持换行、空格或逗号分隔；重复 UID 会自动去重。
          </Text>
          {importError && (
            <Alert color="red" icon={<WarningCircleIcon size={20} />} title="无法导入">
              {importError}
            </Alert>
          )}
          {importResult && (
            <Alert
              color={importResult.failed.length > 0 ? 'yellow' : 'green'}
              title={`导入完成：成功 ${importResult.succeeded.length} 个，失败 ${importResult.failed.length} 个`}
            >
              {importResult.failed.length > 0 && (
                <Stack gap="xs" mt="xs">
                  {importResult.failed.map(({ uid, message }) => (
                    <Text key={uid} size="sm">
                      UID {uid}：{message}
                    </Text>
                  ))}
                  <Text size="sm">输入框中已保留失败的 UID，可修正后重试。</Text>
                </Stack>
              )}
            </Alert>
          )}
          <Select
            data={flags.map((flag) => ({
              value: flag.code,
              label: `${flag.name} (${flag.code})`,
            }))}
            label="Flag"
            placeholder="选择要投票的 Flag"
            searchable
            value={importFlagCode}
            onChange={(value) => {
              setImportFlagCode(value)
              setImportResult(null)
            }}
          />
          <Textarea
            autosize
            label="UID 列表"
            minRows={6}
            placeholder={'例如：\n123456\n234567'}
            value={importUids}
            onChange={(event) => {
              setImportUids(event.currentTarget.value)
              setImportResult(null)
            }}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setImportModalOpened(false)}>
              关闭
            </Button>
            <Button
              disabled={flags.length === 0}
              loading={importing}
              onClick={() => void handleImportVotes()}
            >
              导入并投票
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
