export type VideoKind = "walkthrough" | "lecture" | "short";

export type SiteVideo = {
  id: string; // YouTube video id
  kind: VideoKind;
  title: string;
  description: string; // used in VideoObject JSON-LD + video sitemap
  uploadDate: string; // ISO date; approximate is acceptable for structured data
  classId?: "9" | "10" | "11" | "12";
  chapterSlug?: string;
};

export const CHANNEL_URL = "https://www.youtube.com/@chemistrybykk";
export const SUBSCRIBE_URL =
  "https://www.youtube.com/@chemistrybykk?sub_confirmation=1";

export const VIDEOS: SiteVideo[] = [
  {
    id: "AERV3chVzpM",
    kind: "walkthrough",
    title:
      "Introduction to Chemistry by K K | Complete Website Tour | By: Khyati Kaushik",
    description:
      "Complete tour of the ChemistryByKK website — how to find chapter notes, cheatsheets, question banks, take quizzes, ask doubts and keep your daily streak.",
    uploadDate: "2026-05-18",
  },
  {
    id: "YzJ3BgMNAT8",
    kind: "lecture",
    title:
      "Chemical Reactions & Equations | Class 10 Science | Complete Chapter in One Shot",
    description:
      "Chemical Reactions and Equations Class 10 full chapter in one shot — chemical equations, balancing, combination, decomposition, displacement, double displacement and redox reactions, oxidation & reduction, corrosion and rancidity, with board exam tips.",
    uploadDate: "2026-07-15",
    classId: "10",
    chapterSlug: "chemical-reactions-and-equations",
  },
  {
    id: "28YeFu9vyUI",
    kind: "short",
    title: "How does a chemical reaction occur?",
    description:
      "How does a chemical reaction actually happen? Bond breaking and bond forming explained in under a minute.",
    uploadDate: "2026-07-15",
    classId: "10",
    chapterSlug: "chemical-reactions-and-equations",
  },
  {
    id: "nzB7FsDlSso",
    kind: "short",
    title: "What is Chemistry?",
    description:
      "What is Chemistry? A quick one-minute intro to what you actually study in chemistry.",
    uploadDate: "2026-07-15",
  },
];

export const lectures = VIDEOS.filter((v) => v.kind === "lecture");
export const shorts = VIDEOS.filter((v) => v.kind === "short");

export const watchUrl = (v: SiteVideo) =>
  v.kind === "short"
    ? `https://www.youtube.com/shorts/${v.id}`
    : `https://www.youtube.com/watch?v=${v.id}`;

export const thumbUrl = (id: string, file = "maxresdefault") =>
  `https://i.ytimg.com/vi/${id}/${file}.jpg`;

export const getLectureFor = (classId: string, chapterSlug: string) =>
  lectures.find((v) => v.classId === classId && v.chapterSlug === chapterSlug);
