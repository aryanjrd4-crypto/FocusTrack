const STUDY_KEYWORDS = [
  "lecture", "tutorial", "course", "class", "explained", "full course",
  "how to", "learn", "gate", "jee", "neet", "coding", "programming",
  "algorithm", "data structure", "react", "nodejs", "python", "java",
  "study", "revision", "notes", "chapter", "exam", "preparation"
];

const ENTERTAINMENT_KEYWORDS = [
  "song", "music", "official video", "lyrics", "album", "trailer",
  "movie", "episode", "comedy", "funny", "vlog", "reaction", "dance"
];

export function detectCategory(domain = "", url = "", title = "") {
  domain = domain.toLowerCase().replace("www.", "");
  title = title.toLowerCase();
  url = url.toLowerCase();

  // Local PDF
  if (domain === "local-file" || url.startsWith("file://")) {
    if (url.endsWith(".pdf") || title.includes(".pdf")) return "study";
    return "other";
  }

  // YouTube
  if (domain.includes("youtube") || domain.includes("youtu.be")) {
    for (const word of STUDY_KEYWORDS) {
      if (title.includes(word)) return "study";
    }
    for (const word of ENTERTAINMENT_KEYWORDS) {
      if (title.includes(word)) return "entertainment";
    }
    return "entertainment";
  }

  const CATEGORY_MAP = {
    "wikipedia.org": "study",
    "khanacademy.org": "study",
    "coursera.org": "study",
    "udemy.com": "study",
    "stackoverflow.com": "study",
    "github.com": "study",
    "notion.so": "study",
    "docs.google.com": "study",
    "geeksforgeeks.org": "study",
    "leetcode.com": "study",
    "hackerrank.com": "study",
    "medium.com": "study",
    "w3schools.com": "study",
    "freecodecamp.org": "study",
    "byjus.com": "study",
    "unacademy.com": "study",

    "netflix.com": "entertainment",
    "spotify.com": "entertainment",
    "instagram.com": "entertainment",
    "tiktok.com": "entertainment",
    "reddit.com": "entertainment",
    "hotstar.com": "entertainment",

    "twitter.com": "social",
    "x.com": "social",
    "facebook.com": "social",
    "linkedin.com": "social",
    "whatsapp.com": "social",
    "discord.com": "social",

    "slack.com": "work",
    "gmail.com": "work",
    "outlook.com": "work"
  };

  if (CATEGORY_MAP[domain]) return CATEGORY_MAP[domain];

  for (const [key, cat] of Object.entries(CATEGORY_MAP)) {
    if (domain.includes(key.split(".")[0])) return cat;
  }

  if (domain.endsWith(".edu") || domain.includes(".ac.in")) return "study";

  return "other";
}

export function calculatePoints(seconds, category) {
  if (category === "study") return Math.floor(seconds / 60) * 10;
  if (category === "work") return Math.floor(seconds / 60) * 5;
  return 0;
}