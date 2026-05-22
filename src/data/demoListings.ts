import type { Listing } from '../types/listing'

/** Seed data from the static HTML prototypes. */
export const demoListings: Listing[] = [
  {
    id: 'catan',
    title: 'Catan (Standard)',
    category: 'Strategy',
    condition: 'Like New',
    arrangementType: 'rent',
    listingMode: 'lending',
    price: '$5/day',
    pricePerDay: 5,
    description:
      'The classic game of discovery, settlement, and trade. Perfect for a game night with 3-4 friends.',
    owner: {
      name: 'Alex Rivera',
      rating: 4.9,
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDkx0UXK1Lpk2ElXA9ROMqC4wi2ZrOF4-lcXU-qLY9iqetmJiI9RWq9dEMcAVfggnureaO9twDbvxDwLNCFqvKKP7i6wrxOjNnimFSvEdRwRsRRxQzEqy6wp5z0WSDkDSP493C65sTxk041gs2-ADCbEXcEJerjfpTB4lw1M_vd9qUH5kMeRxtnrPi0SAw4Ddywo5DQ3GkCnxWDrN-wN-hZe6zXTmgN67Yt0h9jCUY_VqRM4wXjKTut8c9VndifPzGtn0B3_I8RKzw',
    },
    location: 'Brooklyn, NY',
    rating: 4.9,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBGWAe1S6-RM9yhP-k4BX0Sj_IGvJ0S9YKjB-RfWNv_9ln7GkmzK2DTgLhd9OZAi0YB6gRCSyu-QbXS4ow5dBYlOiIbYbXF8maPCwDxR-TYogBTyvP41LRYl3QlaUmSunjDkSRljFDmL5VVDtDyuxBEiMAF5_zuJiDrCoQoLUalkZKmB-HlCNUIh8L7yb5-cnQYvzfXPUmtsuqkatkbhqXnWQs_UJbyxIbS6KxV73_slMEYmTEJ-2s2gPt8nA5598o70ImuGJ-mQ9c',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDtoOLKhCu_RFt2sfkGvUMSgWiLREkcxWWJ8JTq2ZpoB8Tv3Zn-AU5rFwa86dCM1ikJ4kHKSv-kiD0bkWDc7XYKku8NV8puWa7FKT95hyepuIuyxDPkFjcCY-PzAILDxgYhbxArSIdBWqUoRyDnM9ESsejguZYkcb1QdMCHJm5PVh5PmWq2xdJhWcOLqQ6uqMKSuLoYEAsQmV1qPdadj_PoqDEDD7ahtPEXbvML5xbn_Cbc5IbwOMog8D3DTUqp30LPqBe79YmPsMA',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDi1lD-r6XduOhNHQsbBYfBrFvmTHkjZaDlmh7ruCg7o2chA9WNDj6p9ZoftBcyD9NlDL241eW1NJ3wBnmTXIrc-I4RlGMxIVYtKELYHc9_olFvjc8g4h--BiiTpGG10P4NJCMKEp_tLlo_9myfOOsFbrHLlcM4AOBAHkwKQHssebMqB52Fzqmh7MkGhj-O0hOhvsy2EC69Y7iSedAYPGMHSJCP8aTM0ZeKm-n1-pOncfayKsBd_TTvddRO-ymkWXd-B5Zpt5yN6Xw',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAE7ODuEhQ9NpUUBFekRI3WjcEoFV61KOFL3HIO58c8vxtFbHSRsXah-DCW97iLEZCYYEd_zPUq00rbFG-A3C_mbHfTiylwqvIdaLfr3tHgdc9jPCR9YJ05nFoxrbUNMQJ_rQdhoazJWX_im2I6_0LJOCP814j5DTgfUweiPc2s0RXfZ-Dcvp4FVie1lhoz0r6huFnILjvA_N4xyZ6YP6bXyHN--GDxjQTnLSzyajmm5lrTKEj6xrZun3MuSvskHm9Qe3DkTOIFKjM',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAL3DHJm8BOeNw6xzDrHAENY0C3wNsuCFFjM38kfyRnr3N5dHJUVTHvjj2oIC_t_pYCN86COoQBcxJzXj5pvEgGTZG9Z334kX2U2W65GcbcfCOgorhzbAE3J1nIfcrHm-4gxKmo1FYJK6dCvuBXWoVt3rNyB2oLXSwChWqfZQbqqxF-6FZ1cd7ITb0cH5M5-8wH-1_pvQvZmTdrcTVE6gaskU5HAZNA6paujEGVJTcNlnK1WN5UpSJVX3AlYJxsU8QEezZyGtGymzE',
    ],
    players: '3-4 Players',
    playTime: '60-90m',
    meetupPreferences: 'Weekends near downtown',
  },
  {
    id: 'wingspan',
    title: 'Wingspan',
    category: 'Strategy',
    condition: 'Like New',
    arrangementType: 'trade',
    listingMode: 'lending',
    price: 'Trade Only',
    description:
      'Competitive bird-collection engine-building game. Mint condition, including Swift-Start pack.',
    owner: {
      name: 'Sarah Chen',
      rating: 5.0,
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC-CQs5RQSPhiSz-Gy0c8SghfWa7FgmDRfhUotd6gLcWYjpzooEtNz9j0jFkJG7Nr0dMrK8ZCwRat2B12uERCBiq7LCTi4Os5XkrAms9uMv-jNPOHdhQmPfgknpYdu14JrmjAbTNd4324owIHyEG-08WbWcFGb1aeVpRhbpAnGf23uputhqbCdNNOLW5upd95vFSfR3jGgVi_MiMj3Dr50QzgsfotUUOEy_7v2_oICnL6Pk1llPtdc88_OURUlNOzwwLN3b8Y2G0cI',
    },
    location: '0.5 miles away',
    rating: 5.0,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD6Yhwx7lDmHTISSiirIy1FeIXGAs3t6fhIKBJuxRYq3uq42ib79RkwmoZq3j1-jjoQ90NwkA0yoFSJI7lpUUi3T8gb9ZCSvP1gr3tz_olEwKt3Hfj0AfnS3Sf9V56PKC75fbhegs9s3ovhcVAa7MVZIJVLvrUXq1dKf-jqkYxSi-uUrz66X1nCKAqvof8Pt9hqvwH-mksSenHx5ycUOWlH4uQ4MxwC3NTP7NXRPUHaAcalsSJg89A_b-AqQMQ95eGZKOcYeaUf82Y',
    players: '1-5 Players',
    playTime: '40-70m',
  },
  {
    id: 'azul',
    title: 'Azul',
    category: 'Family',
    condition: 'Good',
    arrangementType: 'free',
    listingMode: 'lending',
    price: 'Free',
    description:
      'Tactile tile-placement game based on Portuguese palace walls. Fast and easy to learn.',
    owner: {
      name: 'Marcus Thorne',
      rating: 4.8,
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBP2MPi-06oKxYsopQL3fsvc-foEMm7EoTE-KuSmWGdJGd6RPcX3KDQ73jN2BAC21Xy_hHveoVrjjb1WgSB8SG1YebLaq_oY-b0t3kjIgReFFF4C5ONgPxZBvu0_2a9OjLXrkHCWrZMYJk6VxpVnFNcackljOTFsrv1ZdHparqKhvrIjY_Hb10IpylL_CaFHLG72PLSNxcbsQJGicU-vH5k6KMuPembQXFvZVfQ3sMPUfAswyRXwsWYjsJAoe-o9opZ8ARvX6ADmM8',
    },
    location: '2.1 miles away',
    rating: 4.8,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCJ3kwk0l6v1BjaJTuygd7o3m5_rFbt-r_vX1iIQRJqCG4_9RHvwo_sSSm9aNzQYonGh0k-hf52Fdkvby_7O7pqBuGVYU09QvBArYoJJxPyNCxpiWqViAjWknZApWW4b3tudvucA0IlzzZXMu5lqrgYk2JX8bgjWGncduOhBmfZ8HUQORT01bzI0cQnMdka7Q2NFKctjpQXDtKCib0ackW0sOQ9mAtrdIuPQJZrrSq-EaBiCFw0bXekXIpVo6zInSHmHYUkhPRV4BY',
    players: '2-4 Players',
    playTime: '30-45m',
  },
]

export const CATEGORY_OPTIONS = [
  'Strategy',
  'Party',
  'Family',
  'Co-op',
  'Card Games',
] as const
