import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sip_jwt_secret_token_2026_key';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: 'student' | 'recruiter' | 'admin';
  };
}

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Authorization: Bearer <TOKEN>

    // Sandbox Mock Tokens Support
    if (token.startsWith('mock_token_')) {
      const role = token.replace('mock_token_', '') as 'student' | 'recruiter' | 'admin';
      req.user = {
        userId: `mock_${role}_id`,
        email: `${role}@example.com`,
        role: role
      };
      return next();
    }

    jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired session token.' });
      }
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
      next();
    });
  } else {
    res.status(401).json({ error: 'Access denied. No session token provided.' });
  }
};

export const authorizeRoles = (roles: ('student' | 'recruiter' | 'admin')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User is not authenticated.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};
