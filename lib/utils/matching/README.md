# Geographic Matching System

## Overview
This system matches drivers to bookings based on geographic proximity using UK postcodes.

## Components

### 1. `lib/utils/postcodeUtils.js`
Handles postcode-to-coordinate conversion and distance calculations.

**Key Functions:**
- `getPostcodeCoordinates(postcode)` - Converts UK postcode to lat/lng
- `calculateDistanceBetweenPostcodes(postcode1, postcode2)` - Returns distance in miles
- `haversineDistance(coords1, coords2)` - Calculates straight-line distance
- `isValidUKPostcode(postcode)` - Validates UK postcode format

**API Used:** [Postcodes.io](https://postcodes.io) (FREE, no API key required)

### 2. `lib/matching/geographicMatching.js`
Determines which drivers can service a booking.

**Key Functions:**
- `isWithinServiceArea(driverBase, radius, pickupPostcode)` - Boolean check
- `getGeographicallyEligibleDrivers(booking, drivers)` - Filters all drivers
- `calculateProximityScore(distance, maxRadius)` - Scoring for matching algorithm

## How It Works

### Driver Profile
```javascript
{
  basePostcode: "SK3 0AA",  // Stockport
  travelRadius: 15,         // 15 miles
  baseLat: 53.4084,        // Cached coordinates
  baseLng: -2.1487
}
```

### Booking
```javascript
{
  pickupPostcode: "M1 1AA",  // Manchester city center
  dropoffPostcode: "SK8 5AA" // Cheadle
}
```

### Matching Process

1. **Get Pickup Coordinates**
   - Convert booking pickup postcode to lat/lng

2. **Bounding Box Filter (Fast)**
   - Quickly eliminate drivers obviously out of range
   - Uses approximate degree-to-mile conversion

3. **Precise Distance Check (Accurate)**
   - Calculate exact Haversine distance for remaining drivers
   - Only include drivers within their `travelRadius`

4. **Proximity Scoring**
   - Closer drivers score higher (0-1 scale)
   - Used by main matching algorithm for ranking

## Performance Optimization

### Two-Phase Filtering
```
100 drivers in database
  ↓ Bounding box (fast)
30 drivers nearby
  ↓ Haversine (accurate)
8 drivers within range
  ↓ Main matching algorithm
3 best matches shown to manager
```

### Caching Strategy
- Store `baseLat` and `baseLng` in driver profile
- Reduces API calls by 50%
- Faster calculations (no coordinate lookup needed)

## Database Schema Requirements

### Driver Model
```prisma
model Driver {
  id           String @id @default(cuid())
  basePostcode String
  travelRadius Int    // miles
  baseLat      Float? // Optional: cached coordinates
  baseLng      Float?
}
```

## Testing

Run tests:
```bash
node lib/matching/testGeographicMatching.js
```

Expected output:
- ✅ Postcode validation
- ✅ Coordinate lookup (Stockport, Manchester)
- ✅ Distance calculation (~7 miles)
- ✅ Service area checks
- ✅ Driver matching with scores

## API Rate Limits

**Postcodes.io:**
- Free tier: ~10 requests/second
- No API key required
- UK postcodes only

**Mitigation:**
1. Cache coordinates in database
2. Use bounding box pre-filter
3. Batch requests if needed

## Future Upgrades

When the app scales:
1. **Google Maps Distance Matrix API**
   - Real road distances (not straight-line)
   - Traffic-aware routing
   - More accurate ETAs

2. **Premium Postcode APIs**
   - Higher rate limits
   - International support
   - Additional metadata

3. **Self-hosted Postcode Database**
   - Zero API calls
   - Complete offline operation
   - Full control

## Example Usage

```javascript
import { getGeographicallyEligibleDrivers } from '@/lib/matching/geographicMatching';
import { prisma } from '@/lib/db';

// In your booking API
const drivers = await prisma.driver.findMany({
  where: { status: 'ACTIVE' }
});

const booking = {
  pickupPostcode: 'M1 1AA',
  dropoffPostcode: 'SK8 5AA'
};

const eligible = await getGeographicallyEligibleDrivers(booking, drivers);
// Returns: [{ ...driver, distanceToPickup: 7.2 }, ...]
```

## Notes

- Distance is straight-line (as the crow flies), not road distance
- 15-mile radius typically covers most Greater Manchester area
- System works offline once coordinates are cached
- All distances in miles (UK standard)

# Postcode Validation - User Input Handling

## Problem Statement

Users can make mistakes when entering postcodes:
- **Format issues**: `sk3oaa` (no space), `SK3  0AA` (double space), `sk3 oaa` (lowercase)
- **Typos**: `SK3 OAA` (letter O instead of zero)
- **Invalid postcodes**: `SKZ 144` (doesn't exist), `XX99 9XX` (fake)

## Solution: Multi-Layer Validation

### Layer 1: Format Validation (Client-Side)
✅ Instant feedback as user types
✅ Auto-correction of common mistakes
✅ Prevents invalid submissions

### Layer 2: API Validation (Server-Side)
✅ Verifies postcode actually exists
✅ Returns coordinates for caching
✅ Prevents fake postcodes in database

---

## Usage Examples

### Option 1: Use the PostcodeInput Component (Recommended)

```jsx
"use client";

import { useState } from "react";
import { PostcodeInput } from "@/components/shared/PostcodeInput";
import { Button } from "@/components/ui/button";

export function DriverOnboardingForm() {
  const [basePostcode, setBasePostcode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // PostcodeInput already validated format
    // Now verify it exists with API
    const response = await fetch("/api/validate-postcode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postcode: basePostcode }),
    });

    const data = await response.json();

    if (data.valid) {
      // Save driver with coordinates
      await saveDriver({
        basePostcode: data.coordinates.postcode,
        baseLat: data.coordinates.lat,
        baseLng: data.coordinates.lng,
      });
    } else {
      alert(data.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PostcodeInput
        value={basePostcode}
        onChange={setBasePostcode}
        label="Your Base Postcode"
        required
        placeholder="e.g., SK3 0AA"
      />
      <Button type="submit">Continue</Button>
    </form>
  );
}
```

### Option 2: Use the Validation Hook

```jsx
"use client";

import { useState } from "react";
import { usePostcodeValidation } from "@/components/shared/PostcodeInput";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function BookingForm() {
  const [pickupPostcode, setPickupPostcode] = useState("");
  const { validatePostcode, isValidating, error } = usePostcodeValidation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate postcode with API
    const result = await validatePostcode(pickupPostcode);

    if (result.valid) {
      toast.success("Postcode verified!");
      // Continue with booking...
    } else {
      toast.error(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={pickupPostcode}
        onChange={(e) => setPickupPostcode(e.target.value)}
        placeholder="Pickup postcode"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      
      <Button type="submit" disabled={isValidating}>
        {isValidating ? "Verifying..." : "Book Now"}
      </Button>
    </form>
  );
}
```

### Option 3: Direct Utility Functions

```javascript
import { 
  validateAndNormalizePostcode,
  getPostcodeCoordinates 
} from "@/lib/utils/postcodeUtils";

// Format validation only (no API call)
const { valid, normalized, error } = validateAndNormalizePostcode("sk3oaa");
// Result: { valid: true, normalized: "SK3 0AA" }

// Full validation with coordinates (API call)
try {
  const coords = await getPostcodeCoordinates("SK3 0AA");
  // Result: { lat: 53.4084, lng: -2.1487, postcode: "SK3 0AA" }
} catch (error) {
  console.error(error.message);
  // "Postcode not found: SKZ 144. Please check and try again."
}
```

---

## Error Messages

### Format Errors (Client-Side)
- `"Postcode is required"` - Empty field
- `"Invalid UK postcode format"` - Doesn't match pattern

### API Errors (Server-Side)
- `"Postcode not found: SKZ 144. Please check and try again."` - Doesn't exist
- `"Postcode lookup timed out. Please try again."` - Network issue
- `"Unable to verify postcode: XX99 9XX"` - API error

---

## What Happens with Different Inputs?

| User Input | Normalized | Valid? | API Call? | Result |
|------------|-----------|--------|-----------|---------|
| `sk3 0aa` | `SK3 0AA` | ✅ Yes | ✅ Yes | Success |
| `SK30AA` | `SK3 0AA` | ✅ Yes | ✅ Yes | Success |
| `SK3  0AA` | `SK3 0AA` | ✅ Yes | ✅ Yes | Success |
| `SK3 OAA` | `SK3 0AA` | ✅ Yes | ✅ Yes | Success (O→0) |
| `SKZ 144` | `SKZ 144` | ✅ Format OK | ✅ Yes | ❌ Not found |
| `INVALID` | `INVALID` | ❌ No | ❌ No | Format error |
| *(empty)* | *(empty)* | ❌ No | ❌ No | Required error |

---

## When to Validate?

### Driver Onboarding
✅ **Validate on submit** - Must be valid to save driver
- Cache coordinates in database for performance

### Public Booking Form
✅ **Validate on submit** - Prevent fake bookings
- Optional: Show "Verify Postcode" button for instant feedback

### Manager Creating Booking
✅ **Validate on submit** - Ensure valid addresses
- Can skip if using dropdown of known addresses

### Driver Editing Profile
✅ **Validate if postcode changed** - Only check new postcodes

---

## Performance Considerations

### Caching Coordinates
When a postcode is validated, cache the coordinates:

```javascript
// During driver registration
const coords = await getPostcodeCoordinates(basePostcode);

await prisma.driver.create({
  data: {
    basePostcode: coords.postcode, // Normalized
    baseLat: coords.lat,            // Cached
    baseLng: coords.lng,            // Cached
    // ... other fields
  },
});
```

**Benefit:** Matching algorithm never needs to call Postcodes.io API again!

### Rate Limiting
Postcodes.io allows ~10 requests/second. For high traffic:
1. Cache coordinates in database
2. Add debouncing to validation
3. Consider premium API if needed

---

## Testing

Common test cases to try:

```javascript
// Valid postcodes
"SK3 0AA"  // Stockport
"M1 1AA"   // Manchester
"SW1A 1AA" // London

// Format variations (should all work)
"sk3 0aa"
"SK30AA"
"SK3  0AA"

// Invalid (should fail gracefully)
"SKZ 144"
"XX99 9XX"
"INVALID"
```

---

## Summary

✅ Use `PostcodeInput` component for forms
✅ Validates format instantly (client-side)
✅ Verifies existence on submit (server-side)
✅ Auto-corrects common mistakes
✅ Clear error messages for users
✅ Caches coordinates for performance