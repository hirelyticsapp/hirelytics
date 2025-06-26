'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, ChevronRight, Loader2, Save, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { getIndustrySkills, getOrganizations } from '@/actions/organization';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { industriesData } from '@/lib/constants/industry-data';
import { currencies } from '@/lib/constants/job-constants';
import { type BasicJobDetails, basicJobDetailsSchema } from '@/lib/schemas/job-schemas';
import { cn } from '@/lib/utils';

interface BasicDetailsStepProps {
  initialData?: Partial<BasicJobDetails>;
  onComplete: (data: BasicJobDetails, shouldMoveNext?: boolean) => Promise<void>;
  isSaving?: boolean;
}

interface Organization {
  id: string;
  name: string;
}

export function BasicDetailsStep({
  initialData,
  onComplete,
  isSaving = false,
}: BasicDetailsStepProps) {
  const [skillInput, setSkillInput] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);

  const form = useForm<BasicJobDetails>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(basicJobDetailsSchema) as any,
    defaultValues: {
      title: initialData?.title || '',
      organizationId: initialData?.organizationId || '',
      industry: initialData?.industry || '',
      salary: initialData?.salary || '',
      currency: initialData?.currency || 'USD',
      location: initialData?.location || '',
      expiryDate: initialData?.expiryDate || undefined,
      skills: initialData?.skills || [],
      status: initialData?.status || 'draft',
    },
  });

  const skills = form.watch('skills');
  const selectedIndustry = form.watch('industry');

  // Fetch organizations on component mount and set default if only one exists
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const result = await getOrganizations();
        if (result.success) {
          setOrganizations(result.data);
          // If only one organization exists and no organizationId is set, set it as default
          if (result.data.length === 1 && !form.getValues('organizationId')) {
            form.setValue('organizationId', result.data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
      }
    };

    fetchOrganizations();
  }, [form]);

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
    await onComplete(data, true); // Save and move to next step
  };

  const handleSave = async () => {
    const formData = form.getValues();
    const isValid = await form.trigger(); // Validate the form
    if (isValid) {
      await onComplete(formData, false); // Save without moving to next step
    }
  };

  const handleSaveAndContinue = async () => {
    const formData = form.getValues();
    const isValid = await form.trigger(); // Validate the form
    if (isValid) {
      await onComplete(formData, true); // Save and move to next step
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Job Details</CardTitle>
        <CardDescription>Update the basic information about this job position</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Job Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Senior Software Engineer" {...field} />
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
                    <Select onValueChange={field.onChange} value={field.value || ''}>
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
                    <Select onValueChange={field.onChange} value={field.value || ''} disabled>
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
                      <Input placeholder="e.g. 80,000 - 120,000" {...field} />
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
                    <Select onValueChange={field.onChange} value={field.value || 'USD'}>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
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
                <div className="flex flex-wrap gap-3">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="px-3 py-2 text-sm font-medium flex items-center gap-2 hover:bg-secondary/80 transition-colors"
                    >
                      <span>{skill}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0.5 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                        onClick={() => removeSkill(skill)}
                        aria-label={`Remove ${skill} skill`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
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
              <Button type="button" variant="outline" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
              <Button type="button" onClick={handleSaveAndContinue} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <>
                    Save & Continue
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
