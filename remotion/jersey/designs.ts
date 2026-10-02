// Kit designs for the dummy catalogue. Colourways inspired by each club's kit, rendered on our own
// garment; no crests, no manufacturer or sponsor marks. Replaced by his real kit art later.

export type Shade = [deep: string, mid: string, bright: string];

export type Body =
  | { kind: "stripes"; stripes: Array<{ from: number; to: number; c: Shade }> }
  | { kind: "solid"; c: Shade }
  | { kind: "band"; base: Shade; band: Shade; from: number; to: number; edge?: string };

export type KitDesign = {
  body: Body;
  sleeves: { left: Shade; right: Shade };
  trim: string; // collar and cuff rib
  piping: string;
  ink: string; // applications: wordmark, badge, numbers
  outline: string; // number outline
  facade?: boolean; // the diagonal tone-on-tone bands of the 26/27 stripes
  pinstripe?: string; // thin vertical lines over the body
};

const garnet: Shade = ["#4A0A24", "#8A1437", "#B3183F"];
const blau: Shade = ["#08173A", "#14388A", "#1E4CB0"];

const solid = (c: Shade, trim: string, ink: string, extra: Partial<KitDesign> = {}): KitDesign => ({
  body: { kind: "solid", c },
  sleeves: { left: c, right: c },
  trim,
  piping: ink,
  ink,
  outline: trim,
  ...extra,
});

export const DESIGNS: Record<string, KitDesign> = {
  // FC Barcelona 26/27 home, as published: four tonal stripes, navy rib, gold applications
  "barcelona-home-26-27": {
    body: {
      kind: "stripes",
      stripes: [
        { from: -0.4, to: -0.148, c: blau },
        { from: -0.148, to: 0.0, c: garnet },
        { from: 0.0, to: 0.132, c: blau },
        { from: 0.132, to: 0.4, c: garnet },
      ],
    },
    sleeves: { left: blau, right: garnet },
    trim: "#0B1330",
    piping: "#E3B53E",
    ink: "#E3B53E",
    outline: "#0B1330",
    facade: true,
  },
  "real-madrid-home-26-27": solid(["#E9E7E2", "#F5F4F0", "#FFFFFF"], "#1B2A4A", "#C9A24A", { piping: "#C9A24A", outline: "#1B2A4A" }),
  "real-madrid-away-26-27": solid(["#0E0F14", "#1A1C24", "#2A2D38"], "#C9A24A", "#C9A24A", { piping: "#C9A24A", outline: "#0E0F14" }),
  "real-madrid-home-25-26-fan": solid(["#E4E2DC", "#F2F1EC", "#FFFFFF"], "#3B2E6E", "#3B2E6E", { piping: "#3B2E6E", outline: "#FFFFFF" }),
  "man-city-home-26-27": solid(["#5E9FD0", "#79B6E4", "#9ACDF2"], "#16244A", "#16244A", { piping: "#FFFFFF", outline: "#FFFFFF" }),
  "man-city-third-26-27": solid(["#2A1A4A", "#3D2768", "#55388C"], "#E8C547", "#E8C547", { outline: "#2A1A4A" }),
  "arsenal-away-26-27": solid(["#0C1A2E", "#13284A", "#1C3866"], "#D8B14A", "#D8B14A", { piping: "#C8102E", outline: "#0C1A2E" }),
  "liverpool-home-26-27": solid(["#8E0B1F", "#B3122A", "#D21D36"], "#F2F2F2", "#F2F2F2", { piping: "#F2F2F2", outline: "#8E0B1F" }),
  "inter-miami-home-26-27": solid(["#E08AAE", "#F2A9C8", "#F8C4DA"], "#1A1A1A", "#1A1A1A", { piping: "#1A1A1A", outline: "#F8C4DA" }),
  "al-nassr-home-26-27": solid(["#E8C400", "#F8D81C", "#FFE649"], "#1D3C8C", "#1D3C8C", { piping: "#1D3C8C", outline: "#FFE649" }),
  "portugal-home-26": solid(["#8C0E16", "#B5141E", "#D4202A"], "#0B5A2C", "#E8C547", { piping: "#0B5A2C", outline: "#0B5A2C" }),
  "barcelona-away-25-26-fan": solid(["#16171C", "#22242C", "#30333E"], "#F2C230", "#F2C230", { piping: "#C8102E", outline: "#16171C", pinstripe: "#F2C230" }),
  "psg-home-26-27": {
    body: { kind: "band", base: ["#0B1736", "#12224D", "#1A2E63"], band: ["#B5101E", "#D0182A", "#E42838"], from: -0.07, to: 0.07, edge: "#FFFFFF" },
    sleeves: { left: ["#0B1736", "#12224D", "#1A2E63"], right: ["#0B1736", "#12224D", "#1A2E63"] },
    trim: "#0B1736",
    piping: "#D0182A",
    ink: "#FFFFFF",
    outline: "#0B1736",
  },
  "argentina-home-26": {
    body: {
      kind: "stripes",
      stripes: [-0.4, -0.2, -0.12, -0.04, 0.04, 0.12, 0.2].map((from, i, a) => ({
        from,
        to: a[i + 1] ?? 0.4,
        c: i % 2 === 0 ? (["#E8EDF2", "#F4F7FA", "#FFFFFF"] as Shade) : (["#5E9CCB", "#75B1DD", "#8EC4EA"] as Shade),
      })),
    },
    sleeves: { left: ["#E8EDF2", "#F4F7FA", "#FFFFFF"], right: ["#E8EDF2", "#F4F7FA", "#FFFFFF"] },
    trim: "#111318",
    piping: "#75B1DD",
    ink: "#111318",
    outline: "#FFFFFF",
  },
};

/** The hero shirt is the Barcelona-style kit. */
DESIGNS.hero = DESIGNS["barcelona-home-26-27"];
