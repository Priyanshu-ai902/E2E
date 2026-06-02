import { Project, SourceFile, SyntaxKind } from 'ts-morph';

export interface ExtractedCode {
  functions: string[];
  classes: string[];
  interfaces: string[];
  imports: string[];
  exports: string[];
  reactComponents: string[];
  apiRoutes: string[];
}

export const parseSourceFile = (filename: string, content: string): ExtractedCode => {
  const project = new Project({
    useInMemoryFileSystem: true,
  });

  const sourceFile = project.createSourceFile(filename, content);

  const result: ExtractedCode = {
    functions: [],
    classes: [],
    interfaces: [],
    imports: [],
    exports: [],
    reactComponents: [],
    apiRoutes: [],
  };

  // Extract imports
  sourceFile.getImportDeclarations().forEach(imp => {
    result.imports.push(imp.getText());
  });

  // Extract exports
  sourceFile.getExportSymbols().forEach(exp => {
    result.exports.push(exp.getName());
  });

  // Extract functions
  sourceFile.getFunctions().forEach(fn => {
    const name = fn.getName();
    if (name) result.functions.push(name);
  });

  // Extract classes
  sourceFile.getClasses().forEach(cls => {
    const name = cls.getName();
    if (name) result.classes.push(name);
  });

  // Extract interfaces
  sourceFile.getInterfaces().forEach(iface => {
    result.interfaces.push(iface.getName());
  });

  // React Components detection (basic: PascalCase functions returning JSX)
  sourceFile.getFunctions().forEach(fn => {
    const name = fn.getName();
    if (name && /^[A-Z]/.test(name)) {
      // Check if it returns JSX
      const returnType = fn.getReturnType().getText();
      if (returnType.includes('JSX.Element') || returnType.includes('ReactNode') || fn.getText().includes('return <')) {
        result.reactComponents.push(name);
      }
    }
  });

  // Arrow function components
  sourceFile.getVariableDeclarations().forEach(vd => {
    const name = vd.getName();
    if (/^[A-Z]/.test(name)) {
      const initializer = vd.getInitializer();
      if (initializer && (initializer.getKind() === SyntaxKind.ArrowFunction || initializer.getKind() === SyntaxKind.FunctionExpression)) {
        if (vd.getText().includes('return <') || vd.getType().getText().includes('React.FC')) {
          result.reactComponents.push(name);
        }
      }
    }
  });

  // API Routes detection (basic: based on file path or exported handler)
  if (filename.includes('/api/') || filename.includes('route.ts') || filename.includes('route.js')) {
    result.apiRoutes.push(filename);
  }

  return result;
};

export const getSourceFile = (filename: string, content: string): SourceFile => {
  const project = new Project({
    useInMemoryFileSystem: true,
  });
  return project.createSourceFile(filename, content);
};
