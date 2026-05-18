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

// SVG path shapes keyed by route style name
export const ROUTE_PATHS = {
  loop:   "M14 60 C 18 22, 60 14, 78 28 C 96 42, 88 78, 60 80 C 32 82, 10 78, 14 60 Z",
  linear: "M8 78 C 30 70, 36 40, 56 38 C 74 36, 82 52, 92 22",
  small:  "M22 60 C 30 40, 56 38, 64 56 C 70 70, 46 76, 30 70 Z",
  wander: "M8 70 C 22 56, 18 36, 36 30 C 54 24, 56 48, 72 44 C 86 40, 86 18, 94 12",
  m:      "M10 78 L 26 18 L 44 60 L 62 18 L 80 78",
  zig:    "M10 22 L 32 22 L 32 60 L 56 60 L 56 22 L 80 22",
  vert:   "M20 78 L 20 14 M 50 78 L 50 14 M 80 78 L 80 14",
  tempo:  "M10 50 C 30 22, 50 78, 70 30 C 80 14, 90 60, 92 70",
  climb:  "M8 80 L 30 70 L 50 50 L 70 22 L 92 14",
  swim:   "M14 50 C 28 36, 42 64, 56 50 C 70 36, 84 64, 92 50",
  lift:   "M30 30 L 70 30 M 50 20 L 50 70 M 30 70 L 70 70",
};

// Canonical activity log. `week` matches WEEKS[n].n; `route` maps to ROUTE_PATHS.
export const MY_ACTIVITIES = [
  { id: "a01", week: 3, day: "Wed · Jul 8",  sport: "Run",  title: "Northrop sprints",         dur: "16:00",   mins: 16, dist: "1.8 mi",  elev: "22 ft",  pts: 16, route: "vert"   },
  { id: "a02", week: 3, day: "Wed · Jul 8",  sport: "Run",  title: "Mill District zig",         dur: "22:11",   mins: 22, dist: "2.4 mi",  elev: "46 ft",  pts: 22, route: "zig"    },
  { id: "a03", week: 3, day: "Tue · Jul 7",  sport: "Run",  title: "Stadium-loop M",            dur: "38:02",   mins: 38, dist: "4.2 mi",  elev: "118 ft", pts: 38, route: "m"      },
  { id: "a04", week: 3, day: "Tue · Jul 7",  sport: "Run",  title: "Lake Harriet loop",         dur: "42:18",   mins: 42, dist: "5.1 mi",  elev: "112 ft", pts: 42, route: "loop"   },
  { id: "a05", week: 3, day: "Mon · Jul 6",  sport: "Bike", title: "Greenway commute",          dur: "1:08:44", mins: 68, dist: "14.6 mi", elev: "284 ft", pts: 50, route: "linear" },
  { id: "a06", week: 3, day: "Mon · Jul 6",  sport: "Run",  title: "Easy recovery jog",         dur: "26:02",   mins: 26, dist: "2.8 mi",  elev: "44 ft",  pts: 26, route: "small"  },
  { id: "a07", week: 2, day: "Sat · Jul 4",  sport: "Run",  title: "Stone Arch + Mississippi",  dur: "55:11",   mins: 55, dist: "6.3 mi",  elev: "201 ft", pts: 55, route: "wander" },
  { id: "a08", week: 2, day: "Fri · Jul 3",  sport: "Swim", title: "Bde Maka Ska open swim",    dur: "32:00",   mins: 32, dist: "0.9 mi",  elev: "—",      pts: 32, route: "swim"   },
  { id: "a09", week: 2, day: "Thu · Jul 2",  sport: "Run",  title: "Como tempo",                dur: "41:14",   mins: 41, dist: "5.4 mi",  elev: "88 ft",  pts: 41, route: "tempo"  },
  { id: "a10", week: 2, day: "Wed · Jul 1",  sport: "Bike", title: "River Road climb",          dur: "1:22:08", mins: 82, dist: "18.4 mi", elev: "612 ft", pts: 58, route: "climb"  },
  { id: "a11", week: 1, day: "Mon · Jun 29", sport: "Run",  title: "Trumpet section meet-up run",dur: "44:50",  mins: 44, dist: "5.2 mi",  elev: "76 ft",  pts: 44, route: "wander" },
  { id: "a12", week: 1, day: "Sun · Jun 28", sport: "Run",  title: "Long base run",             dur: "1:18:30", mins: 78, dist: "9.1 mi",  elev: "184 ft", pts: 60, route: "wander" },
  { id: "a13", week: 1, day: "Sat · Jun 27", sport: "Run",  title: "Easy aerobic",              dur: "32:40",   mins: 32, dist: "3.9 mi",  elev: "62 ft",  pts: 32, route: "small"  },
  { id: "a14", week: 1, day: "Fri · Jun 26", sport: "Lift", title: "Lift + core",               dur: "48:00",   mins: 48, dist: "—",       elev: "—",      pts: 48, route: "lift"   },
  { id: "a15", week: 1, day: "Wed · Jun 24", sport: "Run",  title: "Kickoff team run",          dur: "36:22",   mins: 36, dist: "4.4 mi",  elev: "72 ft",  pts: 36, route: "loop"   },
  { id: "a16", week: 1, day: "Mon · Jun 22", sport: "Bike", title: "Greenway commute",          dur: "1:04:20", mins: 64, dist: "13.8 mi", elev: "262 ft", pts: 50, route: "linear" },
];

