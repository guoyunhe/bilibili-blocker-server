import { readFile } from 'node:fs/promises'

import sharp from 'sharp'

const FLAGS_API_URL = 'https://bilibili-blocker.guoyunhe.me/api/flags'
const IMAGE_WIDTH = 1200
const IMAGE_HEIGHT = 630

type Flag = {
  name: string
}

function isFlag(value: unknown): value is Flag {
  if (typeof value !== 'object' || value === null) return false
  const flag = value as Record<string, unknown>

  return typeof flag.name === 'string'
}

async function getFlags() {
  const response = await fetch(FLAGS_API_URL, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(10000),
  })

  if (!response.ok) throw new Error(`Flags API returned HTTP ${response.status}`)

  const payload: unknown = await response.json()
  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('data' in payload) ||
    !Array.isArray(payload.data) ||
    !payload.data.every(isFlag)
  ) {
    throw new Error('Flags API returned an invalid response')
  }

  return payload.data
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function estimateTagWidth(text: string, fontSize: number) {
  const textWidth = [...text].reduce(
    (width, character) => width + (character.codePointAt(0)! > 255 ? fontSize : fontSize * 0.58),
    0
  )
  return Math.max(40, Math.ceil(textWidth + 8))
}

type PositionedTag = {
  flag: Flag
  fontSize: number
  width: number
  height: number
  x: number
  y: number
}

function renderTag({ flag, fontSize, width, height, x, y }: PositionedTag) {
  return `<text x="${x + width / 2}" y="${y + height / 2 + fontSize * 0.34}" text-anchor="middle" font-family="Arial, 'Noto Sans CJK SC', sans-serif" font-size="${fontSize}" font-weight="400" fill="#24b7e2">${escapeXml(flag.name)}</text>`
}

function createRandom(seed: number) {
  let state = seed

  return () => {
    state = (state + 0x6d2b79f5) | 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function createTagPlacements(flags: Flag[]) {
  const seed = flags.reduce((value, flag) => {
    for (const character of flag.name) {
      value = Math.imul(value ^ character.codePointAt(0)!, 16777619)
    }
    return value
  }, 2166136261)
  const random = createRandom(seed)
  const shuffledFlags = [...flags]

  for (let index = shuffledFlags.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffledFlags[index], shuffledFlags[swapIndex]] = [
      shuffledFlags[swapIndex],
      shuffledFlags[index],
    ]
  }

  const tags = shuffledFlags.slice(0, 24).map((flag) => {
    const fontSize = 20 + Math.floor(random() * 25)
    const height = Math.round(fontSize * 1.35)

    return {
      flag,
      fontSize,
      width: estimateTagWidth(flag.name, fontSize),
      height,
      x: 0,
      y: 0,
    }
  })

  tags.sort((left, right) => right.width * right.height - left.width * left.height)

  const placed: PositionedTag[] = []
  const margin = 10
  const centerExclusion = { left: 465, right: 735, top: 185, bottom: 415 }

  for (const tag of tags) {
    let position: PositionedTag | undefined

    for (let attempt = 0; attempt < 10000; attempt++) {
      const centerX = 40 + random() * 1120
      const centerY = 30 + random() * 570
      const candidate = {
        ...tag,
        x: centerX - tag.width / 2,
        y: centerY - tag.height / 2,
      }

      if (candidate.x < 24 || candidate.x + tag.width > 1176) continue
      if (candidate.y < 20 || candidate.y + tag.height > 610) continue
      if (
        candidate.x < centerExclusion.right + margin &&
        candidate.x + tag.width > centerExclusion.left - margin &&
        candidate.y < centerExclusion.bottom + margin &&
        candidate.y + tag.height > centerExclusion.top - margin
      ) {
        continue
      }
      if (
        placed.some(
          (other) =>
            candidate.x < other.x + other.width + margin &&
            candidate.x + tag.width + margin > other.x &&
            candidate.y < other.y + other.height + margin &&
            candidate.y + tag.height + margin > other.y
        )
      ) {
        continue
      }

      position = candidate
      break
    }

    if (!position) throw new Error(`Could not place OG image tag "${tag.flag.name}"`)
    placed.push(position)
  }

  return placed
}

async function getLogoPath() {
  const favicon = await readFile(new URL('../../public/favicon.svg', import.meta.url), 'utf8')
  const path = favicon.match(/<path\b[^>]*\bd="([^"]+)"/)?.[1]

  if (!path) throw new Error('Could not find the logo path in public/favicon.svg')
  return path
}

function createSvg(flags: Flag[], logoPath: string) {
  const tags = createTagPlacements(flags).map(renderTag).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" viewBox="0 0 ${IMAGE_WIDTH} ${IMAGE_HEIGHT}">
    <defs>
      <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fff8fa"/>
        <stop offset="1" stop-color="#f4f7fc"/>
      </linearGradient>
      <radialGradient id="glow">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" fill="url(#background)"/>
    <circle cx="600" cy="315" r="340" fill="url(#glow)"/>
    ${tags}
    <path d="${logoPath}" transform="translate(536 205) scale(0.5)" fill="#fb7299"/>
    <text x="600" y="392" text-anchor="middle" font-family="Arial, 'Noto Sans CJK SC', sans-serif" font-size="26" font-weight="700" fill="#fb7299">Bilibili Blocker</text>
  </svg>`
}

export async function generateOgImage() {
  const [flags, logoPath] = await Promise.all([getFlags(), getLogoPath()])

  return sharp(Buffer.from(createSvg(flags, logoPath)))
    .png()
    .toBuffer()
}
