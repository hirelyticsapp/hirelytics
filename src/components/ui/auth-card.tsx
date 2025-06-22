import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AuthCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function AuthCard({
  title,
  description,
  children,
  className,
  headerClassName,
  contentClassName,
}: AuthCardProps) {
  return (
    <Card
      className={cn(
        'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-xl border-0 ring-1 ring-black/5 dark:ring-white/10',
        className
      )}
    >
      <CardHeader className={cn('text-center pb-4', headerClassName)}>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-base text-gray-600 dark:text-gray-300 mt-2">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className={cn('pt-0', contentClassName)}>{children}</CardContent>
    </Card>
  );
}
