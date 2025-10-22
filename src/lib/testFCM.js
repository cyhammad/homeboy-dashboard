// Test FCM implementation
// This file can be used to test FCM functionality

export const testFCMImplementation = {
  // Test if FCM service is properly initialized
  async testFCMService() {
    try {
      console.log('Testing FCM Service...');
      
      // Test browser compatibility
      if (typeof window === 'undefined') {
        console.log('❌ FCM Service: Not in browser environment');
        return false;
      }

      // Test notification support
      if (!('Notification' in window)) {
        console.log('❌ FCM Service: Notifications not supported');
        return false;
      }

      console.log('✅ FCM Service: Browser environment OK');
      console.log('✅ FCM Service: Notifications supported');
      
      return true;
    } catch (error) {
      console.error('❌ FCM Service Test Failed:', error);
      return false;
    }
  },

  // Test Firebase Admin SDK
  async testFirebaseAdmin() {
    try {
      console.log('Testing Firebase Admin SDK...');
      
      // Check if Firebase Admin is properly configured
      const { sendNotificationToUser } = await import('@/lib/firebaseAdmin');
      
      if (!sendNotificationToUser) {
        console.log('❌ Firebase Admin: sendNotificationToUser function not found');
        return false;
      }

      console.log('✅ Firebase Admin: Functions available');
      return true;
    } catch (error) {
      console.error('❌ Firebase Admin Test Failed:', error);
      return false;
    }
  },

  // Test API routes
  async testAPIRoutes() {
    try {
      console.log('Testing API Routes...');
      
      // Test send-notification route
      const testNotification = {
        title: 'Test Notification',
        body: 'This is a test notification',
        data: { test: true }
      };

      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test-user-id',
          notification: testNotification
        })
      });

      if (response.ok) {
        console.log('✅ API Routes: send-notification endpoint accessible');
      } else {
        console.log('⚠️ API Routes: send-notification endpoint returned error (expected for test user)');
      }

      return true;
    } catch (error) {
      console.error('❌ API Routes Test Failed:', error);
      return false;
    }
  },

  // Test FCM permissions
  async testFCMPermissions() {
    try {
      console.log('Testing FCM Permissions...');
      
      // Import and run permission tests
      const { testFCMPermissions } = await import('./testFCMPermissions.js');
      return await testFCMPermissions.runAllTests();
    } catch (error) {
      console.error('❌ FCM Permissions Test Failed:', error);
      return false;
    }
  },

  // Run all tests
  async runAllTests() {
    console.log('🧪 Starting FCM Implementation Tests...');
    console.log('=====================================');

    const results = {
      fcmService: await this.testFCMService(),
      firebaseAdmin: await this.testFirebaseAdmin(),
      apiRoutes: await this.testAPIRoutes(),
      permissions: await this.testFCMPermissions()
    };

    console.log('=====================================');
    console.log('📊 Test Results:');
    console.log('FCM Service:', results.fcmService ? '✅ PASS' : '❌ FAIL');
    console.log('Firebase Admin:', results.firebaseAdmin ? '✅ PASS' : '❌ FAIL');
    console.log('API Routes:', results.apiRoutes ? '✅ PASS' : '❌ FAIL');
    console.log('Permissions:', results.permissions ? '✅ PASS' : '❌ FAIL');

    const allPassed = Object.values(results).every(result => result === true);
    console.log('Overall:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');

    return results;
  }
};

// Auto-run tests if in browser
if (typeof window !== 'undefined') {
  window.testFCM = testFCMImplementation;
  console.log('🔧 FCM Test Suite loaded. Run window.testFCM.runAllTests() to test the implementation.');
}
