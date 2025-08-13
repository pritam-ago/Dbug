import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '../../../db/connect';
import { Project } from '../../../db/models/Project';
import { User } from '../../../db/models/User';
import { createSuccessResponse, createErrorResponse, createUnauthorizedResponse, createNotFoundResponse, createForbiddenResponse } from '../../../utils/response';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const projectId = params.id;
    const project = await Project.findById(projectId);
    
    if (!project) {
      return createNotFoundResponse('Project');
    }

    const userId = user._id.toString();

    // Check if user is the owner
    if (project.isOwner(userId)) {
      return createForbiddenResponse('Project owners cannot leave. Transfer ownership or delete the project instead.');
    }

    // Check if user is a collaborator
    if (!project.isCollaborator(userId)) {
      return createForbiddenResponse('You are not a collaborator on this project');
    }

    // Remove user from collaborators
    const removed = project.removeCollaborator(userId);
    if (!removed) {
      return createErrorResponse('Failed to remove user from project', 500);
    }

    await project.save();

    return createSuccessResponse(
      { projectId, message: 'Successfully left the project' },
      'Successfully left the project'
    );
  } catch (error) {
    return createErrorResponse(`Failed to leave project: ${error}`, 500);
  }
}
