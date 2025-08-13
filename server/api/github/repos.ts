import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { GitHubClient } from '../../utils/githubClient';
import { createSuccessResponse, createErrorResponse, createUnauthorizedResponse } from '../../utils/response';
import { ExtendedUser } from '../../types';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.githubAccessToken) {
      return createUnauthorizedResponse('GitHub access required');
    }
    
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    const user = session.user as ExtendedUser;
    const githubClient = new GitHubClient(user.githubAccessToken!);
    const repos = await githubClient.getUserRepositories(username || undefined);
    
    return createSuccessResponse(repos);
  } catch (error) {
    return createErrorResponse(`Failed to fetch repositories: ${error}`, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.githubAccessToken) {
      return createUnauthorizedResponse('GitHub access required');
    }
    
    const body = await request.json();
    const { name, description, isPrivate = false } = body;
    
    if (!name) {
      return createErrorResponse('Repository name is required', 400);
    }
    
    return createSuccessResponse({ message: 'Repository creation not implemented yet' });
  } catch (error) {
    return createErrorResponse(`Failed to create repository: ${error}`, 500);
  }
}

export async function GET_REPO(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.githubAccessToken) {
      return createUnauthorizedResponse('GitHub access required');
    }
    
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    
    if (!owner || !repo) {
      return createErrorResponse('Owner and repo parameters are required', 400);
    }
    
    const user = session.user as ExtendedUser;
    const githubClient = new GitHubClient(user.githubAccessToken!);
    const repository = await githubClient.getRepository(owner, repo);
    
    return createSuccessResponse(repository);
  } catch (error) {
    return createErrorResponse(`Failed to fetch repository: ${error}`, 500);
  }
}

export async function GET_BRANCHES(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.githubAccessToken) {
      return createUnauthorizedResponse('GitHub access required');
    }
    
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    
    if (!owner || !repo) {
      return createErrorResponse('Owner and repo parameters are required', 400);
    }
    
    const user = session.user as ExtendedUser;
    const githubClient = new GitHubClient(user.githubAccessToken!);
    const branches = await githubClient.getRepositoryBranches(owner, repo);
    
    return createSuccessResponse(branches);
  } catch (error) {
    return createErrorResponse(`Failed to fetch branches: ${error}`, 500);
  }
}

export async function GET_ACCESS(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.githubAccessToken) {
      return createUnauthorizedResponse('GitHub access required');
    }
    
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    
    if (!owner || !repo) {
      return createErrorResponse('Owner and repo parameters are required', 400);
    }
    
    const user = session.user as ExtendedUser;
    const githubClient = new GitHubClient(user.githubAccessToken!);
    const access = await githubClient.checkRepositoryAccess(owner, repo);
    
    return createSuccessResponse(access);
  } catch (error) {
    return createErrorResponse(`Failed to check repository access: ${error}`, 500);
  }
}
