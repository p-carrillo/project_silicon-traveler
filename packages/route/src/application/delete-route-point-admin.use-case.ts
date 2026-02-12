import { IRouteRepository } from '../ports/route-repository.port';

export class DeleteRoutePointAdminUseCase {
  constructor(private readonly routeRepository: IRouteRepository) {}

  async execute(id: number): Promise<void> {
    const deleted = await this.routeRepository.deleteById(id);
    if (!deleted) {
      throw new Error(`RoutePoint ${id} not found`);
    }
  }
}
