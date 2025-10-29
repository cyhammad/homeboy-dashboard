import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';

// Cache for user data to avoid repeated fetches
const userCache = new Map();

export const useUserData = (userId) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setUserData(null);
      setLoading(false);
      return;
    }

    // Check cache first
    if (userCache.has(userId)) {
      setUserData(userCache.get(userId));
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();

          console.log(data);
          const user = {
            id: userDoc.id,
            name: data.name || data.displayName || '',
            imageUrl: data.imageUrl || data.photoURL || '',
            email: data.email || '',
          };
          
          // Cache the user data
          userCache.set(userId, user);
          setUserData(user);
        } else {
          // User not found in Firestore
          setUserData(null);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  return { userData, loading, error };
};

// Helper function to get user initials from name
export const getUserInitials = (name) => {
  if (!name) return 'N';
  const words = name.trim().split(' ');
  if (words.length === 0) return 'N';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

