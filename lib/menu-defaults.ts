import type { S2Data, S3Data } from "@/lib/menu-types";

import type { S4Data } from "@/lib/menu-types";



export const defaultS2Data: S2Data = {

  slideA: {

    fingerFoods: [

      { name: "Mozza Sticks (1)", price: "1.52" },

      { name: "Onion Rings (1)", price: "5.22" },

      { name: "Zucchini Sticks (1)", price: "1.52" },

      { name: "Pizza Finger (1)", price: "2.39" },

      { name: "Deep Fried Pickle (1)", price: "1.52" },

      { name: "Popcorn Chicken (1)", price: "6.96" },

      { name: "Chicken Finger (1)", price: "2.75" },

    ],

    poutine: [

      { name: "Small / Petit", price: "6.09" },

      { name: "Medium / Moyen", price: "7.83" },

      { name: "Large / Grande", price: "9.57" },

      { name: "Family / Famille", price: "13.05", featured: true },

    ],

    poutineAddons: [

      { name: "+ Smoked Meat", price: "6.49" },

      { name: "+ Ground Beef", price: "3.99" },

    ],

    friedChicken: [

      { name: "3 Pieces / morceaux", price: "7.83" },

      { name: "3 Pieces + Fries", price: "11.30" },

      { name: "6 Pieces / morceaux", price: "13.92" },

      { name: "6 Pc + Fries", price: "17.40", featured: true },

    ],

    hotDogs: [

      { name: "Pogo", price: "3.48" },

      { name: "Hot Dog", price: "3.48" },

      { name: "Whistle Dog", price: "4.35" },

    ],

  },

  slideB: {

    fries: [

      { name: "Small / Petit", price: "3.91" },

      { name: "Medium / Moyen", price: "5.22" },

      { name: "Large / Grande", price: "6.52" },

      { name: "Family / Famille", price: "8.69", featured: true },

      { name: "Spicy Fries (M)", price: "6.22" },

      { name: "Potato Wedges (M)", price: "6.22" },

    ],

    partyPack: {

      title: "Party Pack / Plateau",

      description: "6 Mozza, 6 Zucchini, 3 Pizza Fingers, 6 Pickles",

      price: "29.99",

    },

    burgers: [

      { name: "Plain", base: "5.22", withFries: "8.69" },

      { name: "Cheese", base: "6.62", withFries: "10.00" },

      { name: "Bacon & Cheese", base: "6.96", withFries: "10.44" },

      { name: "Chicken", base: "6.96", withFries: "10.44" },

    ],

    chickenWings: {

      flavors: [

        "Mild / Doux",

        "Medium / Moyen",

        "Hot / pic",

        "Honey Garlic / Miel-Ail",

        "Sweet Chili / Piment Sucr",

      ],

      sizes: [

        { name: "8 Wings", price: "8.69" },

        { name: "12 Wings", price: "12.18", featured: true },

        { name: "20 Wings", price: "19.57" },

      ],

    },

  },

};



