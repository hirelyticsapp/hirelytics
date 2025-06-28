# Hirelytics Development Instructions

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm package manager
- MongoDB database instance
- AWS S3 compatible storage
- Git for version control

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd hirelytics

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local
# Fill in required environment variables

# Start development server
pnpm dev
```

### Environment Configuration

Create `.env.local` with all required variables from `PROJECT_CONTEXT.md`.

## Development Guidelines

### Code Style & Standards

#### TypeScript Best Practices

- Use strict TypeScript configuration
- Define interfaces for all data structures
- Prefer type inference where possible
- Use utility types (Pick, Omit, Partial) for data manipulation

```typescript
// Good: Well-defined interface
interface CreateJobRequest {
  title: string;
  organizationId: string;
  industry: string;
  skills: string[];
}

// Good: Type-safe server action
export async function createJob(data: CreateJobRequest): Promise<Result<IJob>> {
  const validatedData = jobSchema.parse(data);
  // Implementation
}
```

#### Component Development

- Use functional components with hooks
- Implement proper prop types
- Follow single responsibility principle
- Use composition over inheritance

```typescript
// Good: Focused component with clear props
interface JobCardProps {
  job: IJob;
  onEdit: (jobId: string) => void;
  onDelete: (jobId: string) => void;
}

export function JobCard({ job, onEdit, onDelete }: JobCardProps) {
  // Implementation
}
```

#### Server Actions Pattern

- Keep server actions in `/src/actions/`
- Use proper error handling
- Implement input validation with Zod
- Return consistent response format

```typescript
'use server';

