import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { title, industry, skills, location } = await request.json();

    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock AI-generated description based on inputs
    const description = `We are seeking a talented ${title} to join our dynamic team in ${location}. This role offers an exciting opportunity to work with cutting-edge technologies and contribute to innovative projects in the ${industry} industry.

Key Responsibilities:
• Lead development and implementation of scalable solutions
• Collaborate with cross-functional teams to deliver high-quality products
• Mentor junior team members and contribute to technical decisions
• Stay current with industry trends and best practices
• Participate in code reviews and maintain high coding standards

What We Offer:
• Competitive salary and comprehensive benefits package
• Flexible work arrangements and professional development opportunities
• Collaborative and inclusive work environment
• Opportunity to work on challenging and impactful projects`;

    const requirements = `Required Qualifications:
• Bachelor's degree in relevant field or equivalent experience
• ${Math.floor(Math.random() * 3) + 2}+ years of professional experience
• Strong proficiency in: ${skills.slice(0, 5).join(', ')}
• Experience with modern development practices and methodologies
• Excellent problem-solving and communication skills
• Ability to work independently and as part of a team

Preferred Qualifications:
• Advanced degree in relevant field
• Experience with ${skills.slice(5, 8).join(', ')}
• Previous leadership or mentoring experience
• Contributions to open-source projects
• Industry certifications relevant to the role`;

    const benefits = `Benefits Package:
• Competitive base salary with performance bonuses
• Comprehensive health, dental, and vision insurance
• 401(k) retirement plan with company matching
• Flexible PTO and paid holidays
• Professional development budget and conference attendance
• Remote work options and flexible scheduling
• Modern equipment and technology stipend
• Team building events and company retreats
• Stock options or equity participation (for eligible roles)`;

    return NextResponse.json({
      success: true,
      data: {
        description,
        requirements,
        benefits,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to generate description' },
      { status: 500 }
    );
  }
}