export const defaultS3Data: S3Data = {

  pizzas: [

    {

      nameEn: "Cheese",

      nameFr: "Fromage",

      image: "/images/pizzas/cheese.png",

      prices: ["8.99", "17.40", "21.74", "23.74", "25.22"],

    },

    {

      nameEn: "Pepperoni",

      nameFr: "Pepperoni",

      image: "/images/pizzas/pepperoni.png",

      prices: ["9.99", "18.26", "22.61", "24.35", "26.09"],

    },

    {

      nameEn: "Pepperoni & Bacon",

      nameFr: "Pepperoni et bacon",

      image: "/images/pizzas/pepperoni-bacon.png",

      prices: ["10.99", "19.13", "23.48", "25.22", "26.96"],

    },

    {

      nameEn: "Combination",

      nameFr: "Combinaison",

      image: "/images/pizzas/combination.png",

      prices: ["10.99", "19.13", "23.48", "25.22", "26.96"],

    },

    {

      nameEn: "Vegetarian",

      nameFr: "Vgtarienne",

      image: "/images/pizzas/vegetarian.png",

      prices: ["10.99", "19.13", "23.48", "25.22", "26.96"],

    },

    {

      nameEn: "Hawaiian",

      nameFr: "Hawaenne",

      image: "/images/pizzas/hawaiian.png",

      prices: ["10.99", "19.13", "23.48", "25.22", "26.96"],

    },

  ],

  premiumPizzas: [

    {

      nameEn: "Meats",

      nameFr: "Viande",

      image: "/images/pizzas/meat.png",

      featured: true,

      price: "13.99",

      prices: ["13.99", "21.47", "26.09", "27.83", "29.57"],

    },

    {

      nameEn: "Canadian",

      nameFr: "Canadienne",

      image: "/images/pizzas/canadian-classic.png",

      featured: true,

      price: "11.99",

      prices: ["11.99", "20.00", "24.35", "26.09", "27.83"],

    },

    {

      nameEn: "Classic",

      nameFr: "Classique",

      image: "/images/pizzas/classic.png",

      featured: false,

      price: "12.99",

      prices: ["12.99", "20.87", "25.22", "26.96", "28.70"],

    },

    {

      nameEn: "Greek",

      nameFr: "Grecque",

      image: "/images/pizzas/greek.png",

      featured: true,

      price: "12.99",

      prices: ["12.99", "20.87", "25.22", "26.96", "28.70"],

    },

  ],

  addons: [

    { nameEn: "Meat", nameFr: "Viande", prices: ["1.75", "2.25", "2.75", "3.50", "4.25"] },

    { nameEn: "Smoked Meat", nameFr: "Viande fume", prices: ["6.49", "6.49", "10.99", "10.99", "14.99"] },

    { nameEn: "Cheese", nameFr: "Fromage", prices: ["1.75", "2.25", "2.75", "3.50", "4.25"] },

    { nameEn: "Vegetable", nameFr: "Lgume", prices: ["1.00", "1.50", "2.00", "2.75", "3.50"] },

  ],

};



