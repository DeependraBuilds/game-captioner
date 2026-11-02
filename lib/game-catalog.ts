// Curated, editable discovery list, not a claim of live player rankings.
// Custom games remain valid even when not in this catalog.
export type GameChoice = { title: string; category: string; aliases: readonly string[] };

export const GAME_GROUPS: ReadonlyArray<{ category: string; games: readonly string[] }> = [
  {
    "category": "Shooters & Battle Royale",
    "games": [
      "Fortnite",
      "Valorant",
      "Counter-Strike 2",
      "Call of Duty",
      "Call of Duty: Warzone",
      "Call of Duty: Black Ops 6",
      "Rainbow Six Siege",
      "Apex Legends",
      "PUBG: Battlegrounds",
      "Overwatch 2",
      "Battlefield 6",
      "Battlefield 2042",
      "Delta Force",
      "Escape from Tarkov",
      "THE FINALS",
      "Marvel Rivals",
      "Halo Infinite",
      "Destiny 2",
      "Warframe",
      "Team Fortress 2",
      "Hell Let Loose",
      "Hunt: Showdown 1896",
      "Ready or Not",
      "Arma 3",
      "Insurgency: Sandstorm",
      "Titanfall 2",
      "Helldivers 2",
      "Star Wars Battlefront II",
      "Deadlock",
      "Splitgate 2"
    ]
  },
  {
    "category": "Open World, Action & RPG",
    "games": [
      "Grand Theft Auto V",
      "GTA Online",
      "Red Dead Redemption 2",
      "Elden Ring",
      "Elden Ring Nightreign",
      "Baldur's Gate 3",
      "Cyberpunk 2077",
      "The Witcher 3: Wild Hunt",
      "Hogwarts Legacy",
      "Black Myth: Wukong",
      "God of War Ragnarök",
      "Ghost of Tsushima",
      "Ghost of Yōtei",
      "Assassin's Creed Shadows",
      "Assassin's Creed Valhalla",
      "Starfield",
      "The Elder Scrolls V: Skyrim",
      "Fallout 4",
      "Fallout 76",
      "Kingdom Come: Deliverance II",
      "Monster Hunter Wilds",
      "Monster Hunter Rise",
      "Diablo IV",
      "Path of Exile 2",
      "Hades",
      "Hades II",
      "Genshin Impact",
      "Honkai: Star Rail",
      "Wuthering Waves",
      "Zenless Zone Zero",
      "The Legend of Zelda: Tears of the Kingdom",
      "The Legend of Zelda: Breath of the Wild",
      "Marvel's Spider-Man 2",
      "Final Fantasy VII Rebirth",
      "Clair Obscur: Expedition 33",
      "Phantom Blade Zero"
    ]
  },
  {
    "category": "Sports, Racing & Fighting",
    "games": [
      "EA Sports FC 26",
      "EA Sports FC 27",
      "eFootball",
      "NBA 2K26",
      "NBA 2K27",
      "Madden NFL 26",
      "MLB The Show 26",
      "NHL 26",
      "EA Sports College Football 26",
      "Rocket League",
      "WWE 2K26",
      "Cricket 24",
      "F1 25",
      "F1 26",
      "Forza Horizon 5",
      "Forza Motorsport",
      "Gran Turismo 7",
      "Assetto Corsa",
      "Assetto Corsa Competizione",
      "iRacing",
      "BeamNG.drive",
      "Need for Speed Unbound",
      "Mario Kart 8 Deluxe",
      "Mario Kart World",
      "Trackmania",
      "Riders Republic",
      "UFC 5",
      "Tekken 8",
      "Street Fighter 6",
      "Mortal Kombat 1",
      "Super Smash Bros. Ultimate",
      "Brawlhalla",
      "Guilty Gear -Strive-",
      "Dragon Ball: Sparking! ZERO"
    ]
  },
  {
    "category": "Strategy, Simulation & Competitive",
    "games": [
      "League of Legends",
      "Dota 2",
      "Teamfight Tactics",
      "Mobile Legends: Bang Bang",
      "Honor of Kings",
      "Pokémon UNITE",
      "StarCraft II",
      "Age of Empires IV",
      "Age of Empires II: Definitive Edition",
      "Sid Meier's Civilization VI",
      "Sid Meier's Civilization VII",
      "Total War: Warhammer III",
      "Crusader Kings III",
      "Hearts of Iron IV",
      "Europa Universalis IV",
      "RimWorld",
      "Factorio",
      "Satisfactory",
      "Cities: Skylines II",
      "Microsoft Flight Simulator 2024",
      "The Sims 4",
      "Football Manager 26",
      "Two Point Museum",
      "Against the Storm",
      "Bloons TD 6",
      "Balatro",
      "Slay the Spire",
      "Slay the Spire 2",
      "Hearthstone",
      "Magic: The Gathering Arena",
      "Clash Royale",
      "Clash of Clans"
    ]
  },
  {
    "category": "Survival, Horror & Co-op",
    "games": [
      "ARC Raiders",
      "Rust",
      "Lethal Company",
      "Phasmophobia",
      "Content Warning",
      "R.E.P.O.",
      "Dead by Daylight",
      "Resident Evil 4",
      "Resident Evil Village",
      "Silent Hill 2",
      "The Outlast Trials",
      "Sons of the Forest",
      "The Forest",
      "Valheim",
      "Palworld",
      "ARK: Survival Ascended",
      "7 Days to Die",
      "DayZ",
      "Project Zomboid",
      "Don't Starve Together",
      "Subnautica",
      "Raft",
      "Enshrouded",
      "V Rising",
      "Terraria",
      "Grounded",
      "The Long Dark",
      "Sea of Thieves",
      "Dying Light 2",
      "Dying Light: The Beast",
      "PEAK",
      "Abiotic Factor"
    ]
  },
  {
    "category": "Indie, Cozy, Sandbox & Social",
    "games": [
      "Minecraft",
      "Roblox",
      "Stardew Valley",
      "Animal Crossing: New Horizons",
      "Fields of Mistria",
      "Sun Haven",
      "Coral Island",
      "Disney Dreamlight Valley",
      "Palia",
      "Cozy Grove",
      "Dinkum",
      "Spiritfarer",
      "Dave the Diver",
      "Cult of the Lamb",
      "Hollow Knight",
      "Hollow Knight: Silksong",
      "Celeste",
      "Undertale",
      "Deltarune",
      "Cuphead",
      "Ori and the Will of the Wisps",
      "The Binding of Isaac: Rebirth",
      "Vampire Survivors",
      "Brotato",
      "Risk of Rain 2",
      "Among Us",
      "Fall Guys",
      "Garry's Mod",
      "Human: Fall Flat",
      "It Takes Two",
      "Split Fiction",
      "Outer Wilds",
      "No Man's Sky",
      "Geometry Dash",
      "osu!",
      "Beat Saber",
      "VRChat",
      "Gorilla Tag",
      "Dress to Impress (Roblox)",
      "Grow a Garden (Roblox)"
    ]
  },
  {
    "category": "MMOs & Mobile",
    "games": [
      "World of Warcraft",
      "Final Fantasy XIV Online",
      "Old School RuneScape",
      "RuneScape",
      "Lost Ark",
      "The Elder Scrolls Online",
      "Guild Wars 2",
      "Black Desert Online",
      "Albion Online",
      "New World: Aeternum",
      "Call of Duty: Mobile",
      "PUBG Mobile",
      "Free Fire",
      "Free Fire MAX",
      "Brawl Stars",
      "Pokémon GO",
      "Pokémon Legends: Z-A",
      "Pokémon Scarlet and Violet",
      "Cookie Run: Kingdom"
    ]
  }
];

