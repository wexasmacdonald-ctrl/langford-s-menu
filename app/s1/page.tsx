"use client";

import { useDaypart, type DayOfWeek } from "@/hooks/use-daypart";
import { MenuFooter } from "@/components/menu/menu-footer";
import { DaypartToggle } from "@/components/menu/daypart-toggle";
import { DayOfWeekToggle } from "@/components/menu/day-of-week-toggle";
import Image from "next/image";

const dailySpecials: Record<
  DayOfWeek,
  { nameEn: string; nameFr: string; image: string } | null
> = {
  monday: { nameEn: "Hamburger Platter", nameFr: "Assiette hamburger", image: "/images/hamburger-platter.png" },
  tuesday: { nameEn: "Smoked Meat Platter", nameFr: "Assiette sandwich à la viande fumée", image: "/images/smoked-meat-platter.png" },
  wednesday: { nameEn: "8 Chicken Wings Platter", nameFr: "Assiette 8 ailes de poulet", image: "/images/chicken-wings-platter.png" },
  thursday: { nameEn: "Chicken Finger Platter", nameFr: "Assiette doigts de poulet", image: "/images/chicken-finger-platter.png" },
  friday: { nameEn: "Fish & Chips", nameFr: "Fish & Chips", image: "/images/fish-and-chips.png" },
  saturday: null,
  sunday: null,
};

const dayNamesFr: Record<DayOfWeek, string> = {
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
  sunday: "Dimanche",
};

