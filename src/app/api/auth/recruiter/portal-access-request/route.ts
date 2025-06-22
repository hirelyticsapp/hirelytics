import { NextResponse } from 'next/server';

import { connectToDatabase } from '@/db';
import { PortalAccessRequest } from '@/db/schema/portal-request-access';
import User from '@/db/schema/user';
import { createPortalAccessRequestSchema } from '@/schema/recruiter';

export async function POST(req: Request) {
  const body = await req.json();

  const bodyParse = createPortalAccessRequestSchema.safeParse(body);

  if (!bodyParse.success) {
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid request data',
        errors: bodyParse.error.errors,
      },
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    await connectToDatabase();

    const isRequestExists = await PortalAccessRequest.findOne({
      work_email: bodyParse.data.work_email,
    });

    if (isRequestExists) {
      return NextResponse.json(
        {
          success: false,
          message: 'Request already exists',
        },
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const isEmailExists = await User.findOne({
      email: bodyParse.data.work_email,
    });

    if (isEmailExists) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email already exists in our system',
        },
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const portalAccessRequest = await PortalAccessRequest.create(bodyParse.data);
    await portalAccessRequest.save();
    return NextResponse.json(
      {
        success: true,
        message: 'Portal access request created successfully',
        data: portalAccessRequest,
      },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating portal access request:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create portal access request',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
