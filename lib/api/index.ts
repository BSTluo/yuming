import path from 'path'
import { mkdirSync } from 'fs'
import logger from '../logger'
import { Bot } from '../event'
import { send } from '../websocket'
import { isTest } from '../utils'
import damaku from '../encoder/messages/damaku'
import Like from '../encoder/system/Like'
import payment from '../encoder/system/payment'
import PrivateMessage from '../encoder/messages/PrivateMessage'
import PublicMessage from '../encoder/messages/PublicMessage'
import { PublicMessage as typePublicMessage } from '../decoder/PublicMessage'
import config from '../../config'
import mediaCard from '../encoder/messages/media_card'
import mediaData from '../encoder/messages/media_data'
import blackList from '../encoder/admin/blackList'
import kick from '../encoder/admin/kick'
import mediaClear from '../encoder/admin/media_clear'
import mediaCut from '../encoder/admin/media_cut'
import mediaExchange from '../encoder/admin/media_exchange'
import mediaGoto from '../encoder/admin/media_goto'
import mediaOperation from '../encoder/admin/media_operation'
import mute from '../encoder/admin/mute'
import notice from '../encoder/admin/notice'
import setMaxUser from '../encoder/admin/setMaxUser'
import whiteList from '../encoder/admin/whiteList'
import GetUserList from '../encoder/system/GetUserList'
import UserProfile from '../encoder/user/UserProfile'
import { moveTo } from '../core'
import bank from '../encoder/system/bank'
import MediaList from '../encoder/system/MediaList'
import { MediaListCallback } from '../decoder/MediaListCallback'
import { UserProfileCallback } from '../decoder/UserProfileCallback'
import { GetUserListCallback } from '../decoder/GetUserListCallback'

export const Event = Bot

export const commands: {
  [index: string]: (m: RegExpExecArray, e: typePublicMessage, reply: (message: string, color?: string) => void) => void
} = {}

export const command = (regexp: RegExp, id: string, callback: (m: RegExpExecArray, e: typePublicMessage, reply: (message: string, color?: string) => void) => void) => {
  logger('Command').debug(`???????????? ${regexp} ??????`)

  if (commands[id]) {
    logger('Command').error(`${id} ???????????????????????????`)
    return
  }
  commands[id] = callback

  const bind = () => {
    Bot.on('PrivateMessage', e => {
      if (e.username === config.account.username) return

      regexp.lastIndex = 0
      if (regexp.test(e.message)) {
        logger('Command').info(`${e.username} ????????????????????? ${id} ??????: ${e.message}`)

        const reply = (msg: string, color?: string) => {
          return method.sendPrivateMessage(e.uid, msg, color || config.app.color)
        }

        regexp.lastIndex = 0
        // @ts-ignore
        callback(regexp.exec(e.message), e, reply)
      }
    })

    Bot.on('PublicMessage', e => {
      if (e.username === config.account.username) return

      regexp.lastIndex = 0
      if (regexp.test(e.message)) {
        logger('Command').info(`${e.username} ????????????????????? ${id} ??????: ${e.message}`)

        const reply = (msg: string, color?: string) => {
          return method.sendPublicMessage(msg, color || config.app.color)
        }

        regexp.lastIndex = 0
        // @ts-ignore
        callback(regexp.exec(e.message), e, reply)
      }
    })
  }

  if (!isTest) setTimeout(bind, 1e3)
  if (isTest) bind()

  logger('Command').debug(`${id} ??????????????????`)
}

