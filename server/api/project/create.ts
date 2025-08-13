import { Request, Response } from 'express';
import { connectToDatabase } from '../../db/connect';
import { Project } from '../../db/models/Project';
import User from '../../db/models/User';
import crypto from 'node:crypto';

function generateJoinCode(length: number = 6): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    code += alphabet[bytes[i] % alphabet.length];
  }
  return code;
}

export async function POST(req: Request, res: Response) {
  try {
    // For now, we'll use a simple user ID from headers or body
    // In production, you'd want proper authentication middleware
    const userId = req.body.userId || req.headers['user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID is required' });
    }
    
    await connectToDatabase();
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { name, description, isPublic = false, githubRepo, collaborators = [], settings = {} } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    
    const defaultSettings = {
      allowCollaboration: true,
      requireApproval: false,
      maxCollaborators: 10,
      ...settings,
    };
    
    let joinCode = generateJoinCode(6);
    for (let attempts = 0; attempts < 3; attempts++) {
      const existing = await Project.findOne({ joinCode });
      if (!existing) break;
      joinCode = generateJoinCode(6);
    }

    const projectData = {
      name,
      joinCode,
      description: description || '',
      owner: user._id,
      collaborators: [],
      githubRepo: githubRepo ? {
        owner: githubRepo.owner,
        name: githubRepo.name,
        branch: githubRepo.branch || 'main',
        fullName: `${githubRepo.owner}/${githubRepo.name}`,
      } : undefined,
      isPublic,
      settings: defaultSettings,
    };
    
    const project = new Project(projectData);
    
    if (collaborators.length > 0) {
      for (const collaboratorEmail of collaborators) {
        const collaborator = await User.findOne({ email: collaboratorEmail });
        if (collaborator) {
          project.addCollaborator(collaborator._id.toString());
        }
      }
    }
    
    await project.save();
    
    return res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully'
    });
  } catch (error) {
    return res.status(500).json({ error: `Failed to create project: ${error}` });
  }
}

export async function GET(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string || req.headers['user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID is required' });
    }
    
    await connectToDatabase();
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const type = req.query.type as string || 'all';
    
    let projects;
    
    switch (type) {
      case 'owned':
        projects = await Project.find({ owner: user._id }).sort({ createdAt: -1 });
        break;
      case 'collaborating':
        projects = await Project.find({ collaborators: user._id }).sort({ createdAt: -1 });
        break;
      case 'public':
        projects = await Project.find({ isPublic: true }).sort({ createdAt: -1 }).limit(20);
        break;
      default:
        projects = await Project.find({
          $or: [
            { owner: user._id },
            { collaborators: user._id },
            { isPublic: true }
          ]
        }).sort({ createdAt: -1 });
    }
    
    return res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    return res.status(500).json({ error: `Failed to fetch projects: ${error}` });
  }
}
