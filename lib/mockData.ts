import { PRAnalysis } from '@/types/pr';

export const mockPRs: PRAnalysis[] = [
  {
    id: '1',
    title: 'Add user authentication system',
    author: 'Sarah Chen',
    status: 'Open',
    createdAt: '2 hours ago',
    codeReviewIssues: [
      'Password not hashed before storage',
      'Missing input validation on email field',
      'SQL injection vulnerability in login query',
      'Session token not properly validated',
    ],
    jestTests: [
      {
        name: 'should hash password correctly',
        code: `test('should hash password correctly', async () => {
  const hashed = await hashPassword('secret123');
  const isValid = await comparePasswords('secret123', hashed);
  expect(isValid).toBe(true);
});`,
      },
      {
        name: 'should validate email format',
        code: `test('should validate email format', () => {
  expect(isValidEmail('user@example.com')).toBe(true);
  expect(isValidEmail('invalid.email')).toBe(false);
});`,
      },
    ],
    testPlan: [
      'Test login with valid credentials',
      'Test login with invalid credentials',
      'Test password reset flow',
      'Test session persistence',
      'Test logout functionality',
    ],
    riskLevel: 'High',
    explanation:
      'This PR introduces critical authentication logic. The identified vulnerabilities could allow unauthorized access. Priority: Must address all security issues before merging.',
  },
  {
    id: '2',
    title: 'Implement dark mode toggle',
    author: 'Alex Rivera',
    status: 'Open',
    createdAt: '5 hours ago',
    codeReviewIssues: [
      'Theme preference not persisted to localStorage',
      'Missing transition on theme switch',
      'Inconsistent color values in dark mode',
    ],
    jestTests: [
      {
        name: 'should toggle theme correctly',
        code: `test('should toggle theme correctly', () => {
  const { rerender } = render(<ThemeToggle />);
  const button = screen.getByRole('button');
  fireEvent.click(button);
  expect(document.documentElement).toHaveClass('dark');
});`,
      },
    ],
    testPlan: [
      'Toggle theme multiple times',
      'Verify all components update',
      'Check persistence after page reload',
      'Test on different screen sizes',
    ],
    riskLevel: 'Low',
    explanation:
      'This is a low-risk UI feature. Minor adjustments needed for persistence and transitions. Can be merged with small fixes.',
  },
  {
    id: '3',
    title: 'Refactor API response handling',
    author: 'Jordan Kim',
    status: 'Merged',
    createdAt: '1 day ago',
    codeReviewIssues: [
      'Error handling could be more specific',
      'Timeout not set for API calls',
    ],
    jestTests: [
      {
        name: 'should handle API errors gracefully',
        code: `test('should handle API errors gracefully', async () => {
  const mockFetch = jest.fn(() => Promise.reject(new Error('Network error')));
  const result = await fetchData(mockFetch);
  expect(result).toEqual({ error: 'Network error' });
});`,
      },
    ],
    testPlan: [
      'Test successful API call',
      'Test network error handling',
      'Test timeout scenarios',
      'Test invalid response format',
    ],
    riskLevel: 'Medium',
    explanation:
      'Good refactoring with proper error handling. Some edge cases could be covered better, but overall solid implementation.',
  },
  {
    id: '4',
    title: 'Add email notifications feature',
    author: 'Morgan Lee',
    status: 'Draft',
    createdAt: '3 hours ago',
    codeReviewIssues: [
      'Email templates not properly escaped for HTML injection',
      'Rate limiting not implemented',
      'No unsubscribe mechanism',
    ],
    jestTests: [
      {
        name: 'should format email correctly',
        code: `test('should format email correctly', () => {
  const email = formatEmail('John Doe', 'john@example.com');
  expect(email).toContain('Dear John Doe');
  expect(email).toContain('john@example.com');
});`,
      },
    ],
    testPlan: [
      'Test email generation',
      'Test with special characters',
      'Verify rate limiting works',
      'Test unsubscribe link',
    ],
    riskLevel: 'Medium',
    explanation:
      'Important feature but needs security hardening. Email template escaping is critical to prevent injection attacks.',
  },
  {
    id: '5',
    title: 'Optimize database queries',
    author: 'Casey Thompson',
    status: 'Open',
    createdAt: '8 hours ago',
    codeReviewIssues: [
      'Missing database indexes on frequently queried columns',
      'N+1 query problem in user list retrieval',
      'No query timeout defined',
    ],
    jestTests: [
      {
        name: 'should fetch user list efficiently',
        code: `test('should fetch user list efficiently', async () => {
  const users = await fetchUsers({ limit: 10 });
  expect(users).toHaveLength(10);
  expect(queries).toHaveBeenCalledTimes(1);
});`,
      },
    ],
    testPlan: [
      'Benchmark query performance',
      'Verify index effectiveness',
      'Test with large datasets',
      'Check connection pooling',
    ],
    riskLevel: 'Medium',
    explanation:
      'Performance improvements are critical. The N+1 issue could cause significant slowdowns in production. Recommend using eager loading.',
  },
];
