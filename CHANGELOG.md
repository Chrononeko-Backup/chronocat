# CHANGELOG

## v0.0.54 (2023-10-17)

### core

- Satori：更换到标准元素 (7dfd01387f72070905bdad314f19f18a97953f9b)
- Satori：实现了 API `guild.member.list` (9e8a9dac7286983398ee8d1a93ce15bb7316c88a)
- Satori：支持了 WebHook (1960b4c76a1c6e9d8c404081cc2d0a143b11618e)
- 支持使用 `autologin` 开关自动登录 (da79fd4fbf79273a17916e799a0982ccc117c941)
- Red：优化了 API `group/getMemberList` 的实现 (4bb28608b16ffbcb0b56b9bc04249832d678e12c)
- TDD：添加 Satori 消息编码器的单元测试 (f10092fc54961791c545dfe48341adfeb40904ea)
- Red：修复了事件中用户身份不正确的问题 @boxie123 (9fa7b0a80a2071a19f4dd298d0682dd1976bd915)
- 修复了 Satori 无法获取网络图片和 WebHook 无法请求的问题 (3e63ddb1a6c8061d57e764b78f059e8d040a54c7)

## v0.0.53 (2023-10-17)

### core

- 添加了 Chronocat Satori OpenAPI 文档 (5708c069223f36cc07e24d34b4a4d33a1b6b9ae8)
- Red & Satori：修复了尝试下载不存在的媒体文件时连接无响应的问题 (78558d42b12aec38e1549da042667720178de427)
- Satori：修复了 `token` 配置项为空时仍然无法连接到事件服务的问题 (c123f0f87a7a0056c2596ad17f823f9749af2c6a)
- Satori：修复了 `token` 配置项为空时事件服务不推送任何事件的问题 (1a9ae46aecbcdf6ca7933b0d2a010586f8abad23)
- Satori：支持使用 `platform` 配置项自定义 Satori 事件服务对外显示的平台 (1900ef5ddf875a39b47dc0e358efc6e0cd5ff875)
- Satori：修复了访问媒体资源报错 `401 unauthorized` 的问题 (3f9206ae550141d5609e4ff152663562b569e2cb)
- Satori：修复了私聊情况下接收消息频道 ID 不一致的问题 (c55debe5219d94556f0a11bbed9dcf1f7226b7f4)
- Satori：实现了 API `user.channel.create` (b63a757c337854f0a05e1a158979bfacdc94b9de)
- Satori：支持发送 `image`/`audio`/`file` 元素 (53ca2e667bb2de607d74bee2711adbb8eab9764b)
- 更新文档 Satori SDK 部分 @Nyayurn (9238c131d5d7df63111d9a6a5130d31b48870fda)
- Chronocat 管理服务在登录成功后给出提示 @falconshark (48054114d76e035399c66567a1b605cea1c58613)
- TDD：添加 Satori 解析器的单元测试 (4b0ea13b50e95a35d8f92e00b94cffcf203d04ad)

## v0.0.52 (2023-10-11)

### core

