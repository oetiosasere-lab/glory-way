const photos = import.meta.glob<string>(
  "@/assets/drinks/*.{jpeg,jpg,png,webp}",
  {
    eager: true,
    import: "default",
  },
);

const photo = (slug: string) => {
  const match = Object.entries(photos).find(([path]) => {
    const file = path.replace(/^.*[\\/]/, "");
    const baseName = file.substring(0, file.lastIndexOf("."));
    return baseName === slug;
  });
  return match ? match[1] : undefined;
};

export type DrinkCategory =
  | "Energy"
  | "Lager"
  | "Stout"
  | "Malt"
  | "Soft Drink"
  | "Bitters"
  | "RTD & Cider"
  | "Spirits & Wine";

export type PackageType = "Bottle" | "Can";

export type Drink = {
  slug: string;
  name: string;
  category: DrinkCategory;
  packageTypes: PackageType[];
  brewer: string;
  size: string;
  note: string;
  image?: string;
};

const make = (
  name: string,
  slug: string,
  category: DrinkCategory,
  packageTypes: PackageType[],
  brewer: string,
  size: string,
  note: string,
): Drink => ({
  slug,
  name,
  category,
  packageTypes,
  brewer,
  size,
  note,
  image: photo(slug),
});

export const drinks: Drink[] = [
  // --- ENERGY DRINKS ---
  make("Red Bull", "red-bull", "Energy", ["Can"], "Red Bull GmbH", "25cl / 33cl Cans", "World-renowned energy drink that vitalizes body and mind. Sold by the pack or carton."),
  make("Monster Energy", "monster", "Energy", ["Can"], "Monster Beverage", "44cl / 50cl Cans", "Tear into a can of the meanest energy drink on the planet. Sold by the pack."),
  make("Fearless", "fearless", "Energy", ["Bottle", "Can"], "Rite Foods", "50cl Cans & PET Bottles", "Quick burst of energy with bold flavours (Classic & Red Berry). Available in bottles and cans."),
  make("Power Horse", "power-horse", "Energy", ["Can"], "Power Horse", "25cl / 33cl Cans", "Premium European energy drink formula for stamina and vitality. Sold in packs."),
  make("Predator", "predator", "Energy", ["Bottle", "Can"], "Monster Energy / Coca-Cola", "40cl PET & 33cl Cans", "Fierce refreshment and affordable energy for high endurance. Bottles and cans."),
  make("Climax", "climax", "Energy", ["Bottle", "Can"], "Nigerian Breweries", "50cl PET & 33cl Cans", "Herbal-infused energy drink by Nigerian Breweries. Distinctive invigorating taste."),
  make("Bullet", "bullet", "Energy", ["Can"], "Bullet", "25cl / 33cl Cans", "Powerful energy formulation popular across clubs and events. Available in cans."),
  make("Rockstar", "rockstar", "Energy", ["Can"], "PepsiCo", "33cl / 44cl Cans", "Designed for those who lead active lifestyles with B-vitamins and taurine."),

  // --- BEERS & LAGERS ---
  make("Star Lager", "star", "Lager", ["Bottle", "Can"], "Nigerian Breweries", "60cl Bottles & 33cl/50cl Cans", "Nigeria's flagship crisp, clean lager since 1949. Premium cold filtered."),
  make("Star Radler", "star-radler", "Lager", ["Bottle", "Can"], "Nigerian Breweries", "45cl Bottles & 33cl Cans", "Crisp Star lager blended with natural citrus juice. Twice as refreshing."),
  make("Gulder Lager", "gulder", "Lager", ["Bottle", "Can"], "Nigerian Breweries", "60cl Bottles & 33cl Cans", "The ultimate beer. Extra-matured full-bodied lager with a crisp bitter finish."),
  make("Heineken", "heineken", "Lager", ["Bottle", "Can"], "Nigerian Breweries", "60cl/33cl Bottles & 33cl Cans", "World-class 100% pure malt premium lager brewed with natural ingredients."),
  make("33 Export", "33-export", "Lager", ["Bottle", "Can"], "Nigerian Breweries", "60cl Bottles & 33cl/50cl Cans", "The beer of friendship. Quality lager with a balanced crisp taste."),
  make("Goldberg", "goldberg", "Lager", ["Bottle", "Can"], "Nigerian Breweries", "60cl Bottles & 33cl/50cl Cans", "Proudly crafted for cultural celebrations and enjoyment. Rich golden taste."),
  make("Hero Lager", "hero", "Lager", ["Bottle", "Can"], "International Breweries", "60cl Bottles & 33cl Cans", "The beer of champions. Robust lager with premium local grains."),
  make("Trophy Lager", "trophy", "Lager", ["Bottle", "Can"], "International Breweries", "60cl Bottles & 33cl Cans", "Crisp, refreshing honour of good times. Light golden lager."),
  make("Budweiser", "budweiser", "Lager", ["Bottle", "Can"], "International Breweries", "60cl Bottles & 33cl/50cl Cans", "The King of Beers. Beechwood aged for a clean, crisp, smooth finish."),
  make("Life Continental", "life", "Lager", ["Bottle", "Can"], "Nigerian Breweries", "60cl Bottles & 33cl Cans", "Traditional lager beer celebrating progress and community."),

  // --- STOUTS ---
  make("Guinness Foreign Extra", "guinness", "Stout", ["Bottle", "Can"], "Guinness Nigeria", "60cl/33cl Bottles & 33cl Cans", "Rich, dark, and iconic extra stout with bold roasted barley flavours."),
  make("Guinness Smooth", "guinness-smooth", "Stout", ["Bottle", "Can"], "Guinness Nigeria", "45cl Bottles & 44cl Cans", "Distinctively smooth stout balancing rich roast notes with fruity sweetness."),
  make("Legend Extra Stout", "legend", "Stout", ["Bottle", "Can"], "Nigerian Breweries", "60cl Bottles & 33cl Cans", "Full-brewed rich, bitter-sweet stout with velvet foam head."),

  // --- MALT DRINKS ---
  make("Maltina", "maltina", "Malt", ["Bottle", "Can"], "Nigerian Breweries", "33cl Bottles & 33cl Cans", "Enriched with vitamins A, B, and calcium. Smooth, nourishing malt goodness."),
  make("Malta Guinness", "malta-guinness", "Malt", ["Bottle", "Can"], "Guinness Nigeria", "33cl Bottles & 33cl Cans", "Premium non-alcoholic malt drink packed with energy and goodness."),
  make("Amstel Malta", "amstel-malta", "Malt", ["Bottle", "Can"], "Nigerian Breweries", "33cl Bottles & 33cl Cans", "Premium low-sugar malt drink with natural, wholesome ingredients."),
  make("Dubic Malt", "dubic-malt", "Malt", ["Bottle", "Can"], "Guinness Nigeria", "33cl Bottles & 33cl Cans", "Rich creamy refreshment with a silky smooth premium malt taste."),
  make("Hi-Malt", "hi-malt", "Malt", ["Bottle", "Can"], "Consolidated Breweries", "33cl Bottles & 33cl Cans", "Classic nourishing malt drink with balanced natural sweetness."),
  make("Grand Malt", "grand-malt", "Malt", ["Bottle", "Can"], "Nigerian Breweries", "33cl Bottles & 33cl Cans", "Rich malt refreshment brewed from the finest natural barley."),

  // --- READY TO DRINK & CIDERS ---
  make("Smirnoff Ice", "smirnoff-ice", "RTD & Cider", ["Bottle", "Can"], "Guinness Nigeria", "30cl Bottles & 33cl Cans", "Crisp, citrus blend infused with Smirnoff No. 21 vodka. Refreshingly zesty."),
  make("Orijin Ready-To-Drink", "orijin", "RTD & Cider", ["Bottle", "Can"], "Guinness Nigeria", "60cl Bottles & 33cl Cans", "Alcoholic blend with African herbs and sweet tropical fruit flavours."),
  make("Desperados", "desperados", "RTD & Cider", ["Bottle", "Can"], "Nigerian Breweries", "33cl Bottles & 33cl Cans", "Tequila-flavoured beer with a wild, refreshing edge."),
  make("Savanna Cider", "savanna", "RTD & Cider", ["Bottle", "Can"], "Distell", "33cl Bottles & 33cl Cans", "Crisp dry cider made from crushed apples. Refreshingly dry finish."),
  make("Hunters Gold", "hunters-gold", "RTD & Cider", ["Bottle", "Can"], "Distell", "33cl Bottles & 33cl Cans", "Crisp, sweet, golden cider bursting with fresh apple fruitiness."),

  // --- BITTERS & HERBAL ---
  make("Action Bitters", "action-bitters", "Bitters", ["Bottle"], "Intercontinental Distillers", "37.5cl & 75cl Bottles", "Popular herbal alcoholic drink crafted from traditional botanical extracts."),
  make("Alomo Bitters", "alomo-bitters", "Bitters", ["Bottle"], "Kasapreko", "20cl, 37.5cl & 75cl Bottles", "Authentic Ghanaian botanical herbal bitters popular across Nigeria."),
  make("1960 Roots", "1960-roots", "Bitters", ["Bottle"], "Grand Oak", "37.5cl & 75cl Bottles", "Heritage Nigerian herbal alcoholic bitters with deep aromatic spice."),
  make("Odogwu Bitters", "odogwu-bitters", "Bitters", ["Bottle"], "Odogwu", "33cl Bottles & Cans", "Herbal alcoholic blend with ginger, honey, and natural ginseng."),

  // --- SPIRITS, WINES & LIQUEURS ---
  make("Gordon's Dry Gin", "gordons-gin", "Spirits & Wine", ["Bottle"], "Guinness / Diageo", "75cl Bottles", "Classic London dry gin infused with handpicked wild juniper berries."),
  make("Chelsea Dry Gin", "chelsea-gin", "Spirits & Wine", ["Bottle"], "Intercontinental Distillers", "75cl & 37.5cl Bottles", "Long-standing Nigerian favourite dry gin with aromatic botanicals."),
  make("Smirnoff Vodka", "smirnoff-vodka", "Spirits & Wine", ["Bottle"], "Guinness / Diageo", "75cl & 37.5cl Bottles", "Triple distilled and ten times filtered for world-renowned purity."),
  make("Jameson Irish Whiskey", "jameson", "Spirits & Wine", ["Bottle"], "Irish Distillers / Pernod", "70cl / 1L Bottles", "Triple-distilled Irish whiskey renowned for its smooth, balanced character."),
  make("Johnnie Walker Black Label", "johnnie-walker-black", "Spirits & Wine", ["Bottle"], "Diageo", "70cl / 1L Bottles", "Iconic 12-year-old blended Scotch whisky with rich, smoky depth."),
  make("Hennessy VS", "hennessy", "Spirits & Wine", ["Bottle"], "Moët Hennessy", "70cl Bottles", "World's favourite cognac with bold notes of toasted oak and fruit."),
  make("Baileys Irish Cream", "baileys", "Spirits & Wine", ["Bottle"], "Diageo", "70cl / 1L Bottles", "The original Irish cream liqueur. Rich dairy cream and aged whiskey."),
  make("Amarula Cream", "amarula", "Spirits & Wine", ["Bottle"], "Distell", "75cl / 1L Bottles", "Exotic South African cream liqueur made from wild marula fruit."),
  make("Four Cousins Sweet Red", "four-cousins", "Spirits & Wine", ["Bottle"], "Van Loveren", "75cl Bottles", "South Africa's beloved natural sweet red wine. Fruity and easy-drinking."),
  make("Carlo Rossi Sweet Red", "carlo-rossi", "Spirits & Wine", ["Bottle"], "E. & J. Gallo", "75cl Bottles", "Rich, sweet California red wine packed with red berry flavours."),
  make("Moët & Chandon Brut", "moet-chandon", "Spirits & Wine", ["Bottle"], "Moët & Chandon", "75cl Bottles", "Prestigious French champagne with vibrant apple, citrus and brioche."),

  // --- SOFT DRINKS & JUICES ---
  make("Coca-Cola", "coca-cola", "Soft Drink", ["Bottle", "Can"], "NBC / Coca-Cola", "35cl/50cl Bottles & 33cl Cans", "The timeless classic refreshing cola. Available in glass bottles and cans."),
  make("Fanta Orange", "fanta", "Soft Drink", ["Bottle", "Can"], "NBC / Coca-Cola", "35cl/50cl Bottles & 33cl Cans", "Vibrant, bubbly orange fruit taste that uplifts every moment."),
  make("Sprite", "sprite", "Soft Drink", ["Bottle", "Can"], "NBC / Coca-Cola", "35cl/50cl Bottles & 33cl Cans", "Crisp, clean lemon-lime refreshment with 100% natural flavours."),
  make("Pepsi", "pepsi", "Soft Drink", ["Bottle", "Can"], "Seven-Up Bottling Co.", "50cl Bottles & 33cl Cans", "Bold, refreshing cola with sweet citrus undertones."),
  make("7UP", "7up", "Soft Drink", ["Bottle", "Can"], "Seven-Up Bottling Co.", "50cl Bottles & 33cl Cans", "Crisp lemon and lime thirst-quencher. 100% naturally refreshing."),
  make("Mirinda", "mirinda", "Soft Drink", ["Bottle", "Can"], "Seven-Up Bottling Co.", "50cl Bottles & 33cl Cans", "Intensely fruity orange sparkling soft drink."),
  make("Fayrouz", "fayrouz", "Soft Drink", ["Bottle", "Can"], "Nigerian Breweries", "33cl Bottles & 33cl Cans", "Natural malted sparkling soft drink with pineapple and citrus."),
  make("Schweppes", "schweppes", "Soft Drink", ["Bottle", "Can"], "NBC / Coca-Cola", "33cl Cans & 35cl Bottles", "Sophisticated sparkling bitter lemon, tonic, soda, and Chapman."),
  make("Bigi Drinks", "bigi", "Soft Drink", ["Bottle"], "Rite Foods", "35cl / 50cl PET Bottles", "Assorted Nigerian soft drinks (Cola, Orange, Tropical, Apple)."),
  make("La Casera Apple", "la-casera", "Soft Drink", ["Bottle"], "La Casera Co.", "50cl PET Bottles", "Nigeria's pioneer carbonated apple drink with crisp real apple taste."),
  make("Chivita Juice", "chivita", "Soft Drink", ["Bottle", "Can"], "CHI Limited", "1L Packs & 33cl Cans", "100% pure real fruit juice blends (Orange, Pineapple, Apple, Mango)."),
  make("Hollandia Yoghurt", "hollandia", "Soft Drink", ["Bottle"], "CHI Limited", "31.5cl & 1L Packs", "Rich and creamy drinking yoghurt in strawberry and plain flavours."),
  make("Ribena", "ribena", "Soft Drink", ["Bottle"], "Suntory", "50cl PET Bottles & 1L", "Rich in vitamin C, made with 100% British blackcurrants."),
];

export const drinkCategories: DrinkCategory[] = [
  "Energy",
  "Lager",
  "Stout",
  "Malt",
  "Soft Drink",
  "RTD & Cider",
  "Bitters",
  "Spirits & Wine",
];

export const drinkOptions = drinks.map((d) => ({
  value: d.slug,
  label: `${d.name} (${d.category})`,
}));
