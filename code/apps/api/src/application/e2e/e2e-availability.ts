export function isE2EDevelopmentEnabled(nodeEnv: string | undefined = process.env.NODE_ENV): boolean {
  return nodeEnv === 'development';
}
