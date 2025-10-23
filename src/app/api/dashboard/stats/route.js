import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get('collection') || 'users';

    // Get collection stats
    const collectionRef = adminDb.collection(collection);
    const snapshot = await collectionRef.get();
    
    // Get some basic stats
    const totalDocs = snapshot.size;
    const docs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Example: Get user statistics
    let userStats = {};
    if (collection === 'users') {
      const activeUsers = docs.filter(doc => !doc.disabled);
      const verifiedUsers = docs.filter(doc => doc.emailVerified);
      
      userStats = {
        totalUsers: totalDocs,
        activeUsers: activeUsers.length,
        verifiedUsers: verifiedUsers.length,
        disabledUsers: totalDocs - activeUsers.length,
      };
    }

    return NextResponse.json({
      collection,
      totalDocuments: totalDocs,
      documents: docs,
      stats: userStats,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/dashboard/stats - Create or update dashboard data
export async function POST(request) {
  try {
    const body = await request.json();
    const { collection, documentId, data } = body;

    if (!collection || !data) {
      return NextResponse.json(
        { error: 'Collection and data are required' },
        { status: 400 }
      );
    }

    let docRef;
    if (documentId) {
      // Update existing document
      docRef = adminDb.collection(collection).doc(documentId);
      await docRef.set(data, { merge: true });
    } else {
      // Create new document
      docRef = await adminDb.collection(collection).add({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      id: docRef.id,
      collection,
      data,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error updating dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to update dashboard data', details: error.message },
      { status: 500 }
    );
  }
}
