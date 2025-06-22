'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface EmailPhaseProps {
  onSubmit: (email: string) => Promise<void>;
  isLoading?: boolean;
  loadingText?: string;
}

export default function EmailPhase({ onSubmit, isLoading = false, loadingText }: EmailPhaseProps) {
  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleSubmit = async (data: EmailFormData) => {
    await onSubmit(data.email);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <CardContent className="space-y-6 py-6">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
              <Mail className="w-6 h-6 text-primary" />
            </div>
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-sm font-medium">Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter your email" className="h-11" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-2 pb-6 px-6">
          <Button type="submit" className="w-full h-11" disabled={isLoading}>
            {isLoading ? loadingText || 'Sending...' : 'Continue'}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}
