#!/usr/bin/env node

const { pool } = require('../packages/shared/dist/index.js');
const { MariaDBRouteRepository } = require('../packages/route/dist/index.js');
const { MariaDBPhotoRepository, PublishPhotoUseCase } = require('../packages/photo/dist/index.js');

async function publishNextPhoto() {
  console.log('🚀 Publishing next ready photo...\n');

  const routeRepo = new MariaDBRouteRepository();
  const photoRepo = new MariaDBPhotoRepository(pool);
  const publishPhotoUseCase = new PublishPhotoUseCase(photoRepo, routeRepo);

  try {
    // Get next image_ready route point
    const readyPoints = await routeRepo.findByStatus('image_ready', 1);

    if (readyPoints.length === 0) {
      console.log('❌ No photos ready to publish');
      return;
    }

    const routePoint = readyPoints[0];
    console.log(`📍 Publishing route point ${routePoint.id} (sequence ${routePoint.sequence})`);
    console.log(`   ${routePoint.placeName || 'Unknown'}, ${routePoint.region || ''}, ${routePoint.country || ''}\n`);

    // Extract prepared data from route point
    const preparedPhoto = {
      imageUrl: routePoint.imagePath || '/images/default.jpg',
      gridThumbnailUrl: routePoint.thumbnailPath || '/images/default_grid.jpg',
      heroThumbnailUrl: routePoint.thumbnailPath?.replace('_grid', '_hero') || '/images/default_hero.jpg',
      narrative: routePoint.narrativePrompt || 'Another day on the road.',
      camera: routePoint.cameraMetadata?.camera || 'Leica M11',
      lens: routePoint.cameraMetadata?.lens || '35mm f/1.4',
      iso: routePoint.cameraMetadata?.iso || 800,
      shutterSpeed: routePoint.cameraMetadata?.shutterSpeed || '1/125',
      aperture: routePoint.cameraMetadata?.aperture || 'f/2.8',
      revisedPrompt: null,
    };

    const photoId = await publishPhotoUseCase.execute(routePoint.id, preparedPhoto);
    console.log(`✅ Photo ${photoId} published successfully!\n`);
    console.log(`📸 Camera: ${preparedPhoto.camera} with ${preparedPhoto.lens}`);
    console.log(`🖼️  Image: ${preparedPhoto.imageUrl}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

publishNextPhoto().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
