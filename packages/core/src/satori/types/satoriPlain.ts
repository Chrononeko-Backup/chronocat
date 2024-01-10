export interface MessageCreatePayload {
  /**
   * @title 目标频道
   *
   * @description 消息要发送到的频道。
   *
   * 在 Chronocat，群聊对应的频道为群号，
   * 私聊对应的频道为 private: 后跟 QQ 号。
   */
  channel_id: string

  /**
   * @title 消息内容
   *
   * @description 消息的内容。
   *
   * 格式为 Satori 消息元素字符串。
   */
  content: string
}
