import * as fs from 'fs'
import * as path from 'path'
import * as api from '../Tools/index'
import { messageReg } from '../Function/Config/regList/index'
import { interpreter } from './api/index'

/**
* 返回一个文件的json对象
* @param list 词库文件目录（wordConfig/userData/wordList/recycleBin）
* @param name 词库文件名
* @return 词库json对象
*/
const getjson = (list: string, name: string) => { return api.command.getjson(dir, list, name) }

/**
* 将词库json对象存储在文件内
* @param list 词库文件目录
* @param name 词库文件名
* @param file 词库json对象
*/
// const update = (list: string, name: string, file: object) => { return api.command.update(dir, list, name, file) }

/**
 * 生成随机数
 * @param n 区间a
 * @param m 区间b
 * @returns 结果
 */
const random = (n: number, m: number) => { return api.command.random(n, m) }

// 定义词库缓存变量的类型
type wordCache = {
  passive: { [key:string]: string[] }
  keys : string[],
  wordList : string[],
  recycleBinList: string[],
  initiative: { [key:string]:string[] }
}

let wordCache: wordCache

let dir: string

export default class {
  /**
   * 配置基础信息
   * @param cache 
   * @param dataDir 
   */
  constructor(cache: wordCache, dataDir: string) {
    wordCache = cache
    dir = dataDir
  }

  /**
   * 开始被动查找问
   * @param q 源问
   * @param playerData 当前玩家数据
   * @returns 结果
   */
  mainStart(q: string, playerData: {[key: string]: string}) {
    if (wordCache.passive[q]) { return this.Change(joint(wordCache.passive[q], q), playerData) } // 无替换的话

    const arrCache = messageReg()
    while (arrCache.item.test(q)) {
      for (const a of arrCache.list) {
        const reg: RegExp = a[0]
        const txt: string = a[1]
        const index: string = a[2]

        const cache = q.match(reg)
        if (cache) {
          q = q.replace(a[0], txt)
          playerData[index] = a[1]
        }

        if (wordCache.passive[q]) {
          // wordCache.passive[q]是词库的表接下来要去那些表将他们拼接起来
          return this.Change(joint(wordCache.passive[q], q), playerData)
        }
      }
    }
  }

  Change(resultArr: string[], playData: {[key: string]: string}) {
    //拷贝原数组
    const inArr = resultArr.slice()
    // 开始解析，若返回值为[Word-Driver] next则表示随机重新解析
    while (inArr.length > 0) {
      const now = inArr.splice(random(0, inArr.length - 1), 1)
      const value = this.start(now[0], playData)
      if (value !== '[Word-Driver] next') {
        return value
      }
    }

    return ''
  }

  /**
   * 主动词库解析
   * @param q 主动词库触发词
   * @param playerData 传入数据
   * @returns 结果
   */
  initiativeStart(q: string, playerData: {[key: string]: string}) {
    if (!wordCache.initiative[q]) { return }

    const main = wordCache.initiative[q]

    const outArr = []

    for (const a of main) {
      outArr.push(this.start(a, playerData))
    }

    return outArr
  }

  /**
   * 开始解析某回答
   * @param a 
   * @param playData 
   * @returns 
   */
  start(a: string, playData: {[key: string]: string}) {
    let out = interpreter(a, playData)
    if (Array.isArray(out)) { out = out.join('') }
    return out
  }

  /**
   * 查看某个物品的排行榜
   * @param itemName 物品名称
   * @param str { header:输出玩家名的前缀 ,body:输出玩家名的后缀 }
   * @returns 排行榜
   */
  itemList (itemName:string, dbName:string, str?: { header: string; body: string }, mk?:boolean) {
    const userData = fs.readdirSync(path.join(dir, './word/userData'))
    const tempArr = {}
    let outArr = mk ? ['# 排行榜', '|序号|ID|数量|','|:--|:--|:--|'] : ['[词库核心] 物品排行榜：', '']
    let number = 0
    const repository = (getjson('wordList', dbName).cache) ? getjson('wordList', dbName).cache : null
    if (!repository) return
    
    userData.forEach(value => {
      const name = value.match(/([\s\S]+?).json/).length > 1 ? value.match(/([\s\S]+?).json/)[1] : null
      if (!name) { return }
      
      const data = (getjson('userData', name).repository) ? getjson('userData', name).repository : null
      if (!data) { return }
      const itemValue = (data[itemName] && typeof data[itemName] === 'number') ? data[itemName] : 0
      
      // 基础的获取玩家数据好了，接下来就是写排行榜
      if (!tempArr[itemValue]) { tempArr[itemValue] = [] }
      tempArr[itemValue].push(name)
    })
    const list = Object.keys(tempArr).sort(func)

    list.forEach(value => {
      number++
      if (mk) { outArr.push(`${number} | ${str.header}${tempArr[value]}${str.body} | ${value}`) }
      if (!mk) { outArr.push(`${number}.  ${str.header}${tempArr[value]}${str.body}  ${value}`) }
    })

    return outArr.join('\n')
  }

  /*
  readPack(dbName: string) { } // 查看xxx词库背包
  readOtherPack() { } //查看某人xxx词库背包
  */
}

/**
 * 拼接多个词库的关键词数组
 * @param list 库表
 * @param q 处理后的关键词
 * @returns 结果
 */
const joint = (list: string[], q: string) => {

  let outArr: string[] = []

  for (const a of list) {
    const word = getjson('wordList', a)
    outArr = word.main[q].concat(outArr)
  }

  return outArr
}

const func = (a:string, b:string) => {
  return Number(a) - Number(b)
}
/*
  wordCacheObj = {
      passive: { 触发词: [所拥有的词库] }
      keys : [所有的触发词],
      wordList : [所有的库名称],
      recycleBinList: [回收站列表],
      initiative: { 主动触发词:[所拥有的词库] }
    }
*/

/*
  {
    main:{ // 基础存储 },
    author: [ // 编写者 ],
    backpack: [ // 标记物品? ],
    cache: '存储库名',
    initiative: { // 主动词库 },
    function: { // js代码 }
  }
*/

/*
playData = {
  mid: ''
  mname: '',
  yid: '',
  yname: ''
}
*/
/*
suerData = {
  存储库名:{item: num/arr/string}
}
*/
