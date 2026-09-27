import type { EditorialGenerationConfig } from '../config/editorial';
import { DEFAULT_EDITORIAL_GENERATION_CONFIG } from '../config/editorial';
import { buildEditorialBrief, evaluateEditorialNarrative, type EditorialBrief } from '../domain/editorial-brief';
import { buildVisualBrief, type VisualBrief } from '../domain/visual-brief';
import type { ContentInput, GeneratedContent, ILLMPort } from '../ports/llm.port';

export interface EditorialGenerationContext {
  sequence: number;
  coordinates?: { lat: number; lng: number } | null;
  distanceFromPrevious?: number | null;
  recentNarratives?: readonly string[];
  verifiedGeographicObservations?: readonly string[];
}

export interface EditorialGenerationResult {
  content: GeneratedContent;
  brief: EditorialBrief;
  visualBrief: VisualBrief;
}

export class EditorialQualityError extends Error {
  constructor(public readonly reasons: string[]) {
    super(`Editorial quality check failed after one regeneration: ${reasons.join('; ')}`);
    this.name = 'EditorialQualityError';
  }
}

export class GenerateEditorialContentUseCase {
  constructor(
    private readonly llm: ILLMPort,
    private readonly config: EditorialGenerationConfig = DEFAULT_EDITORIAL_GENERATION_CONFIG
  ) {}

  async execute(input: ContentInput, context: EditorialGenerationContext): Promise<EditorialGenerationResult> {
    const recentNarratives = context.recentNarratives ?? [];
    const brief = buildEditorialBrief({
      placeName: input.placeName,
      country: input.country,
      region: input.region,
      researchSummary: input.researchSummary,
      sequence: context.sequence,
      coordinates: context.coordinates,
      distanceFromPrevious: context.distanceFromPrevious,
      recentNarratives,
      verifiedGeographicObservations: context.verifiedGeographicObservations,
      config: this.config,
    });

    const visualBrief = buildVisualBrief({
      placeName: input.placeName,
      factualAnchor: brief.factualAnchor,
      visualMaterialAnchor: brief.visualMaterialAnchor,
      researchSupported: brief.researchSupported,
      sequence: context.sequence,
    });
    const generationInput: ContentInput = { ...input, editorialBrief: brief, visualBrief };
    const initialContent = await this.llm.generateContent(generationInput);
    const initialQuality = evaluateEditorialNarrative(initialContent.narrative, brief, recentNarratives);
    if (initialQuality.accepted) return { content: initialContent, brief, visualBrief };

    const regeneratedContent = await this.llm.generateContent({
      ...generationInput,
      qualityFeedback: initialQuality.reasons,
    });
    const regeneratedQuality = evaluateEditorialNarrative(regeneratedContent.narrative, brief, recentNarratives);
    if (!regeneratedQuality.accepted) throw new EditorialQualityError(regeneratedQuality.reasons);

    return { content: regeneratedContent, brief, visualBrief };
  }
}
