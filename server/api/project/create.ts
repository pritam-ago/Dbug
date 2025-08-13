import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '../../db/connect';
import { Project } from '../../db/models/Project';
import { User } from '../../db/models/User';
import { createSuccessResponse, createErrorResponse, createUnauthorizedResponse } from '../../utils/response';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return createUnauthorizedResponse('Authentication required');
    }
    
    await connectToDatabase();
    
    const user = await User.findOne({ email: session.user?.email });
    if (!user) {
      return createUnauthorizedResponse('User not found');
    }
    
    const body = await request.json();
    const { name, description, isPublic = false, githubRepo, collaborators = [], settings = {} } = body;
    
    if (!name) {
      return createErrorResponse('Project name is required', 400);
    }
    
    const defaultSettings = {
      allowCollaboration: true,
      requireApproval: false,
      maxCollaborators: 10,
      ...settings,
    };
    
    const projectData = {
      name,
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
        if (collaborator && project.addCollaborator(collaborator._id.toString())) {
          project.collaborators.push(collaborator._id);
        }
      }
    }
    
    await project.save();
    
    return createSuccessResponse(project, 'Project created successfully');
  } catch (error) {
    return createErrorResponse(`Failed to create project: ${error}`, 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return createUnauthorizedResponse('Authentication required');
    }
    
    await connectToDatabase();
    
    const user = await User.findOne({ email: session.user?.email });
    if (!user) {
      return createUnauthorizedResponse('User not found');
    }
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    
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
    
    return createSuccessResponse(projects);
  } catch (error) {
    return createErrorResponse(`Failed to fetch projects: ${error}`, 500);
  }
}
