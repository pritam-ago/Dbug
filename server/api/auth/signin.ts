import { NextApiRequest, NextApiResponse } from 'next'
import { User } from '../../db/models/User'
import { connectToDatabase } from '../../db/connect'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    await connectToDatabase()

    const { email, name, githubId, githubUsername, githubAccessToken } = req.body

    if (!email || !name || !githubId || !githubUsername) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    let user = await User.findOne({ email })

    if (user) {
      user.githubId = githubId
      user.githubUsername = githubUsername
      user.githubAccessToken = githubAccessToken
      await user.save()
    } else {
      user = await User.create({
        email,
        name,
        githubId,
        githubUsername,
        githubAccessToken,
      })
    }

    res.status(200).json({ 
      success: true, 
      user: user.getPublicProfile() 
    })
  } catch (error) {
    console.error('Signin error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
