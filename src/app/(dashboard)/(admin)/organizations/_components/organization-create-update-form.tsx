import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  createOrganization,
  OrganizationLogoUpload,
  updateOrganization,
} from '@/actions/organization';
import { FileDropzone } from '@/components/file-dropzone';
import S3SignedImage from '@/components/s3-signed-image';
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
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import { Textarea } from '@/components/ui/textarea';
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
  logo: z.string().optional(),
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
  const fileDropzoneRef = useRef<{ clearFiles: () => void }>(null);

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
      // Validate that logo is provided for new organizations
      if (!isEditing && !data.logo) {
        toast.error('Please upload a logo for the organization.');
        return;
      }

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
      // Error is already handled by the mutation's onError callback
    }
  };

  const organizationLogoUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!file) {
        throw new Error('No file selected for upload');
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      return await OrganizationLogoUpload(file);
    },
    onSuccess: (data) => {
      form.setValue('logo', data.key);
      toast.success('Logo uploaded successfully.');
      // Clear the file dropzone after successful upload
      fileDropzoneRef.current?.clearFiles();
    },
    onError: (error) => {
      console.error('Error uploading logo:', error);
      toast.error(`Failed to upload logo: ${error.message}`);
    },
  });

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
            <div>
              <Label className="mb-2">Logo</Label>
              {form.watch('logo') && (
                <div className="mb-2 p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    <S3SignedImage
                      src={form.watch('logo') as string}
                      alt="Current logo"
                      className="w-12 h-12 object-cover rounded"
                      width={48}
                      height={48}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Current Logo</p>
                      <p className="text-xs text-muted-foreground">
                        Click below to upload a new logo
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => form.setValue('logo', '')}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}
              <FileDropzone
                ref={fileDropzoneRef}
                onFilesChange={(files) => {
                  if (files[0]) {
                    organizationLogoUploadMutation.mutate(files[0]);
                  }
                }}
                maxFiles={1}
                maxSize={5 * 1024 * 1024} // 5MB
                acceptedFileTypes={['image/*']}
                disabled={organizationLogoUploadMutation.isPending}
              />
              {organizationLogoUploadMutation.isPending && (
                <div className="mt-2 text-sm text-muted-foreground">Uploading logo...</div>
              )}
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief description of the organization"
                      {...field}
                      className="resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      rows={5}
                    />
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
              <LoadingButton
                type="submit"
                loading={
                  createOrganizationMutation.isPending || organizationLogoUploadMutation.isPending
                }
                disabled={organizationLogoUploadMutation.isPending}
              >
                {organizationLogoUploadMutation.isPending
                  ? 'Uploading Logo...'
                  : createOrganizationMutation.isPending
                    ? isEditing
                      ? 'Updating...'
                      : 'Creating...'
                    : isEditing
                      ? 'Update Organization'
                      : 'Add Organization'}
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
