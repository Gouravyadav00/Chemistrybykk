export type AssetKind = "notes" | "cheatsheet";

export type Chapter = {
  slug: string;
  name: string;
  notesAvailable: boolean;
  file?: string;
  cheatsheetAvailable: boolean;
  cheatsheet?: string;
};

export type ClassData = {
  classId: "9" | "10" | "11" | "12";
  label: string;
  subtitle: string;
  chapters: Chapter[];
};

const make = (
  name: string,
  opts: { file?: string; cheatsheet?: string } = {},
): Chapter => {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return {
    slug,
    name,
    notesAvailable: Boolean(opts.file),
    file: opts.file,
    cheatsheetAvailable: Boolean(opts.cheatsheet),
    cheatsheet: opts.cheatsheet,
  };
};

export const classes: ClassData[] = [
  {
    classId: "9",
    label: "Class 9",
    subtitle: "Foundation Chemistry · NCERT",
    chapters: [
      make("Matter in Our Surroundings"),
      make("Exploring Mixtures and their Seperation/ Is Matter Around Us Pure?"),
      make("Atomic Foundations of Matter/ Atoms and Molecules"),
      make("Journey Inside the Atom/ Structure of the Atom"),
    ],
  },
  {
    classId: "10",
    label: "Class 10",
    subtitle: "Board Foundation · NCERT",
    chapters: [
      make("Chemical Reactions and Equations"),
      make("Acids, Bases and Salts"),
      make("Metals and Non-metals"),
      make("Carbon and its Compounds"),
    ],
  },
  {
    classId: "11",
    label: "Class 11",
    subtitle: "Senior Secondary · NCERT",
    chapters: [
      make("Some Basic Concepts of Chemistry"),
      make("Structure of Atom"),
      make("Classification of Elements and Periodicity in Properties"),
      make("Chemical Bonding and Molecular Structure"),
      make("Thermodynamics"),
      make("Equilibrium"),
      make("Redox Reactions"),
      make("Organic Chemistry – Some Basic Principles and Techniques"),
      make("Hydrocarbons"),
    ],
  },
  {
    classId: "12",
    label: "Class 12",
    subtitle: "Board Year · NCERT",
    chapters: [
      make("Solutions"),
      make("Electrochemistry"),
      make("Chemical Kinetics"),
      make("d- and f-Block Elements"),
      make("Coordination Compounds"),
      make("Haloalkanes and Haloarenes"),
      make("Alcohols, Phenols and Ethers"),
      make("Aldehydes, Ketones and Carboxylic Acids"),
      make("Amines"),
      make("Biomolecules"),
    ],
  },
];

export const findClass = (id: string) =>
  classes.find((c) => c.classId === id) ?? classes[0];

export const defaultNotesPath = (classId: string, slug: string) =>
  `/notes/class${classId}/${slug}.pdf`;

export const defaultCheatsheetPath = (classId: string, slug: string) =>
  `/notes/class${classId}/${slug}.cheatsheet.pdf`;

// Backwards-compatible aliases
export const defaultPdfPath = defaultNotesPath;

export const isImageSrc = (src: string) =>
  /\.(png|jpe?g|webp|gif|avif)$/i.test(src) || src.startsWith("data:image/");

export const isPdfSrc = (src: string) =>
  /\.pdf$/i.test(src) || src.startsWith("data:application/pdf");

export const getAssetSrc = (chapter: Chapter, kind: AssetKind) =>
  kind === "notes" ? chapter.file : chapter.cheatsheet;

export const getAssetAvailable = (chapter: Chapter, kind: AssetKind) =>
  kind === "notes" ? chapter.notesAvailable : chapter.cheatsheetAvailable;
