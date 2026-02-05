#!/usr/bin/env node

/**
 * Seed database with 10 sample photos from Unsplash
 * 
 * Usage: node scripts/seed-photos.js
 */

const { pool } = require('../packages/shared/dist/index.js');
const https = require('https');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// Sample photos from Unsplash (1600x900 landscape photos)
const PHOTOS = [
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=900&fit=crop',
    title: 'Mountain Valley Dawn',
    location: 'Valencia, Spain',
    lat: 39.4699, lng: -0.3763,
    narrative: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
  },
  {
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&h=900&fit=crop',
    title: 'Coastal Sunset Path',
    location: 'Barcelona, Spain',
    lat: 41.3851, lng: 2.1734,
    narrative: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.',
  },
  {
    url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1600&h=900&fit=crop',
    title: 'Urban Twilight Streets',
    location: 'Madrid, Spain',
    lat: 40.4168, lng: -3.7038,
    narrative: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae.',
  },
  {
    url: 'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=1600&h=900&fit=crop',
    title: 'Ancient Stone Bridge',
    location: 'Zaragoza, Spain',
    lat: 41.6488, lng: -0.8891,
    narrative: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est.',
  },
  {
    url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1600&h=900&fit=crop',
    title: 'Desert Highway Horizon',
    location: 'Pamplona, Spain',
    lat: 42.8125, lng: -1.6458,
    narrative: 'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. At vero eos et accusamus.',
  },
  {
    url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&h=900&fit=crop',
    title: 'Lake Reflection Morning',
    location: 'Bilbao, Spain',
    lat: 43.2630, lng: -2.9350,
    narrative: 'Et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.',
  },
  {
    url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1600&h=900&fit=crop',
    title: 'Foggy Forest Trail',
    location: 'San Sebastián, Spain',
    lat: 43.3183, lng: -1.9812,
    narrative: 'Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore cum soluta nobis.',
  },
  {
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&h=900&fit=crop',
    title: 'Snow Peak Summit',
    location: 'Granada, Spain',
    lat: 37.1773, lng: -3.5986,
    narrative: 'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur.',
  },
  {
    url: 'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=1600&h=900&fit=crop',
    title: 'Riverside Village Evening',
    location: 'Sevilla, Spain',
    lat: 37.3891, lng: -5.9845,
    narrative: 'Sapiente delectus ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Lorem ipsum dolor sit amet consectetur adipiscing elit sed eiusmod.',
  },
  {
    url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=1600&h=900&fit=crop',
    title: 'Golden Hour Meadow',
    location: 'Málaga, Spain',
    lat: 36.7213, lng: -4.4214,
    narrative: 'Tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor reprehenderit.',
  },
];

const CAMERA_MODELS = [
  'Leica M6',
  'Nikon F3',
  'Canon AE-1',
  'Pentax K1000',
  'Olympus OM-1',
];

const LENSES = [
  '50mm f/1.4',
  '35mm f/2',
  '28mm f/2.8',
  '85mm f/1.8',
  '24mm f/2.8',
];

const FILM_STOCKS = [
  'Kodak Portra 400',
  'Fuji Pro 400H',
  'Kodak Ektar 100',
  'Ilford HP5 Plus',
  'Kodak Gold 200',
];

const TRANSLATION_LANGUAGES = ['es', 'en'];

/**
 * Download an image from URL
 */
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

/**
 * Create a simple thumbnail (for now, just copy the image)
 * In production, you'd use Sharp to resize
 */
async function createThumbnail(imagePath, thumbnailPath) {
  return fs.promises.copyFile(imagePath, thumbnailPath);
}

/**
 * Random element from array
 */
function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Main seed function
 */
