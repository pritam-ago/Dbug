import { Request, Response } from 'express';
import { connectToDatabase } from '../../db/connect';
import { Project } from '../../db/models/Project';
import User from '../../db/models/User';

export async function POST(req: Request, res: Response) {
  try {
    const userId = req.body.userId || req.headers['user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'User ID is required' });
    }

    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { code } = req.body || {};
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Join code is required' });
    }

    const normalized = code.trim().toUpperCase();
    const project = await Project.findOne({ joinCode: normalized });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const userIdStr = user._id.toString();
    if (!project.isOwner(userIdStr) && !project.isCollaborator(userIdStr)) {
      const added = project.addCollaborator(userIdStr);
      if (!added) {
        return res.status(400).json({ error: 'Project is full' });
      }
      await project.save();
    }

    return res.status(200).json({
      success: true,
      data: project,
      message: 'Joined project successfully'
    });
  } catch (error) {
    return res.status(500).json({ error: `Failed to join project: ${error}` });
  }
}


