const { CreateJourneyUseCase, MariaDBJourneyRepository } = require('../packages/journey/dist/index.js');

async function explore() {
  console.log('\n=== Explorando Journey Module ===\n');
  
  const repo = new MariaDBJourneyRepository();
  
  // Buscar viaje activo
  console.log('1. Buscando viaje activo...');
  const journey = await repo.findActive();
  
  if (journey) {
    console.log('   ✓ Viaje encontrado:');
    console.log('   - ID:', journey.id);
    console.log('   - Nombre:', journey.name);
    console.log('   - Origen:', journey.originPoint);
    console.log('   - Posición actual:', journey.currentPosition);
    console.log('   - Rumbo:', journey.heading);
    console.log('   - Iniciado:', journey.startedAt);
  } else {
    console.log('   ✗ No hay viaje activo');
    console.log('\n2. Creando nuevo viaje...');
    
    const createUseCase = new CreateJourneyUseCase(repo);
    const newJourney = await createUseCase.execute(
      'Around the World on Foot',
      { lat: 43.3328, lng: -8.3186 }, // Oleiros
      'east'
    );
    
    console.log('   ✓ Viaje creado:');
    console.log('   - ID:', newJourney.id);
    console.log('   - Nombre:', newJourney.name);
    console.log('   - Origen:', newJourney.originPoint);
  }
  
  const { pool } = require('../packages/shared/dist/index.js');
  await pool.end();
}

explore().catch(console.error);
