import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { createOrganization, updateOrganization } from '@/actions/organization';
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
import { IOrganization } from '@/db';
import { useTableParams } from '@/hooks/use-table-params';
import { getQueryClient } from '@/lib/query-client';

export const addUpdateOrganizationFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  logo: z.string().url('Logo must be a valid URL').optional(),
});

export type OrganizationCreateUpdateFormData = z.infer<typeof addUpdateOrganizationFormSchema>;

export default function OrganizationCreateUpdateForm({
  organization,
  open,
  setOpen,
}: {
  organization?: IOrganization;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { pagination, filters, sorting } = useTableParams();
  const queryClient = getQueryClient();

  const isEditing = Boolean(organization?.id);

  const form = useForm<OrganizationCreateUpdateFormData>({
    resolver: zodResolver(addUpdateOrganizationFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      logo: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (organization) {
        // Editing mode - populate form with organization data
        form.reset({
          name: organization.name,
          slug: organization.slug,
          description: organization.description,
          logo: organization.logo,
        });
      } else {
        // Create mode - reset form to default values
        form.reset({
          name: '',
          slug: '',
          description: '',
          logo: '',
        });
      }
    }
  }, [organization, form, open]);

  const createOrganizationMutation = useMutation({
    mutationFn: async (data: OrganizationCreateUpdateFormData) => {
      // Here you would typically send the data to your API
      if (isEditing && organization) {
        return await updateOrganization(organization.id, data);
      }
      console.log(data);
      return await createOrganization(data);
    },
    onSuccess: (data) => {
      toast.success(`Organization ${data.name} ${isEditing ? 'updated' : 'created'} successfully.`);
      queryClient.invalidateQueries({ queryKey: ['organizations', pagination, filters, sorting] });
    },
    onError: (error) => {
      console.error('Error creating organization:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} organization: ${error.message}`);
    },
  });

  const onSubmit = async (data: OrganizationCreateUpdateFormData) => {
    try {
      await createOrganizationMutation.mutateAsync(data);
      // Reset form to default values and close dialog
      form.reset({
        name: '',
        slug: '',
        description: '',
        logo: '',
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
            slug: '',
            description: '',
            logo: '',
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
              slug: '',
              description: '',
              logo: '',
            });
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Organization
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Organization' : 'Add Organization'}</DialogTitle>
              <DialogDescription>Fill in the details to add a new organization.</DialogDescription>
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
                  <FormDescription>The organization&apos;s name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug *</FormLabel>
                  <FormControl>
                    <Input placeholder="john-doe" {...field} />
                  </FormControl>
                  <FormDescription>The organization&apos;s slug</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo *</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/logo.png" {...field} />
                  </FormControl>
                  <FormDescription>The organization&apos;s logo URL</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="A brief description of the organization" {...field} />
                  </FormControl>
                  <FormDescription>A brief description of the organization</FormDescription>
                  <FormMessage />
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
                    slug: '',
                    description: '',
                    logo: '',
                  });
                }}
                disabled={false}
              >
                Cancel
              </Button>
              <LoadingButton type="submit" loading={createOrganizationMutation.isPending}>
                {isEditing ? 'Update Organization' : 'Add Organization'}
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
