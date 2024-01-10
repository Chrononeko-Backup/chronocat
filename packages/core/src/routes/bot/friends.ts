import { friendMap } from '../../ipc/globalVars'
import { router } from '../../router'

router.bot.friends(async () => Object.values(friendMap))
