# Tri-X 400 look and fixed 50 mm lens

**Status:** Accepted
**Date:** 2026-09-25

## Context

The documentary house style currently asks for restrained grain and does not give the image model a consistent focal length. The user wants a harder black-and-white look inspired by Tri-X 400 and a consistent 50 mm perspective across generated images.

## Decision

Describe the house style as high-contrast Tri-X 400-inspired monochrome, with deep blacks, bright highlights that retain detail, clear tonal separation, and visible grain. Specify a 50 mm lens in image prompts and generated camera metadata. Record ISO 400 to match the film reference. Keep aperture and shutter speed metadata variable.

## Alternatives considered

- Keep restrained grain and vary focal length by scene.
- Use exact film stock emulation during image post-processing.

## Consequences

### Positive
- Generated images have a more consistent, recognisable tonal character and perspective.
- Prompt direction and displayed camera metadata agree on focal length and film speed.

### Negative
- A fixed 50 mm perspective limits wide-angle and telephoto compositions.
- The image model may interpret film terminology loosely; the tonal description makes the requested look explicit.

### Follow-ups
- Review the Tri-X-style result in the next Admin image batch and adjust contrast or grain from the generated images.
