// Dummy AI question generation for development
// This will be replaced with actual AI integration later

export interface DummyQuestion {
  id: string;
  type: string;
  question: string;
  isAIGenerated: boolean;
}

// Dummy question templates organized by category
const questionTemplates = {
  // Technology questions
  'technical-coding': [
    'Implement a function to reverse a linked list in JavaScript.',
    'Write a Python function to find the longest substring without repeating characters.',
    'Explain the time complexity of your binary search implementation.',
    'How would you optimize a database query that is running slowly?',
    'Implement a debounce function in JavaScript and explain its use cases.',
    'Write a function to detect if a binary tree is balanced.',
    'Explain the difference between synchronous and asynchronous programming.',
    'How would you implement a LRU cache?',
  ],
  'technical-system': [
    'Design a URL shortening service like bit.ly.',
    'How would you design a chat application to handle millions of users?',
    'Explain the architecture of a microservices-based application.',
    'How would you handle database scaling for a growing application?',
    'Design a notification system for a social media platform.',
    'Explain the trade-offs between SQL and NoSQL databases.',
  ],
  'technical-tools': [
    'How do you manage state in a React application?',
    'Explain the difference between Docker containers and virtual machines.',
    'What are the benefits of using TypeScript over JavaScript?',
    'How would you implement CI/CD pipeline for a web application?',
    'Explain the purpose of Kubernetes in container orchestration.',
    'What are the advantages of using Git for version control?',
  ],

  // Healthcare questions
  clinical: [
    'How do you assess a patient with chest pain?',
    'Explain the proper procedure for administering IV medication.',
    'What are the signs and symptoms of sepsis?',
    'How do you handle a medical emergency in a clinical setting?',
    'Describe the process of patient triage in an emergency department.',
    'What protocols do you follow for infection control?',
  ],
  regulatory: [
    'How do you ensure HIPAA compliance in patient data handling?',
    'What are the requirements for medical device validation?',
    'Explain the FDA approval process for new medications.',
    'How do you maintain patient confidentiality in electronic records?',
    'What are the standards for clinical trial documentation?',
  ],
  'patient-care': [
    'How do you communicate with a distressed patient?',
    'Describe your approach to patient education about medications.',
    'How do you handle cultural differences in patient care?',
    'What steps do you take to ensure patient comfort during procedures?',
    'How do you manage difficult family members in patient care situations?',
  ],
  emergency: [
    'How do you prioritize multiple critical patients in an emergency?',
    'Describe your response to a cardiac arrest situation.',
    'What is your approach to trauma assessment and stabilization?',
    'How do you manage a mass casualty incident?',
  ],

  // Finance questions
  analytical: [
    'How do you evaluate the financial health of a company?',
    'Explain the process of building a discounted cash flow model.',
    'How do you assess investment risk in a portfolio?',
    'What metrics do you use for credit risk analysis?',
    'How do you analyze market trends for investment decisions?',
    'Explain the concept of value at risk (VaR) in portfolio management.',
  ],
  'market-knowledge': [
    'How do current economic indicators affect investment strategies?',
    'Explain the impact of interest rate changes on different asset classes.',
    'What factors influence currency exchange rate fluctuations?',
    'How do you analyze sector-specific investment opportunities?',
    'What is your approach to emerging market investments?',
  ],
  quantitative: [
    'How do you calculate the Sharpe ratio and what does it indicate?',
    'Explain the Black-Scholes option pricing model.',
    'How do you perform Monte Carlo simulations for risk assessment?',
    'What statistical methods do you use for portfolio optimization?',
  ],

  // Education questions
  pedagogical: [
    'How do you adapt your teaching style for different learning styles?',
    'Describe your approach to lesson planning and curriculum design.',
    'How do you incorporate technology into your teaching methods?',
    'What strategies do you use to engage unmotivated students?',
    'How do you differentiate instruction for students with varying abilities?',
    'Explain your approach to project-based learning.',
  ],
  curriculum: [
    'How do you align curriculum with learning standards and objectives?',
    'What process do you follow for curriculum evaluation and improvement?',
    'How do you integrate cross-curricular themes into your lessons?',
    'Describe your approach to developing assessment rubrics.',
  ],
  'classroom-management': [
    'How do you establish classroom rules and expectations?',
    'What strategies do you use to handle disruptive behavior?',
    'How do you create an inclusive classroom environment?',
    'Describe your approach to parent-teacher communication.',
    'How do you manage time effectively during lessons?',
  ],
  assessment: [
    'How do you design formative assessments to guide instruction?',
    'What methods do you use for authentic assessment?',
    'How do you provide meaningful feedback to students?',
    'Describe your approach to grading and evaluation.',
  ],

  // Marketing questions
  strategic: [
    'How do you develop a comprehensive marketing strategy for a new product?',
    'What factors do you consider when defining target market segments?',
    'How do you position a brand in a competitive marketplace?',
    'Describe your approach to marketing budget allocation across channels.',
    'How do you measure brand awareness and brand equity?',
  ],
  digital: [
    'How do you optimize content for search engine rankings?',
    'What strategies do you use for social media engagement?',
    'How do you design effective email marketing campaigns?',
    'Describe your approach to influencer marketing partnerships.',
    'How do you measure the ROI of digital marketing campaigns?',
  ],
  analytics: [
    'How do you set up conversion tracking for marketing campaigns?',
    'What key performance indicators do you monitor for marketing success?',
    'How do you analyze customer acquisition costs and lifetime value?',
    'Describe your approach to A/B testing marketing materials.',
  ],
  creative: [
    'How do you generate innovative campaign ideas?',
    'Describe your process for developing brand messaging and voice.',
    'How do you ensure creative consistency across marketing channels?',
    'What methods do you use for creative ideation and brainstorming?',
  ],

  // Sales questions
  'sales-strategy': [
    'How do you develop and execute a territory sales plan?',
    'What strategies do you use for lead qualification and prioritization?',
    'How do you identify and pursue new business opportunities?',
    'Describe your approach to sales forecasting and pipeline management.',
    'How do you adapt your sales strategy for different market conditions?',
  ],
  'customer-relations': [
    'How do you build rapport with new prospects?',
    'Describe your approach to understanding customer needs and pain points.',
    'How do you handle customer objections during the sales process?',
    'What strategies do you use for customer retention and upselling?',
    'How do you manage long-term client relationships?',
  ],
  negotiation: [
    'Describe your approach to preparing for sales negotiations.',
    'How do you handle price objections from customers?',
    'What techniques do you use to close deals effectively?',
    'How do you negotiate win-win solutions with clients?',
  ],
  'product-knowledge': [
    'How do you stay updated on product features and benefits?',
    'Describe how you communicate complex product information to customers.',
    'How do you position your product against competitors?',
    'What methods do you use to demonstrate product value to prospects?',
  ],

  // Behavioral questions (common across industries)
  behavioral: [
    'Describe a time when you had to work under pressure to meet a deadline.',
    'Tell me about a challenging problem you solved creatively.',
    'How do you handle conflict with team members or colleagues?',
    'Describe a situation where you had to learn something new quickly.',
    'Tell me about a time when you had to give difficult feedback to someone.',
    'How do you prioritize tasks when you have multiple urgent deadlines?',
    'Describe a time when you made a mistake and how you handled it.',
    'Tell me about a successful project you led and what made it successful.',
    'How do you stay motivated when working on repetitive tasks?',
    'Describe a time when you had to adapt to significant changes at work.',
  ],

  // Experience-based questions
  experience: [
    'Walk me through your most significant professional achievement.',
    "Describe a project that didn't go as planned and what you learned.",
    'What has been your biggest professional challenge and how did you overcome it?',
    'Tell me about a time when you exceeded expectations in your role.',
    'Describe your experience working in cross-functional teams.',
    'What professional development activities have had the most impact on your career?',
  ],
};

