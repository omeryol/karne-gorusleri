export const CLASSES = ["5", "6", "7", "8"] as const;
export const SECTIONS = ["A", "B", "C", "D"] as const;
export const SEMESTERS = ["1", "2"] as const;
export const TONES = ["positive", "neutral", "negative"] as const;

export const TONE_CONFIG = {
  positive: {
    label: "Olumlu",
    icon: "smile",
    bgColor: "bg-green-50 dark:bg-green-900/10",
    borderColor: "border-green-200 dark:border-green-800",
    textColor: "text-green-700 dark:text-green-300",
    badgeColor: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
  },
  neutral: {
    label: "Nötr",
    icon: "meh",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/10",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    textColor: "text-yellow-700 dark:text-yellow-300",
    badgeColor: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300"
  },
  negative: {
    label: "Olumsuz",
    icon: "frown",
    bgColor: "bg-red-50 dark:bg-red-900/10",
    borderColor: "border-red-200 dark:border-red-800",
    textColor: "text-red-700 dark:text-red-300",
    badgeColor: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300"
  }
} as const;

export const CLASS_COLORS = {
  "5": "from-blue-500 via-purple-500 to-pink-500",
  "6": "from-orange-500 via-pink-500 to-blue-500",
  "7": "from-pink-500 via-green-500 to-orange-500",
  "8": "from-green-500 via-orange-500 to-pink-500"
} as const;
