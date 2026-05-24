export const volumeData = [
  { week: 'W1', AppStore: 120, PlayStore: 210 },
  { week: 'W2', AppStore: 145, PlayStore: 250 },
  { week: 'W3', AppStore: 130, PlayStore: 220 },
  { week: 'W4', AppStore: 160, PlayStore: 290 },
  { week: 'W5', AppStore: 150, PlayStore: 270 },
  { week: 'W6', AppStore: 180, PlayStore: 310 },
  { week: 'W7', AppStore: 190, PlayStore: 350 },
  { week: 'W8', AppStore: 175, PlayStore: 320 },
  { week: 'W9', AppStore: 210, PlayStore: 390 },
  { week: 'W10', AppStore: 230, PlayStore: 410 },
  { week: 'W11', AppStore: 250, PlayStore: 450 },
  { week: 'W12', AppStore: 280, PlayStore: 480 },
];

export const sentimentData = [
  { name: 'Positive', value: 58, color: '#00D09C' },
  { name: 'Neutral', value: 24, color: '#9ba1a6' },
  { name: 'Negative', value: 18, color: '#ef4444' },
];

export const themeFrequencyData = [
  { name: 'Onboarding', count: 850 },
  { name: 'UI/UX', count: 720 },
  { name: 'App Performance', count: 640 },
  { name: 'Payments', count: 530 },
  { name: 'Authentication', count: 410 },
];

export const ratingDistribution = [
  { rating: '5★', count: 1850 },
  { rating: '4★', count: 1250 },
  { rating: '3★', count: 650 },
  { rating: '2★', count: 320 },
  { rating: '1★', count: 210 },
];

export const clusterData = [
  {
    id: 'c1',
    name: 'Onboarding & KYC',
    emoji: '📄',
    percentage: 28,
    sentiment: 'Mixed',
    quotes: [
      "KYC verification took 4 days. Unacceptable in 2026.",
      "Smooth account creation, but Aadhaar linking failed twice."
    ]
  },
  {
    id: 'c2',
    name: 'Authentication Issues',
    emoji: '🔐',
    percentage: 15,
    sentiment: 'Mostly Negative',
    quotes: [
      "Biometric login randomly gets disabled after every update.",
      "OTP never arrives on time when I try to login during market hours."
    ]
  },
  {
    id: 'c3',
    name: 'Payments & Transactions',
    emoji: '💳',
    percentage: 19,
    sentiment: 'Mostly Positive',
    quotes: [
      "UPI payments for SIPs are instant. Love it.",
      "Withdrawal hit my bank account in 30 minutes!"
    ]
  },
  {
    id: 'c4',
    name: 'App Performance & Crashes',
    emoji: '⚡',
    percentage: 22,
    sentiment: 'Mostly Negative',
    quotes: [
      "App hangs immediately at 9:15 AM every single day.",
      "Charts take too long to load on 5G network."
    ]
  },
  {
    id: 'c5',
    name: 'UI/UX & Navigation',
    emoji: '🎨',
    percentage: 16,
    sentiment: 'Mostly Positive',
    quotes: [
      "The new dark mode portfolio view is absolutely gorgeous.",
      "Very clean interface compared to Zerodha and Upstox."
    ]
  }
];

export const reviewsData = [
  { id: 1, rating: 1, text: "KYC verification took 4 days. Unacceptable in 2026.", date: "2026-05-24", platform: "Android", sentiment: "Negative", theme: "Onboarding" },
  { id: 2, rating: 5, text: "The new dark mode portfolio view is absolutely gorgeous.", date: "2026-05-23", platform: "iOS", sentiment: "Positive", theme: "UI/UX" },
  { id: 3, rating: 2, text: "App hangs immediately at 9:15 AM every single day.", date: "2026-05-22", platform: "Android", sentiment: "Negative", theme: "Performance" },
  { id: 4, rating: 4, text: "UPI payments for SIPs are instant. Love it.", date: "2026-05-21", platform: "iOS", sentiment: "Positive", theme: "Payments" },
  { id: 5, rating: 1, text: "Biometric login randomly gets disabled after every update.", date: "2026-05-20", platform: "Android", sentiment: "Negative", theme: "Authentication" },
  { id: 6, rating: 5, text: "Withdrawal hit my bank account in 30 minutes!", date: "2026-05-19", platform: "Android", sentiment: "Positive", theme: "Payments" },
  { id: 7, rating: 3, text: "Smooth account creation, but Aadhaar linking failed twice.", date: "2026-05-18", platform: "iOS", sentiment: "Neutral", theme: "Onboarding" },
];
