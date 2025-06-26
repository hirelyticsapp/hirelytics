'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PaginationState, SortingState } from '@tanstack/react-table';

import { TableFilters } from '@/@types/table';
import {
  createJobFromBasicDetails,
  deleteJob,
  fetchJobs,
  generateInterviewQuestions,
  generateJobDescription,
  getJobById,
  publishJob,
  updateJobBasicDetails,
  updateJobDescription,
  updateJobInterviewConfig,
  updateJobQuestionsConfig,
} from '@/actions/job';
import type {
  BasicJobDetails,
  InterviewConfig,
  JobDescription,
  QuestionsConfig,
} from '@/lib/schemas/job-schemas';

// Query Keys
export const jobQueryKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobQueryKeys.all, 'list'] as const,
  list: (filters: TableFilters, pagination: PaginationState, sorting: SortingState) =>
    [...jobQueryKeys.lists(), { filters, pagination, sorting }] as const,
  details: () => [...jobQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobQueryKeys.details(), id] as const,
};

// Fetch Jobs Query
export function useJobsQuery(
  pagination: PaginationState,
  filters: TableFilters,
  sorting: SortingState
) {
  return useQuery({
    queryKey: jobQueryKeys.list(filters, pagination, sorting),
    queryFn: () => fetchJobs(pagination, filters, sorting),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get Job by ID Query
export function useJobQuery(jobId: string) {
  return useQuery({
    queryKey: jobQueryKeys.detail(jobId),
    queryFn: () => getJobById(jobId),
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create Job Mutation
export function useCreateJobMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { jobData: BasicJobDetails; recruiterId?: string }) =>
      createJobFromBasicDetails(data.jobData, data.recruiterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.lists() });
    },
  });
}

// Update Job Basic Details Mutation
export function useUpdateJobBasicDetailsMutation(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BasicJobDetails) => updateJobBasicDetails(jobId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.detail(jobId) });
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.lists() });
    },
  });
}

// Update Job Description Mutation
export function useUpdateJobDescriptionMutation(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JobDescription) => updateJobDescription(jobId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.detail(jobId) });
    },
  });
}

// Update Job Interview Config Mutation
export function useUpdateJobInterviewConfigMutation(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InterviewConfig) => updateJobInterviewConfig(jobId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.detail(jobId) });
    },
  });
}

// Update Job Questions Config Mutation
export function useUpdateJobQuestionsConfigMutation(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: QuestionsConfig) => updateJobQuestionsConfig(jobId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.detail(jobId) });
    },
  });
}

// Publish Job Mutation
export function usePublishJobMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => publishJob(jobId),
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.detail(jobId) });
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.lists() });
    },
  });
}

// Delete Job Mutation
export function useDeleteJobMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.lists() });
    },
  });
}

// Generate Job Description Mutation
export function useGenerateJobDescriptionMutation() {
  return useMutation({
    mutationFn: (params: {
      jobTitle: string;
      industry: string;
      skills: string[];
      location: string;
    }) => generateJobDescription(params.jobTitle, params.industry, params.skills, params.location),
  });
}

// Generate Interview Questions Mutation
export function useGenerateInterviewQuestionsMutation() {
  return useMutation({
    mutationFn: (params: {
      industry: string;
      jobTitle: string;
      difficultyLevel: string;
      questionTypes: string[];
      totalQuestions: number;
    }) =>
      generateInterviewQuestions(
        params.industry,
        params.jobTitle,
        params.difficultyLevel,
        params.questionTypes,
        params.totalQuestions
      ),
  });
}