// Weekly art challenge — separate from WEEKS (leaderboard structure)
export const ART_WEEKS = [
  {
    n: 1, label: "WK 01", state: "done", dates: "Jun 22 – Jun 28", theme: "Loop",
    submissions: [
      { who: "@maria.t",  section: "Trumpets",    title: "First loop",       path: "M16 60 C 22 18, 78 18, 84 60 C 78 82, 22 82, 16 60 Z", likes: 41, liked: true  },
      { who: "@theo.l",   section: "Color Guard", title: "Como round-trip",  path: "M50 14 C 20 18, 14 60, 50 78 C 86 60, 80 18, 50 14 Z", likes: 38, liked: false },
      { who: "@aliya.r",  section: "Saxes",       title: "Bde Maka Ska",     path: "M18 50 C 22 22, 78 22, 82 50 C 78 78, 22 78, 18 50 Z", likes: 27, liked: false },
      { who: "@dev.c",    section: "Trombones",   title: "Mississippi bend", path: "M14 60 C 18 22, 60 14, 78 28 C 96 42, 88 78, 60 80 C 32 82, 10 78, 14 60 Z", likes: 19, liked: false },
      { who: "@ben.f",    section: "Mellos",      title: "Mini circuit",     path: "M30 50 C 32 32, 68 32, 70 50 C 68 68, 32 68, 30 50 Z", likes: 12, liked: false },
      { who: "@gus.r",    section: "Sousas",      title: "Stadium oval",     path: "M14 50 C 18 30, 82 30, 86 50 C 82 70, 18 70, 14 50 Z", likes: 8,  liked: false },
    ],
  },
  {
    n: 2, label: "WK 02", state: "done", dates: "Jun 29 – Jul 5", theme: "Letter U",
    submissions: [
      { who: "@sun.p",   section: "Drumline",    title: "U-bend river",       path: "M18 14 L 18 60 C 18 80, 82 80, 82 60 L 82 14", likes: 52, liked: true  },
      { who: "@kj.m",    section: "Flutes",      title: "Northrop horseshoe", path: "M22 14 L 22 50 C 22 72, 78 72, 78 50 L 78 14", likes: 36, liked: false },
      { who: "@dev.c",   section: "Trombones",   title: "Lakefront U",        path: "M16 14 L 16 56 C 16 80, 84 80, 84 56 L 84 14", likes: 31, liked: true  },
      { who: "@aliya.r", section: "Saxes",       title: "Mill cup",           path: "M24 14 L 24 54 C 24 70, 76 70, 76 54 L 76 14", likes: 22, liked: false },
      { who: "@theo.l",  section: "Color Guard", title: "Tin Cup",            path: "M28 18 L 28 52 C 28 66, 72 66, 72 52 L 72 18", likes: 14, liked: false },
      { who: "@ben.f",   section: "Mellos",      title: "Late-night U",       path: "M20 16 L 20 58 C 20 76, 80 76, 80 58 L 80 16", likes: 9,  liked: false },
    ],
  },
  {
    n: 3, label: "WK 03", state: "live", dates: "Jul 6 – Jul 12", theme: "Letter M",
    submissions: [
      { who: "@maria.t", section: "Trumpets",    title: "Block M, Como",     path: "M10 78 L 26 18 L 44 60 L 62 18 L 80 78",                                  likes: 23, liked: false },
      { who: "@ben.f",   section: "Mellos",      title: "Mini M",            path: "M10 22 L 32 22 L 32 60 L 56 60 L 56 22 L 80 22",                          likes: 18, liked: true  },
      { who: "@aliya.r", section: "Saxes",       title: "Stadium M",         path: "M16 78 L 28 14 L 50 64 L 72 14 L 84 78",                                  likes: 14, liked: false },
      { who: "@dev.c",   section: "Trombones",   title: "Mississippi M",     path: "M8 78 C 18 22, 28 78, 50 18 C 72 78, 82 22, 92 78",                       likes: 11, liked: false },
      { who: "@theo.l",  section: "Color Guard", title: "Twin Cities M",     path: "M14 78 L 26 22 L 50 70 L 74 22 L 86 78",                                  likes: 7,  liked: false },
      { who: "@gus.r",   section: "Sousas",      title: "Brick M",           path: "M16 78 L 16 14 L 34 14 L 34 50 L 50 30 L 66 50 L 66 14 L 84 14 L 84 78", likes: 5,  liked: false },
    ],
  },
];

