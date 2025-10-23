import { adminAuth, adminDb } from './firebase-admin';

/**
 * Verify Firebase ID token
 * @param {string} idToken - The Firebase ID token
 * @returns {Promise<Object>} Decoded token data
 */
export async function verifyIdToken(idToken) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error(`Invalid token: ${error.message}`);
  }
}

/**
 * Get user by UID
 * @param {string} uid - User UID
 * @returns {Promise<Object>} User record
 */
export async function getUserByUid(uid) {
  try {
    const userRecord = await adminAuth.getUser(uid);
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      emailVerified: userRecord.emailVerified,
      disabled: userRecord.disabled,
      metadata: userRecord.metadata,
      customClaims: userRecord.customClaims,
    };
  } catch (error) {
    throw new Error(`User not found: ${error.message}`);
  }
}

/**
 * Update user custom claims
 * @param {string} uid - User UID
 * @param {Object} claims - Custom claims to set
 */
export async function setUserClaims(uid, claims) {
  try {
    await adminAuth.setCustomUserClaims(uid, claims);
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to set claims: ${error.message}`);
  }
}

/**
 * Get document from Firestore
 * @param {string} collection - Collection name
 * @param {string} docId - Document ID
 * @returns {Promise<Object>} Document data
 */
export async function getDocument(collection, docId) {
  try {
    const doc = await adminDb.collection(collection).doc(docId).get();
    if (!doc.exists) {
      throw new Error('Document not found');
    }
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    throw new Error(`Failed to get document: ${error.message}`);
  }
}

/**
 * Add document to Firestore
 * @param {string} collection - Collection name
 * @param {Object} data - Document data
 * @returns {Promise<string>} Document ID
 */
export async function addDocument(collection, data) {
  try {
    const docRef = await adminDb.collection(collection).add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    throw new Error(`Failed to add document: ${error.message}`);
  }
}

/**
 * Update document in Firestore
 * @param {string} collection - Collection name
 * @param {string} docId - Document ID
 * @param {Object} data - Update data
 * @param {boolean} merge - Whether to merge with existing data
 */
export async function updateDocument(collection, docId, data, merge = true) {
  try {
    const docRef = adminDb.collection(collection).doc(docId);
    await docRef.set({
      ...data,
      updatedAt: new Date(),
    }, { merge });
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to update document: ${error.message}`);
  }
}

/**
 * Delete document from Firestore
 * @param {string} collection - Collection name
 * @param {string} docId - Document ID
 */
export async function deleteDocument(collection, docId) {
  try {
    await adminDb.collection(collection).doc(docId).delete();
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to delete document: ${error.message}`);
  }
}

/**
 * Query documents from Firestore
 * @param {string} collection - Collection name
 * @param {Array} whereClauses - Array of where clauses
 * @param {string} orderBy - Field to order by
 * @param {string} orderDirection - 'asc' or 'desc'
 * @param {number} limit - Maximum number of documents
 * @returns {Promise<Array>} Array of documents
 */
export async function queryDocuments(collection, whereClauses = [], orderBy = null, orderDirection = 'asc', limit = null) {
  try {
    let query = adminDb.collection(collection);
    
    // Apply where clauses
    whereClauses.forEach(clause => {
      query = query.where(clause.field, clause.operator, clause.value);
    });
    
    // Apply ordering
    if (orderBy) {
      query = query.orderBy(orderBy, orderDirection);
    }
    
    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(`Failed to query documents: ${error.message}`);
  }
}
