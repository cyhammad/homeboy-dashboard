import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Listen to notifications collection in real-time
    const q = query(
      collection(db, 'notifications'), 
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notificationsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          // Handle timestamp conversion - could be Firestore Timestamp, string, or ISO string
          let createdAt;
          if (data.createdAt) {
            createdAt = data.createdAt?.toDate 
              ? data.createdAt.toDate().toISOString() 
              : (typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString());
          } else {
            createdAt = new Date().toISOString();
          }
          
          return {
            id: doc.id,
            ...data,
            createdAt,
          };
        });
        
        setNotifications(notificationsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching notifications:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { notifications, loading, error };
};
