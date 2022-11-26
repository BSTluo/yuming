import { App, Plugin, PrivateMessageEvent, PublicMessageEvent} from "@yakumoran/core"
import * as word from './api/index'

export default (app: App) => {
  class wordCore extends Plugin {
    async init () {
      this.plugin_author = '春风萧落'
      this.plugin_description = '词库3.0-dev'
      this.plugin_id = 'word'
      this.plugin_name = '词库核心'
      this.plugin_version = '3.0-dev'
    }

    @app.decorators.EventListener ('PublicMessage')
    public onPublicMessage (msg: PublicMessageEvent) {
      const name = msg.username
      const id = msg.uid
    }

    @app.decorators.EventListener('PrivateMessage')
    public onPrivateMessage (msg: PrivateMessageEvent) {
      const name = msg.username
      const id = msg.uid
    }

    /**
     * 添加词库
     * 验证权限 
     */
    @app.decorators.Command ({
      name: '.问<触发词>答<回答句>',
      command: /^\.问([\s\S]+?)答([\s\S]+)$/,
      desc: '添加问答',
      usage: '.问a答b',
      privateChat: true, // 是否接受私聊消息(可选，默认为true)
      publicChat: true // 是否接受群聊消息(可选，默认为true)
    })
    public addWord (msg: PublicMessageEvent, args: RegExpExecArray) {
      if (!word.permissions.have('word.edit.add', msg.uid)) return
      // 发送消息
      this.app.api.sendPublicMessage(word.editor.add(args[1], args[2], msg.uid))
    }

    
    /**
     * 验证权限能否正常使用
     *  
     */
    @app.decorators.Command ({
      name: '.删<触发词>序<序号>',
      command: /^\.删([\s\S]+?)序([\s\S]+?)$/,
      desc: '删除问答',
      usage: '.删a序号all',
      privateChat: true, // 是否接受私聊消息(可选，默认为true)
      publicChat: true // 是否接受群聊消息(可选，默认为true)
    })
    public test (msg: PublicMessageEvent, args: RegExpExecArray) {
      if (!word.permissions.have('word.edit.del', msg.uid)) return

      // 回复结果
      this.app.api.sendPublicMessage(word.editor.del(args[1], args[2], msg.uid))
    }

  }
  return wordCore
}