export const method = {
  /**
   * @description ??????????????????
   * @param message ????????????
   * @param color ??????
   * @returns {Promise}
   */
  sendPublicMessage: (message: string, color?: string) => {
    logger('Bot').debug(`?????????????????????: ${message}`)
    const data = PublicMessage(message, color || config.app.color)
    return send(data)
  },
  /**
   * @description ??????????????????
   * @param message ????????????
   * @param color ??????
   * @returns {Promise}
   */
  sendPrivateMessage: (uid: string, message: string, color?: string) => {
    logger('Bot').debug(`??? ${uid} ?????????????????????: ${message}`)
    const data = PrivateMessage(uid, message, color || config.app.color)
    return send(data)
  },
  /**
   * @description ????????????
   * @param message ????????????
   * @param color ??????
   * @returns {Promise}
   */
  sendDamaku: (message: string, color: string) => {
    logger('Bot').debug(`?????????????????????: ${message}`)
    const data = damaku(message, color)
    return send(data)
  },
  /**
   * @description ??????
   * @param uid uid
   * @param message ????????????
   * @returns {Promise}
   */
  like: (uid: string, message: string = '') => {
    logger('Bot').debug(`??? ${uid} ???????????????, ${message}`)
    const data = Like(uid, message)
    return send(data)
  },
  /**
   * @description ??????
   * @param uid uid
   * @param money ??????
   * @param message ??????
   * @returns {Promise}
   */
  payment: (uid: string, money: number, message: string) => {
    logger('Bot').debug(`??? ${uid} ?????? ${money} ?????????, ??????: ${message}`)
    const data = payment(uid, money, message)
    return send(data)
  },
  /**
   * @description ????????????
   * @param type ??????
   * @param title ??????
   * @param signer ??????
   * @param cover ??????
   * @param link ??????
   * @param url ????????????
   * @param duration ???????????????
   * @param BitRate ?????????
   * @param color ??????
   * @returns {[Promise, Promise]}
   */
  sendMedia: (type: 'music' | 'video', title: string, signer: string, cover: string, link: string, url: string, duration: number, BitRate: number, color: string) => {
    const cardData = mediaCard(type, title, signer, cover, BitRate, color)
    const mData = mediaData(type, title, signer, cover, link, url, duration)

    return [
      send(cardData),
      send(mData)
    ]
  },
  utils: {
    /**
     * @description ??????????????????
     * @returns {Promise}
     */
    getUserList: (): Promise<GetUserListCallback[]> => {
      return new Promise((resolve, reject) => {
        Bot.once('GetUserListCallback', resolve)
        send(GetUserList())
      })
    },
    /**
     * @description ??????????????????
     * @param username ?????????
     * @returns {Promise}
     */
    getUserProfile: (username: string): Promise<UserProfileCallback> => {
      return new Promise((resolve, reject) => {
        Bot.once('UserProfileCallback', resolve)
        send(UserProfile(username.toLowerCase()))
      })
    },
    /**
     * @description ??????????????????
     * @returns {Promise}
     */
    getMediaList: (): Promise<MediaListCallback[]> => {
      return new Promise((resolve, reject) => {
        Bot.once('MediaListCallback', resolve)
        send(MediaList())
      })
    }
  },
  admin: {
    /**
     * @description ?????????
     * @param username ?????????
     * @param time ??????????????????????????????
     * @param msg ??????
     */
    blackList: (username: string, time: string, msg?: string) => {
      const data = blackList(username, time, msg || 'undefined')
      send(data)
    },
    /**
     * @description ??????
     * @param username ?????????
     */
    kick: (username: string) => {
      const data = kick(username)
      send(data)
    },
    /**
     * @description ??????
     * @param type ??????
     * @param username ?????????
     * @param time ????????????????????????
     * @param msg ??????
     */
    mute: (type: 'chat' | 'music' | 'all', username: string, time: string, msg: string) => {
      const data = mute(type, username, time, msg)
      send(data)
    },
    /**
     * @description ??????????????????
     * @param msg ????????????
     */
    notice: (msg: string) => {
      const data = notice(msg)
      send(data)
    },
    /**
     * @description ????????????????????????
     * @param num ?????????????????????????????????
     */
    setMaxUser: (num?: number) => {
      const data = setMaxUser(num)
      send(data)
    },
    /**
     * @description ?????????
     * @param username ?????????
     * @param time ??????????????????????????????
     * @param msg ??????
     */
    whiteList: (username: string, time: string, msg?: string) => {
      const data = whiteList(username, time, msg || 'undefined')
      send(data)
    },
    media: {
      /**
       * @description ????????????
       */
      clear: () => {
        const data = mediaClear()
        send(data)
      },
      /**
       * @description ????????????
       * @param id ??????id,????????????????????????
       */
      cut: (id?: string) => {
        const data = mediaCut(id)
        send(data)
      },
      /**
       * @description ???????????????????????????
       * @param id1 ?????????id
       * @param id2 ?????????id
       */
      exchange: (id1: string, id2: string) => {
        const data = mediaExchange(id1, id2)
        send(data)
      },
      /**
       * @description ?????????????????????
       * @param time ????????????????????????????????????
       */
      goto: (time: string) => {
        const data = mediaGoto(time)
        send(data)
      },
      /**
       * @description ??????????????????
       * @param op ????????????
       * @param time ????????????????????????????????????
       */
      op: (op: '<' | '>', time: string) => {
        const data = mediaOperation(op, time)
        send(data)
      }
    }
  },
  bot: {
    moveTo: (roomId: string) => {
      return moveTo(roomId)
    }
  },
  system: {
    bank: () => {
      return new Promise((resolve, reject) => {
        Bot.once('BankCallback', resolve)
        send(bank())
      })
    }
  }
}

export const Data = path.join(process.cwd(), './data')

try {
  mkdirSync(Data)
} catch (error) {}
