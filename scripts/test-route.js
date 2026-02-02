const {
  CalculateNextPointUseCase,
  FindNearestCityUseCase,
  GeocodePointUseCase,
  DetectWaterUseCase,
  OverpassAdapter,
  NominatimAdapter,
  RoutePoint,
  MariaDBRouteRepository
} = require('../packages/route/dist/index.js');
const { pool, calculateDistance } = require('../packages/shared/dist/index.js');

async function testRoute() {
  console.log('=== Testing Route Module ===\n');
  
  // Initialize adapters
  const overpassAdapter = new OverpassAdapter();
  const nominatimAdapter = new NominatimAdapter();
  const routeRepository = new MariaDBRouteRepository();
  
  // Use cases
  const calculateUseCase = new CalculateNextPointUseCase();
  const findCityUseCase = new FindNearestCityUseCase(overpassAdapter);
  const geocodeUseCase = new GeocodePointUseCase(nominatimAdapter);
  const detectWaterUseCase = new DetectWaterUseCase(overpassAdapter);
  
  try {
    // 1. Calculate next point from Oleiros heading east
    console.log('1. Calculating next point from Oleiros (heading east)...');
    const origin = { lat: 43.3328, lng: -8.3186 };
    
    const nextPoint = calculateUseCase.execute({
      currentPosition: origin,
      heading: 'east',
      minDistanceKm: 15,
      maxDistanceKm: 20
    });
    
    const distance = calculateDistance(origin, nextPoint);
    console.log(`✓ Next point: ${nextPoint.lat.toFixed(4)}, ${nextPoint.lng.toFixed(4)}`);
    console.log(`  Distance: ${distance.toFixed(2)} km\n`);
    
    // 2. Find nearest city to the new point
    console.log('2. Finding nearest city...');
    const city = await findCityUseCase.execute(nextPoint, 10);
    
    if (city) {
      console.log(`✓ Found: ${city.name} (${city.type})`);
      console.log(`  Coordinates: ${city.lat}, ${city.lon}\n`);
    } else {
      console.log('  No city found within 10km\n');
    }
    
    // 3. Geocode the point
    console.log('3. Geocoding point...');
    const geocoding = await geocodeUseCase.execute(city ? { lat: city.lat, lng: city.lon } : nextPoint);
    
    if (geocoding) {
      console.log(`✓ Location: ${geocoding.displayName}`);
      console.log(`  Country: ${geocoding.country}`);
      console.log(`  Region: ${geocoding.region}\n`);
    } else {
      console.log('  Geocoding failed\n');
    }
    
    // 4. Detect if point is in water
    console.log('4. Checking if point is in water...');
    const isWater = await detectWaterUseCase.execute(nextPoint);
    console.log(`  Is water: ${isWater}\n`);
    
    // 5. Create route point in database
    console.log('5. Creating route point in database...');
    const routePointData = RoutePoint.create(
      2, // journey_id from our test
      1, // sequence
      city ? { lat: city.lat, lng: city.lon } : nextPoint,
      isWater,
      distance
    );
    
    const savedRoute = await routeRepository.create({
      ...routePointData,
      placeName: city?.name || null,
      country: geocoding?.country || null,
      region: geocoding?.region || null,
    });
    
    console.log(`✓ Route point created with ID: ${savedRoute.id}`);
    console.log(`  Place: ${savedRoute.placeName || 'Unknown'}`);
    console.log(`  Status: ${savedRoute.status}\n`);
    
    // 6. Query back from database
    console.log('6. Querying route points by status...');
    const pending = await routeRepository.findByStatus('pending', 5);
    console.log(`✓ Found ${pending.length} pending route points\n`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

testRoute().catch(console.error);