export const MY_ART_SUBMISSION = {
  activityId: "a03",
  rotation: 0,
  title: "Stadium M",
  visibility: "public",
  submittedAt: "Tue · Jul 7 · 8:42pm",
};

export const ROSTER = [
  { name: "Anika Bose",    handle: "@anika.b",    section: "Trumpets",    role: "leader", year: "Senior",    weekPts: 198, season: 612, status: "connected" },
  { name: "Jordan Mehta",  handle: "@jordan.m",   section: "Trumpets",    role: "member", year: "Junior",    weekPts: 168, season: 492, status: "connected", isMe: true },
  { name: "Owen Kim",      handle: "@owen.k",     section: "Trumpets",    role: "member", year: "Sophomore", weekPts: 172, season: 452, status: "connected" },
  { name: "Maria Tovar",   handle: "@maria.t",    section: "Trumpets",    role: "member", year: "Senior",    weekPts: 186, season: 528, status: "connected" },
  { name: "Sami Khan",     handle: "@sami.k",     section: "Trumpets",    role: "member", year: "Freshman",  weekPts: 84,  season: 84,  status: "pending" },
  { name: "Rita Lopez",    handle: "—",           section: "Trumpets",    role: "member", year: "Rookie",    weekPts: 0,   season: 0,   status: "unregistered" },

  { name: "Ben Friedman",  handle: "@ben.f",      section: "Mellophones", role: "leader", year: "Senior",    weekPts: 212, season: 588, status: "connected" },
  { name: "Anika R.",      handle: "@anika.r",    section: "Mellophones", role: "member", year: "Junior",    weekPts: 245, season: 687, status: "connected" },
  { name: "Cole Vu",       handle: "@cole.v",     section: "Mellophones", role: "member", year: "Sophomore", weekPts: 158, season: 388, status: "connected" },
  { name: "Dev Chen",      handle: "@dev.c",      section: "Mellophones", role: "member", year: "Junior",    weekPts: 132, season: 332, status: "connected" },

  { name: "Sun-Jae Park",  handle: "@sun.p",      section: "Drumline",    role: "leader", year: "Senior",    weekPts: 230, season: 644, status: "connected" },
  { name: "Quinn O'Hara",  handle: "@quinn.o",    section: "Drumline",    role: "member", year: "Junior",    weekPts: 240, season: 652, status: "connected" },
  { name: "Marcus Lee",    handle: "@marcus.l",   section: "Drumline",    role: "member", year: "Sophomore", weekPts: 162, season: 412, status: "connected" },
  { name: "Tess Inouye",   handle: "—",           section: "Drumline",    role: "member", year: "Rookie",    weekPts: 0,   season: 0,   status: "unregistered" },

  { name: "Reza Mahdavi",  handle: "@reza.m",     section: "Trombones",   role: "leader", year: "Senior",    weekPts: 236, season: 668, status: "connected" },
  { name: "Aliya Reyes",   handle: "@aliya.r",    section: "Trombones",   role: "member", year: "Junior",    weekPts: 218, season: 601, status: "connected" },
  { name: "Hugo Sato",     handle: "@hugo.s",     section: "Trombones",   role: "member", year: "Sophomore", weekPts: 96,  season: 196, status: "pending" },

  { name: "Lila Park",     handle: "@lila.p",     section: "Saxes",       role: "leader", year: "Senior",    weekPts: 184, season: 504, status: "connected" },
  { name: "Theo Lin",      handle: "@theo.l",     section: "Saxes",       role: "member", year: "Junior",    weekPts: 220, season: 612, status: "connected" },
  { name: "Mei Wong",      handle: "@mei.w",      section: "Saxes",       role: "member", year: "Sophomore", weekPts: 184, season: 524, status: "connected" },

  { name: "Gus Romero",    handle: "@gus.r",      section: "Sousas",      role: "leader", year: "Senior",    weekPts: 196, season: 518, status: "connected" },
  { name: "Lex Halvorson", handle: "—",           section: "Sousas",      role: "member", year: "Rookie",    weekPts: 0,   season: 0,   status: "unregistered" },

  { name: "Priya Nair",    handle: "@priya.n",    section: "Clarinets",   role: "leader", year: "Senior",    weekPts: 168, season: 410, status: "connected" },
  { name: "Eli Bauer",     handle: "@eli.b",      section: "Clarinets",   role: "member", year: "Junior",    weekPts: 124, season: 326, status: "connected" },
  { name: "Sofia Marin",   handle: "@sofia.m",    section: "Clarinets",   role: "member", year: "Sophomore", weekPts: 142, season: 360, status: "connected" },

  { name: "KJ Mensah",     handle: "@kj.m",       section: "Flutes",      role: "leader", year: "Senior",    weekPts: 188, season: 508, status: "connected" },
  { name: "Iris Tan",      handle: "@iris.t",     section: "Flutes",      role: "member", year: "Junior",    weekPts: 96,  season: 248, status: "connected" },
  { name: "Noah Schmidt",  handle: "—",           section: "Flutes",      role: "member", year: "Rookie",    weekPts: 0,   season: 0,   status: "unregistered" },

  { name: "Theo Liu",      handle: "@theo.l2",    section: "Color Guard", role: "leader", year: "Senior",    weekPts: 158, season: 412, status: "connected" },
  { name: "Cam Brooks",    handle: "@cam.b",      section: "Color Guard", role: "member", year: "Junior",    weekPts: 132, season: 348, status: "pending" },

  { name: "Renée Okafor",  handle: "@renee.o",    section: "Pit",         role: "leader", year: "Senior",    weekPts: 168, season: 408, status: "connected" },
  { name: "Joaquin Vega",  handle: "@joaquin.v",  section: "Pit",         role: "member", year: "Junior",    weekPts: 88,  season: 232, status: "connected" },
];
