/**
 * Curated demand trends for Indian kirana stores — what typically sells more
 * in each season and around each major festival, plus products trending
 * nationally. This is a hand-maintained guide, not live market data.
 *
 * `match` holds lowercase keywords; a trend links to a store product whose
 * name contains any of them, so we can show whether it's on the shelf.
 */

export type TrendItem = {
  name: string
  emoji: string
  category: string
  reason: string
  match?: string[]
}

export type TrendGroup = {
  id: string
  title: string
  emoji: string
  blurb: string
  items: TrendItem[]
}

export type SeasonGroup = TrendGroup & { months: number[] } // 1 = Jan
export type FestivalGroup = TrendGroup & { months: number[]; when: string }

export const SEASONS: SeasonGroup[] = [
  {
    id: 'summer',
    title: 'Summer',
    emoji: '☀️',
    months: [3, 4, 5, 6],
    blurb: 'Heat pushes cold drinks, hydration and skin care.',
    items: [
      { name: 'Cold drinks (750ml & 2L)', emoji: '🥤', category: 'Beverages', reason: 'Peak season — keep chilled stock deep', match: ['coca-cola', 'thums up', 'sprite', 'pepsi'] },
      { name: 'Mango drinks', emoji: '🥭', category: 'Beverages', reason: 'Frooti / Maaza move fast with kids', match: ['frooti', 'maaza'] },
      { name: 'Packaged water', emoji: '💧', category: 'Beverages', reason: 'Daily walk-in demand doubles', match: ['bisleri', 'water'] },
      { name: 'Buttermilk & lassi', emoji: '🥛', category: 'Dairy', reason: 'Cooling, cheap, high repeat', match: ['buttermilk', 'lassi', 'chaas'] },
      { name: 'Curd / dahi', emoji: '🥣', category: 'Dairy', reason: 'Raita and lassi at home', match: ['dahi', 'curd'] },
      { name: 'Glucon-D & ORS', emoji: '⚡', category: 'Beverages', reason: 'Heatwave hydration', match: ['glucon', 'electral', 'ors'] },
      { name: 'Rasna / Tang', emoji: '🍊', category: 'Beverages', reason: 'Instant drink mix for families', match: ['rasna', 'tang'] },
      { name: 'Prickly heat powder', emoji: '🧴', category: 'Personal Care', reason: 'Sweat & rash season', match: ['nycil', 'prickly', 'talc'] },
      { name: 'Sunscreen & face wash', emoji: '🧴', category: 'Personal Care', reason: 'Tanning & oily skin', match: ['sunscreen', 'face wash'] },
    ],
  },
  {
    id: 'monsoon',
    title: 'Monsoon',
    emoji: '🌧️',
    months: [7, 8, 9],
    blurb: 'Rainy evenings mean chai, pakode and mosquito care.',
    items: [
      { name: 'Tea (Red Label, Tata Gold)', emoji: '🍵', category: 'Beverages', reason: 'Chai consumption climbs in the rains', match: ['tea'] },
      { name: 'Besan', emoji: '🌾', category: 'Staples', reason: 'Pakode on every rainy evening', match: ['besan'] },
      { name: 'Instant noodles', emoji: '🍜', category: 'Snacks', reason: 'Comfort food, stays indoors', match: ['maggi', 'noodles'] },
      { name: 'Namkeen & bhujia', emoji: '🥨', category: 'Snacks', reason: 'Goes with evening chai', match: ['bhujia', 'namkeen', 'sev'] },
      { name: 'Mosquito repellent', emoji: '🦟', category: 'Household', reason: 'Dengue season — refills sell out', match: ['good knight', 'all out', 'odomos', 'mortein'] },
      { name: 'Antiseptic liquid & soap', emoji: '🧼', category: 'Personal Care', reason: 'Infections & damp clothes', match: ['dettol', 'savlon'] },
      { name: 'Floor & toilet cleaner', emoji: '🧴', category: 'Household', reason: 'Muddy floors, damp homes', match: ['lizol', 'harpic', 'phenyl'] },
      { name: 'Instant soups', emoji: '🥣', category: 'Snacks', reason: 'Warm snacks for cold, wet days', match: ['soup'] },
      { name: 'Honey & ginger', emoji: '🍯', category: 'Staples', reason: 'Home remedies for cough & cold', match: ['honey', 'ginger'] },
    ],
  },
  {
    id: 'festive',
    title: 'Festive season',
    emoji: '🪔',
    months: [10, 11],
    blurb: 'Sweets, gifting and deep cleaning ahead of Diwali.',
    items: [
      { name: 'Ghee', emoji: '🧈', category: 'Dairy', reason: 'Home-made mithai and puja', match: ['ghee'] },
      { name: 'Sugar, maida & sooji', emoji: '🍬', category: 'Staples', reason: 'Festive baking and sweets', match: ['sugar', 'maida', 'sooji', 'rava'] },
      { name: 'Dry fruits', emoji: '🥜', category: 'Staples', reason: 'Top gifting item', match: ['almond', 'badam', 'cashew', 'kaju', 'dry fruit'] },
      { name: 'Chocolate gift packs', emoji: '🍫', category: 'Snacks', reason: 'Celebrations & Silk boxes', match: ['dairy milk', 'celebrations', 'silk', 'kitkat'] },
      { name: 'Cleaning supplies', emoji: '🧽', category: 'Household', reason: 'Pre-Diwali deep clean', match: ['colin', 'harpic', 'lizol', 'vim'] },
      { name: 'Agarbatti & diyas', emoji: '🪔', category: 'Household', reason: 'Daily puja through the season', match: ['agarbatti', 'diya', 'camphor'] },
      { name: 'Cooking oil (big packs)', emoji: '🛢️', category: 'Staples', reason: 'Frying for snacks and sweets', match: ['sunflower', 'saffola', 'mustard oil', 'refined'] },
      { name: 'Namkeen family packs', emoji: '🥨', category: 'Snacks', reason: 'Guests at home every day', match: ['bhujia', 'namkeen'] },
    ],
  },
  {
    id: 'winter',
    title: 'Winter',
    emoji: '❄️',
    months: [12, 1, 2],
    blurb: 'Warm drinks, dry-skin care and immunity boosters.',
    items: [
      { name: 'Coffee & health drinks', emoji: '☕', category: 'Beverages', reason: 'Hot drinks morning and night', match: ['nescafé', 'nescafe', 'coffee', 'bournvita', 'horlicks'] },
      { name: 'Cold cream & lotion', emoji: '🧴', category: 'Personal Care', reason: 'Dry skin everywhere', match: ['nivea', 'cold cream', 'vaseline', 'boroline', 'lotion'] },
      { name: 'Chyawanprash', emoji: '🍯', category: 'Staples', reason: 'Immunity for the whole family', match: ['chyawanprash'] },
      { name: 'Jaggery, til & peanuts', emoji: '🥜', category: 'Staples', reason: 'Gajak, chikki and laddoo', match: ['jaggery', 'gud', 'til', 'peanut'] },
      { name: 'Mustard oil', emoji: '🛢️', category: 'Staples', reason: 'Winter cooking in the north', match: ['mustard', 'sarson'] },
      { name: 'Coconut & hair oil', emoji: '🥥', category: 'Personal Care', reason: 'Dry scalp and skin', match: ['parachute', 'coconut oil', 'hair oil'] },
      { name: 'Instant soups', emoji: '🥣', category: 'Snacks', reason: 'Quick warm snack', match: ['soup'] },
      { name: 'Honey', emoji: '🍯', category: 'Staples', reason: 'Cough, cold & warm water', match: ['honey'] },
    ],
  },
]

