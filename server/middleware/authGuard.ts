import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import { ExtendedUser } from '../types';

export const createAuthGuard = (handler: Function) => {
  return async (req: NextRequest) => {
    try {
      const session = await getServerSession();
      
      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      return handler(req, session);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
};

export const requireRole = (requiredRole: string) => {
  return (handler: Function) => {
    return async (req: NextRequest) => {
      try {
        const session = await getServerSession();
        
        if (!session) {
          return NextResponse.json(
            { success: false, error: 'Authentication required' },
            { status: 401 }
          );
        }
        
        const user = session.user as ExtendedUser;
        if (user?.role !== requiredRole) {
          return NextResponse.json(
            { success: false, error: 'Insufficient permissions' },
            { status: 403 }
          );
        }
        
        return handler(req, session);
      } catch (error) {
        return NextResponse.json(
          { success: false, error: 'Authorization failed' },
          { status: 403 }
        );
      }
    };
  };
};

export const requireGitHubAccess = (handler: Function) => {
  return async (req: NextRequest) => {
    try {
      const session = await getServerSession();
      
      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      const user = session.user as ExtendedUser;
      if (!user?.githubAccessToken) {
        return NextResponse.json(
          { success: false, error: 'GitHub access required' },
          { status: 403 }
        );
      }
      
      return handler(req, session);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'GitHub access verification failed' },
        { status: 403 }
      );
    }
  };
};

export const createRateLimit = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
}) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Too many requests from this IP'
  } = options;
  
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

export const createCors = (options: cors.CorsOptions = {}) => {
  const defaultOptions: cors.CorsOptions = {
    origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  
  return cors({ ...defaultOptions, ...options });
};

export const createSecurityHeaders = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  });
};