export const defaultS4Data: S4Data = {

  header: {

    title: "Hot Food / Cuisine Chaude",
    titleSize: "22vh",

  },

  slideA: {

    fingerFoodsTitle: "Finger Foods / Amuses-gueules",

    partyPackTitle: "Party Pack / Plateau",

    partyPackDescription: "6 Mozza, 6 Zucchini, 3 Pizza Fingers, 6 Pickles",

    partyPackPrice: "29.99",

    poutineTitle: "Poutine",

    poutineAddonsTitle: "Add-ons / Ajouts",

    friedChickenTitle: "Fried Chicken / Poulet frit",

    hotDogsTitle: "Hot Dogs / Saucisse",

    sandwichWrapsTitle: "Sandwiches & Wraps",

    sandwichWrapsHeaders: ["Item", "Price", "+ Fries"],

  },

  slideB: {

    friesTitle: "Fries / Frites",

    burgersTitle: "Burgers / Hambourgeois",

    chickenWingsTitle: "Chicken Wings (12) / Ailes de poulet",

    wingsFlavorsTitle: "Flavors / Saveurs",

    breakfastTitle: "Breakfast / Déjeuner",
    breakfastExtrasTitle: "Breakfast Extras",

    shawarmaTitle: "Shawarma, Fish & Salads",

    shawarmaSectionTitle: "Shawarma",

    fishSectionTitle: "Fish & Chips",

    saladsSectionTitle: "Salads",

    saladsHeaders: ["Item", "Small", "Large"],

  },

  items: {

    fingerFoods: [

      { name: "Mozza Sticks (1)", price: "1.52" },

      { name: "Onion Rings (1)", price: "5.22" },

      { name: "Zucchini Sticks (1)", price: "1.52" },

      { name: "Pizza Finger (1)", price: "2.39" },

      { name: "Deep Fried Pickle (1)", price: "1.52" },

      { name: "Popcorn Chicken (1)", price: "6.96" },

      { name: "Chicken Finger (1)", price: "2.75" },

    ],

    poutine: [

      { name: "Small / Petit", price: "6.09" },

      { name: "Medium / Moyen", price: "7.83" },

      { name: "Large / Grande", price: "9.57" },

      { name: "Family / Famille", price: "13.05" },

    ],

    poutineAddons: [

      { name: "+ Smoked Meat", price: "6.49" },

      { name: "+ Ground Beef", price: "3.99" },

    ],

    friedChicken: [

      { name: "3 Pieces / morceaux", price: "7.83" },

      { name: "3 Pieces + Fries", price: "11.30" },

      { name: "6 Pieces / morceaux", price: "13.92" },

      { name: "6 Pc + Fries", price: "17.40" },

    ],

    hotDogs: [

      { name: "Pogo", price: "3.48" },

      { name: "Hot Dog", price: "3.48" },

      { name: "Whistle Dog", price: "4.35" },

    ],

    sandwichWraps: [

      { name: "Chicken Caesar Wrap", price: "6.99", withFries: "10.99" },

      { name: "Chicken Bacon Ranch Wrap", price: "6.99", withFries: "10.99" },

      { name: "BLT", price: "3.99", withFries: "7.99" },

      { name: "Club Sandwich", price: "9.57", withFries: "13.57" },

      { name: "Grilled Cheese", price: "3.99", withFries: "4.99" },

      { name: "Hot Chicken", price: "12.18", withFries: "12.18" },

      { name: "Smoked Meat", price: "8.69", withFries: "12.18" },

    ],

    fries: [

      { name: "Small / Petit", price: "3.91" },

      { name: "Medium / Moyen", price: "5.22" },

      { name: "Large / Grande", price: "6.52" },

      { name: "Family / Famille", price: "8.69" },

      { name: "Spicy Fries (M)", price: "6.22" },

      { name: "Potato Wedges (M)", price: "6.22" },

    ],

    burgers: [

      { name: "Plain", base: "5.22", withFries: "8.69" },

      { name: "Cheese", base: "6.62", withFries: "10.00" },

      { name: "Bacon & Cheese", base: "6.96", withFries: "10.44" },

      { name: "Chicken", base: "6.96", withFries: "10.44" },

    ],

    wingsFlavors: [

      "Mild / Doux",

      "Medium / Moyen",

      "Hot / pic",

      "Honey Garlic / Miel-Ail",

      "Sweet Chili / Piment Sucr",

    ],

    wingsSizes: [

      { name: "8 Wings", price: "8.69" },

      { name: "12 Wings", price: "12.18" },

      { name: "20 Wings", price: "19.57" },

    ],

    breakfastItems: [

      {

        name: "One Egg",

        detail: "Choice of meat, home fries, toast, 12 oz coffee",

        price: "4.29",

      },

      {

        name: "Two Eggs",

        detail: "Choice of meat, home fries, toast, 12 oz coffee",

        price: "5.19",

      },

      {

        name: "Hungry Man",

        detail: "Three eggs, three meats, home fries, toast, 12 oz coffee",

        price: "8.69",

      },

    ],

    breakfastExtras: [
      { name: "Western", price: "3.99" },
      { name: "Breakfast Burger", price: "2 for 8", forPrice: "2 for 8" },
      { name: "BLT", price: "2 for 8", forPrice: "2 for 8" },
      { name: "Breakfast Burrito", price: "5.99" },
      { name: "Plain Bagel w/ Cream Cheese", price: "2.99" },
      { name: "Add Home Fries", price: "2.49" },
    ],
    shawarmaItems: [

      { name: "Chicken Shawarma (naan)", price: "6.96", withGarlic: "10.44" },

      { name: "Beef Shawarma (naan)", price: "6.96", withGarlic: "10.44" },

      { name: "Beef Gyros", price: "6.96", withGarlic: "10.44" },

      { name: "Chicken Shawarma Salad", price: "10.44" },

    ],

    fishItems: [

      { name: "1 Piece", price: "11.32" },

      { name: "2 Pieces", price: "15.22" },

    ],

    saladSizes: [

      { name: "Garden Salad", small: "5.99", large: "9.99" },

      { name: "Caesar Salad", small: "5.99", large: "9.99" },

    ],

  },

};


