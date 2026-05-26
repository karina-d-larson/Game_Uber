import type { Listing } from '../types/listing'

/**
 * MOCK DATA — Phase 1 / local dev only
 * ===================================
 * Teammate (Firebase): use this array to seed Firestore once, then the app should
 * read via listingService.fetchListings(), not import mockListings in pages.
 *
 * Keep getListingById() for tests or fallbacks; production detail page should
 * use listingService.getListingById after Firestore is wired.
 *
 * Guide: docs/FIREBASE_INTEGRATION.md
 */
export const mockListings: Listing[] = [
  {
    id: 'catan',
    title: 'Catan (Standard)',
    category: 'Strategy',
    condition: 'Like New',
    listingType: 'lending',
    availability: 'available',
    ownerId: 'seed-owner-1',
    ownerName: 'Alex Rivera',
    createdAt: 1716940000000,
    description:
      'The classic game of discovery, settlement, and trade. Perfect for a game night with 3-4 friends.',
    imageUrls: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBGWAe1S6-RM9yhP-k4BX0Sj_IGvJ0S9YKjB-RfWNv_9ln7GkmzK2DTgLhd9OZAi0YB6gRCSyu-QbXS4ow5dBYlOiIbYbXF8maPCwDxR-TYogBTyvP41LRYl3QlaUmSunjDkSRljFDmL5VVDtDyuxBEiMAF5_zuJiDrCoQoLUalkZKmB-HlCNUIh8L7yb5-cnQYvzfXPUmtsuqkatkbhqXnWQs_UJbyxIbS6KxV73_slMEYmTEJ-2s2gPt8nA5598o70ImuGJ-mQ9c',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDtoOLKhCu_RFt2sfkGvUMSgWiLREkcxWWJ8JTq2ZpoB8Tv3Zn-AU5rFwa86dCM1ikJ4kHKSv-kiD0bkWDc7XYKku8NV8puWa7FKT95hyepuIuyxDPkFjcCY-PzAILDxgYhbxArSIdBWqUoRyDnM9ESsejguZYkcb1QdMCHJm5PVh5PmWq2xdJhWcOLqQ6uqMKSuLoYEAsQmV1qPdadj_PoqDEDD7ahtPEXbvML5xbn_Cbc5IbwOMog8D3DTUqp30LPqBe79YmPsMA',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDi1lD-r6XduOhNHQsbBYfBrFvmTHkjZaDlmh7ruCg7o2chA9WNDj6p9ZoftBcyD9NlDL241eW1NJ3wBnmTXIrc-I4RlGMxIVYtKELYHc9_olFvjc8g4h--BiiTpGG10P4NJCMKEp_tLlo_9myfOOsFbrHLlcM4AOBAHkwKQHssebMqB52Fzqmh7MkGhj-O0hOhvsy2EC69Y7iSedAYPGMHSJCP8aTM0ZeKm-n1-pOncfayKsBd_TTvddRO-ymkWXd-B5Zpt5yN6Xw',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAE7ODuEhQ9NpUUBFekRI3WjcEoFV61KOFL3HIO58c8vxtFbHSRsXah-DCW97iLEZCYYEd_zPUq00rbFG-A3C_mbHfTiylwqvIdaLfr3tHgdc9jPCR9YJ05nFoxrbUNMQJ_rQdhoazJWX_im2I6_0LJOCP814j5DTgfUweiPc2s0RXfZ-Dcvp4FVie1lhoz0r6huFnILjvA_N4xyZ6YP6bXyHN--GDxjQTnLSzyajmm5lrTKEj6xrZun3MuSvskHm9Qe3DkTOIFKjM',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAL3DHJm8BOeNw6xzDrHAENY0C3wNsuCFFjM38kfyRnr3N5dHJUVTHvjj2oIC_t_pYCN86COoQBcxJzXj5pvEgGTZG9Z334kX2U2W65GcbcfCOgorhzbAE3J1nIfcrHm-4gxKmo1FYJK6dCvuBXWoVt3rNyB2oLXSwChWqfZQbqqxF-6FZ1cd7ITb0cH5M5-8wH-1_pvQvZmTdrcTVE6gaskU5HAZNA6paujEGVJTcNlnK1WN5UpSJVX3AlYJxsU8QEezZyGtGymzE',
    ],
  },
  {
    id: 'wingspan',
    title: 'Wingspan',
    category: 'Strategy',
    condition: 'Like New',
    listingType: 'lending',
    availability: 'available',
    ownerId: 'seed-owner-2',
    ownerName: 'Sarah Chen',
    createdAt: 1716853600000,
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
    ownerId: 'seed-owner-3',
    ownerName: 'Marcus Thorne',
    createdAt: 1716767200000,
    description:
      'Tactile tile-placement game based on Portuguese palace walls. Fast and easy to learn.',
    imageUrls: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCJ3kwk0l6v1BjaJTuygd7o3m5_rFbt-r_vX1iIQRJqCG4_9RHvwo_sSSm9aNzQYonGh0k-hf52Fdkvby_7O7pqBuGVYU09QvBArYoJJxPyNCxpiWqViAjWknZApWW4b3tudvucA0IlzzZXMu5lqrgYk2JX8bgjWGncduOhBmfZ8HUQORT01bzI0cQnMdka7Q2NFKctjpQXDtKCib0ackW0sOQ9mAtrdIuPQJZrrSq-EaBiCFw0bXekXIpVo6zInSHmHYUkhPRV4BY',
    ],
  },
]

export const CATEGORY_OPTIONS = [
  'Strategy',
  'Party',
  'Family',
  'Co-op',
  'Card Games',
] as const

/** Look up a listing by id for the detail route (Phase 1 mock data). */
export function getListingById(id: string): Listing | undefined {
  return mockListings.find((listing) => listing.id === id)
}
