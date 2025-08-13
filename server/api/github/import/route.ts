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
    const repo = searchParams.get('repo');
    const branch = searchParams.get('branch') || 'main';
    
    if (!repo) {
      return createErrorResponse('Repository parameter is required', 400);
    }
    
    // Parse owner and repo name from full_name (e.g., "owner/repo")
    const [owner, repoName] = repo.split('/');
    if (!owner || !repoName) {
      return createErrorResponse('Invalid repository format. Expected: owner/repo', 400);
    }
    
    const githubClient = new GitHubClient(session.user.githubAccessToken);
    
    // Get file tree
    const fileTree = await githubClient.getFileTree(owner, repoName, branch);
    
    // Get content of main files (limit to first 10 files to avoid overwhelming)
    const mainFiles = fileTree
      .filter(file => file.type === 'file' && !file.path.includes('node_modules') && !file.path.includes('.git'))
      .slice(0, 10);
    
    const filesWithContent = await Promise.all(
      mainFiles.map(async (file) => {
        try {
          const content = await githubClient.getFileContent(owner, repoName, file.path, branch);
          return {
            name: file.name,
            content: content,
            language: getLanguageFromFileName(file.name),
            isDirty: false,
          };
        } catch (error) {
          return {
            name: file.name,
            content: `// Error loading ${file.name}\n// ${error}`,
            language: getLanguageFromFileName(file.name),
            isDirty: false,
          };
        }
      })
    );
    
    return createSuccessResponse({
      fileTree: fileTree,
      files: filesWithContent,
      repository: {
        owner,
        name: repoName,
        branch,
        fullName: repo
      }
    });
  } catch (error) {
    return createErrorResponse(`Failed to import repository: ${error}`, 500);
  }
}

function getLanguageFromFileName(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'jsx': 'javascript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
    'scala': 'scala',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'md': 'markdown',
    'txt': 'text',
  };
  
  return languageMap[extension || ''] || 'text';
}