/**
 * Generate dummy AI questions for a specific question type
 */
export function generateDummyQuestions(
  industry: string,
  jobTitle: string,
  difficultyLevel: string,
  questionTypes: string[],
  numberOfQuestions: number
): DummyQuestion[] {
  const questions: DummyQuestion[] = [];

  questionTypes.forEach((questionType) => {
    const templates = questionTemplates[questionType as keyof typeof questionTemplates] || [];

    for (let i = 0; i < numberOfQuestions; i++) {
      // Get a random question template or create a generic one
      const templateIndex = Math.floor(Math.random() * templates.length);
      const questionText =
        templates[templateIndex] || `Sample ${questionType} question for ${jobTitle} position.`;

      questions.push({
        id: `ai_${questionType}_${Date.now()}_${i}`,
        type: questionType,
        question: questionText,
        isAIGenerated: true,
      });
    }
  });

  return questions;
}

/**
 * Simulate AI question generation with a delay (to mimic API call)
 */
export async function simulateAIGeneration(
  industry: string,
  jobTitle: string,
  difficultyLevel: string,
  questionType: string,
  numberOfQuestions: number
): Promise<{ success: boolean; data: DummyQuestion[] }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

  try {
    const questions = generateDummyQuestions(
      industry,
      jobTitle,
      difficultyLevel,
      [questionType],
      numberOfQuestions
    );

    return {
      success: true,
      data: questions,
    };
  } catch (_error) {
    return {
      success: false,
      data: [],
    };
  }
}
