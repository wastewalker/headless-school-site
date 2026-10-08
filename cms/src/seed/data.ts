/**
 * Seed content for a fictional school, "Altamira Trilingual School".
 *
 * Everything here is invented for the demo. No real institution's names,
 * prices, programmes or news are used.
 *
 * Event dates are offsets in days from the moment the seed runs, so a fresh
 * install always has upcoming and past events to show.
 */

type Block =
  | { type: 'paragraph'; children: { type: 'text'; text: string; bold?: boolean }[] }
  | { type: 'heading'; level: 2 | 3; children: { type: 'text'; text: string }[] }
  | { type: 'list'; format: 'unordered'; children: { type: 'list-item'; children: { type: 'text'; text: string }[] }[] };

const p = (text: string): Block => ({ type: 'paragraph', children: [{ type: 'text', text }] });
const h = (text: string): Block => ({ type: 'heading', level: 2, children: [{ type: 'text', text }] });
const ul = (...items: string[]): Block => ({
  type: 'list',
  format: 'unordered',
  children: items.map((text) => ({ type: 'list-item', children: [{ type: 'text', text }] })),
});

export const levels = [
  { slug: 'kindergarten', name: 'Kindergarten', order: 1, description: 'Ages 3 to 5. Learning through play in three languages.' },
  { slug: 'primary', name: 'Primary', order: 2, description: 'Grades 1 to 6. Literacy, numeracy and project work.' },
  { slug: 'secondary', name: 'Secondary', order: 3, description: 'Grades 7 to 12. Preparation for international diplomas.' },
] as const;

export type LevelSlug = (typeof levels)[number]['slug'];

export const home = {
  heroTitle: 'Learning in three languages, from the first day',
  heroSubtitle:
    'Altamira Trilingual School is a fictional school used to demonstrate a headless CMS. Its news, events and clubs are managed in Strapi and rendered by Next.js.',
  ctaVariantA: 'Book a visit',
  ctaVariantB: 'Come and see a class',
  ctaUrl: '/visit',
};

export const articles: {
  slug: string;
  title: string;
  excerpt: string;
  category: 'school-life' | 'academics' | 'sports' | 'community';
  levels: LevelSlug[];
  body: Block[];
}[] = [
  {
    slug: 'science-fair-2026',
    title: 'Secondary students take the science fair to the town square',
    excerpt: 'Forty projects, three languages and one very loud volcano: this year the fair moved outdoors.',
    category: 'academics',
    levels: ['secondary'],
    body: [
      p('For the first time, the annual science fair left the school gym and set up in the town square, where families and neighbours could walk between stands.'),
      h('What the students built'),
      ul('A rain gauge network logging data every ten minutes', 'A solar oven tested against a conventional one', 'A volcano that, by request, erupted every half hour'),
      p('Each team presented in two languages of its choice, and judges scored the explanation as highly as the result.'),
    ],
  },
  {
    slug: 'reading-week',
    title: 'Reading week fills the primary library',
    excerpt: 'Every class swapped one lesson a day for reading aloud, and the library stayed open until six.',
    category: 'school-life',
    levels: ['primary'],
    body: [
      p('Reading week ran from Monday to Friday. Each day, one lesson per class became a reading session led by a student, a teacher or a visiting parent.'),
      p('The most borrowed book of the week was a picture atlas, which the librarians have now ordered a second copy of.'),
    ],
  },
  {
    slug: 'kindergarten-garden',
    title: 'Kindergarten plants its first vegetable garden',
    excerpt: 'Lettuce, radishes and a sunflower that is already taller than the teachers.',
    category: 'school-life',
    levels: ['kindergarten'],
    body: [
      p('The kindergarten patio now has six raised beds, built with families over two Saturdays.'),
      p('Children water the beds in turns and record growth on a wall chart, counting in all three of the school’s languages.'),
    ],
  },
  {
    slug: 'regional-football-final',
    title: 'Under-14 football team reaches the regional final',
    excerpt: 'A late equaliser and a penalty shoot-out send the team to its first final in five years.',
    category: 'sports',
    levels: ['secondary'],
    body: [
      p('The semi-final finished level after a goal in the last minute, and the team won the shoot-out four to three.'),
      p('The final will be played at home. Details are on the events calendar.'),
    ],
  },
  {
    slug: 'families-language-cafe',
    title: 'Families’ language café opens on Thursday afternoons',
    excerpt: 'Parents can practise the school’s languages over coffee while children are in clubs.',
    category: 'community',
    levels: ['kindergarten', 'primary', 'secondary'],
    body: [
      p('The language café meets in the cafeteria every Thursday at four. Tables are grouped by language and level, and teachers rotate between them.'),
      p('No sign-up is needed. Coffee is on the parents’ association.'),
    ],
  },
];

