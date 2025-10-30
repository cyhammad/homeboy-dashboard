import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';

export const useListings = (status = null) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let q;
    
    if (status) {
      // Filter by status if provided
      q = query(
        collection(db, 'listings'),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
    } else {
      // Get all listings
      q = query(
        collection(db, 'listings'),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const listingsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
        }));
        setListings(listingsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching listings:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [status]);

  return { listings, loading, error };
};

export const useListing = (listingId) => {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!listingId) {
      setListing(null);
      setLoading(false);
      return;
    }

    // Use onSnapshot for real-time updates
    const listingDocRef = doc(db, 'listings', listingId);
    const unsubscribe = onSnapshot(
      listingDocRef,
      (listingDoc) => {
        try {
          if (listingDoc.exists()) {
            const data = listingDoc.data();
            setListing({
              id: listingDoc.id,
              ...data,
            });
          } else {
            setListing(null);
          }
          setError(null);
        } catch (err) {
          console.error('Error processing listing data:', err);
          setError(err.message);
          setListing(null);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching listing:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [listingId]);

  return { listing, loading, error };
};

export const useAllListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'listings'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const listingsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
        }));
        setListings(listingsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching listings:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { listings, loading, error };
};
