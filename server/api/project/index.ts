import { Router } from 'express'
import * as createProject from './create'
import * as joinProject from './join'

const router = Router()

// Convert Next.js API routes to Express routes
router.post('/create', createProject.POST)

router.get('/create', createProject.GET)

router.post('/join', joinProject.POST)

export default router
