// ============================================================
// CreatorAI Studio — Authentication Middleware
// ============================================================
// Verifies Firebase ID tokens on every authenticated request.
// Attaches the decoded user to the request object.
// ============================================================

import type { Request, Response, NextFunction } from 'express';
import { getAuth } from '../config/firebase';
import { AuthenticationError } from '@creatorai/shared';

/**
 * Augment Express Request with authenticated user data.
 */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      userToken?: {
        uid: string;
        email?: string;
        name?: string;
        picture?: string;
      };
    }
  }
}

/**
 * Authentication middleware — verifies Firebase ID token.
 *
 * Expects: `Authorization: Bearer <firebase-id-token>`
 *
 * On success: Attaches userId, userEmail, and userToken to req.
 * On failure: Returns 401 Unauthorized.
 */
export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  // ── Development mode bypass ──
  // When DEVELOPMENT_MODE=true, skip Firebase auth verification.
  // This allows the chat UI to work locally without Firebase login.
  if (process.env.DEVELOPMENT_MODE === 'true' || process.env.NODE_ENV === 'development') {
    const authHeader = req.headers.authorization;

    // If a token is provided, try to verify it (best effort)
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const idToken = authHeader.split('Bearer ')[1];
        if (idToken) {
          const decodedToken = await getAuth().verifyIdToken(idToken);
          req.userId = decodedToken.uid;
          req.userEmail = decodedToken.email;
          req.userToken = { uid: decodedToken.uid, email: decodedToken.email, name: decodedToken.name, picture: decodedToken.picture };
          return next();
        }
      } catch {
        // Token verification failed — fall through to dev user
      }
    }

    // No token or invalid token in dev mode → use dev user
    req.userId = 'dev-user';
    req.userEmail = 'dev@creatorai.studio';
    req.userToken = { uid: 'dev-user', email: 'dev@creatorai.studio', name: 'Developer', picture: undefined };
    return next();
  }

  // ── Production mode — strict Firebase auth ──
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid Authorization header');
    }

    const idToken = authHeader.split('Bearer ')[1];
    if (!idToken) {
      throw new AuthenticationError('No token provided');
    }

    // Verify the token with Firebase
    const decodedToken = await getAuth().verifyIdToken(idToken);

    // Attach user info to request
    req.userId = decodedToken.uid;
    req.userEmail = decodedToken.email;
    req.userToken = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
    };

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      next(error);
    } else {
      next(new AuthenticationError('Invalid or expired token'));
    }
  }
}

/**
 * Optional auth middleware — doesn't fail if no token is provided.
 * Used for endpoints that work for both authenticated and anonymous users.
 */
export async function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    const idToken = authHeader.split('Bearer ')[1];
    if (idToken) {
      const decodedToken = await getAuth().verifyIdToken(idToken);
      req.userId = decodedToken.uid;
      req.userEmail = decodedToken.email;
    }
  } catch {
    // Silently ignore invalid tokens on optional auth routes
  }

  next();
}
