import { Clock, Edit3, Eye, Trash2 } from 'lucide-react';

// Job status options
export const jobStatuses = [
  {
    value: 'draft',
    label: 'Draft',
    description: 'Save as draft to edit later',
    icon: Edit3,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    value: 'published',
    label: 'Published',
    description: 'Active and visible to candidates',
    icon: Eye,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    value: 'expired',
    label: 'Expired',
    description: 'No longer accepting applications',
    icon: Clock,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  {
    value: 'deleted',
    label: 'Deleted',
    description: 'Job has been marked as deleted',
    icon: Trash2,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
];

// Industry-specific question types
export const questionTypesByIndustry = {
  technology: [
    {
      value: 'technical-coding',
      label: 'Coding & Algorithms',
      description: 'Programming challenges and problem-solving',
    },
    {
      value: 'technical-system',
      label: 'System Design',
      description: 'Architecture and scalability questions',
    },
    {
      value: 'technical-tools',
      label: 'Tools & Technologies',
      description: 'Framework and technology-specific questions',
    },
    {
      value: 'behavioral',
      label: 'Behavioral',
      description: 'Teamwork and problem-solving scenarios',
    },
    {
      value: 'experience',
      label: 'Experience-based',
      description: 'Past project and achievement questions',
    },
  ],
  healthcare: [
    {
      value: 'clinical',
      label: 'Clinical Knowledge',
      description: 'Medical procedures and patient care',
    },
    {
      value: 'regulatory',
      label: 'Regulatory & Compliance',
      description: 'Healthcare regulations and standards',
    },
    {
      value: 'patient-care',
      label: 'Patient Care',
      description: 'Patient interaction and care scenarios',
    },
    { value: 'behavioral', label: 'Behavioral', description: 'Teamwork and ethical scenarios' },
    {
      value: 'emergency',
      label: 'Emergency Response',
      description: 'Crisis management and quick decision-making',
    },
  ],
  finance: [
    {
      value: 'analytical',
      label: 'Financial Analysis',
      description: 'Market analysis and financial modeling',
    },
    {
      value: 'regulatory',
      label: 'Regulatory & Compliance',
      description: 'Financial regulations and risk management',
    },
    {
      value: 'market-knowledge',
      label: 'Market Knowledge',
      description: 'Industry trends and market dynamics',
    },
    {
      value: 'behavioral',
      label: 'Behavioral',
      description: 'Client relationship and decision-making',
    },
    {
      value: 'quantitative',
      label: 'Quantitative Skills',
      description: 'Mathematical and statistical problem-solving',
    },
  ],
  education: [
    {
      value: 'pedagogical',
      label: 'Teaching Methods',
      description: 'Educational strategies and lesson planning',
    },
    {
      value: 'curriculum',
      label: 'Curriculum Design',
      description: 'Course development and learning objectives',
    },
    {
      value: 'classroom-management',
      label: 'Classroom Management',
      description: 'Student engagement and discipline',
    },
    {
      value: 'behavioral',
      label: 'Behavioral',
      description: 'Student interaction and conflict resolution',
    },
    {
      value: 'assessment',
      label: 'Assessment & Evaluation',
      description: 'Student evaluation and feedback methods',
    },
  ],
  marketing: [
    {
      value: 'strategic',
      label: 'Marketing Strategy',
      description: 'Campaign planning and market positioning',
    },
    {
      value: 'digital',
      label: 'Digital Marketing',
      description: 'Online marketing and social media strategies',
    },
    {
      value: 'analytics',
      label: 'Analytics & Data',
      description: 'Marketing metrics and performance analysis',
    },
    {
      value: 'behavioral',
      label: 'Behavioral',
      description: 'Creativity and client relationship scenarios',
    },
    {
      value: 'creative',
      label: 'Creative Thinking',
      description: 'Innovation and campaign ideation',
    },
  ],
  other: [
    {
      value: 'behavioral',
      label: 'Behavioral Questions',
      description: 'General behavioral and situational questions',
    },
    {
      value: 'technical',
      label: 'Technical Questions',
      description: 'Role-specific technical knowledge',
    },
    {
      value: 'situational',
      label: 'Situational Questions',
      description: 'Hypothetical work scenarios',
    },
    {
      value: 'experience',
      label: 'Experience-based Questions',
      description: 'Past achievements and learnings',
    },
    {
      value: 'culture-fit',
      label: 'Culture Fit Questions',
      description: 'Values and company culture alignment',
    },
  ],
};

// Question generation modes
export const questionModes = [
  {
    value: 'manual',
    label: 'Manual Questions',
    description: 'Create custom questions manually with option to generate AI suggestions',
  },
  {
    value: 'ai-mode',
    label: 'AI Mode',
    description: 'AI will handle question generation and interview management automatically',
  },
];

// Interview difficulty levels
export const difficultyLevels = [
  {
    value: 'easy',
    label: 'Easy',
    description: 'Basic questions suitable for entry-level positions and beginners',
  },
  {
    value: 'normal',
    label: 'Normal',
    description: 'Standard questions for intermediate-level positions',
  },
  {
    value: 'hard',
    label: 'Hard',
    description: 'Challenging questions for senior-level positions',
  },
  {
    value: 'expert',
    label: 'Expert',
    description: 'Advanced questions for expert-level positions and technical leadership',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: 'Highly complex questions for specialized roles and senior technical positions',
  },
];

// Form steps configuration
export const formSteps = [
  {
    id: 1,
    title: 'Basic Details',
    description: 'Job title, organization, salary, and skills',
    key: 'basicDetails',
  },
  {
    id: 2,
    title: 'Description',
    description: 'Job description, requirements, and benefits',
    key: 'description',
  },
  {
    id: 3,
    title: 'Interview',
    description: 'Interview duration and monitoring settings',
    key: 'interviewConfig',
  },
  {
    id: 4,
    title: 'Questions',
    description: 'Question types and configuration',
    key: 'questionsConfig',
  },
];

// Industries list
export const industries = [
  'technology',
  'healthcare',
  'finance',
  'education',
  'marketing',
  'other',
];

// Currency options
export const currencies = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'INR', label: 'INR (₹)' },
  { value: 'CAD', label: 'CAD (C$)' },
  { value: 'AUD', label: 'AUD (A$)' },
];
