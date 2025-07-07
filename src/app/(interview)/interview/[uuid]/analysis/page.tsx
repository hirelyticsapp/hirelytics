'use client';

import { AlertCircle, CheckCircle, Star, XCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { analyzeInterview, getInterviewAnalysis } from '@/actions/interview-analysis';
import { getJobApplicationByUuid } from '@/actions/job-application';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { type IInterviewAnalysis } from '@/db/schema/job-application';
import { cn } from '@/lib/utils';

interface JobApplicationData {
  candidate: {
    name: string;
    email: string;
  };
  jobDetails: {
    title: string;
    description: string;
    skills: string[];
  };
  status: string;
}

export default function InterviewAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const uuid = params.uuid as string;

  const [analysis, setAnalysis] = useState<IInterviewAnalysis | null>(null);
  const [jobApplication, setJobApplication] = useState<JobApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (uuid) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load job application data
      const jobData = await getJobApplicationByUuid(uuid);
      setJobApplication(jobData);

      // Try to load existing analysis
      const analysisResponse = await getInterviewAnalysis(uuid);
      if (analysisResponse.success && analysisResponse.analysis) {
        setAnalysis(analysisResponse.analysis);
      } else {
        // No existing analysis, trigger analysis
        await runAnalysis();
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load interview data');
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    try {
      setAnalyzing(true);
      setError(null);

      const result = await analyzeInterview(uuid);
      if (result.success && result.analysis) {
        setAnalysis(result.analysis);
      } else {
        setError(result.error || 'Failed to analyze interview');
      }
    } catch (err) {
      console.error('Error analyzing interview:', err);
      setError('Failed to analyze interview');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRecommendationBadge = (recommendation: string) => {
    const config = {
      strong_hire: {
        label: 'Strong Hire',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
      },
      hire: { label: 'Hire', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      borderline: {
        label: 'Borderline',
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertCircle,
      },
      no_hire: { label: 'No Hire', color: 'bg-red-100 text-red-800', icon: XCircle },
    };

    const rec = config[recommendation as keyof typeof config] || config.borderline;
    const Icon = rec.icon;

    return (
      <Badge className={cn('px-3 py-1', rec.color)}>
        <Icon className="w-4 h-4 mr-1" />
        {rec.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading interview analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (analyzing) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing interview responses...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="max-w-md mx-auto mt-12">
            <CardHeader>
              <CardTitle className="text-red-600">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={loadData} className="w-full">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!analysis || !jobApplication) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="max-w-md mx-auto mt-12">
            <CardHeader>
              <CardTitle>No Analysis Available</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">No interview analysis found.</p>
              <Button onClick={runAnalysis} className="w-full">
                Run Analysis
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-4">
            ← Back to Dashboard
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Interview Analysis</h1>
              <p className="text-gray-600 mt-2">
                {jobApplication.candidate.name} • {jobApplication.jobDetails.title}
              </p>
            </div>
            <div className="text-right">{getRecommendationBadge(analysis.recommendation)}</div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Overall Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <span className={cn('text-3xl font-bold', getScoreColor(analysis.overallScore))}>
                  {analysis.overallScore}
                </span>
                <span className="text-gray-400 ml-1">/100</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Technical Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <span
                  className={cn(
                    'text-3xl font-bold',
                    getScoreColor(analysis.technicalCompetency.score)
                  )}
                >
                  {analysis.technicalCompetency.score}
                </span>
                <span className="text-gray-400 ml-1">/100</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Communication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <span
                  className={cn(
                    'text-3xl font-bold',
                    getScoreColor(
                      Math.round(
                        (analysis.communicationSkills.clarity +
                          analysis.communicationSkills.confidence +
                          analysis.communicationSkills.articulation) /
                          3
                      )
                    )
                  )}
                >
                  {Math.round(
                    (analysis.communicationSkills.clarity +
                      analysis.communicationSkills.confidence +
                      analysis.communicationSkills.articulation) /
                      3
                  )}
                </span>
                <span className="text-gray-400 ml-1">/100</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Cultural Fit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <span
                  className={cn('text-3xl font-bold', getScoreColor(analysis.culturalFit.score))}
                >
                  {analysis.culturalFit.score}
                </span>
                <span className="text-gray-400 ml-1">/100</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skills Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Skills Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.skillsAssessment.map((skill, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{skill.skill}</span>
                        <span className={cn('font-bold', getScoreColor(skill.score))}>
                          {skill.score}/100
                        </span>
                      </div>
                      <Progress value={skill.score} className="h-2" />
                      <p className="text-sm text-gray-600">{skill.feedback}</p>
                      {skill.evidence.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Evidence:</p>
                          {skill.evidence.map((evidence, i) => (
                            <blockquote
                              key={i}
                              className="text-xs text-gray-600 italic border-l-2 border-gray-200 pl-2 ml-2"
                            >
                              &quot;{evidence}&quot;
                            </blockquote>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Question Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Question-by-Question Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analysis.questionAnalysis.map((qa, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                        <span className={cn('font-bold', getScoreColor(qa.score))}>
                          {qa.score}/100
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{qa.question}</p>
                      <div className="bg-gray-50 p-3 rounded mb-3">
                        <p className="text-sm text-gray-700">{qa.userResponse}</p>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{qa.feedback}</p>

                      {qa.strengths.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-green-600 mb-1">Strengths:</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {qa.strengths.map((strength, i) => (
                              <li key={i} className="flex items-start">
                                <span className="text-green-500 mr-1">•</span>
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {qa.areasForImprovement.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-yellow-600 mb-1">
                            Areas for Improvement:
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {qa.areasForImprovement.map((area, i) => (
                              <li key={i} className="flex items-start">
                                <span className="text-yellow-500 mr-1">•</span>
                                {area}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recommendation */}
            <Card>
              <CardHeader>
                <CardTitle>Recommendation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  {getRecommendationBadge(analysis.recommendation)}
                </div>
                <p className="text-sm text-gray-600">{analysis.recommendationReason}</p>
              </CardContent>
            </Card>

            {/* Communication Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Communication Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Clarity</span>
                    <span
                      className={cn(
                        'font-bold',
                        getScoreColor(analysis.communicationSkills.clarity)
                      )}
                    >
                      {analysis.communicationSkills.clarity}
                    </span>
                  </div>
                  <Progress value={analysis.communicationSkills.clarity} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Confidence</span>
                    <span
                      className={cn(
                        'font-bold',
                        getScoreColor(analysis.communicationSkills.confidence)
                      )}
                    >
                      {analysis.communicationSkills.confidence}
                    </span>
                  </div>
                  <Progress value={analysis.communicationSkills.confidence} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Articulation</span>
                    <span
                      className={cn(
                        'font-bold',
                        getScoreColor(analysis.communicationSkills.articulation)
                      )}
                    >
                      {analysis.communicationSkills.articulation}
                    </span>
                  </div>
                  <Progress value={analysis.communicationSkills.articulation} className="h-2" />
                </div>
                <Separator className="my-4" />
                <p className="text-sm text-gray-600">{analysis.communicationSkills.feedback}</p>
              </CardContent>
            </Card>

            {/* Strengths & Areas for Improvement */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">Strengths</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {analysis.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-1">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-yellow-600 mb-2">Areas for Improvement</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {analysis.areasForImprovement.map((area, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-yellow-500 mr-1">•</span>
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Feedback */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 leading-relaxed">{analysis.detailedFeedback}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Analysis completed on {new Date(analysis.analyzedAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