- Satori：修复了 API `assets` 报错 500 的问题 (#33)
- Satori：支持发送 `message` 元素 (730635590f4bec561b795114286c6165687e8245)
- Satori：修复了发送消息时 `message` 元素无 children 导致发送失败的问题 (8a440b23e63fb37cd64dd1c6a7a7aabbd5540b8d)
- 资源获取 API 避免误获取到缩略图而非原图 (e24030895e3491d989b389962b5168f3b65a8403)

此更改直接对所有资源获取事件进行了仅原图的筛选。已在多个 QQ
版本上测试通过。遇到问题请创建新的 Issue。

## v0.0.51 (2023-10-10)

### core

- 增加了 Chronocat 的 Logo @Lipraty (bbe271eebdc578ca91411a24f259a1adb9fea61a)
- Satori：修复了事件端点错误的问题 (a485533866313e1f6c3a14519c67de67d8c3adb0)
- Satori：支持 `READY` 信令的响应数据 (12df4f8fa5edecf80875a75ad4cb7a82c82dda0d)
- Satori：标准元素实现最新版规范 (7a328e3ce692ce4905007f921a95e3e264ad52f1)
- Satori：API `message.create` 返回 content 字段 (f09df36a1485af3a8f3dd73502a855b813d270bc)
- 移除了无头模式（模式 1 和模式 2） (e4e1945709beba656863331626e4cff64470a62a)
- 修复了无头模式导致 QQ 无法正常退出的问题 (1da52f2c46b9b738423e0f375b191c0e54048e00)

## v0.0.50 (2023-10-07)

### core

- 实装了远程登录 (1d22d6d21cd3fac52e76e8bc06382f47bbbebae9)
- 修复了远程登录无响应的问题 (7bae5f2366f461232ec2eecfc3f18b4ee83e9670)
- 实现远程登录失败时返回错误信息 (94a2b42dccc0b3699eb0c23c957a0d8bbad90e79)
- 修复远程登录在 Linux QQ v3.1.2-13107 上的问题 (eb5006fa252bbd20f7ba1265601e1f04bf6e3371)
- 实装了无头模式（模式 3） (8ddea1a1938b59072fbbf3c4e2e49cc64b14d5cf)
- 实装了无头模式（模式 4） (917f1e02fb130b39e41771c2cf6e1dccea7dfae7)
- 仅在调试环境挂载全局变量 (25ce1cfd980aedaa76aeffb5f930393eea276d56)
- 支持使用 `--chrono-mode` 和 `CHRONO_MODE` 设定运行环境 (b0159c0ed3bb17e1f5388cfb985193d9fb5aaaee)
- 支持 chrono-mode 传入 `debug` (8fc0e7c15a852b089e43ff9949dc2ad50a63072c)
- 支持使用 `--chrono-default-token` 和 `CHRONO_DEFAULT_TOKEN` 设定初始 token (a45c6a366a744c7ea7543f0cd8002e14a32b0775)
- Satori：支持了 API `message.create` (6f80d19ea9529148c2fd953c76e14a1ac0470b87)
- Satori：实装了消息编码器 (6601032c4f793cc201600af474052b1a4376386e)
- Satori：修复了 API 调用未等待调用结束的问题 (2eaf3eae6df0a9208564ea97983854f723f63a22)
- Satori：修复了消息编码器的返回数据格式 (a6d66b158d949bb9469d0a6a83496e22ae2131d0)
- Red：新增 API `bot/exit`，用于关闭机器人 (03c066d601d87d20aa30b6ea0a0f21d10bcc4acd)

### llqqnt

- 直接加载核心而不等待 ready 事件 (98a3a76c93e4620ceb19f2a73c04482dcd270795)

### docker

- 首个版本

## v0.0.49 (2023-10-04)

### core

- 更新登录逻辑 (c8c788e3a6a32ba67937b7913e4669c65dc123b7)
- Satori：实现 Satori Assets (69eb7a8e7d6fa1766d9e3e14d6fff43a6462457f)
- Satori：修复了入群事件名称错误的问题 (f32c834e0b5310f82d3a1c1b4d9b5dc30c39cf10)
- Red：修复了 17153 及以上版本发送消息闪退的问题 (b2e0910375645e922c5894b3ea22807a78e7f247)
- Red：修复了 17153 及以上版本发送消息有概率失败的问题 (8c887cf99cd09dfd18708c853dd13a05fed30c20)
- Red：修复了 17153 及以上版本上传文件报错 500 的问题 (8b51c3d74a9ecc5ea1d9d8f4260107b9aed3ede6)

### cli

- 首个版本

## v0.0.48 (2023-10-02)

### core

- 更新登录逻辑 (8317e0eeb30977e45553c5fe3d2f74956371e842)
- Satori：修复了 Channel 和 Member 对象错误携带 `avatar` 字段的问题 (b1f862e642291be2518f780284401cea291898e1)
- Satori：无法获取用户名时不提供 `user.name` (55c3b2313d0f5ff252192a29bcd646506e68d420)
- Satori：不使用 `POST` 调用 API 时返回 `405 Method Not Allowed` (8136cfc5fcb5426142a55541ba6272fb38eb7eb7)
- Red：修复了 API `message/fetchRichMedia` 返回缩略图而非原图的问题 (5e5b3941a7036dd76822d3fbf1dacf9864f691de)

## v0.0.47 (2023-09-29)

### core

- 修复了配置文件中覆写配置部分的未填写字段仍然会以默认值覆写全局配置的已有字段的问题 (d55929bdd319ff1dda8681324511b92c8232629f)
- Satori：新增 `self_url` 配置项 (d8bec3d4778eedc947c73ad0e5e6d7bf10fbf254)
- Satori：支持事件 (fc5bb0050185507213aff295e23311fe3a0ea301)
- Satori：事件携带唯一 ID (1891c7d0d5e35fbf7fe7153efc89540585ad959c)
- Satori：优化 Index 页面 (c3dfa994f89a07b3ea4e9a7756ba25fcff6d3102)
- Satori：修复了 image 元素携带无用的 `no-isemoji` 属性问题 (ecd040686d1ade5f6f022427893e9dec25a3a5be)
- 支持了可信安装 (94097552a86c2b236e81205f473b46c7b7495e03)
- Red：API `message/getHistory` 响应添加 QQ 号 (4d50496679f43e6f23dd83c38dc0a8edd66a6e14)

## v0.0.46 (2023-09-25)

### core

- 添加了 Chronocat 配置文件的类型定义 (3b85d7737ad18637047e68038d4e7055ffecb1b7)
- 添加了 Chronocat 配置文件类型定义到 JSON Schema 的生成 (28527870ada1b5e0928c44fd251184a04a8d44a3)
- 支持了 Chronocat 配置文件的解析、校验、自动生成和迁移 (2cb1aa009a55334092ec3eff29314d9d4549075a)
- 移除了插件卸载逻辑 (7ea7b3fa75eb20ab7fa789d4b571349f1992f8a0)
- 支持根据配置文件启动任意个数的服务 (4069e711e36322a26df7bb051a5d30371c163c0c)
- 禁止服务使用默认 token 启动 (a4a6cb76c88b91fda0c7c2385dfafea044c0bde0)
- 支持了 Satori 协议 (b974114b93c4cc6277556f7a350a12a763fb3fd5)
- Satori：支持了 API `login.get` (4abd5ed61b085c957a69fc484fb8b43ad973538d)

## v0.0.45 (2023-09-20)

### core

- 修复了 API 请求中以数字形式传入 QQ 号会导致报错 500 的问题 (53d77e1f472aabde0c95b1b0e7f150adf342435a)
- 修复了非 NT 手机 QQ（8.9.63 以下版本）无法显示引用消息的问题 (9de067ee26e9e064935491367a394d23a7860ced)

### red

- 更新了 `r.reply()` 的参数 (c74aa56d03f5f0946c20b4d1d355f02623cf2740)

## v0.0.44 (2023-09-19)

### core

**这个版本修复了一个严重的安全问题，我们建议所有用户立即升级到这一版本。**

- 修复了 HTTP 不进行认证仍能调用 API 的问题 (d2f610d7ed0594f0108095cce93a6a0c8dd99ce4)

### red

- r 助手支持 `reply()` (c370aebbbb677bbe516717d1b43ed5dc504cbcf7)
- r 助手添加了类型校验 (55417fca62963de03f25f0b498bac1c764c8f5fb)
- 修复了 `r.remoteFile()` 的类型问题 (b0c8e82bae3589038aff7512646c72e4ab2c23a4)
- 修复了 r 助手中的类型问题 (55417fca62963de03f25f0b498bac1c764c8f5fb)

## v0.0.43 (2023-09-19)

### core

- 修复了 `message::recv` 的 payload 可能为空的问题 (6c421411dfb02ae59fc3136d457dc39e9f7c8693)
- 修复了 API 响应的相关问题 (#14)

### red

- r 助手支持 `remoteFile()` (d1d9f2239dc3db2d64462f79ca035e972c7f117b)
- 完善 `Message` 类型 (846f2d60c9c252e59f8173c9001f12708f7e9377)

## v0.0.42 (2023-09-17)

### core

- 修复了 API `upload` 可能会无限等待响应的问题 (38ea51dd0a48ac3a42b6d1e7f4fde891b7611cb7)
- 修复了 API `upload` 上传未知格式文件会失败的问题 (bfd0ba13013a5fd91025a4d1e4cc8c08b449163c)
- 修复了 WebSocket 鉴权失败和断连时的问题 @XiYang6666 (#10)

现在，WebSocket 鉴权失败后会遵循 WebSocket 标准，以状态码 `3000`
关闭连接。详见 Issue 内讨论。

### red

- r 助手支持 `remoteAudio()` (5e401924a773a3767606a6b138f7702aae1484d8)
- `r.remoteAudio()` 添加 `duration` 为必须参数 (30c62e599d7a9848947485a41c794d5fccbf6494)
- 合并转发载荷类型由 `MessageSendForwardPayload` 修改为 `UnsafeMessageSendForwardPayload` (363db56fa707045f0c99a92456680b34e68bd231)

该修改只影响 TypeScript 类型定义，不影响逻辑代码。

## v0.0.41 (2023-09-15)

### core

- 支持普通合并转发
- 普通合并转发、伪造合并转发支持所有 Windows QQ 版本
- 支持伪造合并转发消息发送者使用 QQ 号指定 (53062537c27b59df7ec6e5564b165fb402edd3b5)

### koishi-plugin-adapter

- 支持发送文件 (24db317b9f9a39645bd5312771602d0722818df0)
- 适配了 Koishi v4.14.6 和 Satori v3 (4b8fb8cb0b6246fdd4d11dba56a351c94fcdc15d)

## v0.0.40 (2023-09-10)

### core

- 修复了 native 模块导致 QQ 无法启动的问题 (#7)

版本 0.0.40 紧急修复了 Chronocat 导致 QQ
无法启动的问题。特别地，如果你已经安装了版本 0.0.39
并已经无法启动 QQ，可以按照如下步骤进行修复：

1. 打开 `文档/LiteLoaderQQNT/plugins` 文件夹，删除下面带有 `LiteLoader-Plugin-Chronocat` 字样的文件夹
1. 使用任务管理器结束所有 QQ 进程
1. 重新打开 QQ，QQ 应当能够正常启动。接下来可以前往 LiteLoaderQQNT 插件市场下载 0.0.40 版本。

### module-native

- 修复了 native 模块导致 QQ 无法启动的问题 (#7)
- 普通合并转发、伪造合并转发支持所有 Windows QQ 版本 (e98d26cd2956d65618fdf2645b0442813b0ad307)

### koishi-plugin-adapter

- 支持发送语音消息 (0f872ca68b8e0f5f9dfd16682143d2df4ca81176)

## v0.0.39 (2023-09-09)

### core

- 发送消息后返回发送结果 @Hieuzest (#4)
- 支持伪造合并转发 (#5)
- 修复了文件上传和资源获取有概率失败的问题 @Hieuzest (#6)

### module-native

- 支持伪造合并转发 (#5)

### miraigo

- 支持伪造合并转发 (#5)

### koishi-plugin-adapter

- 适配了 Koishi v4.14.5 和 Satori v3 (e124693ef6c27cfbbab0a4e0d135b29b0adb19ff)

## v0.0.38 (2023-08-30)

### core

- 接收到的聊天消息中现在会包含群成员身份组信息 @Hieuzest (#3)
- 修复了 HTTP API 无法使用的问题
- 修复了文件上传的问题

### koishi-plugin-assets-memory

- 修复了资源获取失败的问题 (a45ac5934b6053c783c8122e3466b43ce0c24eb8)

## v0.0.37 (2023-08-26)

### core

- 修复了一个问题，该问题会导致首次使用 Chronocat 时不会自动创建 token 文件 (ad8b570bd7d41ecc9ac600421c34b5bb8049e3f5)

## v0.0.36 (2023-08-26)

### core

- 完全重构了 Chronocat Core

### red

- 添加 Payload 相关类型

### llqqnt

- 首个版本

### qqntim

- 首个版本

### iife

- 首个版本

### koishi-plugin-adapter

- 拆分了资源存储逻辑

### koishi-plugin-assets-memory

- 首个版本

## v0.0.35 (2023-08-11)

### koishi-plugin-adapter

- 修复了一些小的问题并提升了稳定性

## v0.0.34 (2023-08-04)

### core

- 更新了 Chronocat 核心

## v0.0.33 (2023-08-04)

### core

- 更新了 Chronocat 核心

## v0.0.32 (2023-07-31)

### core

- 更新了 Chronocat 核心

## v0.0.31 (2023-07-30)

### core

- 更新了 Chronocat 核心

## v0.0.30 (2023-07-27)

### koishi-plugin-adapter

- 撤回了将 chronocatAssets 服务提升至 host 插件的更改，因为这会导致问题

## v0.0.29 (2023-07-27)

### koishi-plugin-adapter

- 支持了 session 上的 avatar 字段
- 修复了一个问题，该问题会导致群聊无法发送消息

## v0.0.28 (2023-07-26)

### core

- 更新了 Chronocat 核心

### koishi-plugin-adapter

- 更新了插件配置
- 将 chronocatAssets 服务提升至 host 插件
- 修复了处理消息过慢的问题

## v0.0.27 (2023-07-25)

### core

- 更新了 Chronocat 核心

### koishi-plugin-adapter

- 实现接收文件
- 实现接收语音消息
- 实现接收视频消息
- 实现「群组内群员被禁言」事件
- 支持 `session.isDirect`
- 修复了处理消息过慢的问题

## v0.0.26 (2023-07-24)

### koishi-plugin-adapter

- 俢復孒①些尒哋問趧並諟圱孒穏萣悻

## v0.0.25 (2023-07-23)

### koishi-plugin-adapter

- 开发流程启用 TDD 模式：现在，开发 Chronocat 时无需启动 Chronocat、Koishi 或 QQ
- 支持「旧版群成员邀请新人入群」事件
- 修复了「新人自行入群」事件不触发的问题

### koishi-plugin-launcher

- 启动器适配 QQ v9.9.1.15293

## v0.0.24 (2023-07-21)

### koishi-plugin-adapter

- 修复了一个表情混排消息导致消息解析出错的问题
- 修复图片接收问题

### koishi-plugin-launcher

- 移除了第一代启动器
- 更新了 Chronocat 核心
- 修复了 QQ 无限转圈的问题

## v0.0.23 (2023-07-20)

### koishi-plugin-adapter

- 使用 host 插件作为入口点
- 俢復孒①些尒哋問趧並諟圱孒穏萣悻

### koishi-plugin-launcher

- 默认使用 Chronocat 第二代启动器
- 启动器适配 QQ v9.9.1.15240
- 启动器支持 Windows ARM / Linux ARM

## v0.0.22 (2023-07-19)

### koishi-plugin-adapter

- 现在，在 session 存在字段缺失时会给出警告。在反馈问题时，请携带相关错误码进行反馈。
- 实现 getMessageList
- 实现 getGuild、getGuildList
- 检测群名称变更事件
- 修复图片接收错误

## v0.0.21 (2023-07-19)

### koishi-plugin-launcher

- 支持 Chronocat 第二代启动器

## v0.0.20 (2023-07-17)

### koishi-plugin-adapter

- 俢復孒①些尒哋問趧並諟圱孒穏萣悻

## v0.0.19 (2023-07-14)

### koishi-plugin-adapter

- 修复了一些小的问题并提升了稳定性

## v0.0.18 (2023-07-14)

### core

- 更新了 Chronocat 核心

## v0.0.17 (2023-07-13)

### koishi-plugin-adapter

- 现在，每个已弃用或未实现的 API 都配备了专属的错误码。在反馈问题时，请携带相关错误码进行反馈。
- 不再解析 ark 消息
- 修复了接收到的图片 URL 中出现 undefined 的问题
- 修复了使用 bot.sendMessage() 无法主动发送群聊消息的问题
- 修复了一些小的问题并提升了稳定性

## v0.0.16 (2023-07-11)

### koishi-plugin-adapter

- 修复了 adapter 无法加载的问题

## v0.0.15 (2023-07-11)

### koishi-plugin-adapter

- 添加了更多 API

## v0.0.14 (2023-07-11)

### core

- 更新 Chronocat 核心到 v1.0.1

## v0.0.13 (2023-07-11)

### koishi-plugin-adapter

- 优化了消息解析逻辑

## v0.0.12 (2023-07-09)

### koishi-plugin-adapter

- 优化了消息解析逻辑
- 修复了入群提醒判断不正确的问题

## v0.0.11 (2023-07-09)

### koishi-plugin-adapter

- 优化了消息解析逻辑
- 修复了 `jpeg` 图片无法正常发送的问题

## v0.0.10 (2023-07-09)

### koishi-plugin-adapter

- 重构了消息解析逻辑

## v0.0.9 (2023-07-09)

### koishi-plugin-adapter

- 支持新成员入群事件
- 修复图片发送逻辑

### koishi-plugin-launcher

- 修复 launcher 插件导致 QQ 无限转圈的问题

## v0.0.8 (2023-07-08)

### koishi-plugin-adapter

- 接收到的 at 元素添加 name 属性

### koishi-plugin-launcher

- 修复了 launcher 无法检测 QQ 是否正在运行的问题

## v0.0.7 (2023-07-07)

### koishi-plugin-adapter

- 适配最新版 Koishi Desktop
- 实现发送 at 消息
- 推荐使用 `OneBotCL` API
- 修复了 v0.0.5 版本无法使用的问题

### koishi-plugin-launcher

- 优化了启动逻辑

## v0.0.6 (2023-07-06)

### koishi-plugin-adapter

- 修复了 v0.0.5 版本无法使用的问题

## v0.0.5 (2023-07-04)

### koishi-plugin-adapter

- 实现接收 at 消息
- 实现发送 base64 图片

## v0.0.4 (2023-07-03)

### koishi-plugin-launcher

- 实装 launcher

## v0.0.3 (2023-07-02)

### koishi-plugin-adapter

- 修复了一些小的问题并提升了稳定性

## v0.0.2 (2023-07-02)

### koishi-plugin-adapter

- 修复了一些小的问题并提升了稳定性

## v0.0.1 (2023-07-01)

### koishi-plugin-adapter

- 首个版本
