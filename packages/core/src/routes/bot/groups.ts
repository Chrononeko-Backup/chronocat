import { groupMap } from '../../ipc/globalVars'
import { router } from '../../router'

router.bot.groups(async () => Object.values(groupMap))