export const FESTIVALS: FestivalGroup[] = [
  {
    id: 'sankranti',
    title: 'Makar Sankranti · Lohri · Pongal',
    emoji: '🪁',
    months: [1],
    when: 'Mid January',
    blurb: 'Til, jaggery and rice sweets.',
    items: [
      { name: 'Til & jaggery', emoji: '🥜', category: 'Staples', reason: 'Til-gud laddoo and chikki', match: ['til', 'jaggery', 'gud'] },
      { name: 'Peanuts & popcorn', emoji: '🍿', category: 'Snacks', reason: 'Lohri bonfire snacks', match: ['peanut', 'popcorn'] },
      { name: 'Rice & moong dal', emoji: '🍚', category: 'Staples', reason: 'Pongal and khichdi', match: ['rice', 'moong'] },
      { name: 'Ghee', emoji: '🧈', category: 'Dairy', reason: 'Sweets and khichdi', match: ['ghee'] },
    ],
  },
  {
    id: 'holi',
    title: 'Holi',
    emoji: '🎨',
    months: [3],
    when: 'March',
    blurb: 'Gujiya, thandai and colours.',
    items: [
      { name: 'Maida, khoya & sugar', emoji: '🥟', category: 'Staples', reason: 'Gujiya making at home', match: ['maida', 'sugar', 'khoya'] },
      { name: 'Cold drinks (2L)', emoji: '🥤', category: 'Beverages', reason: 'Parties and guests', match: ['coca-cola', 'thums up', 'sprite', 'pepsi'] },
      { name: 'Namkeen', emoji: '🥨', category: 'Snacks', reason: 'Served with every visit', match: ['bhujia', 'namkeen', 'sev'] },
      { name: 'Coconut oil & soap', emoji: '🥥', category: 'Personal Care', reason: 'Protect skin, wash off colour', match: ['parachute', 'coconut oil', 'soap'] },
    ],
  },
  {
    id: 'rakhi',
    title: 'Raksha Bandhan',
    emoji: '🎁',
    months: [8],
    when: 'August',
    blurb: 'Sweets and chocolate gifting.',
    items: [
      { name: 'Chocolate gift packs', emoji: '🍫', category: 'Snacks', reason: 'Rakhi gifts for siblings', match: ['dairy milk', 'celebrations', 'silk', 'kitkat'] },
      { name: 'Dry fruits', emoji: '🥜', category: 'Staples', reason: 'Premium gifting', match: ['almond', 'badam', 'cashew', 'kaju'] },
      { name: 'Milkmaid & ghee', emoji: '🥫', category: 'Dairy', reason: 'Home-made sweets', match: ['milkmaid', 'ghee'] },
    ],
  },
  {
    id: 'ganesh',
    title: 'Janmashtami · Ganesh Chaturthi · Onam',
    emoji: '🌺',
    months: [8, 9],
    when: 'Aug – Sep',
    blurb: 'Modak, prasad and puja items.',
    items: [
      { name: 'Ghee & dry fruits', emoji: '🧈', category: 'Dairy', reason: 'Modak and panjiri', match: ['ghee', 'almond', 'cashew'] },
      { name: 'Rice flour & jaggery', emoji: '🍚', category: 'Staples', reason: 'Ukadiche modak', match: ['rice', 'jaggery'] },
      { name: 'Coconut oil', emoji: '🥥', category: 'Staples', reason: 'Onam sadhya cooking', match: ['coconut oil', 'parachute'] },
      { name: 'Agarbatti & camphor', emoji: '🪔', category: 'Household', reason: 'Daily aarti for 10 days', match: ['agarbatti', 'camphor'] },
    ],
  },
  {
    id: 'navratri',
    title: 'Navratri & Dussehra',
    emoji: '🪷',
    months: [9, 10],
    when: 'Sep – Oct',
    blurb: 'Vrat (fasting) food sells for nine days.',
    items: [
      { name: 'Sabudana', emoji: '⚪', category: 'Staples', reason: 'Khichdi and vada for vrat', match: ['sabudana'] },
      { name: 'Kuttu & singhara atta', emoji: '🌾', category: 'Staples', reason: 'Fasting flour — stock early', match: ['kuttu', 'singhara'] },
      { name: 'Makhana', emoji: '🍿', category: 'Snacks', reason: 'Top vrat snack', match: ['makhana'] },
      { name: 'Sendha namak', emoji: '🧂', category: 'Staples', reason: 'Rock salt for fasting', match: ['sendha', 'rock salt'] },
      { name: 'Ghee', emoji: '🧈', category: 'Dairy', reason: 'Puja and vrat cooking', match: ['ghee'] },
      { name: 'Milk & paneer', emoji: '🥛', category: 'Dairy', reason: 'Fasting-friendly protein', match: ['milk 500', 'paneer'] },
    ],
  },
  {
    id: 'karwa',
    title: 'Karwa Chauth',
    emoji: '🌙',
    months: [10],
    when: 'October',
    blurb: 'Sargi items the morning before.',
    items: [
      { name: 'Pheni & mathri', emoji: '🥨', category: 'Snacks', reason: 'Sargi thali', match: ['pheni', 'mathri'] },
      { name: 'Dry fruits', emoji: '🥜', category: 'Staples', reason: 'Sargi thali', match: ['almond', 'cashew', 'dry fruit'] },
      { name: 'Milk & sweets', emoji: '🥛', category: 'Dairy', reason: 'Breaking the fast', match: ['milk 500', 'milkmaid'] },
    ],
  },
  {
    id: 'diwali',
    title: 'Dhanteras & Diwali',
    emoji: '🪔',
    months: [10, 11],
    when: 'Oct – Nov',
    blurb: 'The biggest sales week of the year.',
    items: [
      { name: 'Chocolate & sweet gift boxes', emoji: '🎁', category: 'Snacks', reason: 'Corporate and family gifting', match: ['celebrations', 'dairy milk', 'silk', 'soan papdi'] },
      { name: 'Dry fruits', emoji: '🥜', category: 'Staples', reason: 'Most-gifted item at Diwali', match: ['almond', 'badam', 'cashew', 'kaju'] },
      { name: 'Ghee, sugar, besan', emoji: '🧈', category: 'Staples', reason: 'Laddoo and mithai at home', match: ['ghee', 'sugar', 'besan'] },
      { name: 'Cleaning supplies', emoji: '🧽', category: 'Household', reason: 'Diwali safai', match: ['colin', 'harpic', 'lizol', 'vim', 'phenyl'] },
      { name: 'Diyas, candles, agarbatti', emoji: '🕯️', category: 'Household', reason: 'Lighting and puja', match: ['diya', 'candle', 'agarbatti'] },
      { name: 'Cold drinks & namkeen', emoji: '🥤', category: 'Beverages', reason: 'Guests and card parties', match: ['coca-cola', 'thums up', 'pepsi', 'bhujia'] },
    ],
  },
  {
    id: 'chhath',
    title: 'Chhath Puja',
    emoji: '🌅',
    months: [11],
    when: 'November',
    blurb: 'Big in Bihar, UP and Jharkhand.',
    items: [
      { name: 'Wheat flour & jaggery', emoji: '🌾', category: 'Staples', reason: 'Thekua prasad', match: ['atta', 'jaggery', 'gud'] },
      { name: 'Ghee', emoji: '🧈', category: 'Dairy', reason: 'Thekua and puja', match: ['ghee'] },
      { name: 'Coconut & fruits', emoji: '🥥', category: 'Staples', reason: 'Arghya offerings', match: ['nariyal', 'dry coconut'] },
    ],
  },
  {
    id: 'weddings',
    title: 'Wedding season',
    emoji: '💍',
    months: [11, 12, 1, 2],
    when: 'Nov – Feb',
    blurb: 'Bulk orders from families and caterers.',
    items: [
      { name: 'Basmati rice (bulk)', emoji: '🍚', category: 'Staples', reason: 'Biryani and pulao for guests', match: ['basmati', 'rice'] },
      { name: 'Cooking oil (15L tins)', emoji: '🛢️', category: 'Staples', reason: 'Caterer orders', match: ['sunflower', 'saffola', 'mustard oil', 'refined'] },
      { name: 'Packaged water', emoji: '💧', category: 'Beverages', reason: 'Events need cases', match: ['bisleri', 'water'] },
      { name: 'Paneer & cream', emoji: '🧀', category: 'Dairy', reason: 'Wedding menu staples', match: ['paneer', 'fresh cream'] },
    ],
  },
  {
    id: 'christmas',
    title: 'Christmas & New Year',
    emoji: '🎄',
    months: [12],
    when: 'December',
    blurb: 'Cakes, parties and snacks.',
    items: [
      { name: 'Plum cake & cookies', emoji: '🍰', category: 'Snacks', reason: 'Christmas treats', match: ['cake', 'cookie', 'good day'] },
      { name: 'Chips & party snacks', emoji: '🥔', category: 'Snacks', reason: 'New Year parties', match: ['lays', 'kurkure', 'bingo'] },
      { name: 'Cold drinks (2L)', emoji: '🥤', category: 'Beverages', reason: 'Parties', match: ['coca-cola', 'thums up', 'sprite', 'pepsi'] },
      { name: 'Chocolates', emoji: '🍫', category: 'Snacks', reason: 'Gifting for kids', match: ['dairy milk', 'kitkat'] },
    ],
  },
]

