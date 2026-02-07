# ADR 001: Module Architecture

**Status:** Accepted  
**Date:** 2026-02-02  

## Context

We are building a web application that simulates a photographer's journey around the world on foot from Oleiros (Spain) heading east. The system must:

- Generate route points every 15-20km prioritizing cities
- Research each location using external APIs (Overpass, Nominatim, Brave Search)
- Generate image prompts and narrative using LLMs (GPT-4)
- Create photographic images using DALL-E 3
- Maintain a buffer of 10 pre-generated photos
- Publish one photo daily between 18:00-20:00
- Display photos in a gallery with search/filter capabilities
- Support future migration from local storage to cloud storage

The codebase must follow hexagonal architecture with SOLID principles, using MariaDB without ORM (direct SQL), and be organized as a TypeScript monorepo.

## Decision

We will organize the application into **8 domain modules** within a monorepo structure, each following hexagonal architecture (domain, application, ports, adapters):

### Module Structure

```
project-silicon-traveler/
├── apps/
│   ├── api/              # REST API server
│   ├── web/              # Next.js frontend
│   ├── scheduler/        # Cron jobs (generator & publisher)
│   └── cli/              # CLI tools (init-journey script)
├── packages/
│   ├── journey/          # Journey management (origin, current position, heading)
│   ├── route/            # Route point calculation, city finding, geocoding
│   ├── research/         # Web research using Brave Search API
│   ├── content/          # LLM content generation (image & narrative prompts)
│   ├── image/            # Image generation (DALL-E) & thumbnail creation
│   ├── storage/          # Abstract file storage with pluggable adapters
│   ├── photo/            # Photo publishing & management
│   ├── map/              # Map state and photo pins
│   └── shared/           # MariaDB connection pool & utilities
```

### Module Responsibilities

#### 1. Journey Module
**Domain:** Journey entity with origin point, current position, heading direction, travel statistics  
**Use Cases:** CreateJourney, GetJourneyStats, UpdateCurrentPosition  
**Ports:** JourneyRepository (output)  
**Adapters:** MariaDBJourneyRepository  

#### 2. Route Module
**Domain:** RoutePoint entity with coordinates, sequence, place information, status  
**Use Cases:** 
- CalculateNextPoint (Haversine formula, bearing ~90° east, 15-20km)
- DetectWater (check if coordinates fall in water bodies)
- FindNearestCity (Overpass API: place=city/town/village, prioritize by population)
- GeocodePoint (Nominatim reverse geocoding for country/region)  
**Ports:** IOverpassPort, INominatimPort, RouteRepository (output)  
**Adapters:** OverpassAdapter, NominatimAdapter, MariaDBRouteRepository  

#### 3. Research Module
**Domain:** Research result value object  
**Use Cases:** ResearchPlace (query Brave Search, extract relevant info)  
**Ports:** IBraveSearchPort (output)  
**Adapters:** BraveSearchAdapter (with retry logic)  

#### 4. Content Module
**Domain:** ContentPrompts value object (imagePrompt, narrative, cameraMetadata)  
**Use Cases:** GenerateContent (GPT-4 generates prompts based on research)  
**Ports:** ILLMPort (output)  
**Adapters:** OpenAILLMAdapter  

#### 5. Image Module
**Domain:** Image entity with paths, dimensions  
**Use Cases:** 
- GenerateImage (DALL-E 3 from prompt)
- CreateThumbnail (sharp: 400x400 square, 1920x1080 hero)  
**Ports:** IImageGenerationPort, IImageProcessingPort (output)  
**Adapters:** DallEAdapter, SharpAdapter  

#### 6. Storage Module
**Domain:** StoredFile value object (path, url)  
**Use Cases:** SaveFile, GetFile, DeleteFile  
**Ports:** IStoragePort (output)  
**Adapters:** LocalStorageAdapter (initial), S3StorageAdapter (future)  

**Storage Port Interface:**
```typescript
interface IStoragePort {
  save(file: Buffer, path: string): Promise<string>; // returns full path
  get(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
}
```

This abstraction allows seamless migration from local filesystem to cloud storage (S3, R2, etc.) by swapping adapters without changing domain logic.

#### 7. Photo Module
**Domain:** Photo entity with all display metadata  
**Use Cases:** 
- PreparePhoto (orchestrates image generation, thumbnail creation, storage)
- PublishPhoto (creates photo record, marks route point as published)
- GetLatestPhoto, ListPhotos (with filters)  
**Ports:** PhotoRepository (output)  
**Adapters:** MariaDBPhotoRepository

#### 8. Map Module
**Domain:** MapState entity with photo pins and viewport  
**Use Cases:** 
- RefreshMapState (recalculate pins from published photos)
- GetMapPins (retrieve pins for display)  
**Ports:** MapRepository (output)  
**Adapters:** MariaDBMapRepository  

### Dependency Flow

```
Domain (entities, value objects, business rules)
   ↑
Application (use cases, orchestration)
   ↑
Ports (interfaces)
   ↑
Adapters (infrastructure: DB, APIs, filesystem)
```

**Rules:**
- Domain has ZERO dependencies on infrastructure
- Application depends only on domain and port interfaces
- Adapters implement ports and depend on external services
- No cross-module direct dependencies (modules integrate via ports)

### Pipeline Flow

**Generation Pipeline** (runs every 6h):
1. Route Module: Calculate next point → Detect water → Find city → Geocode
2. Research Module: Search web for location info
3. Content Module: Generate prompts from research
4. Image Module: Generate image with DALL-E
5. Image Module: Create thumbnails
6. Storage Module: Save images to storage
7. Photo Module: Update route_point with paths, mark status='image_ready'

**Publishing Pipeline** (runs daily 18-20h):
1. Photo Module: Get next image_ready route point
2. Photo Module: Create photo record, mark status='published'

## Alternatives Considered

### Option A: Monolithic Architecture
Group all logic in a single module with layers (controllers → services → repositories).

**Rejected because:**
- Tight coupling makes testing difficult
- Hard to swap external services (storage, APIs)
- Violates SOLID principles
- Difficult to reason about domain boundaries

### Option B: Microservices Architecture
Separate applications for each module communicating via message queue.

**Rejected because:**
- Over-engineered for current scale
- Increased operational complexity
- Network latency between services
- More difficult local development

### Option C: Feature-Based Modules
Organize by features (generation, publishing, display) instead of domain concepts.

**Rejected because:**
- Mixes unrelated concerns
- Domain logic scattered across features
- Harder to maintain consistent business rules

## Consequences

### Positive
- **Clear separation of concerns**: Each module has single responsibility
- **Testability**: Domain logic can be tested without infrastructure
- **Flexibility**: Can swap APIs, storage, or databases by changing adapters
- **Maintainability**: Changes in one module don't affect others
- **Team scalability**: Different developers can work on different modules
- **Future-proof storage**: IStoragePort abstraction allows easy migration to cloud

### Negative
- **Initial complexity**: More files and folders than monolithic approach
- **Learning curve**: Team must understand hexagonal architecture
- **Boilerplate**: More interfaces and abstractions to maintain
- **Cross-module orchestration**: Apps must coordinate multiple modules

### Follow-ups
- Define exact port interfaces for each module
- Document data flow between modules in sequence diagrams
- Create shared types package for cross-module communication
- Implement error handling strategy across module boundaries
- Define transaction boundaries for multi-module operations
