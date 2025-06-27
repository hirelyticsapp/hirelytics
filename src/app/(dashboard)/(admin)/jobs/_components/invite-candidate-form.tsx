import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { SendHorizonalIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { inviteCandidateForJob } from '@/actions/job-invite';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { LoadingButton } from '@/components/ui/loading-button';
import { Textarea } from '@/components/ui/textarea';
import { IJob } from '@/db';

export const inviteCandidateFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .refine((value) => {
      // Validate that the input is a valid email format
      const emails = value.split('\n').map((email) => email.trim());
      return emails.every((email) => /^\S+@\S+\.\S+$/.test(email));
    }, 'Please enter valid email addresses, one per line'),
});

type InviteCandidateFormData = z.infer<typeof inviteCandidateFormSchema>;

export default function InviteCandidateForm({
  open,
  setOpen,
  job,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  job: IJob;
}) {
  const form = useForm<InviteCandidateFormData>({
    resolver: zodResolver(inviteCandidateFormSchema),
    defaultValues: {
      email: '',
    },
  });

  const inviteCandidateForJobMutation = useMutation({
    mutationFn: async (data: InviteCandidateFormData) => {
      //  please make the candidates email a list of emails separated by new lines
      const emails = data.email.split('\n').map((email) => email.trim());
      console.log('Inviting candidates for job:', job.id, 'with emails:', emails);
      return inviteCandidateForJob(job.id, emails);
    },
    onSuccess: () => {
      form.reset();
      setOpen(false);
      // Optionally, show a success message
      console.log('Candidate invited successfully');
      toast.success('Candidate invited successfully!');
    },
    onError: (error) => {
      console.error('Error creating candidate:', error);
      toast.error(`Failed to invite candidate: ${error.message}`);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (data: InviteCandidateFormData) => {
              await inviteCandidateForJobMutation.mutateAsync(data);
            })}
            className="space-y-4"
          >
            <DialogHeader>
              <DialogTitle>Invite Candidate</DialogTitle>
              <DialogDescription>
                Invite a candidate to apply for the job: {job?.title}
              </DialogDescription>
            </DialogHeader>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter one email per line" rows={10} {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the candidate&apos;s email addresses, one per line.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <LoadingButton type="submit" loading={inviteCandidateForJobMutation.isPending}>
                <SendHorizonalIcon className="mr-2 h-4 w-4" />
                {inviteCandidateForJobMutation.isPending
                  ? 'Sending Invitation...'
                  : 'Send Invitation'}
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