export default function Screen1() {
  const {
    isBreakfast,
    dayOfWeek,
    daypartOverride,
    setDaypartOverride,
    dayOverride,
    setDayOverride,
  } = useDaypart();
  const todaySpecial = dailySpecials[dayOfWeek];
  const hasSpecialToday = todaySpecial !== null;

  const isPizzaPromoDay =
    dayOfWeek === "wednesday" ||
    dayOfWeek === "thursday" ||
    dayOfWeek === "friday";

  const controlToggles = (
    <div className="absolute top-[1vh] right-[1.5vh] z-20 flex flex-col items-end gap-[0.5vh]">
      <DaypartToggle value={daypartOverride} onChange={setDaypartOverride} />
      <DayOfWeekToggle value={dayOverride} onChange={setDayOverride} />
    </div>
  );

  if (isBreakfast) {
    return (
      <main className="relative w-screen h-screen bg-background text-foreground flex flex-col overflow-hidden p-[1.5vh] menu-marble">
        {controlToggles}
        {/* Header */}
        <div className="text-center shrink-0 mb-[1vh]">
          <h1 className="font-[family-name:var(--font-heading)] text-[6vh] font-bold text-primary uppercase tracking-wider">
            Breakfast Menu
          </h1>
          <p className="text-muted-foreground text-[3vh]">
            Menu Déjeuner - Served until 11:00 AM
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 grid grid-cols-2 gap-[1.5vh]">
          <div className="relative rounded-[1vh] overflow-hidden">
            <Image
              src="/images/breakfast.jpg"
              alt="Delicious breakfast"
              fill
              className="object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-[2vh]">
              <p className="text-[5vh] font-bold text-primary font-[family-name:var(--font-heading)] uppercase">
                Fresh & Hot
              </p>
              <p className="text-[3vh] text-muted-foreground">Frais et Chaud</p>
            </div>
          </div>

          <div className="flex flex-col gap-[1vh] min-h-0">
            <div className="bg-card rounded-[1vh] p-[2vh] border border-border flex-1 min-h-0 flex flex-col">
              <h2 className="font-[family-name:var(--font-heading)] text-[4.5vh] font-bold text-primary uppercase shrink-0 border-b border-border pb-[0.5vh] mb-[1vh]">
                Breakfast Platters / Assiettes Déjeuner
              </h2>
              <div className="space-y-[1.5vh] flex-1 min-h-0 overflow-hidden">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-[3.2vh] font-medium text-foreground">One Egg Platter</span>
                    <p className="text-[2.4vh] text-muted-foreground">Assiette 1 oeuf - w/ meat, homefries, toast, coffee</p>
                  </div>
                  <span className="text-[3.8vh] font-bold text-primary ml-[1vh]">$4.29</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-[3.2vh] font-medium text-foreground">Two Egg Platter</span>
                    <p className="text-[2.4vh] text-muted-foreground">Assiette 2 oeufs - w/ meat, homefries, toast, coffee</p>
                  </div>
                  <span className="text-[3.8vh] font-bold text-primary ml-[1vh]">$5.19</span>
                </div>
                <div className="flex justify-between items-baseline bg-primary/10 rounded-[0.5vh] p-[1vh] -mx-[0.5vh]">
                  <div>
                    <span className="text-[3.2vh] font-bold text-primary">Hungerman</span>
                    <p className="text-[2.4vh] text-muted-foreground">3 eggs, 3 meats, homefries, toast, coffee</p>
                  </div>
                  <span className="text-[3.8vh] font-bold text-primary ml-[1vh]">$8.69</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-[1vh] p-[2vh] border border-border flex-1 min-h-0 flex flex-col">
              <h2 className="font-[family-name:var(--font-heading)] text-[4.5vh] font-bold text-primary uppercase shrink-0 border-b border-border pb-[0.5vh] mb-[1vh]">
                Sandwiches
              </h2>
              <div className="grid grid-cols-2 gap-x-[3vh] gap-y-[1.2vh] flex-1 min-h-0">
                <div className="flex justify-between"><span className="text-[3vh]">BLT</span><span className="text-[3vh] font-bold text-primary">$3.99</span></div>
                <div className="flex justify-between"><span className="text-[3vh]">Grilled Cheese</span><span className="text-[3vh] font-bold text-primary">$3.49</span></div>
                <div className="flex justify-between"><span className="text-[3vh]">Western</span><span className="text-[3vh] font-bold text-primary">$3.99</span></div>
                <div className="flex justify-between"><span className="text-[3vh]">Breakfast Burger</span><span className="text-[3vh] font-bold text-primary">$3.99</span></div>
                <div className="flex justify-between bg-primary/10 rounded px-[0.5vh]"><span className="text-[3vh] font-bold text-primary">Breakfast Burrito</span><span className="text-[3vh] font-bold text-primary">$5.99</span></div>
                <div className="flex justify-between"><span className="text-[3vh]">Bagel w/ Cream Cheese</span><span className="text-[3vh] font-bold text-primary">$2.99</span></div>
              </div>
            </div>
          </div>
        </div>

        <MenuFooter />
      </main>
    );
  }

  // Weekend layout (no daily special) - show all specials with photos
  if (!hasSpecialToday) {
    return (
      <main className="relative w-screen h-screen bg-background text-foreground flex flex-col overflow-hidden p-[1.5vh] menu-marble">
        {controlToggles}
        {/* Header */}
        <div className="text-center shrink-0 mb-[1vh]">
          <h1 className="font-[family-name:var(--font-heading)] text-[6vh] font-bold text-primary uppercase tracking-wider">
            Specials & Deals
          </h1>
          <p className="text-muted-foreground text-[3vh]">Spéciaux et Promotions - All specials include 355ml beverage</p>
        </div>

        {/* Content - 2 columns with big photos */}
        <div className="flex-1 min-h-0 grid grid-cols-2 gap-[1.5vh]">
          {/* Left - Everyday Pizza Deal */}
          <div className="relative rounded-[1vh] overflow-hidden">
            <Image
              src="/images/pizza-pepperoni.png"
              alt="9 inch Pizza"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-[2vh]">
              <span className="bg-primary text-primary-foreground text-[2.5vh] font-bold px-[1.2vh] py-[0.4vh] rounded-full uppercase">
                Everyday Deal
              </span>
              <h3 className="font-[family-name:var(--font-heading)] text-[4vh] font-bold uppercase mt-[1vh]">
                9&quot; Pizza of Your Choice
              </h3>
              <p className="text-[2.5vh] text-muted-foreground">Pizza 9&quot; de votre choix</p>
              <p className="text-[2.2vh] text-muted-foreground">+ 355ml beverage</p>
              <p className="text-[8vh] font-bold text-primary">$10.44</p>
            </div>
          </div>

          {/* Right - BOGO Pizza with photo */}
          <div className="relative rounded-[1vh] overflow-hidden">
            <Image
              src="/images/bogo-pizza.jpg"
              alt="Buy One Get One Free Pizza"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-[2vh]">
              <span
                className={`text-[2.5vh] font-bold px-[1.2vh] py-[0.4vh] rounded-full uppercase ${
                  isPizzaPromoDay ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                Wed / Thu / Fri Only
              </span>
              <p className="text-[2vh] text-muted-foreground mt-[0.5vh]">Mer / Jeu / Ven seulement</p>
              <h2 className="font-[family-name:var(--font-heading)] text-[5vh] font-bold uppercase text-foreground leading-tight mt-[1vh]">
                Buy 1 Get 2nd FREE
              </h2>
              <p className="text-[2.5vh] text-foreground">Achetez 1, obtenez la 2e GRATUITE</p>
              <p className="text-[2.2vh] text-muted-foreground mt-[0.5vh]">14&quot; Pepperoni & Cheese Pizza</p>
              <p className="text-[8vh] font-bold text-primary">$22.61</p>
              
            </div>
          </div>
        </div>

        <MenuFooter />
      </main>
    );
  }

  // Weekday layout - Today's special with big photo
  return (
    <main className="relative w-screen h-screen bg-background text-foreground flex flex-col overflow-hidden p-[1.5vh] menu-marble">
      {controlToggles}
      {/* Header */}
      <div className="text-center shrink-0 mb-[1vh]">
        <h1 className="font-[family-name:var(--font-heading)] text-[6vh] font-bold text-primary uppercase tracking-wider">
          Daily Specials / Spéciaux du jour
        </h1>
        <span className="inline-block mt-[0.6vh] bg-accent text-accent-foreground text-[2.5vh] font-bold px-[1vh] py-[0.3vh] rounded-full">
          All specials include a 355ml beverage / Tous les spéciaux incluent un breuvage 355ml
        </span>
      </div>

      {/* Content - 3 big photo columns */}
      <div className="flex-1 min-h-0 grid grid-cols-3 gap-[1.5vh]">
        {/* Left - Today's Special with big photo */}
        <div className="relative rounded-[1vh] overflow-hidden">
          <Image
            src={todaySpecial.image}
            alt={todaySpecial.nameEn}
            fill
            className="object-cover"
            style={{
              objectPosition:
                dayOfWeek === "monday" || dayOfWeek === "tuesday"
                  ? "center -70px"
                  : "center",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-[2vh]">
            <div className="flex items-center gap-[1vh] mb-[0.5vh]">
              <span className="bg-accent text-accent-foreground text-[2.5vh] font-bold px-[1.2vh] py-[0.4vh] rounded-full uppercase">
                Today&apos;s Special
              </span>
              <span className="text-muted-foreground text-[2.5vh] capitalize">
                {dayOfWeek} / {dayNamesFr[dayOfWeek]}
              </span>
            </div>
            <h2 className="font-[family-name:var(--font-heading)] text-[5vh] font-bold text-foreground uppercase">
              {todaySpecial.nameEn}
            </h2>
            <p className="text-[3vh] text-muted-foreground">{todaySpecial.nameFr}</p>
            <p className="text-[8vh] font-bold text-primary">$10.44</p>
          </div>
        </div>

        {/* Middle - Everyday Pizza Deal */}
        <div className="relative rounded-[1vh] overflow-hidden">
          <Image
            src="/images/pizza-pepperoni.png"
            alt="9 inch Pizza"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-[2vh]">
            <span className="bg-primary text-primary-foreground text-[2.5vh] font-bold px-[1vh] py-[0.3vh] rounded-full uppercase">
              Everyday / Tous les jours
            </span>
            <h3 className="font-[family-name:var(--font-heading)] text-[4vh] font-bold uppercase mt-[1vh]">
              9&quot; Pizza of Your Choice
            </h3>
            <p className="text-[2.5vh] text-muted-foreground">Pizza 9&quot; de votre choix</p>
            <p className="text-[2.2vh] text-muted-foreground">+ 355ml beverage</p>
            <p className="text-[8vh] font-bold text-primary">$10.44</p>
          </div>
        </div>

        {/* Right - BOGO Pizza Promo with photo */}
        <div className="relative rounded-[1vh] overflow-hidden">
          <Image
            src="/images/bogo-pizza.jpg"
            alt="Buy One Get One Free"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-[2vh]">
            <span className={`text-[2.5vh] font-bold px-[1vh] py-[0.3vh] rounded-full uppercase ${
              isPizzaPromoDay 
                ? "bg-accent text-accent-foreground" 
                : "bg-muted text-muted-foreground"
            }`}>
              Wed / Thu / Fri Only
            </span>
            <p className="text-[2vh] text-muted-foreground">Mer / Jeu / Ven seulement</p>
            <h3 className="font-[family-name:var(--font-heading)] text-[4vh] font-bold uppercase text-foreground mt-[1vh]">
              Buy 1 Get 2nd FREE
            </h3>
            <p className="text-[2.5vh] text-muted-foreground">Achetez 1, obtenez la 2e GRATUITE</p>
            <p className="text-[2.8vh] text-muted-foreground mt-[0.5vh]">14&quot; Pepperoni & Cheese</p>
            <p className="text-[8vh] font-bold text-primary">$22.61</p>
            
          </div>
        </div>
      </div>

      <MenuFooter />
    </main>
  );
}


