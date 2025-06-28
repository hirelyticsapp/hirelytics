import { Calendar, Clock, MapPin, PlayCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { IJob } from '@/db';

interface MockInterviewCardProps {
  mockInterview: Partial<IJob>;
}

export default function MockInterviewCard({ mockInterview }: MockInterviewCardProps) {
  const handleStartInterview = () => {
    // Navigate to the interview page
    window.location.href = `/interview/${mockInterview.id}`;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">{mockInterview.title}</CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary" className="capitalize">
            {mockInterview.industry}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {mockInterview.location}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {mockInterview.interviewConfig?.duration || 30} minutes
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Expires: {new Date(mockInterview.expiryDate!).toLocaleDateString()}
          </div>

          {mockInterview.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {mockInterview.description}
            </p>
          )}

          {mockInterview.skills && mockInterview.skills.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Skills Required:</p>
              <div className="flex flex-wrap gap-1">
                {mockInterview.skills.slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {mockInterview.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{mockInterview.skills.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={handleStartInterview} className="w-full">
          <PlayCircle className="mr-2 h-4 w-4" />
          Start Practice Interview
        </Button>
      </CardFooter>
    </Card>
  );
}
