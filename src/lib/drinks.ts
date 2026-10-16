import maltinaFallback from "@/assets/drink-maltina.jpg";

const photos = import.meta.glob<string>(
  "@/assets/drinks/*.{jpeg,jpg,png,webp}",
  {
    eager: true,
    import: "default",
  },
);

const photo = (slug: string) => {
  const match = Object.entries(photos).find(([path]) =>
    path.includes(`/${slug}.`),
  );
  return match ? match[1] : maltinaFallback;
};


export type Drink = {
  slug: string;
  name: string;
  category: "Lager" | "Stout" | "Malt" | "Soft Drink" | "Energy";
  brewer: string;
  size: string;
  note: string;
  image?: string;
};

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const make = (
  name: string,
  category: Drink["category"],
  note: string,
): Drink => ({
  slug: slugify(name),
  name,
  category,
  brewer: category,
  size: "Bottles & cans",
  note,
  image: photo(slugify(name)),
});

export const drinks: Drink[] = [
  make("Star", "Lager", "Crisp, clean Nigerian lager. Available in bottles and cans."),
  make("Gulder", "Lager", "Full-bodied lager with a smooth finish. Bottles and cans."),
  make("Heineken", "Lager", "World-class premium lager. Bottles and cans."),
  make("33 Export", "Lager", "Easy-drinking lager. Bottles and cans."),
  make("Goldberg", "Lager", "Proudly Nigerian lager. Bottles and cans."),
  make("Life", "Lager", "Refreshing lager. Bottles and cans."),
  make("Hero", "Lager", "Popular lager. Bottles and cans."),
  make("Guinness", "Stout", "Rich, dark stout. Bottles and cans."),
  make("Legend", "Stout", "Bold, smooth extra stout. Bottles and cans."),
  make("Coca-Cola", "Soft Drink", "Classic cola. Bottles and cans."),
  make("Coke Zero", "Soft Drink", "Zero-sugar cola. Bottles and cans."),
  make("Pepsi", "Soft Drink", "Refreshing cola. Bottles and cans."),
  make("7UP", "Soft Drink", "Lemon-lime soft drink. Bottles and cans."),
  make("Fanta", "Soft Drink", "Orange soft drink. Bottles and cans."),
  make("Sprite", "Soft Drink", "Lemon-lime soft drink. Bottles and cans."),
  make("Mirinda", "Soft Drink", "Fruity soft drink. Bottles and cans."),
  make("Mountain Dew", "Soft Drink", "Citrus soft drink. Bottles and cans."),
  make("Bigi", "Soft Drink", "Assorted soft drinks. Bottles and cans."),
  make("Maltina", "Malt", "Non-alcoholic malt drink. Bottles and cans."),
  make("Malta Guinness", "Malt", "Non-alcoholic malt drink. Bottles and cans."),
  make("Amstel Malta", "Malt", "Non-alcoholic malt drink. Bottles and cans."),
  make("Fayrouz", "Malt", "Non-alcoholic sparkling drink. Bottles and cans."),
  make("Dubic Malt", "Malt", "Non-alcoholic malt drink. Bottles and cans."),
  make("Malta Gold", "Malt", "Non-alcoholic malt drink. Bottles and cans."),
  make("Hi-Malt", "Malt", "Non-alcoholic malt drink. Bottles and cans."),
  make("Fearless", "Energy", "Energy drink. Bottles and cans."),
  make("Monster", "Energy", "Energy drink. Cans."),
  make("Predator", "Energy", "Energy drink. Bottles and cans."),
  make("Climax", "Energy", "Energy drink. Bottles and cans."),
  make("Power Horse", "Energy", "Energy drink. Cans."),
  make("Red Bull", "Energy", "Energy drink. Cans."),
  make("Trophy", "Energy", "Energy drink. Bottles and cans."),
];

export const drinkOptions = drinks.map((d) => ({ value: d.slug, label: d.name }));