const ALIASES: Readonly<Record<string, readonly string[]>> = {
  "Rainbow Six Siege": [
    "r6",
    "r6s",
    "siege",
    "tom clancy's rainbow six siege"
  ],
  "Counter-Strike 2": [
    "cs2",
    "csgo",
    "counter strike"
  ],
  "Call of Duty": [
    "cod"
  ],
  "Call of Duty: Warzone": [
    "warzone",
    "wz"
  ],
  "Call of Duty: Black Ops 6": [
    "bo6",
    "black ops 6"
  ],
  "Grand Theft Auto V": [
    "gta5",
    "gta v",
    "gta 5"
  ],
  "GTA Online": [
    "gtao",
    "grand theft auto online"
  ],
  "PUBG: Battlegrounds": [
    "pubg"
  ],
  "Overwatch 2": [
    "ow2",
    "overwatch"
  ],
  "EA Sports FC 26": [
    "fc26",
    "fifa 26"
  ],
  "EA Sports FC 27": [
    "fc27",
    "fifa 27"
  ],
  "NBA 2K26": [
    "2k26"
  ],
  "NBA 2K27": [
    "2k27"
  ],
  "Rocket League": [
    "rl"
  ],
  "League of Legends": [
    "lol"
  ],
  "Dota 2": [
    "dota"
  ],
  "Teamfight Tactics": [
    "tft"
  ],
  "Sid Meier's Civilization VI": [
    "civ 6",
    "civ vi",
    "civilization 6"
  ],
  "Sid Meier's Civilization VII": [
    "civ 7",
    "civ vii",
    "civilization 7"
  ],
  "The Elder Scrolls V: Skyrim": [
    "skyrim",
    "tesv"
  ],
  "Call of Duty: Mobile": [
    "cod mobile",
    "codm"
  ],
  "Mobile Legends: Bang Bang": [
    "mlbb",
    "mobile legends"
  ],
  "Free Fire": [
    "garena free fire"
  ],
  "Phasmophobia": [
    "phasmo"
  ],
  "R.E.P.O.": [
    "repo"
  ],
  "Dead by Daylight": [
    "dbd"
  ],
  "Stardew Valley": [
    "sdv"
  ],
  "World of Warcraft": [
    "wow"
  ],
  "Final Fantasy XIV Online": [
    "ffxiv",
    "ff14"
  ],
  "Old School RuneScape": [
    "osrs"
  ],
  "Clair Obscur: Expedition 33": [
    "expedition 33"
  ]
};

