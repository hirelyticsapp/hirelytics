import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { questionType, numberOfQuestions, industry, difficultyLevel, jobTitle } =
      await request.json();

    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock question templates based on type and industry
    const questionTemplates = {
      'technical-coding': [
        'Implement a function that solves [specific algorithm problem] with optimal time complexity.',
        'Design a data structure that efficiently handles [specific operations] for a [use case].',
        'Write code to handle [specific technical scenario] while considering edge cases.',
        'Optimize the following code snippet for better performance and readability.',
        'Implement a solution for [technical challenge] using [specific technology/framework].',
      ],
      'technical-system': [
        'Design a scalable system architecture for [specific use case] handling [scale requirements].',
        'How would you approach designing a distributed system for [specific problem]?',
        'Explain your approach to handling [system challenge] in a high-traffic environment.',
        'Design a database schema for [specific application] considering [requirements].',
        'How would you ensure system reliability and fault tolerance for [scenario]?',
      ],
      behavioral: [
        'Describe a challenging project you worked on and how you overcame obstacles.',
        'Tell me about a time when you had to work with a difficult team member.',
        'How do you handle competing priorities and tight deadlines?',
        'Describe a situation where you had to learn a new technology quickly.',
        'Tell me about a time when you made a mistake and how you handled it.',
      ],
      clinical: [
        'How would you handle a patient presenting with [specific symptoms]?',
        'Describe your approach to [specific medical procedure or protocol].',
        'What are the key considerations when treating [specific condition]?',
        'How do you ensure patient safety during [specific scenario]?',
        'Explain your decision-making process for [clinical situation].',
      ],
      analytical: [
        'How would you analyze the financial performance of [specific scenario]?',
        'Walk me through your approach to [financial analysis task].',
        'What metrics would you use to evaluate [specific investment/decision]?',
        'How would you assess the risk associated with [financial scenario]?',
        'Explain your methodology for [specific financial modeling task].',
      ],
    };

    const templates =
      questionTemplates[questionType as keyof typeof questionTemplates] ||
      questionTemplates.behavioral;

    // Generate questions based on the number requested
    const questions = Array.from({ length: numberOfQuestions }, (_, index) => {
      const template = templates[index % templates.length];
      return {
        id: `q_${Date.now()}_${index}`,
        type: questionType,
        question: template.replace(/\[([^\]]+)\]/g, (match, placeholder) => {
          // Replace placeholders with context-appropriate content
          const replacements = {
            'specific algorithm problem': 'finding the longest palindromic substring',
            'specific operations': 'insert, delete, and search operations',
            'use case': `${industry} application`,
            'specific technical scenario': `${jobTitle.toLowerCase()} workflow`,
            'specific technology/framework': getRandomTech(industry),
            'specific use case': `${industry} platform`,
            'scale requirements': '1M+ daily active users',
            'specific problem': `${industry} data processing`,
            'system challenge': 'high availability and consistency',
            'specific application': `${industry} management system`,
            requirements: 'scalability and performance',
            scenario: `${industry} production environment`,
            'specific symptoms': getRandomSymptoms(),
            'specific medical procedure or protocol': getRandomProcedure(),
            'specific condition': getRandomCondition(),
            'clinical situation': 'emergency patient care',
            'specific scenario': `${industry} company analysis`,
            'financial analysis task': 'portfolio optimization',
            'specific investment/decision': 'market expansion strategy',
            'financial scenario': 'merger and acquisition',
            'specific financial modeling task': 'DCF valuation',
          };
          return replacements[placeholder as keyof typeof replacements] || placeholder;
        }),
        isAIGenerated: true,
      };
    });

    return NextResponse.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}

function getRandomTech(industry: string) {
  const techByIndustry = {
    technology: ['React', 'Node.js', 'Python', 'Docker', 'Kubernetes'],
    healthcare: ['HL7', 'FHIR', 'Epic', 'Cerner', 'DICOM'],
    finance: ['Bloomberg API', 'FIX Protocol', 'R', 'MATLAB', 'SQL'],
    education: ['LMS', 'Canvas', 'Blackboard', 'Google Classroom', 'Zoom'],
    marketing: [
      'Google Analytics',
      'HubSpot',
      'Salesforce',
      'Adobe Creative Suite',
      'Facebook Ads',
    ],
    sales: ['Salesforce', 'HubSpot', 'Pipedrive', 'Zoom', 'LinkedIn Sales Navigator'],
  };

  const techs =
    techByIndustry[industry as keyof typeof techByIndustry] || techByIndustry.technology;
  return techs[Math.floor(Math.random() * techs.length)];
}

function getRandomSymptoms() {
  const symptoms = [
    'chest pain and shortness of breath',
    'severe headache and vision changes',
    'abdominal pain and nausea',
  ];
  return symptoms[Math.floor(Math.random() * symptoms.length)];
}

function getRandomProcedure() {
  const procedures = [
    'IV insertion',
    'wound care',
    'medication administration',
    'patient assessment',
  ];
  return procedures[Math.floor(Math.random() * procedures.length)];
}

function getRandomCondition() {
  const conditions = ['diabetes management', 'hypertension', 'post-operative care', 'chronic pain'];
  return conditions[Math.floor(Math.random() * conditions.length)];
}
