import type { E2EExecutionContext } from './e2e-execution';
import type { IGlobalPlaceSelector } from './global-place-selector.port';

export class SelectRandomResearchPlaceUseCase {
  constructor(private readonly selector: IGlobalPlaceSelector) {}

  execute(context: E2EExecutionContext): void {
    const [place] = this.selector.select(1);
    context.emit({ type: 'result', index: 1, total: 1, data: { place } });
  }
}
