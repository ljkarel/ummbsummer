export const TODAY = "Wed · Jul 8";
export const WEEK_LABEL = "Week 3 of 10";
export const WEEK_DATES = "Jul 6 – Jul 12";
export const FREEZE = "Sun 11:59pm";

export const ME = {
  name: "Jordan Mehta",
  section: "Trumpets",
  sectionRank: 14,
  sectionSize: 38,
  weekMinutes: 168,
  weekPoints: 168,
  totalPoints: 412,
  streak: 5
};

export const SECTIONS = [
  { name: "Mellophones", avg: 24.8, members: 22, trend: +1, weeks: [21.4, 23.6, 24.8] },
  { name: "Drumline",    avg: 23.1, members: 31, trend: +2, weeks: [18.9, 20.7, 23.1] },
  { name: "Trumpets",   avg: 22.4, members: 38, trend:  0, isMe: true, weeks: [19.8, 22.1, 22.4] },
  { name: "Trombones",  avg: 21.7, members: 26, trend: -1, weeks: [22.0, 22.9, 21.7] },
  { name: "Saxes",      avg: 20.9, members: 24, trend:  0, weeks: [19.4, 20.6, 20.9] },
  { name: "Sousas",     avg: 19.2, members: 14, trend: +1, weeks: [17.1, 18.0, 19.2] },
  { name: "Clarinets",  avg: 18.4, members: 29, trend: -2, weeks: [20.1, 21.0, 18.4] },
  { name: "Flutes",     avg: 17.8, members: 27, trend: -1, weeks: [16.9, 18.4, 17.8] },
  { name: "Color Guard",avg: 17.2, members: 21, trend:  0, weeks: [15.8, 17.0, 17.2] },
  { name: "Pit",        avg: 14.6, members: 12, trend: -1, weeks: [13.2, 15.1, 14.6] },
];
SECTIONS.forEach((s) => { s.season = s.weeks.reduce((a, b) => a + b, 0); });

export const WEEKS = [
  { n: 1, state: "done", you: 198 },
  { n: 2, state: "done", you: 232 },
  { n: 3, state: "live", you: 168 },
  { n: 4, state: "soon" },
  { n: 5, state: "soon" },
  { n: 6, state: "soon" },
  { n: 7, state: "soon" },
  { n: 8, state: "soon" },
];
