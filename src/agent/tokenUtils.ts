import jwt from "jsonwebtoken";

const TOKEN_EXPIRY_HOURS = 24;

export interface UploadTokenPayload {
  jobId: string;
  iat: number; // issued at
  exp: number; // expires at
}

export interface TokenValidationResult {
  valid: boolean;
  jobId?: string;
  error?: string;
}

const secret = process.env.JWT_SECRET!;

/**
 * Generate a JWT token for upload access
 */
export function generateUploadToken(jobId: string): string {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + TOKEN_EXPIRY_HOURS * 60 * 60;

  const payload: UploadTokenPayload = {
    jobId,
    iat: now,
    exp: expiresAt,
  };

  return jwt.sign(payload, secret, {
    algorithm: "HS256",
  });
}

/**
 * Validate a JWT token and return the associated job ID if valid
 */
export function validateUploadToken(token: string): TokenValidationResult {
  try {
    // Verify and decode the JWT
    const payload = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    }) as UploadTokenPayload;

    return { valid: true, jobId: payload.jobId };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: "Token expired" };
    } else if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, error: "Invalid token" };
    } else {
      return { valid: false, error: "Token validation failed" };
    }
  }
}
