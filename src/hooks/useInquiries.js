import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';

export const useAllInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'inquiries'), orderBy('requestedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const inquiriesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          requestedAt: doc.data().requestedAt?.toDate().toISOString(), // Convert Timestamp to ISO string
          createdAt: doc.data().createdAt?.toDate().toISOString(), // Convert Timestamp to ISO string
          updatedAt: doc.data().updatedAt?.toDate().toISOString(), // Convert Timestamp to ISO string
        }));
        setInquiries(inquiriesData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching inquiries:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { inquiries, loading, error };
};
