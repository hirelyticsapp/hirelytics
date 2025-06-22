'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { AuthCard } from '@/components/ui/auth-card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export function RequestAccessForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<RequestAccessFormData>({
    resolver: zodResolver(requestAccessSchema),
    defaultValues: {
      full_name: '',
      work_email: '',
      job_title: '',
      phone_number: '',
      company_name: '',
      company_size: '',
      industry: '',
      monthly_hires: '',
      hiring_challenge: '',
      referral_source: '',
    },
  });

  const createPortalRequest = useCreatePortalRequest();

  const handleSubmit = async (data: RequestAccessFormData) => {
    setIsLoading(true);
    try {
      await createPortalRequest.mutateAsync(data);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Request submission failed:', error);
      toast.error('Failed to submit request. Please check your details and try again.', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthCard
        title="Request Submitted Successfully!"
        description="We'll review your request and get back to you within 24 hours"
        className="w-full shadow-lg border-0 bg-card/50 backdrop-blur-sm"
      >
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="space-y-3">
            <p className="text-base text-muted-foreground">
              Thank you for your interest in Hirelytics! Our team will review your request and
              contact you soon.
            </p>
            <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-3">
              📧 Check your email for a confirmation and next steps
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/recruiter/login" className="flex-1">
              <Button variant="outline" className="flex-1">
                Back to Login
              </Button>
            </Link>

            <Button onClick={() => setIsSubmitted(false)} className="flex-1">
              Submit Another Request
            </Button>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Request Recruiter Access"
      description="Tell us about your company and hiring needs to get started"
      className="w-full shadow-lg border-0 bg-card/50 backdrop-blur-sm"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Personal & Contact Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-border/50">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Full Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="John Doe"
                        className="h-12 text-base border-2 border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background/50"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="job_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Job Title *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Senior Recruiter"
                        className="h-12 text-base border-2 border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background/50"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="work_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Work Email *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="john@company.com"
                        className="h-12 text-base border-2 border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background/50"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Phone Number *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        className="h-12 text-base border-2 border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background/50"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Company Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-border/50">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Company Details</h3>
            </div>

            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">
                    Company Name *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Acme Corporation"
                      className="h-12 text-base border-2 border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background/50"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Industry *
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 text-base border-2 border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background/50">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border-2 border-border/50 rounded-lg shadow-lg">
                        <SelectItem value="technology" className="cursor-pointer hover:bg-muted">
                          Technology
                        </SelectItem>
                        <SelectItem value="finance" className="cursor-pointer hover:bg-muted">
                          Finance
                        </SelectItem>
                        <SelectItem value="healthcare" className="cursor-pointer hover:bg-muted">
                          Healthcare
                        </SelectItem>
                        <SelectItem value="retail" className="cursor-pointer hover:bg-muted">
                          Retail
                        </SelectItem>
                        <SelectItem value="manufacturing" className="cursor-pointer hover:bg-muted">
                          Manufacturing
                        </SelectItem>
                        <SelectItem value="consulting" className="cursor-pointer hover:bg-muted">
                          Consulting
                        </SelectItem>
                        <SelectItem value="education" className="cursor-pointer hover:bg-muted">
                          Education
                        </SelectItem>
                        <SelectItem value="other" className="cursor-pointer hover:bg-muted">
                          Other
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Company Size *
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 text-base border-2 border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background/50">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border-2 border-border/50 rounded-lg shadow-lg">
                        <SelectItem value="1-10" className="cursor-pointer hover:bg-muted">
                          1-10 employees
                        </SelectItem>
                        <SelectItem value="11-50" className="cursor-pointer hover:bg-muted">
                          11-50 employees
                        </SelectItem>
                        <SelectItem value="51-200" className="cursor-pointer hover:bg-muted">
                          51-200 employees
                        </SelectItem>
                        <SelectItem value="201-1000" className="cursor-pointer hover:bg-muted">
                          201-1000 employees
                        </SelectItem>
                        <SelectItem value="1000+" className="cursor-pointer hover:bg-muted">
                          1000+ employees
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monthly_hires"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Monthly Hires *
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 text-base border-2 border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background/50">
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border-2 border-border/50 rounded-lg shadow-lg">
                        <SelectItem value="1-5" className="cursor-pointer hover:bg-muted">
                          1-5 hires
                        </SelectItem>
                        <SelectItem value="6-15" className="cursor-pointer hover:bg-muted">
                          6-15 hires
                        </SelectItem>
                        <SelectItem value="16-30" className="cursor-pointer hover:bg-muted">
                          16-30 hires
                        </SelectItem>
                        <SelectItem value="31-50" className="cursor-pointer hover:bg-muted">
                          31-50 hires
                        </SelectItem>
                        <SelectItem value="50+" className="cursor-pointer hover:bg-muted">
                          50+ hires
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Requirements & Additional Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-border/50">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Hiring Requirements</h3>
            </div>

            <FormField
              control={form.control}
              name="hiring_challenge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">
                    Current Hiring Challenges *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your main hiring challenges and what you hope to achieve with our platform..."
                      className="min-h-[140px] text-base border-2 border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background/50 resize-none"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referral_source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">
                    How did you hear about us?
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 text-base border-2 border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background/50">
                        <SelectValue placeholder="Select source (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-background border-2 border-border/50 rounded-lg shadow-lg">
                      <SelectItem value="google" className="cursor-pointer hover:bg-muted">
                        Google Search
                      </SelectItem>
                      <SelectItem value="linkedin" className="cursor-pointer hover:bg-muted">
                        LinkedIn
                      </SelectItem>
                      <SelectItem value="referral" className="cursor-pointer hover:bg-muted">
                        Referral
                      </SelectItem>
                      <SelectItem value="conference" className="cursor-pointer hover:bg-muted">
                        Conference/Event
                      </SelectItem>
                      <SelectItem value="social-media" className="cursor-pointer hover:bg-muted">
                        Social Media
                      </SelectItem>
                      <SelectItem value="other" className="cursor-pointer hover:bg-muted">
                        Other
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col gap-4 pt-6 border-t border-border/50">
            <Button
              type="submit"
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting Request...
                </div>
              ) : (
                'Submit Access Request'
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have access?{' '}
              <a
                href="/recruiter/login"
                className="underline underline-offset-4 hover:text-primary font-medium transition-colors duration-200"
              >
                Sign in here
              </a>
            </div>
          </div>
        </form>
      </Form>
    </AuthCard>
  );
}
