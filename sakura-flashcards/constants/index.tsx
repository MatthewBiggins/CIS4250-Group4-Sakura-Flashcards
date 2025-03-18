// Array of links for the header and mobile sidebar
export const navLinks = [
  { href: "/", key: "Home", text: "Home" },
  { href: "/glossary", key: "Glossary", text: "Glossary" },
  {
    href: "/studysets",
    studySetId: "genki-1",
    key: "genki-1",
    text: "Genki Vol. 1",
  },
  {
    href: "/studysets",
    studySetId: "genki-2",
    key: "genki-2",
    text: "Genki Vol. 2",
  },
  { href: "/dashboard", key: "Dashboard", text: "Dashboard" },
];

type Item = {
  name: string;
  slug: string;
  description?: string;
};

// details about the provided study sets, including the link slug to the study set pages
export const StudySets: { name: string; items: Item[] }[] = [
  {
    name: "Study Sets",
    items: [
      {
        name: "Genki Volume I (Third Edition)",
        slug: "studysets/genki-1",
        description: "A beginner course in elementary Japanese (Lessons 1-12)",
      },
      {
        name: "Genki Volume II (Third Edition)",
        slug: "studysets/genki-2",
        description:
          "An intermediate course in elementary Japanese (Lessons 13-23)",
      },
    ],
  },
];

export type TCardProgress = {
  correct: number;
  incorrect: number;
};

export type TUnitProgress = Map<number, TCardProgress>;
export type TLessonProgress = Array<TUnitProgress>;
export type TStudySetProgress = Array<TLessonProgress>;

interface ICardData {
  frontSide: string;
  backSide: string;
}

export interface IUnitData {
  title: string;
  slug: string;
  items: Array<ICardData>;
}

export interface ILessonData {
  lessonNumber: number;
  lessonTitle: string;
  lessonPages: string;
  slug: string;
  units: Array<IUnitData>;
}
