export type RunOnceJob = 'generator' | 'publisher' | 'all';

export type RunOnceOptions = {
  job: RunOnceJob;
};

export type RunOnceResolveResult =
  | { ok: true; options: RunOnceOptions }
  | { ok: false; error: string };

const VALID_JOBS: RunOnceJob[] = ['generator', 'publisher', 'all'];

export function resolveRunOnceOptions(
  args: string[],
  envJob?: string
): RunOnceResolveResult {
  const jobArg = readArgValue(args, '--job');
  const hasJobFlag = args.some((arg) => arg === '--job' || arg.startsWith('--job='));
  if (hasJobFlag && (!jobArg || jobArg.trim().length === 0)) {
    return { ok: false, error: 'Missing value for --job.' };
  }

  const requested = jobArg ?? normalizeEnvJob(envJob) ?? 'generator';
  const normalized = requested.toLowerCase();

  if (!isValidJob(normalized)) {
    return {
      ok: false,
      error: `Invalid job "${requested}". Expected one of: ${VALID_JOBS.join(', ')}.`,
    };
  }

  return { ok: true, options: { job: normalized } };
}

function isValidJob(value: string): value is RunOnceJob {
  return VALID_JOBS.includes(value as RunOnceJob);
}

function normalizeEnvJob(envJob?: string): string | undefined {
  if (!envJob) {
    return undefined;
  }

  const trimmed = envJob.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readArgValue(args: string[], flag: string): string | undefined {
  for (const arg of args) {
    if (arg.startsWith(`${flag}=`)) {
      return arg.slice(flag.length + 1);
    }
  }

  const index = args.indexOf(flag);
  if (index === -1) {
    return undefined;
  }

  const candidate = args[index + 1];
  if (!candidate || candidate.startsWith('--')) {
    return undefined;
  }

  return candidate;
}