export const GAME_CATALOG: readonly GameChoice[] = GAME_GROUPS.flatMap(group =>
  group.games.map(title => ({ title, category: group.category, aliases: ALIASES[title] ?? [] }))
);
export const FEATURED_GAMES = [
  "Fortnite",
  "Minecraft",
  "Roblox",
  "Valorant",
  "Grand Theft Auto V",
  "Call of Duty: Warzone",
  "Rainbow Six Siege",
  "Counter-Strike 2",
  "League of Legends",
  "EA Sports FC 27",
  "Apex Legends",
  "Stardew Valley"
] as const;

export function normalizeGameSearch(value: string): string {
  return value.toLocaleLowerCase("en").normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

export function findGames(input: string, limit = 12): GameChoice[] {
  const query = normalizeGameSearch(input);
  const max = Math.min(30, Math.max(0, Math.floor(limit)));
  if (!query) {
    if (input.trim()) return [];
    return FEATURED_GAMES.slice(0, max).map(name => GAME_CATALOG.find(game => game.title === name)!);
  }
  return GAME_CATALOG
    .map((game, order) => {
      const titles = [game.title, ...game.aliases].map(normalizeGameSearch);
      const match = titles.some(value => value === query) ? 0
        : titles.some(value => value.startsWith(query)) ? 1
        : titles.some(value => value.split(" ").some(word => word.startsWith(query))) ? 2
        : titles.some(value => value.includes(query)) ? 3 : 4;
      return { game, match, order };
    })
    .filter(item => item.match < 4)
    .sort((a,b) => a.match - b.match || a.order - b.order)
    .slice(0,max)
    .map(({game}) => game);
}
