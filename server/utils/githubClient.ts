import { Octokit } from '@octokit/rest';
import { GitHubRepo, GitHubFile } from '../types';

export class GitHubClient {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    });
  }

  async getUserRepositories(username?: string): Promise<GitHubRepo[]> {
    try {
      const { data } = await this.octokit.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100,
      });
      return data.map(this.mapRepoData);
    } catch (error) {
      throw new Error(`Failed to fetch repositories: ${error}`);
    }
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepo> {
    try {
      const { data } = await this.octokit.repos.get({ owner, repo });
      return this.mapRepoData(data);
    } catch (error) {
      throw new Error(`Failed to fetch repository: ${error}`);
    }
  }

  async getRepositoryBranches(owner: string, repo: string): Promise<string[]> {
    try {
      const { data } = await this.octokit.repos.listBranches({ owner, repo });
      return data.map((branch: any) => branch.name);
    } catch (error) {
      throw new Error(`Failed to fetch branches: ${error}`);
    }
  }

  async getFileTree(owner: string, repo: string, branch: string = 'main', path: string = ''): Promise<GitHubFile[]> {
    try {
      const { data } = await this.octokit.git.getTree({
        owner,
        repo,
        tree_sha: branch,
        recursive: 'true',
      });

      if (!data.tree) return [];

      return data.tree
        .filter((item: any) => item.type === 'blob' || item.type === 'tree')
        .map((item: any) => ({
          name: item.path || '',
          path: item.path || '',
          sha: item.sha || '',
          size: item.size || 0,
          type: item.type as 'file' | 'dir',
          url: item.url || '',
          html_url: '',
          git_url: item.url || '',
          download_url: item.type === 'blob' ? item.url : undefined,
        }));
    } catch (error) {
      throw new Error(`Failed to fetch file tree: ${error}`);
    }
  }

  async getFileContent(owner: string, repo: string, path: string, branch: string = 'main'): Promise<string> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
        ref: branch,
      });

      if (Array.isArray(data)) {
        throw new Error('Path is a directory, not a file');
      }

      if (data.type !== 'file') {
        throw new Error('Path is not a file');
      }

      if (data.encoding === 'base64' && data.content) {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }

      return data.content || '';
    } catch (error) {
      throw new Error(`Failed to fetch file content: ${error}`);
    }
  }

  async createOrUpdateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    branch: string = 'main'
  ): Promise<void> {
    try {
      let currentSha: string | undefined;

      try {
        const { data } = await this.octokit.repos.getContent({
          owner,
          repo,
          path,
          ref: branch,
        });

        if (!Array.isArray(data) && data.type === 'file') {
          currentSha = data.sha;
        }
      } catch (error) {
        currentSha = undefined;
      }

      await this.octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: Buffer.from(content).toString('base64'),
        branch,
        sha: currentSha,
      });
    } catch (error) {
      throw new Error(`Failed to create/update file: ${error}`);
    }
  }

  async deleteFile(owner: string, repo: string, path: string, message: string, branch: string = 'main'): Promise<void> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
        ref: branch,
      });

      if (Array.isArray(data)) {
        throw new Error('Path is a directory, not a file');
      }

      await this.octokit.repos.deleteFile({
        owner,
        repo,
        path,
        message,
        sha: data.sha,
        branch,
      });
    } catch (error) {
      throw new Error(`Failed to delete file: ${error}`);
    }
  }

  async getCommitHistory(owner: string, repo: string, path: string, branch: string = 'main'): Promise<any[]> {
    try {
      const { data } = await this.octokit.repos.listCommits({
        owner,
        repo,
        path,
        sha: branch,
        per_page: 20,
      });
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch commit history: ${error}`);
    }
  }

  async searchFiles(owner: string, repo: string, query: string, branch: string = 'main'): Promise<GitHubFile[]> {
    try {
      const { data } = await this.octokit.search.code({
        q: `repo:${owner}/${repo} ${query}`,
      });

      return data.items.map((item: any) => ({
        name: item.name || '',
        path: item.path || '',
        sha: item.sha || '',
        size: 0,
        type: 'file',
        url: item.url || '',
        html_url: item.html_url || '',
        git_url: item.git_url || '',
        download_url: item.download_url || undefined,
      }));
    } catch (error) {
      throw new Error(`Failed to search files: ${error}`);
    }
  }

  async checkRepositoryAccess(owner: string, repo: string): Promise<{ canPush: boolean; canPull: boolean }> {
    try {
      const { data } = await this.octokit.repos.get({ owner, repo });
      return {
        canPush: data.permissions?.push || false,
        canPull: data.permissions?.pull || false,
      };
    } catch (error) {
      throw new Error(`Failed to check repository access: ${error}`);
    }
  }

  private mapRepoData(repo: any): GitHubRepo {
    return {
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description || '',
      private: repo.private,
      html_url: repo.html_url,
      clone_url: repo.clone_url,
      default_branch: repo.default_branch,
      updated_at: repo.updated_at,
      permissions: {
        admin: repo.permissions?.admin || false,
        push: repo.permissions?.push || false,
        pull: repo.permissions?.pull || false,
      },
    };
  }
}
