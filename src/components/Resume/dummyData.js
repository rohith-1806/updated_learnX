export const INITIAL_RESUME_DATA = {
  id: "resume-1",
  title: "Rohith - Full Stack Developer",
  updatedAt: "Just now",
  template: "modern",
  accentColor: "#6366f1", // Indigo
  fontFamily: "Inter, sans-serif",
  atsScore: 88,
  
  // 1. Personal Information
  personal: {
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    fullName: "Rohith Kumar",
    role: "Senior Full Stack Software Engineer",
    email: "rohith.kumar@example.com",
    phone: "+91 98765 43210",
    location: "Bengaluru, Karnataka, India",
    linkedin: "linkedin.com/in/rohith-dev",
    github: "github.com/rohith-codes",
    portfolio: "rohith-portfolio.dev",
    summary: "Dynamic and results-driven Full Stack Engineer with 4+ years of experience designing, developing, and scaling high-performance web applications using React, Node.js, and Cloud Infrastructure. Passionate about sleek UI UX design, microservices architecture, and automated testing."
  },

  // 2. Education
  education: [
    {
      id: "edu-1",
      college: "Indian Institute of Technology (IIT)",
      degree: "Bachelor of Technology (B.Tech)",
      branch: "Computer Science & Engineering",
      cgpa: "9.2 / 10.0",
      startDate: "2019-08",
      endDate: "2023-05"
    },
    {
      id: "edu-2",
      college: "National Public School",
      degree: "Higher Secondary (12th CBSE)",
      branch: "Physics, Chemistry, Math & CS",
      cgpa: "95.4%",
      startDate: "2017-06",
      endDate: "2019-03"
    }
  ],

  // 3. Skills
  skills: [
    { name: "React.js", level: "Expert", category: "Frontend" },
    { name: "JavaScript (ES6+)", level: "Expert", category: "Languages" },
    { name: "TypeScript", level: "Advanced", category: "Languages" },
    { name: "Node.js & Express", level: "Advanced", category: "Backend" },
    { name: "Python", level: "Intermediate", category: "Languages" },
    { name: "MongoDB & PostgreSQL", level: "Advanced", category: "Database" },
    { name: "HTML5 / CSS3 / SASS", level: "Expert", category: "Frontend" },
    { name: "Tailwind CSS & Glassmorphism", level: "Expert", category: "Styling" },
    { name: "Docker & AWS", level: "Intermediate", category: "DevOps" },
    { name: "Git & GitHub CI/CD", level: "Advanced", category: "Tools" }
  ],

  // 4. Experience
  experience: [
    {
      id: "exp-1",
      company: "TechNova Solutions Inc.",
      role: "Lead Frontend Developer",
      duration: "Jan 2023 - Present",
      description: "• Spearheaded the complete redesign of core customer dashboard, boosting user engagement by 42% and page performance score from 65 to 98 on Lighthouse.\n• Architected reusable design system in React & TypeScript utilized across 8 engineering sub-teams.\n• Mentored 5 junior developers and conducted code reviews to maintain high unit test coverage (90%+)."
    },
    {
      id: "exp-2",
      company: "CloudScale Systems",
      role: "Full Stack Engineering Intern",
      duration: "May 2022 - Dec 2022",
      description: "• Developed scalable RESTful APIs with Node.js and Express, processing over 100K daily API calls.\n• Built interactive user telemetry visualizations using D3.js and Tailwind CSS."
    }
  ],

  // 5. Projects
  projects: [
    {
      id: "proj-1",
      name: "LernX EdTech SaaS Platform",
      description: "Engineered an end-to-end online learning & course management platform featuring live streaming, interactive quizzes, automated certificates, and modern dark/light glass theme.",
      techStack: ["React", "Node.js", "Express", "MongoDB", "Framer Motion"],
      github: "github.com/rohith-codes/lernx-platform",
      liveLink: "lernx-demo.vercel.app"
    },
    {
      id: "proj-2",
      name: "AI Resume & ATS Analyzer",
      description: "Created an intelligent client-side ATS checker with automated keyword matching, PDF/DOCX preview rendering, and personalized improvement metrics.",
      techStack: ["React", "JavaScript", "HTML2Canvas", "CSS Modules"],
      github: "github.com/rohith-codes/ats-resume-pro",
      liveLink: "resume-ats-pro.dev"
    }
  ],

  // 6. Certifications
  certifications: [
    {
      id: "cert-1",
      title: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services",
      year: "2023"
    },
    {
      id: "cert-2",
      title: "Meta Certified Senior React Specialist",
      issuer: "Coursera / Meta",
      year: "2022"
    }
  ],

  // 7. Achievements
  achievements: [
    {
      id: "ach-1",
      title: "1st Place Winner - National Hackathon 2023",
      description: "Secured top rank among 350+ teams by building an AI-assisted cloud deployment visualizer."
    },
    {
      id: "ach-2",
      title: "Dean's Honor List for Academic Excellence",
      description: "Awarded top 2% academic distinction for consecutive semesters."
    }
  ],

  // 8. Languages
  languages: [
    { name: "English", proficiency: "Native / Full Professional" },
    { name: "Hindi", proficiency: "Fluent" },
    { name: "Kannada", proficiency: "Conversational" }
  ],

  // 9. Interests
  interests: ["Open Source Contribution", "UI/UX Design", "Competitive Programming", "Tech Blogging", "Bouldering"],

  // 10. Declaration
  declaration: {
    text: "I hereby declare that all the information mentioned above is authentic, complete, and accurate to the best of my knowledge.",
    place: "Bengaluru",
    date: "2026-07-22",
    signatureName: "Rohith Kumar"
  }
};

