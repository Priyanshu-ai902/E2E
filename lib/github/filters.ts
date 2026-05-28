export const EXCLUDED_FILES = [
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
];

export const EXCLUDED_DIRECTORIES = [
  'dist/',
  'build/',
  'node_modules/',
];

export const EXCLUDED_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp',
  '.pdf', '.zip', '.tar', '.gz', '.mp3', '.mp4', '.avi',
  '.ttf', '.woff', '.woff2', '.eot',
  '.bin', '.exe', '.dll', '.so', '.dylib',
];

export const isFileExcluded = (filename: string): boolean => {
  if (!filename) return true;

  const normalizedName = filename.toLowerCase();

  // Check exact file matches
  if (EXCLUDED_FILES.includes(normalizedName)) return true;

  // Check generated / snapshots / build directories
  if (
    EXCLUDED_DIRECTORIES.some(dir => normalizedName.includes(dir)) ||
    normalizedName.includes('__snapshots__') ||
    normalizedName.includes('generated')
  ) {
    return true;
  }

  // Check binary / asset extensions
  if (EXCLUDED_EXTENSIONS.some(ext => normalizedName.endsWith(ext))) {
    return true;
  }

  return false;
};
