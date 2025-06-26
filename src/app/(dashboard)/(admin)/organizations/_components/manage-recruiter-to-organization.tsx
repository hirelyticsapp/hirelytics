'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  addMemberToOrganization,
  fetchOrganizationMembers,
  fetchRecruitersNotInOrganization,
  removeMemberFromOrganization,
} from '@/actions/member';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { LoadingButton } from '@/components/ui/loading-button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IOrganization, IUser } from '@/db';
import { getQueryClient } from '@/lib/query-client';
import { cn } from '@/lib/utils';

const addRecruitersFormSchema = z.object({
  recruiters: z
    .array(
      z.object({
        userId: z.string(),
        roles: z.array(z.enum(['owner', 'member'])).min(1, 'Please select at least one role'),
      })
    )
    .min(1, 'Please select at least one recruiter'),
});

type AddRecruitersFormData = z.infer<typeof addRecruitersFormSchema>;

interface ManageMembersProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  organization: IOrganization;
}

export default function ManageMembers({ open, setOpen, organization }: ManageMembersProps) {
  const [activeTab, setActiveTab] = useState<'add' | 'members'>('add');
  const [recruitersOpen, setRecruitersOpen] = useState(false);
  const [selectedRecruiters, setSelectedRecruiters] = useState<
    Array<{ user: IUser; roles: string[] }>
  >([]);

  // Local pagination state for members
  const [membersPage, setMembersPage] = useState(1);
  const [membersPageSize] = useState(5);

  const queryClient = getQueryClient();

  const form = useForm<AddRecruitersFormData>({
    resolver: zodResolver(addRecruitersFormSchema),
    defaultValues: {
      recruiters: [],
    },
  });

  // Fetch available recruiters
  const { data: availableRecruiters } = useQuery({
    queryKey: ['recruiters-not-in-organization', organization?.id],
    queryFn: () =>
      fetchRecruitersNotInOrganization(organization?.id, { pageIndex: 0, pageSize: 100 }, {}, []),
    enabled: open && !!organization?.id,
  });

  // Fetch organization members
  const {
    data: membersData,
    refetch: refetchMembers,
    isLoading: membersLoading,
  } = useQuery({
    queryKey: ['organization-members', organization?.id, membersPage, membersPageSize],
    queryFn: () =>
      fetchOrganizationMembers(organization?.id, {
        pageIndex: membersPage - 1,
        pageSize: membersPageSize,
      }),
    enabled: open && !!organization?.id,
  });

  const addMembersMutation = useMutation({
    mutationFn: async (data: AddRecruitersFormData) => {
      const promises = data.recruiters.map((recruiter) =>
        addMemberToOrganization(recruiter.userId, organization.id, recruiter.roles)
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast.success('Recruiters added to organization successfully');
      setSelectedRecruiters([]);
      form.reset();
      setMembersPage(1); // Reset to first page to see new members
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['recruiters-not-in-organization', organization.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['organization-members', organization?.id, membersPage, membersPageSize],
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add recruiters to organization');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => removeMemberFromOrganization(memberId),
    onSuccess: () => {
      toast.success('Member removed from organization successfully');
      refetchMembers();
      queryClient.invalidateQueries({
        queryKey: ['recruiters-not-in-organization', organization.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['organization-members', organization?.id, membersPage, membersPageSize],
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove member from organization');
    },
  });

  const onSubmit = (data: AddRecruitersFormData) => {
    addMembersMutation.mutate(data);
  };

  const handleRecruiterSelect = (recruiter: Partial<IUser>) => {
    const isAlreadySelected = selectedRecruiters.some((r) => r.user.id === recruiter.id);
    if (!isAlreadySelected && recruiter.id) {
      setSelectedRecruiters([
        ...selectedRecruiters,
        { user: recruiter as IUser, roles: ['member'] },
      ]);
    }
    setRecruitersOpen(false);
  };

  const handleRemoveRecruiter = (recruiterId: string) => {
    setSelectedRecruiters(selectedRecruiters.filter((r) => r.user.id !== recruiterId));
  };

  const handleRoleChange = (recruiterId: string, roles: string[]) => {
    setSelectedRecruiters(
      selectedRecruiters.map((r) => (r.user.id === recruiterId ? { ...r, roles } : r))
    );
  };

  // Update form data when selectedRecruiters changes
  React.useEffect(() => {
    form.setValue(
      'recruiters',
      selectedRecruiters.map((r) => ({
        userId: r.user.id,
        roles: r.roles as ('owner' | 'member')[],
      }))
    );
  }, [selectedRecruiters, form]);

  // Handle member list pagination
  const totalPages = Math.ceil((membersData?.totalCount || 0) / membersPageSize);
  const canGoPrevious = membersPage > 1;
  const canGoNext = membersPage < totalPages;

  const handlePreviousPage = () => {
    if (canGoPrevious) {
      setMembersPage(membersPage - 1);
    }
  };

  const handleNextPage = () => {
    if (canGoNext) {
      setMembersPage(membersPage + 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Members - {organization?.name}
          </DialogTitle>
          <DialogDescription>
            Add recruiters to the organization or view existing members.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value as 'add' | 'members');
            if (value === 'members') {
              setMembersPage(1); // Reset to first page when switching to members tab
            }
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Members
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              View Members ({membersData?.totalCount || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Recruiter Selection */}
                <FormItem>
                  <FormLabel>Select Recruiters</FormLabel>
                  <Popover open={recruitersOpen} onOpenChange={setRecruitersOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={recruitersOpen}
                        className="w-full justify-between"
                      >
                        Select recruiters to add...
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search recruiters..." />
                        <CommandList>
                          <CommandEmpty>No recruiters found.</CommandEmpty>
                          <CommandGroup>
                            {availableRecruiters?.data?.map((recruiter) => (
                              <CommandItem
                                key={recruiter.id}
                                onSelect={() => handleRecruiterSelect(recruiter)}
                                disabled={selectedRecruiters.some(
                                  (r) => r.user.id === recruiter.id
                                )}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    selectedRecruiters.some((r) => r.user.id === recruiter.id)
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                <div>
                                  <div className="font-medium">{recruiter.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {recruiter.email}
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormItem>

                {/* Selected Recruiters */}
                {selectedRecruiters.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">
                      Selected Recruiters ({selectedRecruiters.length})
                    </h4>
                    {selectedRecruiters.map((selectedRecruiter, index) => (
                      <div
                        key={selectedRecruiter.user.id}
                        className="p-4 border rounded-lg bg-muted/30"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="text-sm">
                              <p className="font-medium">{selectedRecruiter.user.name}</p>
                              <p className="text-muted-foreground">
                                {selectedRecruiter.user.email}
                              </p>
                            </div>
                            <FormField
                              control={form.control}
                              name={`recruiters.${index}.roles`}
                              render={() => (
                                <FormItem>
                                  <FormLabel className="text-sm">Roles</FormLabel>
                                  <div className="space-y-2">
                                    {(['owner', 'member'] as const).map((role) => (
                                      <FormItem
                                        key={role}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={selectedRecruiter.roles.includes(role)}
                                            onCheckedChange={(checked) => {
                                              const newRoles = checked
                                                ? [...selectedRecruiter.roles, role]
                                                : selectedRecruiter.roles.filter((r) => r !== role);
                                              handleRoleChange(selectedRecruiter.user.id, newRoles);
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal capitalize">
                                          {role}
                                        </FormLabel>
                                      </FormItem>
                                    ))}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveRecruiter(selectedRecruiter.user.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      setSelectedRecruiters([]);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <LoadingButton
                    type="submit"
                    loading={addMembersMutation.isPending}
                    disabled={selectedRecruiters.length === 0}
                  >
                    Add {selectedRecruiters.length} Member
                    {selectedRecruiters.length !== 1 ? 's' : ''}
                  </LoadingButton>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <div className="min-h-[400px] space-y-4">
              {/* Members List */}
              {membersLoading ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">Loading members...</p>
                </div>
              ) : membersData?.data?.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">No members found in this organization.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {membersData?.data?.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-card"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{member.user?.name}</h4>
                            <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                          </div>
                          <div className="flex gap-1">
                            {member.role?.map((role) => (
                              <Badge key={role} variant="secondary" className="capitalize">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeMemberMutation.mutate(member.id!)}
                        disabled={removeMemberMutation.isPending}
                        className="ml-4 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {(membersData?.totalCount || 0) > 0 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(membersPage - 1) * membersPageSize + 1} to{' '}
                    {Math.min(membersPage * membersPageSize, membersData?.totalCount || 0)} of{' '}
                    {membersData?.totalCount || 0} members
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={!canGoPrevious}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {membersPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={!canGoNext}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
