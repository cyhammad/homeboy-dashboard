import { useEffect } from 'react';
import { recordAnalytics } from '@/lib/firebaseUtils';

export const useAnalytics = (page, userId = null) => {
  useEffect(() => {
    const trackPageView = async () => {
      try {
        await recordAnalytics('page_view', 1, {
          page,
          userId,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        });
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };

    trackPageView();
  }, [page, userId]);

  const trackEvent = async (eventName, value = 1, metadata = {}) => {
    try {
      await recordAnalytics(eventName, value, {
        page,
        userId,
        timestamp: new Date().toISOString(),
        ...metadata
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };

  const trackUserAction = async (action, target = null) => {
    try {
      await recordAnalytics('user_action', 1, {
        action,
        target,
        page,
        userId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking user action:', error);
    }
  };

  return {
    trackEvent,
    trackUserAction
  };
};
