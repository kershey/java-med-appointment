import { NextRequest, NextResponse } from 'next/server';
import { syncAllDoctorNames } from '@/app/firebase/doctors';
import { getCurrentUserData } from '@/app/firebase/auth';

// This endpoint should be protected by middleware in a production application
export async function POST(request: NextRequest) {
  try {
    const { userId, adminKey } = await request.json();

    // Basic security check - in a real app, use a proper authentication middleware
    // This is just a placeholder - replace with a proper authentication mechanism
    if (!userId || adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Check if the user is an admin
    const userResult = await getCurrentUserData(userId);
    if (
      !userResult.success ||
      !userResult.userData ||
      userResult.userData.userType !== 'Admin'
    ) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Run the migration
    const result = await syncAllDoctorNames();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully synced ${result.updated} doctor records`,
        updated: result.updated,
      });
    } else {
      console.error('Error in sync-doctor-names route:', result.error);
      return NextResponse.json(
        {
          error: 'Error syncing doctor names',
          details: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in sync-doctor-names route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
