import express, { Request, Response, NextFunction } from 'express';
import { GitHubClient } from '../../utils/githubClient';
import { createSuccessResponse, createErrorResponse, createUnauthorizedResponse } from '../../utils/expressResponse';

// Extend Request interface to include githubToken
interface AuthenticatedRequest extends Request {
  githubToken?: string;
}

const router = express.Router();

// Middleware to check GitHub access token
const requireGitHubAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(createUnauthorizedResponse('GitHub access token required'));
  }
  
  const token = authHeader.substring(7);
  req.githubToken = token;
  next();
};

// GET /api/github/repos - Get user repositories
router.get('/repos', requireGitHubAccess, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const githubClient = new GitHubClient(req.githubToken!);
    const repos = await githubClient.getUserRepositories();
    
    return res.json(createSuccessResponse(repos));
  } catch (error) {
    return res.status(500).json(createErrorResponse(`Failed to fetch repositories: ${error}`, 500));
  }
});

// GET /api/github/import - Import repository
router.get('/import', requireGitHubAccess, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { repo, branch = 'main' } = req.query;
    
    if (!repo) {
      return res.status(400).json(createErrorResponse('Repository parameter is required', 400));
    }
    
    // Parse owner and repo name from full_name (e.g., "owner/repo")
    const [owner, repoName] = (repo as string).split('/');
    if (!owner || !repoName) {
      return res.status(400).json(createErrorResponse('Invalid repository format. Expected: owner/repo', 400));
    }
    
    const githubClient = new GitHubClient(req.githubToken!);
    
    // Get file tree
    const fileTree = await githubClient.getFileTree(owner, repoName, branch as string);
    
    // Get content of main files (limit to first 10 files to avoid overwhelming)
    const mainFiles = fileTree
      .filter((file: any) => file.type === 'file' && !file.path.includes('node_modules') && !file.path.includes('.git'))
      .slice(0, 10);
    
    const filesWithContent = await Promise.all(
      mainFiles.map(async (file: any) => {
        try {
          const content = await githubClient.getFileContent(owner, repoName, file.path, branch as string);
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
    
    return res.json(createSuccessResponse({
      fileTree: fileTree,
      files: filesWithContent,
      repository: {
        owner,
        name: repoName,
        branch,
        fullName: repo
      }
    }));
  } catch (error) {
    return res.status(500).json(createErrorResponse(`Failed to import repository: ${error}`, 500));
  }
});

// GET /api/github/files - Get file tree
router.get('/files', requireGitHubAccess, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { owner, repo, branch = 'main', path = '' } = req.query;
    
    if (!owner || !repo) {
      return res.status(400).json(createErrorResponse('Owner and repo parameters are required', 400));
    }
    
    const githubClient = new GitHubClient(req.githubToken!);
    const files = await githubClient.getFileTree(owner as string, repo as string, branch as string, path as string);
    
    return res.json(createSuccessResponse(files));
  } catch (error) {
    return res.status(500).json(createErrorResponse(`Failed to fetch file tree: ${error}`, 500));
  }
});

// GET /api/github/files/content - Get file content
router.get('/files/content', requireGitHubAccess, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { owner, repo, path, branch = 'main' } = req.query;
    
    if (!owner || !repo || !path) {
      return res.status(400).json(createErrorResponse('Owner, repo, and path parameters are required', 400));
    }
    
    const githubClient = new GitHubClient(req.githubToken!);
    const content = await githubClient.getFileContent(owner as string, repo as string, path as string, branch as string);
    
    return res.json(createSuccessResponse({ content, path, branch }));
  } catch (error) {
    return res.status(500).json(createErrorResponse(`Failed to fetch file content: ${error}`, 500));
  }
});

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

export default router;
