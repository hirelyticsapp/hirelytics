# Validation Context & Patterns

## Overview

This document provides comprehensive context about validation patterns, error handling, and data integrity measures used throughout the Hirelytics platform.

## Validation Architecture

### Multi-Layer Validation Strategy

```
1. Client-Side Validation (Immediate Feedback)
   ├── Form Field Validation (React Hook Form + Zod)
   ├── Real-time Validation (onChange/onBlur)
   ├── Type Safety (TypeScript)
   └── UI Feedback (Error messages, visual indicators)

2. API Layer Validation (Security & Consistency)
   ├── Request Schema Validation (Zod)
   ├── Authentication Validation (JWT/Session)
   ├── Authorization Validation (Role-based)
   └── Rate Limiting (Abuse prevention)

3. Database Layer Validation (Data Integrity)
   ├── Mongoose Schema Validation
   ├── Unique Constraints
   ├── Custom Validators
   └── Default Values
```

## Client-Side Validation Patterns

### Form Validation with React Hook Form + Zod

```typescript
// Form Schema Definition
const jobFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Job title is required')
    .max(100, 'Title cannot exceed 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_.]+$/, 'Title contains invalid characters'),

  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase(),

  skills: z
    .array(z.string())
    .min(1, 'At least one skill is required')
    .max(20, 'Maximum 20 skills allowed'),

  salary: z
    .string()
    .optional()
    .refine((val) => !val || /^\d+$/.test(val), 'Salary must be a number'),

  expiryDate: z
    .date({
      required_error: 'Expiry date is required',
      invalid_type_error: 'Please select a valid date',
    })
    .refine((date) => date > new Date(), 'Expiry date must be in the future'),
});

// Form Hook Implementation
export function useJobForm(defaultValues?: Partial<JobFormData>) {
  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: '',
      email: '',
      skills: [],
      salary: '',
      expiryDate: undefined,
      ...defaultValues,
    },
    mode: 'onChange', // Real-time validation
  });

  return form;
}
```

### Real-time Validation Patterns

```typescript
// Field-level validation with debouncing
export function useFieldValidation<T>(
  value: T,
  validator: (value: T) => string | null,
  delay = 300
) {
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    setIsValidating(true);
    const timeoutId = setTimeout(() => {
      const validationError = validator(value);
      setError(validationError);
      setIsValidating(false);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, validator, delay]);

  return { error, isValidating };
}

// Email uniqueness validation
export function useEmailValidation(email: string) {
  return useQuery({
    queryKey: ['email-validation', email],
    queryFn: async () => {
      if (!email || !z.string().email().safeParse(email).success) {
        return null;
      }

      const response = await fetch('/api/validate/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      return result.exists ? 'Email is already registered' : null;
    },
    enabled: !!email,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### Form Error Display Patterns

```typescript
// Error Display Component
interface FormErrorProps {
  error?: FieldError;
  touched?: boolean;
}

export function FormError({ error, touched }: FormErrorProps) {
  if (!error || !touched) return null;

  return (
    <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
      <AlertCircle size={14} />
      {error.message}
    </p>
  );
}

// Field Wrapper with Validation
interface ValidatedFieldProps {
  label: string;
  error?: FieldError;
  touched?: boolean;
  required?: boolean;
  children: React.ReactNode;
}

export function ValidatedField({
  label,
  error,
  touched,
  required,
  children
}: ValidatedFieldProps) {
  const hasError = error && touched;

  return (
    <div className="space-y-2">
      <Label className={cn(
        "text-sm font-medium",
        hasError && "text-red-600 dark:text-red-400"
      )}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <div className={cn(
        "relative",
        hasError && "ring-2 ring-red-500 rounded-md"
      )}>
        {children}
      </div>

      <FormError error={error} touched={touched} />
    </div>
  );
}
```

## API Layer Validation

### Request Validation Pattern

```typescript
// API Route Validation
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate with Zod schema
    const validationResult = requestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request data',
          errors: validationResult.error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
            code: err.code,
          })),
        },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { data } = validationResult;

    // Proceed with validated data
    // ... business logic
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Authentication Validation

```typescript
// JWT Token Validation
export async function validateAuthToken(request: NextRequest) {
  try {
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error('No authentication token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // Validate token structure
    const tokenSchema = z.object({
      userId: z.string(),
      email: z.string().email(),
      role: z.enum(['admin', 'recruiter', 'user']),
      iat: z.number(),
      exp: z.number(),
    });

    const validatedToken = tokenSchema.parse(decoded);

    // Check if token is expired
    if (validatedToken.exp < Date.now() / 1000) {
      throw new Error('Token has expired');
    }

    return validatedToken;
  } catch (error) {
    throw new Error('Invalid authentication token');
  }
}

// Role-based Authorization
export function requireRole(allowedRoles: UserRole[]) {
  return async (request: NextRequest) => {
    const token = await validateAuthToken(request);

    if (!allowedRoles.includes(token.role)) {
      throw new Error('Insufficient permissions');
    }

    return token;
  };
}
```

