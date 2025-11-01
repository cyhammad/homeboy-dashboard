import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

// Get bucket name for GCS SDK operations
// GCS SDK uses the actual bucket name (e.g., homeboy-app-1705d.appspot.com)
const getBucketNameForSDK = () => {
  let bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET;
  if (!bucket) {
    throw new Error('Storage bucket not configured. Please set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
  }
  // Remove gs:// prefix if present
  if (bucket.startsWith('gs://')) {
    bucket = bucket.replace('gs://', '');
  }
  // Use the bucket name as-is for GCS SDK (e.g., homeboy-app-1705d.appspot.com)
  return bucket;
};

// Get bucket name for Firebase Storage API URL construction
// Firebase Storage API uses .firebasestorage.app format (e.g., homeboy-app-1705d.firebasestorage.app)
const getBucketNameForURL = () => {
  let bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET;
  if (!bucket) {
    throw new Error('Storage bucket not configured');
  }
  // Remove gs:// prefix if present
  if (bucket.startsWith('gs://')) {
    bucket = bucket.replace('gs://', '');
  }
  
  // Convert .appspot.com to .firebasestorage.app for Firebase Storage API URLs
  if (bucket.endsWith('.appspot.com')) {
    // Extract the base name (e.g., "homeboy-app-1705d" from "homeboy-app-1705d.appspot.com")
    const baseName = bucket.replace('.appspot.com', '');
    bucket = `${baseName}.firebasestorage.app`;
  } else if (!bucket.endsWith('.firebasestorage.app')) {
    // If it's not in either format, extract base name and use .firebasestorage.app
    const baseName = bucket.split('.')[0];
    bucket = `${baseName}.firebasestorage.app`;
  }
  
  return bucket;
};

const storageBucketForSDK = getBucketNameForSDK();
const storageBucketForURL = getBucketNameForURL();

export async function POST(request) {
  try {
    // Validate environment variables
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      throw new Error('Missing Firebase Admin credentials. Please check environment variables.');
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const userId = formData.get('userId') || 'admin';
    const timestamp = formData.get('timestamp') || Date.now().toString();

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create storage reference path matching phone app format
    const fileName = `Property Listings/${userId}/${timestamp}`;
    
    // Upload to Firebase Storage
    const storage = new Storage({
      projectId: process.env.FIREBASE_PROJECT_ID,
      credentials: {
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        project_id: process.env.FIREBASE_PROJECT_ID,
      },
    });
    
    // Try different bucket name formats
    let bucket, fileRef;
    const bucketVariants = [
      storageBucketForSDK, // e.g., homeboy-app-1705d.appspot.com
      storageBucketForSDK.split('.')[0], // e.g., homeboy-app-1705d (just the ID)
      storageBucketForURL, // e.g., homeboy-app-1705d.firebasestorage.app
    ];
    
    let lastError;
    let bucketFound = false;
    for (let i = 0; i < bucketVariants.length; i++) {
      const bucketName = bucketVariants[i];
      try {
        bucket = storage.bucket(bucketName);
        fileRef = bucket.file(fileName);
        // Test if bucket exists by checking if we can access it
        await bucket.getMetadata();
        bucketFound = true;
        break;
      } catch (err) {
        lastError = err;
        if (i === bucketVariants.length - 1) {
          // This was the last variant, throw the error
          throw new Error(`Failed to access bucket. Tried: ${bucketVariants.join(', ')}. Last error: ${lastError.message}`);
        }
      }
    }
    
    if (!bucketFound || !bucket || !fileRef) {
      throw new Error(`Could not find valid bucket. Tried: ${bucketVariants.join(', ')}`);
    }

    // Upload the file first
    await fileRef.save(buffer, {
      contentType: file.type || 'image/jpeg',
    });

    // Generate a download token matching Firebase Storage format (UUID)
    const downloadToken = uuidv4();

    // Set metadata with download token (Firebase Storage format)
    await fileRef.setMetadata({
      metadata: {
        firebaseStorageDownloadTokens: downloadToken,
      },
    });

    // Construct URL matching phone app format
    // Format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
    const encodedPath = encodeURIComponent(fileName);
    const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${storageBucketForURL}/o/${encodedPath}?alt=media&token=${downloadToken}`;

    return NextResponse.json({
      url: downloadURL,
      fileName,
    });

  } catch (error) {
    // Provide more detailed error information
    let errorDetails = error.message;
    if (error.code) {
      errorDetails += ` (Code: ${error.code})`;
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to upload image', 
        details: errorDetails,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      },
      { status: 500 }
    );
  }
}

