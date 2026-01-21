# AI Video Generation Specifications

## Overview
Instead of filming thousands of exercises, FitApp will use Generative AI to create consistent, high-quality demonstration videos. This allows for infinite variations (different angles, body types, home/gym settings).

## 1. Prompt Engineering Template

To ensure consistency across 1000+ videos, we use a strict prompt template.

**Template:**
> "(Style), (Camera Angle), (Subject Description), performing (Exercise Name), (Movement Details), (Environment), (Lighting), (Quality Tags)"

### Variables:

**Style:**
- "Photorealistic"
- "Instructional fitness video"
- "4k resolution"

**Camera Angle:**
- "Side profile view" (Best for Squats, Lunges)
- "Front view" (Best for Shoulder Press, Curls)
- "45-degree angle" (Best for Bench Press, Pushups)

**Subject:**
- "Athletic Egyptian male, short hair, wearing black compression shirt and shorts"
- "Fitness female model, wearing modest sportswear, hijab (optional variant)"

**Environment:**
- "Clean modern gym background, blurred depth of field"
- "Bright living room with wooden floor" (For Home Workouts)

**Lighting:**
- "Soft studio lighting"
- "Natural daylight"

## 2. Technical Pipeline

### A. Generation
*Recommended Tools:*
1. **Stable Video Diffusion (SVD-XT):** Open source, can be hosted on our own GPUs. Best for cost control.
2. **Runway Gen-2:** Higher quality, paid API. Good for "Hero" exercises.
3. **Luma Dream Machine:** Excellent motion consistency.

### B. Post-Processing (Automated)
1. **Looping:** AI videos are short (2-4s). We must use ffmpeg to create a seamless "boomerang" loop.
2. **Overlay:** Add FitApp logo watermark.
3. **Compression:** Convert to H.265 for mobile streaming.

## 3. Database Integration

The `exercises` table will have a `video_status` field:
- `PENDING`: Needs generation.
- `PROMPTED`: Prompt written, waiting for API.
- `GENERATED`: Video exists, needs review.
- `PUBLISHED`: Live in app.

## 4. Cost Estimation
- Self-hosted SVD: ~$0.01 per video (GPU cost).
- Runway API: ~$0.05 - $0.10 per video.
- **Strategy:** Use Self-hosted for the bulk (80%), use Runway for complex movements (20%).