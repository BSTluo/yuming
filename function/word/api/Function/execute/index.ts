// 苏苏的随机数生成姬
// const random = (n: number, m: number) => { return Math.floor(Math.random() * (m - n + 1) + n) }
import { next } from '../../Driver/api/index'

// 函数包
export const funcPack:any = {
  测试: (inData: any, playData: any) => {
    // 当发现有测试语句的时候会触发这个
    if (inData[1] === '1') { return next() }
    return inData[1]
  }
}
