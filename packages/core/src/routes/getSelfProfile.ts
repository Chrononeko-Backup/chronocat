import { selfProfile } from '../ipc/globalVars'
import { router } from '../router'

router.getSelfProfile(async () => selfProfile.value ?? {})
