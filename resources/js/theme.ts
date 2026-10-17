import { createTheme } from '@mantine/core'

export const theme = createTheme({
  primaryColor: 'bilibili',
  colors: {
    bilibili: [
      '#e6f8fd',
      '#d0f0fa',
      '#a7e3f6',
      '#79d4f0',
      '#4cc6e9',
      '#24b7e2',
      '#00a1d6',
      '#0088b7',
      '#006f97',
      '#005675',
    ],
    bilibiliPink: [
      '#fff0f4',
      '#ffe1e9',
      '#ffc6d6',
      '#ffa9c3',
      '#fb8dad',
      '#fb7299',
      '#e65c83',
      '#cc456c',
      '#b32f55',
      '#99203e',
    ],
  },
  fontFamily: 'Inter, "PingFang SC", "Microsoft YaHei", ui-sans-serif, system-ui, sans-serif',
  headings: {
    fontFamily: 'Inter, "PingFang SC", "Microsoft YaHei", ui-sans-serif, system-ui, sans-serif',
  },
  defaultRadius: 'md',
})
