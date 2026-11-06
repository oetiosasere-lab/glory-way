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
  | "Bitters";

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
  // --- ENERGY DRINKS (All Cans, sold by the pack/carton) ---
  make("Red Bull", "red-bull", "Energy", ["Can"], "Red Bull GmbH", "25cl / 33cl Cans", "World-renowned energy drink that vitalizes body and mind. Sold by the pack or carton."),
  make("Monster Energy", "monster", "Energy", ["Can"], "Monster Beverage", "44cl / 50cl Cans", "Tear into a can of the meanest energy drink on the planet. Sold by the pack."),
  make("Fearless", "fearless", "Energy", ["Can"], "Rite Foods", "50cl Cans", "Quick burst of energy with bold flavours (Classic & Red Berry). Sold in packs."),

  make("Predator", "predator", "Energy", ["Can"], "Monster Energy / Coca-Cola", "33cl Cans", "Fierce refreshment and affordable energy for high endurance. Sold in packs."),
  make("Climax", "climax", "Energy", ["Can"], "Nigerian Breweries", "33cl Cans", "Herbal-infused energy drink by Nigerian Breweries. Distinctive invigorating taste."),
  make("Bullet", "bullet", "Energy", ["Can"], "Bullet", "25cl / 33cl Cans", "Powerful energy formulation popular across clubs and events. Available in cans."),


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

  // --- BITTERS & HERBAL (Only Action Bitters) ---
  make("Action Bitters", "action-bitters", "Bitters", ["Bottle"], "Intercontinental Distillers", "37.5cl & 75cl Bottles", "Popular heritage herbal alcoholic drink crafted from traditional botanical extracts."),

  // --- SOFT DRINKS (All in Cans, plus dedicated Bottle Coke & Bottle Pepsi) ---
  make("Coca-Cola (Can)", "coca-cola", "Soft Drink", ["Can"], "NBC / Coca-Cola", "33cl Cans", "The classic refreshing cola in convenient chilled cans. Sold by the pack or carton."),
  make("Bottle Coke", "bottle-coke", "Soft Drink", ["Bottle"], "NBC / Coca-Cola", "35cl / 50cl Glass & PET Bottles", "Classic Coca-Cola in traditional bottles. Sold by the crate."),
  make("Pepsi (Can)", "pepsi", "Soft Drink", ["Can"], "Seven-Up Bottling Co.", "33cl Cans", "Bold, refreshing cola in chilled 33cl cans. Sold by the pack or carton."),
  make("Bottle Pepsi", "bottle-pepsi", "Soft Drink", ["Bottle"], "Seven-Up Bottling Co.", "50cl / 60cl Bottles", "Original refreshing Pepsi cola in glass and PET bottles. Sold by the crate."),
  make("Fanta Orange", "fanta", "Soft Drink", ["Can"], "NBC / Coca-Cola", "33cl Cans", "Vibrant, bubbly orange fruit taste in chilled cans. Sold in packs."),
  make("Sprite", "sprite", "Soft Drink", ["Can"], "NBC / Coca-Cola", "33cl Cans", "Crisp, clean lemon-lime refreshment in chilled cans. Sold in packs."),
  make("7UP", "7up", "Soft Drink", ["Can"], "Seven-Up Bottling Co.", "33cl Cans", "Crisp lemon and lime thirst-quencher in convenient cans. Sold in packs."),
  make("Mirinda", "mirinda", "Soft Drink", ["Can"], "Seven-Up Bottling Co.", "33cl Cans", "Intensely fruity orange sparkling soft drink in chilled cans."),
  make("Fayrouz", "fayrouz", "Soft Drink", ["Can"], "Nigerian Breweries", "33cl Cans", "Natural malted sparkling soft drink with pineapple and citrus in cans."),
  make("Schweppes", "schweppes", "Soft Drink", ["Can"], "NBC / Coca-Cola", "33cl Cans", "Sparkling bitter lemon, tonic, soda, and Chapman in cans."),
  make("La Casera Apple", "la-casera", "Soft Drink", ["Can"], "La Casera Co.", "33cl / 50cl Cans", "Crisp, sparkling natural apple refreshment in chilled cans."),
  make("Chivita Juice", "chivita", "Soft Drink", ["Can"], "CHI Limited", "33cl Cans / Packs", "100% pure real fruit juice blends in convenient packs and cans."),
  make("Hollandia Yoghurt", "hollandia", "Soft Drink", ["Can"], "CHI Limited", "Packs & Cans", "Rich and creamy drinking yoghurt in strawberry and plain flavours."),
  make("Ribena", "ribena", "Soft Drink", ["Can"], "Suntory", "Packs & Cans", "Rich in vitamin C, made with 100% British blackcurrants."),
];

export const drinkCategories: DrinkCategory[] = [
  "Energy",
  "Lager",
  "Stout",
  "Malt",
  "Soft Drink",
  "Bitters",
];

export const drinkOptions = drinks.map((d) => ({
  value: d.slug,
  label: `${d.name} (${d.packageTypes.join("/")})`,
}));
