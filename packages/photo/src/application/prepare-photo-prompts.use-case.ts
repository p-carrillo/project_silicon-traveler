import { IRouteRepository } from '@silicon-traveler/route';
import { IBraveSearchPort } from '@silicon-traveler/research';
import {
  ILLMPort,
  ContentInput,
  buildContentPrompt,
  CONTENT_SYSTEM_PROMPT,
  selectCamera,
} from '@silicon-traveler/content';
import { Point } from '@silicon-traveler/shared';

export interface PreparePhotoPromptsResult {
  routePointId: number;
  journeyId: number;
  sequence: number;
  placeName: string | null;
  region: string | null;
  country: string | null;
  coordinates: Point;
  isFerryCrossing: boolean;
  researchQuery: string;
  researchSummary: string;
  llmSystemPrompt: string;
  llmUserPrompt: string;
  contentStatus: 'generated';
  imagePrompt: string | null;
  narrative: string | null;
  cameraMetadata: {
    camera: string;
    lens: string;
    iso: number;
    shutterSpeed: string;
    aperture: string;
  } | null;
}

export class PreparePhotoPromptsUseCase {
  constructor(
    private readonly routeRepository: IRouteRepository,
    private readonly braveSearch: IBraveSearchPort,
    private readonly llm: ILLMPort
  ) {}

  async execute(routePointId: number): Promise<PreparePhotoPromptsResult> {
    const routePoint = await this.routeRepository.findById(routePointId);
    if (!routePoint) {
      throw new Error(`RoutePoint ${routePointId} not found`);
    }

    if (routePoint.status !== 'pending') {
      throw new Error(`RoutePoint ${routePointId} already processed (status: ${routePoint.status})`);
    }

    const query = `${routePoint.placeName || 'Unknown'} ${routePoint.country || ''} history culture tourism`;
    const searchResults = await this.braveSearch.search(query, 3);
    const researchSummary = searchResults.map((r) => r.description).join(' ');

    routePoint.updateResearch(researchSummary, routePoint.osmData);
    await this.routeRepository.update(routePoint);

    const input: ContentInput = {
      placeName: routePoint.placeName || 'Unknown Place',
      country: routePoint.country || 'Unknown Country',
      region: routePoint.region || 'Unknown Region',
      researchSummary,
      isFferryCrossing: routePoint.isFferryCrossing,
    };

    const cameraSelection = selectCamera(`${input.placeName}|${input.region}|${input.country}`);
    const llmUserPrompt = buildContentPrompt(input, cameraSelection);

    const content = await this.llm.generateContent(input);

    routePoint.updateContent(content.imagePrompt, content.narrative, content.cameraMetadata);
    await this.routeRepository.update(routePoint);

    return {
      routePointId: routePoint.id,
      journeyId: routePoint.journeyId,
      sequence: routePoint.sequence,
      placeName: routePoint.placeName,
      region: routePoint.region,
      country: routePoint.country,
      coordinates: routePoint.coordinates,
      isFerryCrossing: routePoint.isFferryCrossing,
      researchQuery: query,
      researchSummary,
      llmSystemPrompt: CONTENT_SYSTEM_PROMPT,
      llmUserPrompt,
      contentStatus: 'generated',
      imagePrompt: content.imagePrompt,
      narrative: content.narrative,
      cameraMetadata: content.cameraMetadata,
    };
  }
}
