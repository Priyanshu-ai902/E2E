import { SourceFile, SyntaxKind, Node } from 'ts-morph';
import { AnalysisFinding } from './schemas';

export interface Rule {
  name: string;
  category: 'security' | 'performance' | 'architecture';
  check: (sourceFile: SourceFile) => AnalysisFinding[];
}

const securityRules: Rule[] = [
  {
    name: 'Hardcoded Secrets',
    category: 'security',
    check: (sourceFile: SourceFile) => {
      const findings: AnalysisFinding[] = [];
      const secretKeywords = ['api_key', 'secret', 'password', 'token', 'jwt_secret', 'auth_token'];
      
      sourceFile.getVariableDeclarations().forEach(vd => {
        const name = vd.getName().toLowerCase();
        if (secretKeywords.some(k => name.includes(k))) {
          const initializer = vd.getInitializer();
          if (initializer && initializer.getKind() === SyntaxKind.StringLiteral) {
            // Check if it's likely a real secret (not an empty string or placeholder)
            const val = initializer.getText().replace(/['"]/g, '');
            if (val.length > 5 && !val.includes('YOUR_')) {
              findings.push({
                category: 'security',
                severity: 'critical',
                confidence: 90,
                title: 'Potential Hardcoded Secret',
                description: `Variable '${vd.getName()}' appears to hold a hardcoded secret. Use environment variables instead.`,
                file: sourceFile.getFilePath(),
                line: vd.getStartLineNumber(),
              });
            }
          }
        }
      });
      return findings;
    }
  },
  {
    name: 'Dangerous Functions',
    category: 'security',
    check: (sourceFile: SourceFile) => {
      const findings: AnalysisFinding[] = [];
      const dangerousFns = ['eval', 'Function'];
      
      sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(call => {
        const expression = call.getExpression().getText();
        if (dangerousFns.includes(expression)) {
          findings.push({
            category: 'security',
            severity: 'critical',
            confidence: 100,
            title: 'Use of Dangerous Function',
            description: `Use of ${expression}() can lead to code injection vulnerabilities.`,
            file: sourceFile.getFilePath(),
            line: call.getStartLineNumber(),
          });
        }
      });
      return findings;
    }
  },
  {
    name: 'dangerouslySetInnerHTML',
    category: 'security',
    check: (sourceFile: SourceFile) => {
      const findings: AnalysisFinding[] = [];
      sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute).forEach(attr => {
        if (attr.getNameNode().getText() === 'dangerouslySetInnerHTML') {
          findings.push({
            category: 'security',
            severity: 'high',
            confidence: 100,
            title: 'Use of dangerouslySetInnerHTML',
            description: 'This property can lead to XSS vulnerabilities if the input is not sanitized.',
            file: sourceFile.getFilePath(),
            line: attr.getStartLineNumber(),
          });
        }
      });
      return findings;
    }
  },
  {
    name: 'SQL Injection Patterns',
    category: 'security',
    check: (sourceFile: SourceFile) => {
      const findings: AnalysisFinding[] = [];
      // Look for SQL-like strings in template literals used in query functions
      sourceFile.getDescendantsOfKind(SyntaxKind.TaggedTemplateExpression).forEach(tte => {
        const tag = tte.getTag().getText();
        if (tag === 'sql' || tag.includes('query')) {
          // This is generally safe if using tagged templates (like in drizzle or pg)
          // But let's check for non-tagged ones or raw concatenations
        }
      });

      sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(call => {
        const name = call.getExpression().getText().toLowerCase();
        if (name.includes('query') || name.includes('execute')) {
          const args = call.getArguments();
          args.forEach(arg => {
            if (arg.getKind() === SyntaxKind.BinaryExpression) {
              const text = arg.getText();
              if (text.includes('+') && (text.includes('SELECT') || text.includes('INSERT') || text.includes('UPDATE'))) {
                findings.push({
                  category: 'security',
                  severity: 'critical',
                  confidence: 85,
                  title: 'Potential SQL Injection',
                  description: 'Detected raw string concatenation in a database query. Use parameterized queries or a query builder instead.',
                  file: sourceFile.getFilePath(),
                  line: call.getStartLineNumber(),
                });
              }
            }
          });
        }
      });
      return findings;
    }
  }
];

const performanceRules: Rule[] = [
  {
    name: 'N+1 Query Pattern',
    category: 'performance',
    check: (sourceFile: SourceFile) => {
      const findings: AnalysisFinding[] = [];
      const loopKinds = [
        SyntaxKind.ForStatement,
        SyntaxKind.ForInStatement,
        SyntaxKind.ForOfStatement,
        SyntaxKind.WhileStatement,
        SyntaxKind.DoStatement
      ];

      sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(call => {
        const name = call.getExpression().getText().toLowerCase();
        if (name.includes('fetch') || name.includes('get') || name.includes('query')) {
          // Check if this call is inside a loop
          let parent = call.getParent();
          while (parent) {
            if (loopKinds.includes(parent.getKind())) {
              findings.push({
                category: 'performance',
                severity: 'high',
                confidence: 75,
                title: 'Potential N+1 Query',
                description: `Database or API call '${call.getExpression().getText()}' found inside a loop. Consider batching.`,
                file: sourceFile.getFilePath(),
                line: call.getStartLineNumber(),
              });
              break;
            }
            // Also check for .map(), .forEach() etc.
            if (parent.getKind() === SyntaxKind.CallExpression) {
              const expr = (parent as any).getExpression();
              if (expr && expr.getText().includes('.map') || expr.getText().includes('.forEach')) {
                findings.push({
                  category: 'performance',
                  severity: 'high',
                  confidence: 75,
                  title: 'Potential N+1 Query',
                  description: `Database or API call '${call.getExpression().getText()}' found inside a collection iteration. Consider batching.`,
                  file: sourceFile.getFilePath(),
                  line: call.getStartLineNumber(),
                });
                break;
              }
            }
            parent = parent.getParent();
          }
        }
      });
      return findings;
    }
  },
  {
    name: 'Nested Loops',
    category: 'performance',
    check: (sourceFile: SourceFile) => {
      const findings: AnalysisFinding[] = [];
      const loopKinds = [SyntaxKind.ForStatement, SyntaxKind.ForInStatement, SyntaxKind.ForOfStatement, SyntaxKind.WhileStatement];
      
      loopKinds.forEach(kind => {
        sourceFile.getDescendantsOfKind(kind).forEach(loop => {
          const nested = loop.getDescendants().filter(d => loopKinds.includes(d.getKind()));
          if (nested.length > 0) {
            findings.push({
              category: 'performance',
              severity: 'medium',
              confidence: 90,
              title: 'Nested Loops Detected',
              description: 'Nested loops can lead to poor performance (O(n^2) complexity).',
              file: sourceFile.getFilePath(),
              line: loop.getStartLineNumber(),
            });
          }
        });
      });
      return findings;
    }
  }
];

const architectureRules: Rule[] = [
  {
    name: 'Oversized File',
    category: 'architecture',
    check: (sourceFile: SourceFile) => {
      const findings: AnalysisFinding[] = [];
      const lineCount = sourceFile.getEndLineNumber();
      if (lineCount > 400) {
        findings.push({
          category: 'architecture',
          severity: 'medium',
          confidence: 100,
          title: 'Oversized File',
          description: `This file has ${lineCount} lines. Consider splitting it into smaller, more manageable modules.`,
          file: sourceFile.getFilePath(),
          line: 1,
        });
      }
      return findings;
    }
  },
  {
    name: 'Dead Code Indicators',
    category: 'architecture',
    check: (sourceFile: SourceFile) => {
      const findings: AnalysisFinding[] = [];
      sourceFile.getVariableDeclarations().forEach(vd => {
        const references = vd.findReferencesAsNodes();
        if (references.length === 1 && !vd.getName().startsWith('_')) {
          findings.push({
            category: 'architecture',
            severity: 'low',
            confidence: 85,
            title: 'Unused Variable',
            description: `Variable '${vd.getName()}' is declared but never used.`,
            file: sourceFile.getFilePath(),
            line: vd.getStartLineNumber(),
          });
        }
      });
      return findings;
    }
  }
];

export const runRules = (sourceFile: SourceFile): AnalysisFinding[] => {
  const allFindings: AnalysisFinding[] = [];
  const rules = [...securityRules, ...performanceRules, ...architectureRules];
  
  rules.forEach(rule => {
    try {
      allFindings.push(...rule.check(sourceFile));
    } catch (e) {
      console.error(`Error running rule ${rule.name}:`, e);
    }
  });
  
  return allFindings;
};
