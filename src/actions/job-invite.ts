'use server';

import { connectToDatabase } from '@/db';
import JobInvitation from '@/db/schema/job-invitation';
import User from '@/db/schema/user';

export async function inviteCandidateForJob(jobId: string, emails: string[]) {
  await connectToDatabase();
  const invited = await Promise.all(
    emails.map(async (email) => {
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          email,
          role: 'candidate',
        });
      }

      // Check if the user is already invited for this job
      const existingInvitation = await JobInvitation.findOne({
        jobId,
        candidateEmail: email,
      });
      if (existingInvitation) {
        //skip
        return email; // Return the email to track successful invitations
      }

      await JobInvitation.create({
        jobId,
        candidateEmail: email,
        candidateId: user._id,
        invitedBy: user._id, // Assuming the inviter is the user themselves
        status: 'pending',
        uuid: crypto.randomUUID(), // Generate a unique identifier for the invitation
      });
      return email; // Return the email to track successful invitations
    })
  );

  if (invited.length === 0) {
    throw new Error('No candidates were invited.');
  }
  return invited;
}
