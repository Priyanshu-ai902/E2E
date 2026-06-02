import { AnalysisFinding, RiskScores } from './schemas';

export const calculateScores = (findings: AnalysisFinding[]): RiskScores => {
  let security = 100;
  let performance = 100;
  let architecture = 100;

  findings.forEach(finding => {
    const deduction = getDeduction(finding.severity);
    if (finding.category === 'security') security -= deduction;
    if (finding.category === 'performance') performance -= deduction;
    if (finding.category === 'architecture') architecture -= deduction;
  });

  // Clamp values
  security = Math.max(0, security);
  performance = Math.max(0, performance);
  architecture = Math.max(0, architecture);

  const overall = Math.round((security + performance + architecture) / 3);

  return {
    security,
    performance,
    architecture,
    overall,
  };
};

const getDeduction = (severity: string): number => {
  switch (severity) {
    case 'critical': return 40;
    case 'high': return 25;
    case 'medium': return 10;
    case 'low': return 5;
    default: return 0;
  }
};
