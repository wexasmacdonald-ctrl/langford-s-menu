export type MenuItem = {
  name: string;
  price: string;
  featured?: boolean;
};

export type BurgerItem = {
  name: string;
  base: string;
  withFries: string;
};

export type S2Data = {
  slideA: {
    fingerFoods: MenuItem[];
    poutine: MenuItem[];
    poutineAddons: MenuItem[];
    friedChicken: MenuItem[];
    hotDogs: MenuItem[];
  };
  slideB: {
    fries: MenuItem[];
    partyPack: {
      title: string;
      description: string;
      price: string;
    };
    burgers: BurgerItem[];
    chickenWings: {
      flavors: string[];
      sizes: MenuItem[];
    };
  };
};

export type PizzaItem = {
  nameEn: string;
  nameFr: string;
  image: string;
  prices: string[];
};

export type PremiumPizzaItem = {
  nameEn: string;
  nameFr: string;
  image: string;
  featured: boolean;
  price: string;
  prices?: string[];
};

export type AddonItem = {
  nameEn: string;
  nameFr: string;
  prices: string[];
};

export type S3Data = {
  pizzas: PizzaItem[];
  premiumPizzas: PremiumPizzaItem[];
  addons: AddonItem[];
};

export type SandwichWrapItem = {
  name: string;
  price: string;
  withFries: string;
};

export type BreakfastItem = {
  name: string;
  detail: string;
  price: string;
};

export type BreakfastExtra = {
  name: string;
  price: string;
};

export type ShawarmaItem = {
  name: string;
  price: string;
  withGarlic?: string;
};

export type FishItem = {
  name: string;
  price: string;
};

export type SaladSizeItem = {
  name: string;
  small: string;
  large: string;
};

export type S4Data = {
  header: {
    title: string;
  };
  slideA: {
    fingerFoodsTitle: string;
    partyPackTitle: string;
    partyPackDescription: string;
    partyPackPrice: string;
    poutineTitle: string;
    poutineAddonsTitle: string;
    friedChickenTitle: string;
    hotDogsTitle: string;
    sandwichWrapsTitle: string;
    sandwichWrapsHeaders: [string, string, string];
  };
  slideB: {
    friesTitle: string;
    burgersTitle: string;
    chickenWingsTitle: string;
    wingsFlavorsTitle: string;
    breakfastTitle: string;
    breakfastExtrasTitle: string;
    shawarmaTitle: string;
    shawarmaSectionTitle: string;
    fishSectionTitle: string;
    saladsSectionTitle: string;
    saladsHeaders: [string, string, string];
  };
  items: {
    fingerFoods: MenuItem[];
    poutine: MenuItem[];
    poutineAddons: MenuItem[];
    friedChicken: MenuItem[];
    hotDogs: MenuItem[];
    sandwichWraps: SandwichWrapItem[];
    fries: MenuItem[];
    burgers: BurgerItem[];
    wingsFlavors: string[];
    wingsSizes: MenuItem[];
    breakfastItems: BreakfastItem[];
    breakfastExtras: BreakfastExtra[];
    shawarmaItems: ShawarmaItem[];
    fishItems: FishItem[];
    saladSizes: SaladSizeItem[];
  };
};