async function seedPhotos() {
  console.log('📸 Starting photo seed...\n');
  
  let connection;
  
  try {
    connection = await pool.getConnection();
    
    // Clean existing seed data
    console.log('1. Cleaning previous seed data...');
    await connection.query('DELETE FROM photos');
    await connection.query('DELETE FROM route_points');
    console.log('   ✓ Tables cleaned\n');
    
    // Ensure journey exists
    console.log('2. Checking journey...');
    const journeys = await connection.query('SELECT id FROM journey LIMIT 1');
    
    let journeyId;
    if (journeys.length === 0) {
      console.log('   Creating journey...');
      const result = await connection.query(
        `INSERT INTO journey (name, origin_point, current_position, heading, started_at) 
         VALUES (?, ST_GeomFromText(?), ST_GeomFromText(?), ?, ?)`,
        [
          'Around the World on Foot',
          'POINT(-0.3763 39.4699)', // Valencia
          'POINT(-0.3763 39.4699)',
          'east',
          '2026-01-01 00:00:00',
        ]
      );
      journeyId = Number(result.insertId);
    } else {
      journeyId = journeys[0].id;
    }
    console.log(`   ✓ Journey ID: ${journeyId}\n`);
    
    // Since we cleaned the tables, always start from sequence 1
    const startSequence = 1;
    console.log(`3. Starting from sequence: ${startSequence}\n`);
    
    // Create images directory structure
    const baseDate = new Date('2026-02-01');
    
    for (let i = 0; i < PHOTOS.length; i++) {
      const photo = PHOTOS[i];
      const sequence = startSequence + i;
      const photoDate = new Date(baseDate);
      photoDate.setDate(photoDate.getDate() + i);
      
      const year = photoDate.getFullYear();
      const month = String(photoDate.getMonth() + 1).padStart(2, '0');
      const day = String(photoDate.getDate()).padStart(2, '0');
      
      console.log(`${sequence}/10: ${photo.title} (${photo.location})`);
      
      // Create directory structure
      const dateDir = path.join(rootDir, 'images', String(year), month, day);
      await fs.promises.mkdir(dateDir, { recursive: true });
      
      // Download image
      const imagePath = path.join(dateDir, `photo-${sequence}.jpg`);
      const thumbnailPath = path.join(dateDir, `photo-${sequence}-thumb.jpg`);
      const relativeImagePath = `images/${year}/${month}/${day}/photo-${sequence}.jpg`;
      const relativeThumbnailPath = `images/${year}/${month}/${day}/photo-${sequence}-thumb.jpg`;
      
      console.log(`   Downloading image...`);
      await downloadImage(photo.url, imagePath);
      
      console.log(`   Creating thumbnail...`);
      await createThumbnail(imagePath, thumbnailPath);
      
      // Insert route point
      const pointWKT = `POINT(${photo.lng} ${photo.lat})`;
      const cameraMetadata = {
        model: random(CAMERA_MODELS),
        lens: random(LENSES),
        film: random(FILM_STOCKS),
        iso: [100, 200, 400, 800][Math.floor(Math.random() * 4)],
        shutterSpeed: ['1/125', '1/250', '1/500', '1/1000'][Math.floor(Math.random() * 4)],
      };
      
      console.log(`   Inserting route point...`);
      const routeResult = await connection.query(
        `INSERT INTO route_points 
         (journey_id, sequence, place_name, coordinates, country, status, image_path, thumbnail_path, 
          camera_metadata, narrative_prompt, published_at, created_at)
         VALUES (?, ?, ?, ST_GeomFromText(?), ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          journeyId,
          sequence,
          photo.location,
          pointWKT,
          'Spain',
          'published',
          relativeImagePath,
          relativeThumbnailPath,
          JSON.stringify(cameraMetadata),
          photo.narrative,
          photoDate.toISOString().slice(0, 19).replace('T', ' '),
          new Date().toISOString().slice(0, 19).replace('T', ' '),
        ]
      );
      
      const routePointId = Number(routeResult.insertId);

      for (const language of TRANSLATION_LANGUAGES) {
        await connection.query(
          `INSERT INTO route_point_translations
           (route_point_id, language, image_prompt, narrative)
           VALUES (?, ?, ?, ?)`,
          [
            routePointId,
            language,
            null,
            photo.narrative,
          ]
        );
      }
      
      // Insert photo
      console.log(`   Inserting photo...`);
      const photoResult = await connection.query(
        `INSERT INTO photos 
         (route_point_id, title, narrative, location, coordinates, camera_model, lens, iso, 
          shutter_speed, roll_number, frame_number, image_path, thumbnail_path, published_at, created_at)
         VALUES (?, ?, ?, ?, ST_GeomFromText(?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          routePointId,
          photo.title,
          photo.narrative,
          photo.location,
          pointWKT,
          cameraMetadata.model,
          cameraMetadata.lens,
          cameraMetadata.iso,
          cameraMetadata.shutterSpeed,
          `ROLL-${String(sequence).padStart(3, '0')}`,
          `FRAME-${String(sequence).padStart(2, '0')}`,
          relativeImagePath,
          relativeThumbnailPath,
          photoDate.toISOString().slice(0, 19).replace('T', ' '),
          new Date().toISOString().slice(0, 19).replace('T', ' '),
        ]
      );

      const photoId = Number(photoResult.insertId);
      for (const language of TRANSLATION_LANGUAGES) {
        await connection.query(
          `INSERT INTO photo_translations
           (photo_id, language, title, narrative, location)
           VALUES (?, ?, ?, ?, ?)`,
          [
            photoId,
            language,
            photo.title,
            photo.narrative,
            photo.location,
          ]
        );
      }
      
      console.log(`   ✓ Photo ${sequence} inserted\n`);
    }
    
    console.log('✅ Successfully seeded 10 photos!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Journey: ${journeyId}`);
    console.log(`   - Route points: ${PHOTOS.length}`);
    console.log(`   - Photos: ${PHOTOS.length}`);
    console.log(`   - Images downloaded to: images/2026/02/`);
    
  } catch (error) {
    console.error('❌ Error seeding photos:', error);
    throw error;
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

// Run if executed directly
if (require.main === module) {
  seedPhotos()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedPhotos };
