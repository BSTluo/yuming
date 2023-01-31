import { App, Plugin, PrivateMessageEvent, PublicMessageEvent } from "@yakumoran/core"
import * as word from './api/index'
import * as fs from 'fs'
import * as path from 'path'

export default (app: App) => {
  class wordCore extends Plugin {
    async init() {
      
      this.plugin_author = '春风萧落'
      this.plugin_description = '词库3.0-dev'
      this.plugin_id = 'word'
      this.plugin_name = '词库核心'
      this.plugin_version = '3.0-dev'

      const config = JSON.parse(fs.readFileSync(path.join(process.cwd(),'config.json')).toString())
      if (!word.permissions.have('word.*', config.bot.master_uid)) { word.permissions.add('word.*', config.bot.master_uid) }
    }

    @app.decorators.EventListener('PublicMessage')
    public onPublicMessage(msg: PublicMessageEvent) {
      const name = msg.username
      const id = msg.uid
      

      const out = word.driver.mainStart(msg.message, {
        mname: name,
        mid: id
      })

      if (!out) return
      this.app.api.sendPublicMessage(out)
    }

    @app.decorators.EventListener('PrivateMessage')
    public onPrivateMessage(msg: PrivateMessageEvent) {
      const name = msg.username
      const id = msg.uid

      const out = word.driver.mainStart(msg.message, {
        mname: name,
        mid: id
      })

      this.app.api.sendPrivateMessage(msg.uid, out)
    }

    @app.decorators.Command({
      name: '.问<触发词>答<回答句>',
      command: /^\.问([\s\S]+?)答([\s\S]+)$/,
      desc: '添加问答',
      usage: '.问a答b',
      privateChat: true, // 是否接受私聊消息(可选，默认为true)
      publicChat: true // 是否接受群聊消息(可选，默认为true)
    })
    public addWord(msg: PublicMessageEvent, args: RegExpExecArray) {
      console.log(msg)
      console.log(args)
      if (!word.permissions.have('word.edit.add', msg.uid)) return this.app.api.sendPublicMessage(' [词库核心] word.edit.add 权限不足')
      // 发送消息
      this.app.api.sendPublicMessage(word.editor.add(args[1], args[2], msg.uid))
    }

    @app.decorators.Command({
      name: '.删<触发词>序号<序号>',
      command: /^\.删([\s\S]+?)序号([\s\S]+?)$/,
      desc: '删除问答',
      usage: '.删a序号all',
      privateChat: true, // 是否接受私聊消息(可选，默认为true)
      publicChat: true // 是否接受群聊消息(可选，默认为true)
    })
    public delWord(msg: PublicMessageEvent, args: RegExpExecArray) {
      if (!word.permissions.have('word.edit.rm', msg.uid)) return this.app.api.sendPublicMessage(' [词库核心] word.edit.rm 权限不足')

      // 回复结果
      this.app.api.sendPublicMessage(word.editor.del(args[1], args[2], msg.uid))
    }

    @app.decorators.Command({
      name: '.问表<触发词>',
      command: /^\.问表([\s\S]+?)$/,
      desc: '查询问答',
      usage: '.问表测试',
      privateChat: true, // 是否接受私聊消息(可选，默认为true)
      publicChat: true // 是否接受群聊消息(可选，默认为true)
    })
    public findWord(msg: PublicMessageEvent, args: RegExpExecArray) {
      // 回复结果
      this.app.api.sendPublicMessage(word.editor.findQuestion(args[1]))
    }

    @app.decorators.Command({
      name: '.入库<库名>',
      command: /^\.入库([\s\S]+?)$/,
      desc: '开始编辑某库',
      usage: '.入库测试库',
      privateChat: true, // 是否接受私聊消息(可选，默认为true)
      publicChat: true // 是否接受群聊消息(可选，默认为true)
    })
    public setList(msg: PublicMessageEvent, args: RegExpExecArray) {
      // 回复结果
      const adminlist = word.editor.isWriter(msg.uid)
      if (adminlist) {
        this.app.api.sendPublicMessage(word.editor.changePointer(args[1], msg.uid))
      } else {
        this.app.api.sendPublicMessage(' [词库核心] 您可能不是此词库的作者，无法入库')
      }
    }

    @app.decorators.Command({
      name: '.出库',
      command: /^\.出库$/,
      desc: '开始编辑默认库',
      usage: '.出库',
      privateChat: true, // 是否接受私聊消息(可选，默认为true)
      publicChat: true // 是否接受群聊消息(可选，默认为true)
    })
    public resetList(msg: PublicMessageEvent, args: RegExpExecArray) {
      // 回复结果
      this.app.api.sendPublicMessage(word.editor.resetPointer(msg.uid))
    }

    
    @app.decorators.Command({
      name: '.表<触发词>',
      command: /^\.表([\s\S]+?)$/,
      desc: '查看某关键词的回答',
      usage: '.表测试',
      privateChat: true, // 是否接受私聊消息(可选，默认为true)
      publicChat: true // 是否接受群聊消息(可选，默认为true)
    })
    public whatIn(msg: PublicMessageEvent, args: RegExpExecArray) {
      // 回复结果
      this.app.api.sendPublicMessage(word.editor.list(args[1], msg.uid))
    }

    @app.decorators.Command({
      name: '.库表<库名/all>',
      command: /^\.库表([\s\S]+?)$/,
      desc: '查看拥有的词库',
      usage: '.库表默认',
      privateChat: true, // 是否接受私聊消息(可选，默认为true)
      publicChat: true // 是否接受群聊消息(可选，默认为true)
    })
    public findList(msg: PublicMessageEvent, args: RegExpExecArray) {
      // 回复结果
      this.app.api.sendPublicMessage(word.editor.findList(args[1]))
    }

    @app.decorators.Command({
      name: '.栈<库名/all>',
      command: /^\.栈([\s\S]+?)$/,
      desc: '查看某词库拥有的所有触发词',
      usage: '.栈默认',
      privateChat: true, // 是否接受私聊消息(可选，默认为true)
      publicChat: true // 是否接受群聊消息(可选，默认为true)
    })
    public passiveList(msg: PublicMessageEvent, args: RegExpExecArray) {
      // 回复结果
      this.app.api.sendPublicMessage(word.editor.passiveList(args[1]))
    }

    @app.decorators.Command({
      name: '.赋权<uid> <权限名>',
      command: /^\.赋权\s+\[@([\s\S]+?)@\]\s+([\s\S]+?)$/,
      desc: '给一位用户权限',
      usage: '.栈默认',
      privateChat: true, // 是否接受私聊消息(可选，默认为true)
      publicChat: true // 是否接受群聊消息(可选，默认为true)
    })
    public addPermission(msg: PublicMessageEvent, args: RegExpExecArray) {
      // 回复结果
      if (!word.permissions.have('word.admin', msg.uid)) return this.app.api.sendPublicMessage(' [词库核心] word.admin 权限不足')

      this.app.api.sendPublicMessage(word.permissions.add(args[2], args[1].toLowerCase()))
    }

    @app.decorators.Command({
      name: '.<物品名称>:<库名>天梯',
      command: /^\.([\s\S]+?):([\s\S]+?)天梯$/,
      desc: '查看某物品的数量',
      usage: '.小鱼干天梯',
      privateChat: true, // 是否接受私聊消息(可选，默认为true)
      publicChat: true // 是否接受群聊消息(可选，默认为true)
    })
    public itemList(msg: PublicMessageEvent, args: RegExpExecArray) {
      const a = '\\\\\\*\n' + word.driver.itemList(args[1], args[2], { header: ' [@', body: '@] ' }, true)
      this.app.api.sendPublicMessage(a)
    }

    @app.decorators.Command({
      name: '.删库<库名>',
      command: /^\.删库([\s\S]+?)$/,
      desc: '将一个库移动到回收站',
      usage: '.删库默认',
      privateChat: true, // 是否接受私聊消息(可选，默认为true)
      publicChat: true // 是否接受群聊消息(可选，默认为true)
    })
    public rmList(msg: PublicMessageEvent, args: RegExpExecArray) {
      if (!word.permissions.have('word.edit.listRm', msg.uid)) return this.app.api.sendPublicMessage(' [词库核心] word.edit.listRm 权限不足')

      this.app.api.sendPublicMessage(word.editor.killList(args[1]))
    }

    @app.decorators.Command({
      name: '.清空回收站',
      command: /^\.清空回收站$/,
      desc: '将回收站清空',
      usage: '.清空回收站',
      privateChat: true, // 是否接受私聊消息(可选，默认为true)
      publicChat: true // 是否接受群聊消息(可选，默认为true)
    })
    public clearBackup(msg: PublicMessageEvent, args: RegExpExecArray) {
      if (!word.permissions.have('word.edit.clearList', msg.uid)) return this.app.api.sendPublicMessage(' [词库核心] word.edit.clearList 权限不足')

      this.app.api.sendPublicMessage(word.editor.killList(args[1]))
    }

    @app.decorators.Command({
      name: '.还原回收站<词库名>',
      command: /^\.还原回收站([\s\S]+?)$/,
      desc: '将回收站内某词库还原',
      usage: '.还原回收站默认',
      privateChat: true, // 是否接受私聊消息(可选，默认为true)
      publicChat: true // 是否接受群聊消息(可选，默认为true)
    })
    public recoveryList(msg: PublicMessageEvent, args: RegExpExecArray) {
      if (!word.permissions.have('word.edit.recoveryList', msg.uid)) return this.app.api.sendPublicMessage(' [词库核心] word.edit.recoveryList 权限不足')

      this.app.api.sendPublicMessage(word.editor.recoveryList(args[1]))
    }

    @app.decorators.Command({
      name: '.查看回收站列表',
      command: /^\.查看回收站列表$/,
      desc: '查看回收站内的词库',
      usage: '.查看回收站列表',
      privateChat: true, // 是否接受私聊消息(可选，默认为true)
      publicChat: true // 是否接受群聊消息(可选，默认为true)
    })
    public backupList(msg: PublicMessageEvent, args: RegExpExecArray) {
      if (!word.permissions.have('word.edit.recoveryList', msg.uid)) return this.app.api.sendPublicMessage(' [词库核心] word.edit.recoveryList 权限不足')

      this.app.api.sendPublicMessage(word.editor.recoveryList(args[1]))
    }

    @app.decorators.Command({
      name: '.强删<词库名>',
      command: /^\.强删([\s\S]+?)$/,
      desc: '不放入回收站直接删除词库',
      usage: '.强删默认',
      privateChat: true, // 是否接受私聊消息(可选，默认为true)
      publicChat: true // 是否接受群聊消息(可选，默认为true)
    })
    public mandatoryDelete(msg: PublicMessageEvent, args: RegExpExecArray) {
      if (!word.permissions.have('word.edit.delet', msg.uid)) return this.app.api.sendPublicMessage(' [词库核心] word.edit.delet 权限不足')

      this.app.api.sendPublicMessage(word.editor.mandatoryDelete(args[1]))
    }

    @app.decorators.Command({
      name: '.添加开发者<对方id>',
      command: /^\.添加开发者\s\[@([\s\S]+?)@\]\s$/,
      desc: '在当前词库添加此id为开发者',
      usage: '.添加开发 [@5b0fe8a3b1ff2@] ',
      privateChat: true, // 是否接受私聊消息(可选，默认为true)
      publicChat: true // 是否接受群聊消息(可选，默认为true)
    })
    public addWriter(msg: PublicMessageEvent, args: RegExpExecArray) {
      if (!word.permissions.have('word.edit.addWriter', msg.uid)) return this.app.api.sendPublicMessage(' [词库核心] word.edit.addWriter 权限不足')

      this.app.api.sendPublicMessage(word.editor.addWriter(args[1], msg.uid))
    }

    @app.decorators.Command({
      name: '.删除开发者<对方id>',
      command: /^\.删除开发者\s\[@([\s\S]+?)@\]\s$/,
      desc: '在当前词库删除此id为开发者',
      usage: '.删除开发者 [@5b0fe8a3b1ff2@] ',
      privateChat: true, // 是否接受私聊消息(可选，默认为true)
      publicChat: true // 是否接受群聊消息(可选，默认为true)
    })
    public rmWriter(msg: PublicMessageEvent, args: RegExpExecArray) {
      if (!word.permissions.have('word.edit.rmWriter', msg.uid)) return this.app.api.sendPublicMessage(' [词库核心] word.edit.rmWriter 权限不足')

      this.app.api.sendPublicMessage(word.editor.rmWriter(args[1], msg.uid))
    }

    @app.decorators.Command({
      name: '.查看开发者<词库名>',
      command: /^\.查看开发者([\s\S]+?)$/,
      desc: '查看某词库的开发者',
      usage: '.查看开发者默认',
      privateChat: true, // 是否接受私聊消息(可选，默认为true)
      publicChat: true // 是否接受群聊消息(可选，默认为true)
    })
    public viewWriter(msg: PublicMessageEvent, args: RegExpExecArray) {
      this.app.api.sendPublicMessage(word.editor.viewWriter(args[1]))
    }

    @app.decorators.Command({
      name: '.增包<物品名称>',
      command: /^\.增包([\s\S]+?)$/,
      desc: '添加某物品到当前词库的物品清单',
      usage: '.增包小鱼干',
      privateChat: true, // 是否接受私聊消息(可选，默认为true)
      publicChat: true // 是否接受群聊消息(可选，默认为true)
    })
    public setPack(msg: PublicMessageEvent, args: RegExpExecArray) {
      if (word.editor.isWriter(msg.uid)) {
        this.app.api.sendPublicMessage(word.editor.setPack(msg.uid, args[1]))
      } else {
        this.app.api.sendPublicMessage(' [词库核心] 您不是当前词库的开发者，请检查当前所入的库')
      }
    }

    @app.decorators.Command({
      name: '.删包<物品名称>',
      command: /^\.删包([\s\S]+?)$/,
      desc: '删除某物品到当前词库的物品清单',
      usage: '.删包小鱼干',
      privateChat: true, // 是否接受私聊消息(可选，默认为true)
      publicChat: true // 是否接受群聊消息(可选，默认为true)
    })
    public delPack(msg: PublicMessageEvent, args: RegExpExecArray) {
      if (word.editor.isWriter(msg.uid)) {
        this.app.api.sendPublicMessage(word.editor.delPack(msg.uid, args[1]))
      } else {
        this.app.api.sendPublicMessage(' [词库核心] 您不是当前词库的开发者，请检查当前所入的库')
      }
    }

    @app.decorators.Command({
      name: '.查包',
      command: /^\.查包$/,
      desc: '查看当前词库的物品清单',
      usage: '.查包',
      privateChat: true, // 是否接受私聊消息(可选，默认为true)
      publicChat: true // 是否接受群聊消息(可选，默认为true)
    })
    public listPack(msg: PublicMessageEvent, args: RegExpExecArray) {
      if (word.editor.isWriter(msg.uid)) {
        this.app.api.sendPublicMessage(word.editor.listPack(msg.uid))
      } else {
        this.app.api.sendPublicMessage(' [词库核心] 您不是当前词库的开发者，请检查当前所入的库')
      }
    }

    @app.decorators.Command({
      name: '.修改存储格<背包存储格>',
      command: /^\.修改存储格([\s\S]+?)$/,
      desc: '将当前词库的物品存储于背包某格',
      usage: '.修改存储格春风',
      privateChat: true, // 是否接受私聊消息(可选，默认为true)
      publicChat: true // 是否接受群聊消息(可选，默认为true)
    })
    public changCache(msg: PublicMessageEvent, args: RegExpExecArray) {
      if (word.editor.isWriter(msg.uid)) {
        this.app.api.sendPublicMessage(word.editor.changCache(args[1] ,msg.uid))
      } else {
        this.app.api.sendPublicMessage(' [词库核心] 您不是当前词库的开发者，请检查当前所入的库')
      }
    }

    @app.decorators.Command({
      name: '.有<主动式>时<回答句>',
      command: /^\.有([\s\S]+?)时([\s\S]+)$/,
      desc: '添加主动问答',
      usage: '.有进入房间答欢迎光临',
      privateChat: true, // 是否接受私聊消息(可选，默认为true)
      publicChat: true // 是否接受群聊消息(可选，默认为true)
    })
    public whenOn(msg: PublicMessageEvent, args: RegExpExecArray) {
      if (!word.permissions.have('word.edit.add', msg.uid)) return this.app.api.sendPublicMessage(' [词库核心] word.edit.add 权限不足')
      // 发送消息
      this.app.api.sendPublicMessage(word.editor.whenOn(args[1], args[2], msg.uid))
    }

    @app.decorators.Command({
      name: '.无<触发词>序号<序号>',
      command: /^\.删([\s\S]+?)序号([\s\S]+?)$/,
      desc: '删除主动问答',
      usage: '.无进入房间序号all',
      privateChat: true, // 是否接受私聊消息(可选，默认为true)
      publicChat: true // 是否接受群聊消息(可选，默认为true)
    })
    public whenOff(msg: PublicMessageEvent, args: RegExpExecArray) {
      if (!word.permissions.have('word.edit.rm', msg.uid)) return this.app.api.sendPublicMessage(' [词库核心] word.edit.rm 权限不足')

      // 回复结果
      this.app.api.sendPublicMessage(word.editor.whenOff(args[1], args[2], msg.uid))
    }

    // 修改当前词库的存储库
    // 上传
    // 下载
  }
  return wordCore
}
