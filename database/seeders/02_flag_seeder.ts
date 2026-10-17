import { BaseSeeder } from '@adonisjs/lucid/seeders'

import Flag from '#models/flag'

const batchSize = 1000
const flagDefinitions = [
  { code: 'aislop', name: 'AI 泔水', description: '低质量的 AI 生成视频' },
  { code: 'aivoice', name: 'AI 配音', description: 'AI 配音内容' },
  { code: 'catfish', name: '钓鱼内容', description: '网络钓鱼视频' },
  { code: 'clickbait', name: '标题党', description: '使用夸张标题或封面诱导点击' },
  { code: 'copycat', name: '搬运与切片(未授权)', description: '未经授权搬运或切片他人内容' },
  { code: 'fakenews', name: '假新闻', description: '假新闻与阴谋论' },
  {
    code: 'finance',
    name: '投资理财与欺诈风险',
    description: '无资质的投资理财建议、展示投资收益或宣传投资项目',
  },
  {
    code: 'sales',
    name: '推销带货',
    description: '直播带货、软广恰饭及引流推销商品或课程',
  },
  { code: 'spam', name: '垃圾内容', description: '垃圾内容' },
  {
    code: 'superstition',
    name: '封建迷信与宗教',
    description: '算命占卜、鬼神玄学及无执业医师资格的医疗建议，不含历史科普',
  },
  { code: 'troll', name: '对立引战', description: '对立引战内容' },
]

export default class FlagSeeder extends BaseSeeder {
  async run() {
    for (let index = 0; index < flagDefinitions.length; index += batchSize) {
      await Flag.updateOrCreateMany('code', flagDefinitions.slice(index, index + batchSize))
    }
  }
}
