import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'notifications'), 
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notificationsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toISOString(),
        }));
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
