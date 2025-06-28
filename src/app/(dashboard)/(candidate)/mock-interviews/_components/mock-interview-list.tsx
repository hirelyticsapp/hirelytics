'use client';
import { Users } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { IJob } from '@/db';
import { useTableParams } from '@/hooks/use-table-params';

import { useCandidateMockInterviewsQuery } from '../_hooks/use-candidate-mock-interview-queries';
import MockInterviewCard from './mock-interview-card';

export default function MockInterviewList() {
  const [refreshing, setRefreshing] = useState(false);
  const { pagination, filters, setSearch } = useTableParams();

  const {
    data: mockInterviewsData,
    isLoading,
    error,
    refetch,
  } = useCandidateMockInterviewsQuery(pagination, filters, []);

  const data = mockInterviewsData?.data || [];

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">Error loading mock interviews</p>
          <p className="text-sm text-gray-600">{error.message}</p>
          <Button onClick={handleRefresh} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search mock interviews..."
          value={filters.search || ''}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Mock Interviews Available</h3>
          <p className="text-muted-foreground">
            Check back later for new mock interview opportunities
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.map((mockInterview: Partial<IJob>) => (
            <MockInterviewCard key={mockInterview.id} mockInterview={mockInterview} />
          ))}
        </div>
      )}
    </div>
  );
}
