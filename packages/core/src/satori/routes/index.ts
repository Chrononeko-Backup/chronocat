import { guildMemberList } from './guild/member/list'
import { loginGet } from './login/get'
import { messageCreate } from './message/create'
import type { Route } from './types'
import { userChannelCreate } from './user/channel/create'

const routesIntl = {
  'guild.member.list': guildMemberList,
  'login.get': loginGet,
  'message.create': messageCreate,
  'user.channel.create': userChannelCreate,
} as const

export type Routes = keyof typeof routesIntl

export const routes: Record<Routes, Route> = routesIntl
