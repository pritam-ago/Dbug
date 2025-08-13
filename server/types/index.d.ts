import { Document } from 'mongoose';

export interface User {
  id: string;
  email: string;
  name: string;
  githubId?: string;
  githubUsername?: string;
  githubAccessToken?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends Document {
  _id : mongoose.Types.ObjectId;
  email: string;
  name: string;
  githubId?: string;
  githubUsername?: string;
  githubAccessToken?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  getPublicProfile(): Partial<IUser>;
  hasGitHubAccess(): boolean;
}

export interface Project {
  id: string;
  name: string;
  joinCode: string;
  description: string;
  owner: string;
  collaborators: string[];
  githubRepo?: {
    owner: string;
    name: string;
    branch: string;
    fullName: string;
  };
  isPublic: boolean;
  settings: {
    allowCollaboration: boolean;
    requireApproval: boolean;
    maxCollaborators: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IProject extends Document {
  _id: any;
  name: string;
  joinCode: string;
  description: string;
  owner: any;
  collaborators: any[];
  githubRepo?: {
    owner: string;
    name: string;
    branch: string;
    fullName: string;
  };
  isPublic: boolean;
  settings: {
    allowCollaboration: boolean;
    requireApproval: boolean;
    maxCollaborators: number;
  };
  createdAt: Date;
  updatedAt: Date;
  isOwner(userId: string): boolean;
  isCollaborator(userId: string): boolean;
  canAccess(userId: string): boolean;
  addCollaborator(userId: string): boolean;
  removeCollaborator(userId: string): boolean;
}

export interface Session {
  id: string;
  projectId: string;
  participants: string[];
  activeUsers: {
    userId: string;
    username: string;
    cursor: {
      line: number;
      ch: number;
    };
    lastSeen: Date;
  }[];
  lastActivity: Date;
  createdAt: Date;
}

export interface ISession extends Document {
  _id: any;
  projectId: any;
  participants: any[];
  activeUsers: {
    userId: any;
    username: string;
    cursor: {
      line: number;
      ch: number;
    };
    lastSeen: Date;
  }[];
  lastActivity: Date;
  createdAt: Date;
  addParticipant(userId: string, username: string): boolean;
  removeParticipant(userId: string): boolean;
  updateUserCursor(userId: string, line: number, ch: number): boolean;
  recordEdit(userId: string): void;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  html_url: string;
  clone_url: string;
  default_branch: string;
  updated_at: string;
  permissions: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
}

export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
  url: string;
  html_url: string;
  git_url: string;
  download_url?: string;
}

export interface DebugRequest {
  code: string;
  language: string;
  errorMessage?: string;
  context?: string;
  preferences?: {
    style: 'concise' | 'detailed';
    focus: 'bug-fix' | 'optimization' | 'security' | 'all';
  };
}

export interface DebugResponse {
  originalCode: string;
  fixedCode: string;
  analysis: {
    issues: string[];
    suggestions: string[];
    complexity: number;
    maintainability: number;
  };
  explanation: string;
  confidence: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface WebSocketEvent {
  type: string;
  payload: any;
  timestamp: Date;
  userId: string;
}

export interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  githubAccessToken?: string;
}

export interface NextAuthSession {
  user?: ExtendedUser;
}

export interface NextAuthUser {
  id?: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  role?: string;
  githubId?: string;
  githubUsername?: string;
  githubAccessToken?: string;
}

export interface NextAuthJWT {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  role?: string;
  githubId?: string;
  githubUsername?: string;
  githubAccessToken?: string;
}

export interface NextAuthAccount {
  provider: string;
  type: string;
  access_token?: string;
  refresh_token?: string;
}

export interface NextAuthProfile {
  id: string;
  login: string;
  name?: string;
  avatar_url?: string;
}

export interface EnvironmentVariables {
  MONGODB_URI: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GOOGLE_GENERATIVE_AI_API_KEY: string;
  OPENAI_API_KEY: string;
  JWT_SECRET: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CollaborationEvent extends WebSocketEvent {
  type: 'cursor_move' | 'code_change' | 'user_join' | 'user_leave' | 'file_open' | 'file_close';
  projectId: string;
}

export interface CursorPosition {
  line: number;
  ch: number;
}

export interface ActiveUser {
  userId: string;
  username: string;
  cursor?: CursorPosition;
  lastSeen: Date;
}

export interface CodeChange {
  filePath: string;
  changes: any;
}

export interface ProjectCreateRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
  githubRepo?: {
    owner: string;
    name: string;
    branch?: string;
  };
  collaborators?: string[];
  settings?: {
    allowCollaboration?: boolean;
    requireApproval?: boolean;
    maxCollaborators?: number;
  };
}

export interface ProjectSettings {
  allowCollaboration: boolean;
  requireApproval: boolean;
  maxCollaborators: number;
}

export interface GitHubRepository {
  owner: string;
  name: string;
  branch: string;
  fullName: string;
}

export interface ProjectStats {
  totalConnections: number;
  activeProjects: number;
  projectStats: Array<{
    projectId: string;
    activeUsers: number;
  }>;
}

export interface AIConfig {
  gemini?: {
    apiKey: string;
    model: string;
  };
  openai?: {
    apiKey: string;
    model: string;
  };
}

export interface AIPrompt {
  code: string;
  language: string;
  context?: string;
  preferences?: {
    style: 'concise' | 'detailed';
    focus: 'bug-fix' | 'optimization' | 'security' | 'all';
  };
}

export interface AISuggestion {
  suggestion: string;
  explanation?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface CodeAnalysis {
  complexity: number;
  maintainability: number;
  issues: string[];
  suggestions: string[];
}

export interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
}

export interface CorsOptions {
  origin?: string | string[];
  credentials?: boolean;
  methods?: string[];
  allowedHeaders?: string[];
}

export interface SecurityHeadersOptions {
  contentSecurityPolicy?: {
    directives: {
      defaultSrc: string[];
      styleSrc: string[];
      scriptSrc: string[];
      imgSrc: string[];
    };
  };
  hsts?: {
    maxAge: number;
    includeSubDomains: boolean;
    preload: boolean;
  };
}

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      githubId?: string;
      githubUsername?: string;
      githubAccessToken?: string;
    }
  }
  
  interface JWT {
    githubId?: string;
    githubUsername?: string;
    githubAccessToken?: string;
  }
}
