import { buildPlaceResearchQuery, type ResearchPlaceUseCase, type ResearchSummaryLanguage } from '@silicon-traveler/research';
import type { E2EExecutionContext } from './e2e-execution';
import { E2EPreflightError } from './generate-global-photo-batch.use-case';

export class InvestigatePlaceUseCase {
  constructor(private readonly research: Pick<ResearchPlaceUseCase, 'executeForPlace'>) {}

  async execute(context: E2EExecutionContext, input: unknown): Promise<void> {
    const location = readLocation(input);
    const summaryLanguage = readSummaryLanguage(input);
    context.emit({ type: 'progress', index: 1, total: 1, data: { stage: 'researching', location, query: buildPlaceResearchQuery(location) } });
    const result = await this.research.executeForPlace(location, { includePageContent: true, summaryLanguage });
    context.emit({ type: 'result', index: 1, total: 1, data: { location, ...result } });
  }
}

function readSummaryLanguage(input: unknown): ResearchSummaryLanguage {
  if (typeof input === 'object' && input !== null && 'language' in input) {
    const language = (input as { language: unknown }).language;
    if (language === 'es' || language === 'en') return language;
  }
  return 'en';
}

function readLocation(input: unknown): string {
  if (typeof input !== 'object' || input === null || !('location' in input)) throw new E2EPreflightError('Enter a location to research');
  const location = (input as { location: unknown }).location;
  if (typeof location !== 'string' || !location.trim()) throw new Error('Enter a location to research');
  if (location.trim().length > 200) throw new E2EPreflightError('Location must be 200 characters or fewer');
  return location.trim();
}
