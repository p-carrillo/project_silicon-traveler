import type { QueryExecutor } from '@silicon-traveler/shared';
import { IRouteRepository } from '../ports/route-repository.port';

export class DeleteRoutePointAdminUseCase {
  constructor(private readonly routeRepository: IRouteRepository) {}

  async execute(id: number, options?: { queryExecutor?: QueryExecutor }): Promise<void> {
    const deleted = await this.routeRepository.deleteById(id, options?.queryExecutor);
    if (!deleted) {
      throw new Error(`RoutePoint ${id} not found`);
    }
  }
}
