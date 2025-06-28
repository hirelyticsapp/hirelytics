# Component Patterns & UI Architecture Context

## Overview

This document provides comprehensive context about component patterns, UI architecture, and design system used throughout the Hirelytics platform.

## Component Architecture

### Component Organization

```
src/components/
├── ui/                    # Base Shadcn/ui components
│   ├── button.tsx
│   ├── input.tsx
│   ├── form.tsx
│   ├── card.tsx
│   └── ...
├── data-table/           # Data table components
│   ├── data-table.tsx
│   └── data-table-*.tsx
├── icons/                # Custom icon components
├── file-dropzone.tsx     # File upload components
├── media-check.tsx       # Device testing components
└── s3-signed-image.tsx   # Image handling components
```

### Design System Patterns

#### Base Component Structure

```typescript
// Standard component interface pattern
interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
}

// Component with forwarded ref pattern
const Component = React.forwardRef<
  HTMLElementType,
  ComponentProps
>(({ className, variant = "default", size = "default", ...props }, ref) => {
  return (
    <ElementType
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      ref={ref}
      {...props}
    />
  );
});
Component.displayName = "Component";
```

#### Variant System

```typescript
// Component variant configuration using cva
const componentVariants = cva(
  'base-classes', // Base styles
  {
    variants: {
      variant: {
        default: 'default-styles',
        destructive: 'destructive-styles',
        outline: 'outline-styles',
        secondary: 'secondary-styles',
        ghost: 'ghost-styles',
        link: 'link-styles',
      },
      size: {
        default: 'default-size',
        sm: 'small-size',
        lg: 'large-size',
        icon: 'icon-size',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

## Form Component Patterns

### Form Architecture with React Hook Form + Zod

```typescript
// Form component structure
interface FormComponentProps<T extends FieldValues> {
  schema: ZodSchema<T>;
  defaultValues?: Partial<T>;
  onSubmit: (data: T) => Promise<void> | void;
  submitLabel?: string;
  className?: string;
}

// Standard form pattern
function FormComponent<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  submitLabel = "Submit",
  className
}: FormComponentProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onChange"
  });

  const handleSubmit = async (data: T) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      // Handle form errors
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={cn("space-y-6", className)}>
        {/* Form fields */}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Loading..." : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
```

### Form Field Patterns

```typescript
// Standard form field component
interface FormFieldComponentProps {
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  type?: "text" | "email" | "password" | "number" | "textarea" | "select";
  options?: Array<{ label: string; value: string }>;
}

// Form field implementation
function FormFieldComponent({ name, label, type = "text", ...props }: FormFieldComponentProps) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={props.required ? "required" : ""}>{label}</FormLabel>
          <FormControl>
            {type === "textarea" ? (
              <Textarea {...field} {...props} />
            ) : type === "select" ? (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder={props.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {props.options?.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input type={type} {...field} {...props} />
            )}
          </FormControl>
          {props.description && <FormDescription>{props.description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
```

## Layout Component Patterns

### Authentication Layout

```typescript
// Auth layout pattern
interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showLogo?: boolean;
}

function AuthLayout({ children, title, subtitle, showLogo = true }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <AuthCard className="w-full max-w-md">
        {showLogo && (
          <div className="text-center mb-6">
            <HirelyticsLogo className="mx-auto h-12 w-auto" />
          </div>
        )}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-600 mt-2">{subtitle}</p>}
        </div>
        {children}
      </AuthCard>
    </div>
  );
}
```

### Dashboard Layout

```typescript
// Dashboard layout pattern
interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

function DashboardLayout({ children, sidebar, header, breadcrumbs }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      {sidebar && (
        <aside className="w-64 bg-white shadow-sm border-r">
          {sidebar}
        </aside>
      )}
      <main className="flex-1 flex flex-col overflow-hidden">
        {header && (
          <header className="bg-white shadow-sm border-b px-6 py-4">
            {header}
          </header>
        )}
        {breadcrumbs && (
          <div className="px-6 py-3 bg-gray-50 border-b">
            <Breadcrumb items={breadcrumbs} />
          </div>
        )}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
```

## Data Table Patterns

### DataTable Component Structure

```typescript
// Data table interface
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  loading?: boolean;
  pagination?: {
    pageSize: number;
    pageIndex: number;
    pageCount: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  filters?: FilterConfig[];
  actions?: TableAction<TData>[];
}

// Data table implementation
function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  loading = false,
  pagination,
  filters,
  actions
}: DataTableProps<TData, TValue>) {
  // Table state management
  // Filtering logic
  // Sorting logic
  // Pagination logic

  return (
    <div className="space-y-4">
      {/* Table toolbar */}
      <DataTableToolbar
        searchKey={searchKey}
        filters={filters}
        actions={actions}
      />

      {/* Table content */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {/* Header rows */}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeleton columns={columns.length} />
            ) : (
              /* Data rows */
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && <DataTablePagination {...pagination} />}
    </div>
  );
}
```

### Column Definition Patterns

```typescript
// Standard column definitions
const jobsColumns: ColumnDef<Job>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Job Title" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return <StatusBadge status={status} />;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <DataTableRowActions row={row} actions={jobActions} />
    ),
  },
];
```

## Modal & Dialog Patterns

### Modal Component Structure

```typescript
// Modal interface
interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}