export const RESUME_TEMPLATES = [
  {
    id: "modern",
    name: "Modern Glass",
    category: "Popular",
    description: "Sleek, two-column layout with subtle gradient highlights and prominent contact bar.",
    badge: "Recommended",
    accent: "#6366f1",
    previewBg: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
  },
  {
    id: "minimal",
    name: "Minimalist Clean",
    category: "ATS Friendly",
    description: "Ultra clean single-column structure with elegant typography and high readability.",
    badge: "High ATS",
    accent: "#0f172a",
    previewBg: "linear-gradient(135deg, #1e293b 0%, #475569 100%)"
  },
  {
    id: "executive",
    name: "Executive Leadership",
    category: "Senior Roles",
    description: "Authoritative design with prominent header accent, clear sections, and formal styling.",
    badge: "Premium",
    accent: "#0284c7",
    previewBg: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)"
  },
  {
    id: "corporate",
    name: "Corporate Standard",
    category: "Traditional",
    description: "Classic corporate format preferred by Fortune 500 companies and traditional recruiters.",
    badge: "Classic",
    accent: "#15803d",
    previewBg: "linear-gradient(135deg, #15803d 0%, #047857 100%)"
  },
  {
    id: "classic",
    name: "Classic Elegant",
    category: "Universal",
    description: "Time-tested classic layout with serif typography touches and refined spacing.",
    badge: "Universal",
    accent: "#b91c1c",
    previewBg: "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)"
  },
  {
    id: "creative",
    name: "Creative Portfolio",
    category: "Designers",
    description: "Vibrant visual layout ideal for UI designers, creative leads, and product thinkers.",
    badge: "Creative",
    accent: "#ec4899",
    previewBg: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)"
  },
  {
    id: "developer",
    name: "Developer / Engineer",
    category: "Tech",
    description: "Tech-focused layout prioritizing skills matrix, GitHub repositories, and tech stack chips.",
    badge: "Tech Pro",
    accent: "#10b981",
    previewBg: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
  },
  {
    id: "student",
    name: "Graduate & Student",
    category: "Entry Level",
    description: "Tailored for students and freshers emphasizing education, projects, and academic honors.",
    badge: "Entry Level",
    accent: "#f59e0b",
    previewBg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
  }
];

export const ATS_MOCK_REPORT = {
  score: 82,
  status: "Great ATS Match",
  summary: "Your resume is well-structured and aligns closely with standard ATS parsing algorithms. Adding key cloud keywords and quantitative metrics will push your score above 92%.",
  scores: {
    skills: 88,
    projects: 85,
    experience: 78,
    formatting: 92,
    keywords: 75,
    readability: 95,
    grammar: 90,
    education: 100,
    achievements: 80
  },
  suggestions: [
    {
      id: "sug-1",
      title: "Missing Docker & AWS Cloud keywords",
      description: "Recruiters looking for Senior Full Stack roles heavily index Docker, AWS, and Cloud deployment skills. Consider adding these to your tech stack list.",
      priority: "High",
      type: "keyword"
    },
    {
      id: "sug-2",
      title: "Add measurable metrics to experience",
      description: "Quantified bullet points (e.g. 'Improved speed by 35%') increase recruiter response rates by up to 40%.",
      priority: "High",
      type: "experience"
    },
    {
      id: "sug-3",
      title: "Include LinkedIn & GitHub URLs",
      description: "Ensure full hyperlinked profile URLs are placed at the top for immediate access by hiring software.",
      priority: "Medium",
      type: "contact"
    },
    {
      id: "sug-4",
      title: "Use strong action verbs",
      description: "Replace generic terms like 'worked on' with high-impact verbs like 'Spearheaded', 'Architected', and 'Engineered'.",
      priority: "Medium",
      type: "grammar"
    },
    {
      id: "sug-5",
      title: "Optimize resume section formatting",
      description: "Formatting is overall crisp! Keep section titles standard (e.g., 'Work Experience', 'Education', 'Projects').",
      priority: "Low",
      type: "format"
    }
  ],
  keywordsFound: [
    "React", "Node", "MongoDB", "Java", "Python", "JavaScript", "TypeScript", "HTML5", "CSS3", "Git", "REST API", "Express"
  ],
  keywordsMissing: [
    "Docker", "AWS", "CI/CD", "REST API", "GraphQL", "Kubernetes", "Redis", "Microservices", "Jest"
  ]
};

export const ACCENT_COLORS = [
  { name: "Indigo", value: "#6366f1" },
  { name: "Emerald", value: "#10b981" },
  { name: "Crimson", value: "#ef4444" },
  { name: "Royal Blue", value: "#2563eb" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Slate Dark", value: "#0f172a" }
];

export const FONT_OPTIONS = [
  { name: "Inter (Modern)", value: "'Inter', sans-serif" },
  { name: "Roboto (Clean)", value: "'Roboto', sans-serif" },
  { name: "Poppins (Friendly)", value: "'Poppins', sans-serif" },
  { name: "Merriweather (Serif)", value: "'Merriweather', serif" },
  { name: "Outfit (Tech)", value: "'Outfit', sans-serif" }
];
