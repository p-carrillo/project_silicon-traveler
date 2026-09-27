const {
  MariaDBJourneyRepository,
  CreateJourneyUseCase,
  GetJourneyStatsUseCase
} = require('../packages/journey/dist/index.js');
const { pool } = require('../packages/shared/dist/index.js');

async function testJourney() {
  const repository = new MariaDBJourneyRepository();
  const createUseCase = new CreateJourneyUseCase(repository);
  const statsUseCase = new GetJourneyStatsUseCase(repository);
  
  try {
    console.log('Creating journey from Oleiros...');
    const journey = await createUseCase.execute(
      'Around the World on Foot',
      { lat: 43.3328, lng: -8.3186 }, // Oleiros, Spain
      'east'
    );
    
    console.log('\n✓ Journey created:');
    console.log('ID:', journey.id);
    console.log('Name:', journey.name);
    console.log('Origin:', journey.originPoint);
    console.log('Current Position:', journey.currentPosition);
    console.log('Heading:', journey.heading);
    console.log('Started:', journey.startedAt);
    
    console.log('\nGetting journey stats...');
    const stats = await statsUseCase.execute();
    console.log('Stats:', stats);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

testJourney().catch(console.error);
