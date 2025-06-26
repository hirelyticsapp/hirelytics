import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { createRecruiter, updateRecruiter } from '@/actions/recruiter';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/ui/loading-button';
import { Switch } from '@/components/ui/switch';
import { IUser } from '@/db';
import { useTableParams } from '@/hooks/use-table-params';
import { getQueryClient } from '@/lib/query-client';

export const addUpdateRecruiterFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  emailVerified: z.boolean(),
});

export type RecruiterCreateUpdateFormData = z.infer<typeof addUpdateRecruiterFormSchema>;

export default function RecruiterCreateUpdateForm({
  recruiter,
  open,
  setOpen,
}: {
  recruiter?: IUser;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { pagination, filters, sorting } = useTableParams();
  const queryClient = getQueryClient();

  const isEditing = Boolean(recruiter?.id);

  const form = useForm<RecruiterCreateUpdateFormData>({
    resolver: zodResolver(addUpdateRecruiterFormSchema),
    defaultValues: {
      name: '',
      email: '',
      emailVerified: false,
    },
  });

  useEffect(() => {
    if (open) {
      if (recruiter) {
        // Editing mode - populate form with recruiter data
        form.reset({
          name: recruiter.name,
          email: recruiter.email,
          emailVerified: recruiter.emailVerified,
        });
      } else {
        // Create mode - reset form to default values
        form.reset({
          name: '',
          email: '',
          emailVerified: false,
        });
      }
    }
  }, [recruiter, form, open]);

  const createRecruiterMutation = useMutation({
    mutationFn: async (data: RecruiterCreateUpdateFormData) => {
      // Here you would typically send the data to your API
      if (isEditing && recruiter) {
        return await updateRecruiter(recruiter.id, data);
      }
      console.log(data);
      return await createRecruiter({
        ...data,
        role: 'recruiter', // Ensure role is set to recruiter
      });
    },
    onSuccess: (data) => {
      toast.success(`Recruiter ${data.name} ${isEditing ? 'updated' : 'created'} successfully.`);
      queryClient.invalidateQueries({ queryKey: ['recruiters', pagination, filters, sorting] });
    },
    onError: (error) => {
      console.error('Error creating recruiter:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} recruiter: ${error.message}`);
    },
  });

  const onSubmit = async (data: RecruiterCreateUpdateFormData) => {
    try {
      await createRecruiterMutation.mutateAsync(data);
      // Reset form to default values and close dialog
      form.reset({
        name: '',
        email: '',
        emailVerified: false,
      });
      setOpen(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          // Reset form when dialog closes
          form.reset({
            name: '',
            email: '',
            emailVerified: false,
          });
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="default"
          onClick={() => {
            form.reset({
              name: '',
              email: '',
              emailVerified: false,
            });
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Recruiter
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Recruiter' : 'Add Recruiter'}</DialogTitle>
              <DialogDescription>Fill in the details to add a new recruiter.</DialogDescription>
            </DialogHeader>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormDescription>The recruiter&apos;s full name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormDescription>The recruiter&apos;s email address</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emailVerified"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Email Verified</FormLabel>
                    <FormDescription>Mark this recruiter&apos;s email as verified</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  form.reset({
                    name: '',
                    email: '',
                    emailVerified: false,
                  });
                }}
                disabled={false}
              >
                Cancel
              </Button>
              <LoadingButton type="submit" loading={createRecruiterMutation.isPending}>
                {isEditing ? 'Update Recruiter' : 'Add Recruiter'}
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