// Modal implementation
function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(modalSizes[size])}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        {showCloseButton && (
          <DialogClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
          </DialogClose>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

### Confirmation Dialog Pattern

```typescript
// Confirmation dialog hook
function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ConfirmConfig | null>(null);

  const confirm = (config: ConfirmConfig): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfig({ ...config, onConfirm: resolve });
      setIsOpen(true);
    });
  };

  const ConfirmDialog = () => (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{config?.title}</AlertDialogTitle>
          <AlertDialogDescription>{config?.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => config?.onConfirm(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => config?.onConfirm(true)}>
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { confirm, ConfirmDialog };
}
```

## Loading & Error State Patterns

### Loading States

```typescript
// Loading component variants
interface LoadingProps {
  variant?: 'spinner' | 'skeleton' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

// Loading implementations
const LoadingSpinner = ({ size = 'md', text, className }: LoadingProps) => (
  <div className={cn("flex items-center justify-center space-x-2", className)}>
    <Loader2 className={cn("animate-spin", loadingSizes[size])} />
    {text && <span className="text-sm text-muted-foreground">{text}</span>}
  </div>
);

const LoadingSkeleton = ({ className }: LoadingProps) => (
  <div className={cn("animate-pulse", className)}>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
    <div className="h-4 bg-gray-200 rounded w-1/2" />
  </div>
);
```

### Error Boundary Pattern

```typescript
// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} />;
    }

    return this.props.children;
  }
}
```

## Responsive Design Patterns

### Responsive Component Structure

```typescript
// Responsive breakpoint utilities
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Responsive hook
function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<string>('md');

  useEffect(() => {
    const checkBreakpoint = () => {
      if (window.innerWidth >= 1280) setBreakpoint('xl');
      else if (window.innerWidth >= 1024) setBreakpoint('lg');
      else if (window.innerWidth >= 768) setBreakpoint('md');
      else setBreakpoint('sm');
    };

    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  return breakpoint;
}

// Mobile-first responsive patterns
const ResponsiveGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {children}
  </div>
);
```

## Animation & Transition Patterns

### Framer Motion Integration

```typescript
// Animation variants
const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const slideInVariants = {
  hidden: { x: -100, opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: 100, opacity: 0 }
};

// Animated component wrapper
const AnimatedCard = ({ children, ...props }: CardProps) => (
  <motion.div
    variants={fadeInVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    transition={{ duration: 0.3 }}
  >
    <Card {...props}>{children}</Card>
  </motion.div>
);
```

This component patterns context provides Copilot with comprehensive understanding of your UI architecture, component structure, and design patterns for consistent code suggestions.