export const events: {
  slug: string;
  title: string;
  description: string;
  startsInDays: number;
  durationHours: number;
  location: string;
  levels: LevelSlug[];
}[] = [
  { slug: 'open-day', title: 'Open day for new families', description: 'Tour the classrooms, meet teachers from every level and sit in on a short lesson.', startsInDays: 12, durationHours: 4, location: 'Main campus', levels: ['kindergarten', 'primary', 'secondary'] },
  { slug: 'football-final', title: 'Under-14 regional football final', description: 'Home match against the regional champions. Families welcome.', startsInDays: 5, durationHours: 2, location: 'School sports field', levels: ['secondary'] },
  { slug: 'lantern-walk', title: 'Lantern walk', description: 'Kindergarten and first grade walk the neighbourhood with lanterns they made in class.', startsInDays: 20, durationHours: 2, location: 'Starts at the kindergarten patio', levels: ['kindergarten', 'primary'] },
  { slug: 'parents-evening-primary', title: 'Primary parents’ evening', description: 'Individual meetings with class teachers. Book a slot with the school office.', startsInDays: 9, durationHours: 3, location: 'Primary building', levels: ['primary'] },
  { slug: 'science-fair', title: 'Science fair', description: 'Secondary projects presented in the town square.', startsInDays: -14, durationHours: 5, location: 'Town square', levels: ['secondary'] },
  { slug: 'reading-week-closing', title: 'Reading week closing assembly', description: 'Students read their favourite passages to the whole primary school.', startsInDays: -7, durationHours: 1, location: 'Assembly hall', levels: ['primary'] },
];

export const activities: {
  slug: string;
  name: string;
  summary: string;
  category: 'sports' | 'arts' | 'science' | 'languages' | 'leadership';
  schedule: string;
  openToExternal: boolean;
  levels: LevelSlug[];
}[] = [
  { slug: 'football', name: 'Football', summary: 'Training for school teams and friendly matches with other schools.', category: 'sports', schedule: 'Tue and Thu, 15:30–17:00', openToExternal: true, levels: ['primary', 'secondary'] },
  { slug: 'robotics', name: 'Robotics club', summary: 'Build and program small robots, from block coding to Python.', category: 'science', schedule: 'Wed, 15:30–17:30', openToExternal: true, levels: ['primary', 'secondary'] },
  { slug: 'choir', name: 'Children’s choir', summary: 'Songs in the school’s three languages, with a concert every term.', category: 'arts', schedule: 'Mon, 14:30–15:30', openToExternal: false, levels: ['kindergarten', 'primary'] },
  { slug: 'debate', name: 'Debate society', summary: 'Weekly debates in English and Spanish, and an inter-school tournament.', category: 'leadership', schedule: 'Fri, 15:30–17:00', openToExternal: false, levels: ['secondary'] },
  { slug: 'little-explorers', name: 'Little explorers', summary: 'Outdoor play, nature walks and simple experiments for the youngest.', category: 'science', schedule: 'Thu, 14:00–15:00', openToExternal: false, levels: ['kindergarten'] },
  { slug: 'german-for-families', name: 'German for families', summary: 'Beginner German classes for parents and older siblings.', category: 'languages', schedule: 'Sat, 10:00–11:30', openToExternal: true, levels: ['kindergarten', 'primary', 'secondary'] },
];