/** Products trending with Indian shoppers year-round right now. */
export const INDIA_TRENDING: TrendItem[] = [
  { name: 'Makhana (fox nuts)', emoji: '🍿', category: 'Snacks', reason: 'Healthy snacking boom — flavoured packs growing fast', match: ['makhana'] },
  { name: 'Energy drinks', emoji: '⚡', category: 'Beverages', reason: 'Sting & Charged at ₹20 fly off the shelf', match: ['sting', 'charged', 'red bull'] },
  { name: 'High-protein dairy', emoji: '💪', category: 'Dairy', reason: 'Amul Protein lassi, milk & paneer trending', match: ['protein'] },
  { name: 'Korean-style noodles', emoji: '🍜', category: 'Snacks', reason: 'Spicy ramen popular with teens', match: ['korean', 'ramen', 'buldak'] },
  { name: 'Millet (ragi, jowar) products', emoji: '🌾', category: 'Staples', reason: 'Shree Anna push — atta, cookies, flakes', match: ['millet', 'ragi', 'jowar', 'bajra'] },
  { name: 'Peanut butter', emoji: '🥜', category: 'Staples', reason: 'Gym-goers and kids’ tiffins', match: ['peanut butter'] },
  { name: 'Oats', emoji: '🥣', category: 'Staples', reason: 'Quick healthy breakfast', match: ['oats'] },
  { name: 'Instant coffee sachets', emoji: '☕', category: 'Beverages', reason: 'Young buyers switching from tea', match: ['nescafé', 'nescafe', 'bru', 'coffee'] },
  { name: 'Cold coffee & iced tea', emoji: '🧋', category: 'Beverages', reason: 'Ready-to-drink cans and bottles', match: ['cold coffee', 'iced tea'] },
  { name: 'Ready-to-cook mixes', emoji: '🍛', category: 'Staples', reason: 'Poha, upma, idli mixes save time', match: ['mtr', 'poha', 'upma', 'idli'] },
  { name: 'Liquid detergent & refills', emoji: '🧴', category: 'Household', reason: 'Shift from powder to liquid', match: ['liquid detergent', 'matic'] },
  { name: 'Dishwash liquid', emoji: '🧽', category: 'Household', reason: 'Replacing bars in city homes', match: ['vim liquid', 'pril', 'gel'] },
  { name: 'Hand wash refills', emoji: '🧼', category: 'Personal Care', reason: 'Refill packs cheaper than bottles', match: ['hand wash', 'handwash'] },
  { name: 'Sugar-free & jaggery sweets', emoji: '🍯', category: 'Staples', reason: 'Diabetes-aware households', match: ['sugar free', 'jaggery', 'stevia'] },
]

export function currentSeason(now: Date): SeasonGroup {
  const month = now.getMonth() + 1
  return SEASONS.find((s) => s.months.includes(month)) ?? SEASONS[0]
}

export type UpcomingFestival = FestivalGroup & { status: 'now' | 'soon' }

/** Festivals falling in this month ("now") or next month ("soon"). */
export function upcomingFestivals(now: Date): UpcomingFestival[] {
  const month = now.getMonth() + 1
  const next = (month % 12) + 1
  const out: UpcomingFestival[] = []
  for (const f of FESTIVALS) {
    if (f.months.includes(month)) out.push({ ...f, status: 'now' })
    else if (f.months.includes(next)) out.push({ ...f, status: 'soon' })
  }
  // a window ending this month is mostly behind us late in the month —
  // rank it after the festivals still ahead
  const rank = (f: UpcomingFestival) =>
    f.status === 'soon'
      ? 1
      : f.months[f.months.length - 1] === month && now.getDate() > 20
        ? 2
        : 0
  return out.sort((a, b) => rank(a) - rank(b))
}