export async function updateJobStatus(
  jobId: string,
  status: JobStatus
): Promise<ActionResult<IJob>> {
  try {
    await connectToDatabase();
    const { user } = await auth();

    // Validation
    const validatedStatus = jobStatusSchema.parse(status);

    // Business logic
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { status: validatedStatus },
      { new: true }
    );

    return { success: true, data: updatedJob };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Database Development

#### Schema Design Principles

- Use consistent naming conventions
- Implement proper indexes for queries
- Include audit fields (createdAt, updatedAt, deletedAt)
- Use references for relationships

```typescript
// Good: Well-structured schema
const JobSchema = new Schema<IJob>({
  title: { type: String, required: true, maxlength: 100 },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  skills: { type: [String], required: true },
  status: { type: String, enum: ['draft', 'published', 'expired'], default: 'draft' },
  // Audit fields
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null },
});

// Indexes for common queries
JobSchema.index({ organizationId: 1, status: 1 });
JobSchema.index({ title: 'text', description: 'text' });
```

#### Query Optimization

- Use aggregation pipelines for complex queries
- Implement pagination for large datasets
- Use projections to limit returned fields

```typescript
// Good: Optimized query with pagination
export async function fetchJobs(
  pagination: PaginationState,
  filters: TableFilters
): Promise<TableData<IJob>> {
  const skip = pagination.pageIndex * pagination.pageSize;

  const jobs = await Job.find(buildFilterQuery(filters))
    .populate('organizationId', 'name slug')
    .select('-questionsConfig.questions') // Exclude large fields
    .skip(skip)
    .limit(pagination.pageSize)
    .sort({ createdAt: -1 });

  const total = await Job.countDocuments(buildFilterQuery(filters));

  return {
    data: jobs,
    total,
    pageCount: Math.ceil(total / pagination.pageSize),
  };
}
```

### Frontend Development

#### Component Structure

```
components/
├── ui/           # Base UI components (Button, Input, etc.)
├── forms/        # Form-specific components
├── data-table/   # Table components
├── layout/       # Layout components
└── feature/      # Feature-specific components
```

#### State Management

- Use React Query for server state
- Local state with useState/useReducer
- Context for shared application state

```typescript
// Good: Server state with React Query
export function useJobs(filters: TableFilters) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => fetchJobs(DEFAULT_PAGINATION, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Good: Local state management
export function useJobForm(initialData?: Partial<IJob>) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<JobFormData>(initialData || {});

  const updateFormData = useCallback((stepData: Partial<JobFormData>) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
  }, []);

  return { currentStep, formData, setCurrentStep, updateFormData };
}
```

#### Form Development

- Use React Hook Form with Zod validation
- Implement multi-step forms for complex workflows
- Provide clear error messages and feedback

```typescript
// Good: Form with validation
export function JobBasicDetailsForm({ onSubmit, initialData }: FormProps) {
  const form = useForm<BasicJobDetails>({
    resolver: zodResolver(basicJobDetailsSchema),
    defaultValues: initialData
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title *</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Senior Software Engineer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* More fields */}
      </form>
    </Form>
  );
}
```

### API Development

#### Route Handlers

- Follow RESTful conventions
- Implement proper HTTP status codes
- Use middleware for authentication

```typescript
// Good: RESTful API route
export async function GET(request: NextRequest) {
  try {
    const { user } = await auth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await fetchUserData(user.id);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

#### AI Integration

- Implement fallback mechanisms
- Handle API rate limits
- Provide mock data for development

```typescript
// Good: AI integration with fallbacks
export async function generateJobDescription(params: GenerationParams) {
  try {
    // Try AI generation first
    const aiResult = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: buildPrompt(params) }],
    });

    return {
      success: true,
      data: aiResult.choices[0].message.content,
      source: 'ai',
    };
  } catch (error) {
    // Fallback to templates
    console.warn('AI generation failed, using template:', error);
    return {
      success: true,
      data: getTemplateDescription(params),
      source: 'template',
    };
  }
}
```

### Interview System Development

#### Video Call Components

- Implement WebRTC for real-time communication
- Handle device permissions gracefully
- Provide fallback options for poor connections

```typescript
// Good: Video call hook
export function useVideoCall() {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const startCall = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMediaStream(stream);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to start video call:', error);
      // Handle permission denied, device not found, etc.
    }
  }, []);

  const endCall = useCallback(() => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
      setIsConnected(false);
    }
  }, [mediaStream]);

  return { mediaStream, isConnected, startCall, endCall };
}
```

#### Recording and Monitoring

- Implement periodic snapshots
- Handle storage efficiently
- Respect privacy settings

```typescript
// Good: Monitoring implementation
export function useInterviewMonitoring(config: InterviewConfig) {
  const [snapshots, setSnapshots] = useState<Blob[]>([]);

  useEffect(() => {
    if (!config.screenMonitoring) return;

    const interval = setInterval(async () => {
      try {
        const canvas = await html2canvas(document.body);
        canvas.toBlob((blob) => {
          if (blob) {
            setSnapshots((prev) => [...prev, blob]);
            // Upload to storage
            uploadSnapshot(blob);
          }
        });
      } catch (error) {
        console.error('Failed to capture snapshot:', error);
      }
    }, config.screenMonitoringInterval * 1000);

    return () => clearInterval(interval);
  }, [config]);

  return { snapshots };
}
```

### Testing Guidelines

#### Unit Testing

- Test business logic thoroughly
- Mock external dependencies
- Use descriptive test names

```typescript
// Good: Comprehensive test
describe('generateJobDescription', () => {
  it('should return AI-generated content when API succeeds', async () => {
    // Arrange
    const mockParams = { title: 'Software Engineer', industry: 'Technology' };
    jest.mocked(openai.chat.completions.create).mockResolvedValue(mockAIResponse);

    // Act
    const result = await generateJobDescription(mockParams);

    // Assert
    expect(result.success).toBe(true);
    expect(result.source).toBe('ai');
    expect(result.data).toContain('Software Engineer');
  });

  it('should fallback to template when AI fails', async () => {
    // Test fallback behavior
  });
});
```

#### Integration Testing

- Test API endpoints
- Verify database operations
- Test authentication flows

```typescript
// Good: API integration test
describe('/api/jobs', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  it('should create job when authenticated', async () => {
    const response = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${validToken}`)
      .send(validJobData);

    expect(response.status).toBe(201);
    expect(response.body.data.title).toBe(validJobData.title);
  });
});
```

### Performance Guidelines

#### Frontend Optimization

- Use React.memo for expensive components
- Implement virtualization for large lists
- Optimize images and assets

```typescript
// Good: Optimized component
const JobCard = React.memo(({ job, onEdit, onDelete }: JobCardProps) => {
  const handleEdit = useCallback(() => onEdit(job.id), [job.id, onEdit]);
  const handleDelete = useCallback(() => onDelete(job.id), [job.id, onDelete]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{job.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleEdit}>Edit</Button>
        <Button onClick={handleDelete}>Delete</Button>
      </CardContent>
    </Card>
  );
});
```

#### Backend Optimization

- Use database indexes strategically
- Implement caching where appropriate
- Optimize queries and aggregations

```typescript
// Good: Cached query
const getCachedJobStats = unstable_cache(
  async (organizationId: string) => {
    return await Job.aggregate([
      { $match: { organizationId: new Types.ObjectId(organizationId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
  },
  ['job-stats'],
  { revalidate: 300 } // 5 minutes
);
```

### Security Best Practices

#### Input Validation

- Validate all inputs with Zod schemas
- Sanitize user-generated content
- Implement rate limiting

```typescript
// Good: Comprehensive validation
const createJobSchema = z.object({
  title: z.string().min(1).max(100),
  organizationId: z.string().refine(Types.ObjectId.isValid),
  skills: z.array(z.string()).min(1).max(20),
  salary: z.string().optional(),
});

export async function createJob(rawData: unknown) {
  const data = createJobSchema.parse(rawData);
  // Proceed with validated data
}
```

#### Authentication

- Verify permissions for all operations
- Use secure session management
- Implement CSRF protection

```typescript
// Good: Permission check
export async function updateJob(jobId: string, updates: Partial<IJob>) {
  const { user } = await auth();
  if (!user) throw new Error('Unauthorized');

  const job = await Job.findById(jobId);
  if (!job) throw new Error('Job not found');

  // Check if user has permission to update this job
  const hasPermission = await checkJobUpdatePermission(user, job);
  if (!hasPermission) throw new Error('Forbidden');

  return await Job.findByIdAndUpdate(jobId, updates, { new: true });
}
```

### Deployment Guidelines

#### Environment Setup

- Use different configurations for dev/staging/prod
- Implement proper logging
- Set up monitoring and alerts

```typescript
// Good: Environment-specific configuration
const config = {
  development: {
    logLevel: 'debug',
    enableDevTools: true,
    aiMockMode: true,
  },
  production: {
    logLevel: 'error',
    enableDevTools: false,
    aiMockMode: false,
  },
}[process.env.NODE_ENV || 'development'];
```

#### Database Migrations

- Version control schema changes
- Implement rollback strategies
- Test migrations thoroughly

```typescript
// Good: Migration script
export async function migrateJobsToNewSchema() {
  const jobs = await Job.find({ schemaVersion: { $lt: 2 } });

  for (const job of jobs) {
    await Job.findByIdAndUpdate(job._id, {
      $set: {
        'questionsConfig.mode': job.questionsConfig.mode || 'manual',
        schemaVersion: 2,
      },
    });
  }

  console.log(`Migrated ${jobs.length} jobs to schema version 2`);
}
```

### Feature Development Process

#### 1. Planning Phase

- Create detailed technical specifications
- Define acceptance criteria
- Plan database schema changes
- Design API contracts

#### 2. Implementation Phase

- Create feature branch from main
- Implement backend changes first
- Add frontend components
- Write comprehensive tests

#### 3. Review Phase

- Code review checklist
- Test coverage verification
- Performance impact assessment
- Security review

#### 4. Deployment Phase

- Deploy to staging environment
- Run integration tests
- Perform user acceptance testing
- Deploy to production with monitoring

### Common Patterns

#### Error Handling

```typescript
// Good: Consistent error handling
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string
): Promise<Result<T>> {
  try {
    const result = await operation();
    return { success: true, data: result };
  } catch (error) {
    console.error(`Error in ${context}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

#### Data Fetching

```typescript
// Good: Reusable data fetching hook
export function useApiData<T>(
  key: string[],
  fetcher: () => Promise<T>,
  options?: UseQueryOptions<T>
) {
  return useQuery({
    queryKey: key,
    queryFn: fetcher,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}
```

### Troubleshooting Common Issues

#### MongoDB Connection Issues

- Check connection string format
- Verify network connectivity
- Review authentication credentials

#### Video Call Problems

- Check browser permissions
- Verify HTTPS requirement
- Test different browsers

#### Build Errors

- Clear node_modules and reinstall
- Check TypeScript configuration
- Verify environment variables

Follow these guidelines to maintain code quality, security, and performance while developing new features for the Hirelytics platform.
