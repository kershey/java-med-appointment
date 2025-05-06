const firebase = require('@firebase/rules-unit-testing');
const fs = require('fs');
const { assertFails, assertSucceeds } = firebase;

/**
 * The emulator will accept any project ID for testing.
 */
const PROJECT_ID = 'firestore-rules-test';

/**
 * Creates a new app with authentication data.
 */
function getAuthedApp(auth) {
  return firebase
    .initializeTestApp({
      projectId: PROJECT_ID,
      auth,
    })
    .firestore();
}

/**
 * Creates a new admin app.
 */
function getAdminApp() {
  return firebase
    .initializeAdminApp({
      projectId: PROJECT_ID,
    })
    .firestore();
}

beforeAll(async () => {
  // Load the rules file before the tests begin
  const rules = fs.readFileSync('firestore.rules', 'utf8');
  await firebase.loadFirestoreRules({
    projectId: PROJECT_ID,
    rules,
  });
});

afterAll(async () => {
  // Delete all the test apps
  await Promise.all(firebase.apps().map((app) => app.delete()));
});

beforeEach(async () => {
  // Clear the database between tests
  await firebase.clearFirestoreData({ projectId: PROJECT_ID });
});

// Test users
const testUid = 'user123';
const testAdminUid = 'admin123';
const testDoctorUid = 'doctor123';

// Test user creation
describe('User creation', () => {
  test('should allow creating a user with correct data', async () => {
    const db = getAuthedApp({ uid: testUid });
    const adminDb = getAdminApp();

    // Setup test data
    const userData = {
      uid: testUid,
      email: 'user@example.com',
      fullName: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      userType: 'Patient',
      status: 'Inactive',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    // Attempt to create user document
    const userRef = db.collection('users').doc(testUid);
    await assertSucceeds(userRef.set(userData));
  });

  test('should allow creating an admin user with Active status', async () => {
    const db = getAuthedApp({ uid: testAdminUid });

    // Setup test data
    const adminData = {
      uid: testAdminUid,
      email: 'admin@example.com',
      fullName: 'Test Admin',
      firstName: 'Test',
      lastName: 'Admin',
      userType: 'Admin',
      status: 'Active', // Admin starts with Active status
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    // Attempt to create admin document
    const adminRef = db.collection('users').doc(testAdminUid);
    await assertSucceeds(adminRef.set(adminData));
  });

  test('should NOT allow creating a non-admin user with Active status', async () => {
    const db = getAuthedApp({ uid: testUid });

    // Setup test data with wrong status
    const userData = {
      uid: testUid,
      email: 'user@example.com',
      fullName: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      userType: 'Patient',
      status: 'Active', // Should be Inactive for non-admin
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    // Attempt should fail
    const userRef = db.collection('users').doc(testUid);
    await assertFails(userRef.set(userData));
  });
});

// Test admin activation
describe('Admin activation', () => {
  test('should allow an admin to update their status from Inactive to Active', async () => {
    const adminDb = getAdminApp();
    const db = getAuthedApp({ uid: testAdminUid });

    // Setup: Create an Inactive admin user
    await adminDb.collection('users').doc(testAdminUid).set({
      uid: testAdminUid,
      email: 'admin@example.com',
      fullName: 'Test Admin',
      firstName: 'Test',
      lastName: 'Admin',
      userType: 'Admin',
      status: 'Inactive',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    // Attempt to update status
    await assertSucceeds(
      db.collection('users').doc(testAdminUid).update({
        status: 'Active',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      })
    );
  });
});

// Run tests with: npx firebase emulators:exec --only firestore "node firestore.rules.test.js"
