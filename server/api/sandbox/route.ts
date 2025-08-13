import { Router } from 'express'
import { executeCode } from './execute.js'

const router = Router()

router.post('/execute', executeCode)

export default router
