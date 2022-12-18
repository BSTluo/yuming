import * as path from 'path'

export const config = {
  pars: {
    leftBoundarySymbol: '$', // 左边界符号配置
    rightBoundarySymbol: '$' // 右边界符号配置
  },
  dir: path.join(process.cwd(), './data'), // 词库缓存路径
  host: 'https://word.bstluo.top/'
}
