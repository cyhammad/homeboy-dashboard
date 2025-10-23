import { NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/firebaseAdmin";

/**
 * Middleware to verify Firebase ID token using Firebase Admin Auth
 */
export async function verifyFirebaseToken(request) {
  try {
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("auth-token")?.value;
    
    const token = authHeader?.replace("Bearer ", "") || cookieToken;

    if (!token) {
      return {
        success: false,
        response: NextResponse.json(
          { error: "No authentication token provided" },
          { status: 401 }
        )
      };
    }

    // Verify token using Firebase Admin Auth
    const result = await verifyIdToken(token);

    if (!result.success) {
      return {
        success: false,
        response: NextResponse.json(
          { error: "Invalid authentication token" },
          { status: 401 }
        )
      };
    }

    return {
      success: true,
      decodedToken: result.decodedToken
    };

  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    return {
      success: false,
      response: NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      )
    };
  }
}

/**
 * Middleware to verify admin role using Firebase Admin Auth
 */
export async function verifyAdminRole(request) {
  try {
    const authResult = await verifyFirebaseToken(request);
    
    if (!authResult.success) {
      return authResult;
    }

    const { decodedToken } = authResult;
    
    // Check if user has admin role
    const isAdmin = decodedToken.role === 'admin' || decodedToken.uid === 'admin';
    
    if (!isAdmin) {
      return {
        success: false,
        response: NextResponse.json(
          { error: "Admin access required" },
          { status: 403 }
        )
      };
    }

    return {
      success: true,
      decodedToken
    };

  } catch (error) {
    console.error("Error verifying admin role:", error);
    return {
      success: false,
      response: NextResponse.json(
        { error: "Admin verification failed" },
        { status: 403 }
      )
    };
  }
}
