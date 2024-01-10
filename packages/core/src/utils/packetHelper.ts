const packetPreset = {
  atTinyUid: '',
  elementId: '',
  msgId: '0',
  chatType: 1,
  guildId: '',
  peerUid: '',
  peerUin: '',
  elementType: 1,
  content: '',
  atUid: '',
  atNtUid: '',
  atType: 0,
  extBufForUI: '',
  fileName: '',
  fileSize: '',
  fileSubId: '',
  fileUuid: '',
  md5HexStr: '',
  original: true,
  picHeight: 0,
  picWidth: 0,
  picType: 0,
  picSubType: 0,
  sourcePath: '',
  summary: '',
  thumbFileSize: 0,
}

export const makeFullPacket = (obj: Record<string, unknown>) => {
  const traverse = (obj: Record<string, unknown>) => {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        traverse(obj[key] as Record<string, unknown>)
      } else {
        for (const key in packetPreset) {
          obj[key] ??= packetPreset[key as keyof typeof packetPreset]
        }
      }
    }
  }

  // 开始遍历
  traverse(obj)

  return obj
}