### Rate Limiting Validation

```typescript
// Rate Limiting Implementation
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

export function rateLimit(identifier: string, maxRequests: number, windowMs: number) {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Clean old entries
  Object.keys(rateLimitStore).forEach((key) => {
    if (rateLimitStore[key].resetTime < windowStart) {
      delete rateLimitStore[key];
    }
  });

  // Check current limit
  const current = rateLimitStore[identifier];

  if (!current) {
    rateLimitStore[identifier] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (current.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
    };
  }

  current.count++;
  return {
    allowed: true,
    remaining: maxRequests - current.count,
  };
}
```

## Database Layer Validation

### Mongoose Schema Validation

```typescript
// User Schema with Validation
const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
    validate: {
      validator: function (v: string) {
        return /^[a-zA-Z\s]+$/.test(v);
      },
      message: 'Name can only contain letters and spaces',
    },
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function (v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address',
    },
  },

  role: {
    type: String,
    enum: {
      values: ['admin', 'recruiter', 'user'],
      message: 'Role must be admin, recruiter, or user',
    },
    required: [true, 'Role is required'],
  },
});

// Custom validation methods
UserSchema.pre('save', async function (next) {
  if (this.isModified('email')) {
    // Check email uniqueness
    const existingUser = await this.constructor.findOne({
      email: this.email,
      _id: { $ne: this._id },
    });

    if (existingUser) {
      throw new Error('Email is already registered');
    }
  }

  next();
});
```

### Custom Validators

```typescript
// ObjectId Validation
export const objectIdValidator = {
  validator: function (v: string) {
    return mongoose.Types.ObjectId.isValid(v);
  },
  message: 'Invalid ObjectId format',
};

// Date Range Validation
export const futureDateValidator = {
  validator: function (v: Date) {
    return v > new Date();
  },
  message: 'Date must be in the future',
};

// Array Length Validation
export const arrayLengthValidator = (min: number, max: number) => ({
  validator: function (v: any[]) {
    return v.length >= min && v.length <= max;
  },
  message: `Array length must be between ${min} and ${max}`,
});
```

## Error Handling Patterns

### Centralized Error Processing

```typescript
// Error Types
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

// Error Response Builder
export function buildErrorResponse(type: ErrorType, message: string, details?: any) {
  const statusCodes = {
    [ErrorType.VALIDATION_ERROR]: 400,
    [ErrorType.AUTHENTICATION_ERROR]: 401,
    [ErrorType.AUTHORIZATION_ERROR]: 403,
    [ErrorType.NOT_FOUND_ERROR]: 404,
    [ErrorType.RATE_LIMIT_ERROR]: 429,
    [ErrorType.DATABASE_ERROR]: 500,
    [ErrorType.INTERNAL_ERROR]: 500,
  };

  return NextResponse.json(
    {
      success: false,
      error: {
        type,
        message,
        details,
      },
    },
    {
      status: statusCodes[type],
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
```

### Validation Error Formatting

```typescript
// Zod Error Formatter
export function formatZodError(error: z.ZodError) {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
    value: err.input,
  }));
}

// Mongoose Error Formatter
export function formatMongooseError(error: mongoose.Error.ValidationError) {
  return Object.entries(error.errors).map(([field, err]) => ({
    field,
    message: err.message,
    value: err.value,
  }));
}
```

## Validation Best Practices

### Schema Design Principles

1. **Fail Fast**: Validate at the earliest possible layer
2. **Clear Messages**: Provide actionable error messages
3. **Consistent Structure**: Use consistent validation patterns
4. **Performance**: Cache validation results where appropriate
5. **Security**: Sanitize and escape user inputs

### Validation Hierarchy

```
1. Type Safety (TypeScript) - Compile-time validation
2. Schema Validation (Zod) - Runtime validation
3. Business Logic Validation - Domain-specific rules
4. Database Constraints - Data integrity enforcement
```

### Error Message Guidelines

- **Specific**: "Email is required" instead of "Invalid input"
- **Actionable**: "Password must contain at least 8 characters"
- **User-friendly**: Avoid technical jargon
- **Contextual**: Include field names and expected formats

This validation context provides comprehensive patterns for maintaining data integrity and user experience throughout the Hirelytics platform.
