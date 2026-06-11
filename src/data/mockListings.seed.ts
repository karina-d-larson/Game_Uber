import type { Listing } from '../types/listing'

/**
 * Seed listings for local dev only — imported by listingService.dev, not by UI.
 * FIREBASE TODO: one-time Firestore import, then remove runtime dependency.
 */
export const mockListings: Listing[] = [
  {
    id: 'catan',
    title: 'Catan (Standard)',
    category: 'Strategy',
    condition: 'Like New',
    listingType: 'lending',
    availability: 'available',
    arrangementType: 'rent',
    price: '$5/day',
    pricePerDay: 5,
    ownerId: 'seed-owner-1',
    ownerName: 'Alex Rivera',
    createdAt: 1716940000000,
    updatedAt: 1716940000000,
    location: '1.2 miles',
    meetupPreferences: 'Weekends near downtown',
    description:
      'The classic game of discovery, settlement, and trade. Perfect for a game night with 3-4 friends.',
    imageUrls: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBGWAe1S6-RM9yhP-k4BX0Sj_IGvJ0S9YKjB-RfWNv_9ln7GkmzK2DTgLhd9OZAi0YB6gRCSyu-QbXS4ow5dBYlOiIbYbXF8maPCwDxR-TYogBTyvP41LRYl3QlaUmSunjDkSRljFDmL5VVDtDyuxBEiMAF5_zuJiDrCoQoLUalkZKmB-HlCNUIh8L7yb5-cnQYvzfXPUmtsuqkatkbhqXnWQs_UJbyxIbS6KxV73_slMEYmTEJ-2s2gPt8nA5598o70ImuGJ-mQ9c',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDtoOLKhCu_RFt2sfkGvUMSgWiLREkcxWWJ8JTq2ZpoB8Tv3Zn-AU5rFwa86dCM1ikJ4kHKSv-kiD0bkWDc7XYKku8NV8puWa7FKT95hyepuIuyxDPkFjcCY-PzAILDxgYhbxArSIdBWqUoRyDnM9ESsejguZYkcb1QdMCHJm5PVh5PmWq2xdJhWcOLqQ6uqMKSuLoYEAsQmV1qPdadj_PoqDEDD7ahtPEXbvML5xbn_Cbc5IbwOMog8D3DTUqp30LPqBe79YmPsMA',
    ],
  },
  {
    id: 'wingspan',
    title: 'Wingspan',
    category: 'Strategy',
    condition: 'Like New',
    listingType: 'lending',
    availability: 'available',
    arrangementType: 'trade',
    price: 'Trade Only',
    ownerId: 'seed-owner-2',
    ownerName: 'Sarah Chen',
    createdAt: 1716853600000,
    updatedAt: 1716853600000,
    location: '0.5 miles',
    description:
      'Competitive bird-collection engine-building game. Mint condition, including Swift-Start pack.',
    imageUrls: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD6Yhwx7lDmHTISSiirIy1FeIXGAs3t6fhIKBJuxRYq3uq42ib79RkwmoZq3j1-jjoQ90NwkA0yoFSJI7lpUUi3T8gb9ZCSvP1gr3tz_olEwKt3Hfj0AfnS3Sf9V56PKC75fbhegs9s3ovhcVAa7MVZIJVLvrUXq1dKf-jqkYxSi-uUrz66X1nCKAqvof8Pt9hqvwH-mksSenHx5ycUOWlH4uQ4MxwC3NTP7NXRPUHaAcalsSJg89A_b-AqQMQ95eGZKOcYeaUf82Y',
    ],
  },
  {
    id: 'azul',
    title: 'Azul',
    category: 'Family',
    condition: 'Good',
    listingType: 'lending',
    availability: 'available',
    arrangementType: 'free',
    price: 'Free',
    ownerId: 'seed-owner-3',
    ownerName: 'Marcus Thorne',
    createdAt: 1716767200000,
    updatedAt: 1716767200000,
    location: '2.1 miles',
    description:
      'Tactile tile-placement game based on Portuguese palace walls. Fast and easy to learn.',
    imageUrls: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCJ3kwk0l6v1BjaJTuygd7o3m5_rFbt-r_vX1iIQRJqCG4_9RHvwo_sSSm9aNzQYonGh0k-hf52Fdkvby_7O7pqBuGVYU09QvBArYoJJxPyNCxpiWqViAjWknZApWW4b3tudvucA0IlzzZXMu5lqrgYk2JX8bgjWGncduOhBmfZ8HUQORT01bzI0cQnMdka7Q2NFKctjpQXDtKCib0ackW0sOQ9mAtrdIuPQJZrrSq-EaBiCFw0bXekXIpVo6zInSHmHYUkhPRV4BY',
    ],
  },
]
