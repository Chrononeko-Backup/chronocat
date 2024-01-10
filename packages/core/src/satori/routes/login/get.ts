import { selfProfile } from '../../../ipc/globalVars'

export const loginGet = async () => ({
  id: selfProfile.value?.uin,
  avatar: `http://q.qlogo.cn/headimg_dl?dst_uin=${selfProfile.value?.uin}&spec=640`,
})
