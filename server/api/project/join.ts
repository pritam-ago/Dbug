import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '../../db/connect';
import { Project } from '../../db/models/Project';
import { User } from '../../db/models/User';
import { createSuccessResponse, createErrorResponse, createUnauthorizedResponse, createNotFoundResponse } from '../../utils/response';

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
    const { code } = body || {};
    if (!code || typeof code !== 'string') {
      return createErrorResponse('Join code is required', 400);
    }

    const normalized = code.trim().toUpperCase();
    const project = await Project.findOne({ joinCode: normalized });
    if (!project) {
      return createNotFoundResponse('Project');
    }

    const userId = user._id.toString();
    if (!project.isOwner(userId) && !project.isCollaborator(userId)) {
      const added = project.addCollaborator(userId);
      if (!added) {
        return createErrorResponse('Project is full', 400);
      }
      await project.save();
    }

    return createSuccessResponse(project, 'Joined project successfully');
  } catch (error) {
    return createErrorResponse(`Failed to join project: ${error}`, 500);
  }
}


