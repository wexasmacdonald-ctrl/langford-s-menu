"use client";

import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const screens = [
    {
      id: "s1",
      title: "Daily Specials",
      description: "Today's deals, everyday pizza special, and weekly specials overview",
      image: "/images/burger.jpg",
      features: ["Weekday specials", "Pizza promo (Wed-Fri)", "Breakfast mode"],
    },
    {
      id: "s2",
      title: "Hot Food",
      description: "Finger foods, fries, poutine, fried chicken, and burgers",
      image: "/images/poutine.jpg",
      features: ["Auto-rotating slides", "5-second intervals", "Breakfast mode"],
    },
    {
      id: "s3",
      title: "Pizza Menu",
      description: "Full pizza selection with all sizes and add-ons",
      image: "/images/pizza.jpg",
      features: ["Price grid by size", "Featured pizzas", "Add-on pricing"],
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-[family-name:var(--font-heading)] text-5xl font-bold text-primary uppercase tracking-wider mb-4">
            Menu Board System
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Digital menu display for restaurant TV screens. Each screen runs on
            its own URL for independent control via Google Onn TV sticks.
          </p>
        </div>

        {/* Screen Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {screens.map((screen) => (
            <Link
              key={screen.id}
              href={`/${screen.id}`}
              className="group block bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
            >
              <div className="relative aspect-video">
                <Image
                  src={screen.image || "/placeholder.svg"}
                  alt={screen.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded uppercase">
                    /{screen.id}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase text-foreground group-hover:text-primary transition-colors">
                  {screen.title}
                </h2>
                <p className="text-muted-foreground text-sm mt-2">
                  {screen.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {screen.features.map((feature) => (
                    <span
                      key={feature}
                      className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold uppercase text-primary mb-4">
            Setup Instructions
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-bold mb-2">Screen URLs</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  <code className="bg-secondary px-2 py-0.5 rounded">/s1</code> - Daily
                  Specials
                </li>
                <li>
                  <code className="bg-secondary px-2 py-0.5 rounded">/s2</code> - Hot
                  Food (rotating)
                </li>
                <li>
                  <code className="bg-secondary px-2 py-0.5 rounded">/s3</code> - Pizza
                  Menu (rotating)
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2">Daypart Switching</h4>
              <p className="text-sm text-muted-foreground">
                Menus automatically switch to breakfast mode before 11:00 AM and
                back to regular menu after.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Screen Resolution</h4>
              <p className="text-sm text-muted-foreground">
                All screens are optimized for 3840x2160 (4K/16:9) displays. 
                The TV browser should be set to full screen mode.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
