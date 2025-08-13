import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { GitHubClient } from '../../utils/githubClient';
import { createSuccessResponse, createErrorResponse, createUnauthorizedResponse } from '../../utils/response';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.githubAccessToken) {
      return createUnauthorizedResponse('GitHub access required');
    }
    
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    const branch = searchParams.get('branch') || 'main';
    const path = searchParams.get('path') || '';
    
    if (!owner || !repo) {
      return createErrorResponse('Owner and repo parameters are required', 400);
    }
    
    const githubClient = new GitHubClient(session.user.githubAccessToken);
    const files = await githubClient.getFileTree(owner, repo, branch, path);
    
    return createSuccessResponse(files);
  } catch (error) {
    return createErrorResponse(`Failed to fetch file tree: ${error}`, 500);
  }
}

export async function GET_CONTENT(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.githubAccessToken) {
      return createUnauthorizedResponse('GitHub access required');
    }
    
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    const path = searchParams.get('path');
    const branch = searchParams.get('branch') || 'main';
    
    if (!owner || !repo || !path) {
      return createErrorResponse('Owner, repo, and path parameters are required', 400);
    }
    
    const githubClient = new GitHubClient(session.user.githubAccessToken);
    const content = await githubClient.getFileContent(owner, repo, path, branch);
    
    return createSuccessResponse({ content, path, branch });
  } catch (error) {
    return createErrorResponse(`Failed to fetch file content: ${error}`, 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.githubAccessToken) {
      return createUnauthorizedResponse('GitHub access required');
    }
    
    const body = await request.json();
    const { owner, repo, path, content, message, branch = 'main' } = body;
    
    if (!owner || !repo || !path || !content || !message) {
      return createErrorResponse('Owner, repo, path, content, and message are required', 400);
    }
    
    const githubClient = new GitHubClient(session.user.githubAccessToken);
    await githubClient.createOrUpdateFile(owner, repo, path, content, message, branch);
    
    return createSuccessResponse({ message: 'File updated successfully' });
  } catch (error) {
    return createErrorResponse(`Failed to update file: ${error}`, 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.githubAccessToken) {
      return createUnauthorizedResponse('GitHub access required');
    }
    
    const body = await request.json();
    const { owner, repo, path, message, branch = 'main' } = body;
    
    if (!owner || !repo || !path || !message) {
      return createErrorResponse('Owner, repo, path, and message are required', 400);
    }
    
    const githubClient = new GitHubClient(session.user.githubAccessToken);
    await githubClient.deleteFile(owner, repo, path, message, branch);
    
    return createSuccessResponse({ message: 'File deleted successfully' });
  } catch (error) {
    return createErrorResponse(`Failed to delete file: ${error}`, 500);
  }
}

export async function GET_HISTORY(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.githubAccessToken) {
      return createUnauthorizedResponse('GitHub access required');
    }
    
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    const path = searchParams.get('path');
    const branch = searchParams.get('branch') || 'main';
    
    if (!owner || !repo || !path) {
      return createErrorResponse('Owner, repo, and path parameters are required', 400);
    }
    
    const githubClient = new GitHubClient(session.user.githubAccessToken);
    const history = await githubClient.getCommitHistory(owner, repo, path, branch);
    
    return createSuccessResponse(history);
  } catch (error) {
    return createErrorResponse(`Failed to fetch commit history: ${error}`, 500);
  }
}

export async function POST_SEARCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.githubAccessToken) {
      return createUnauthorizedResponse('GitHub access required');
    }
    
    const body = await request.json();
    const { owner, repo, query, branch = 'main' } = body;
    
    if (!owner || !repo || !query) {
      return createErrorResponse('Owner, repo, and query are required', 400);
    }
    
    const githubClient = new GitHubClient(session.user.githubAccessToken);
    const results = await githubClient.searchFiles(owner, repo, query, branch);
    
    return createSuccessResponse(results);
  } catch (error) {
    return createErrorResponse(`Failed to search files: ${error}`, 500);
  }
}
