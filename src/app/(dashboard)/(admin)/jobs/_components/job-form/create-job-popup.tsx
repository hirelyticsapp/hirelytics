'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Resolver, useForm } from 'react-hook-form';

import { createMockInterview } from '@/actions/job';
import { getIndustrySkills, getOrganizations } from '@/actions/organization';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { useCreateJobMutation } from '@/hooks/use-job-queries';
import { industriesData } from '@/lib/constants/industry-data';
import { currencies } from '@/lib/constants/job-constants';
import { type BasicJobDetails, basicJobDetailsSchema } from '@/lib/schemas/job-schemas';
import { cn } from '@/lib/utils';

interface UnifiedJobCreatePopupProps {
  onJobCreated: (jobId: string) => void;
}

interface Organization {
  id: string;
  name: string;
}

type JobType = 'regular' | 'mock';

export function UnifiedJobCreatePopup({ onJobCreated }: UnifiedJobCreatePopupProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [jobType, setJobType] = useState<JobType>('regular');
  const [skillInput, setSkillInput] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const isAdmin = user?.role === 'admin';

  // Initialize the create job mutation for regular jobs
  const createJobMutation = useCreateJobMutation();

  const form = useForm<BasicJobDetails>({
    resolver: zodResolver(basicJobDetailsSchema) as Resolver<BasicJobDetails>,
    defaultValues: {
      title: '',
      organizationId: '',
      industry: '',
      salary: '',
      currency: 'USD',
      location: '',
      skills: [],
      status: 'draft',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  const skills = form.watch('skills');
  const selectedIndustry = form.watch('industry');

  // Fetch organizations on component mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const result = await getOrganizations();
        if (result.success) {
          setOrganizations(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
      }
    };

    if (open) {
      fetchOrganizations();
    }
  }, [open]);

  // Fetch skills when industry changes
  useEffect(() => {
    if (selectedIndustry) {
      const fetchSkills = async () => {
        setLoadingSkills(true);
        try {
          const result = await getIndustrySkills(selectedIndustry);
          if (result.success) {
            setAvailableSkills(result.data);
          }
        } catch (error) {
          console.error('Failed to fetch skills:', error);
        } finally {
          setLoadingSkills(false);
        }
      };

      fetchSkills();
    }
  }, [selectedIndustry]);

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      form.setValue('skills', [...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      form.setValue(
        'skills',
        skills.filter((s) => s !== skill)
      );
    } else {
      form.setValue('skills', [...skills, skill]);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    form.setValue(
      'skills',
      skills.filter((skill) => skill !== skillToRemove)
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const onSubmit = async (data: BasicJobDetails) => {
    try {
      setIsCreating(true);

      if (jobType === 'mock') {
        // Create mock job
        const result = await createMockInterview(data, user?.id);
        if (result.success && result.jobId) {
          setOpen(false);
          form.reset();
          router.push(`/mock-jobs/${result.jobId}`);
        } else {
          console.error('Failed to create mock job:', result.error);
        }
      } else {
        // Create regular job
        console.log('Creating regular job with basic details:', data);
        const result = await createJobMutation.mutateAsync({
          jobData: data,
          recruiterId: user?.id,
        });

        if (result.success && result.data) {
          setOpen(false);
          form.reset();
          onJobCreated(result.data.id);
        } else {
          console.error('Failed to create job:', result.error);
        }
      }
    } catch (error) {
      console.error('Error creating job:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    form.reset();
    setJobType('regular');
    setSkillInput('');
    setAvailableSkills([]);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Job
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Job Type Selection - Only for Admin */}
            {isAdmin && (
              <div className="space-y-3">
                <FormLabel>Job Type</FormLabel>
                <RadioGroup
                  value={jobType}
                  onValueChange={(value: JobType) => setJobType(value)}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="regular" id="regular" />
                    <label htmlFor="regular" className="text-sm font-medium cursor-pointer">
                      Regular Job
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mock" id="mock" />
                    <label htmlFor="mock" className="text-sm font-medium cursor-pointer">
                      Mock Interview
                    </label>
                  </div>
                </RadioGroup>
                {jobType === 'mock' && (
                  <p className="text-sm text-muted-foreground">
                    Mock interviews are practice sessions for candidates to improve their interview
                    skills.
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>
                      {jobType === 'mock' ? 'Mock Interview Title' : 'Job Title'} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          jobType === 'mock'
                            ? 'e.g. Frontend Developer Practice Interview'
                            : 'e.g. Senior Software Engineer'
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organizationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select organization" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(industriesData).map(([key, data]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <data.icon className="h-4 w-4" />
                              {data.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. New York, NY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          jobType === 'mock' ? 'e.g. Practice Interview' : 'e.g. 80,000 - 120,000'
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Expiry Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Skills Section */}
            <div className="space-y-3">
              <FormLabel>Skills *</FormLabel>

              {/* Custom skill input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a custom skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button type="button" onClick={addSkill} variant="outline">
                  Add
                </Button>
              </div>

              {/* Industry-specific skills */}
              {selectedIndustry && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Popular skills for{' '}
                    {industriesData[selectedIndustry as keyof typeof industriesData]?.label}:
                  </p>
                  {loadingSkills ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading skills...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                      {availableSkills.map((skill) => (
                        <div key={skill} className="flex items-center space-x-2">
                          <Checkbox
                            id={skill}
                            checked={skills.includes(skill)}
                            onCheckedChange={() => toggleSkill(skill)}
                          />
                          <label
                            htmlFor={skill}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {skill}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Selected skills */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1">
                      {skill}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                    </Badge>
                  ))}
                </div>
              )}

              {form.formState.errors.skills && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.skills.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isCreating || createJobMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || createJobMutation.isPending}>
                {isCreating || createJobMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  `Create ${jobType === 'mock' ? 'Mock Job' : 'Job'}`
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
