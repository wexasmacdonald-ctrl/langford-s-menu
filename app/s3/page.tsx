"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { MenuFooter } from "@/components/menu/menu-footer";
import { cn } from "@/lib/utils";
import { defaultS3Data } from "@/lib/menu-defaults";
import type { S3Data } from "@/lib/menu-types";
import { useUndoRedo } from "@/hooks/use-undo-redo";

type SaveState = "idle" | "saving" | "saved" | "error";

type RowControlsProps = {
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onToggleFeatured?: () => void;
  featured?: boolean;
  className?: string;
};

const inputBaseClass =
  "bg-transparent border border-border/60 rounded px-[0.4vh] py-[0.1vh] text-foreground";

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(nextIndex, 0, item);
  return next;
}

function updateItem<T extends object>(items: T[], index: number, patch: Partial<T>) {
  return items.map((item, idx) => (idx === index ? { ...item, ...patch } : item));
}

function removeItem<T>(items: T[], index: number) {
  return items.filter((_, idx) => idx !== index);
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

function RowControls({
  onMoveUp,
  onMoveDown,
  onRemove,
  onToggleFeatured,
  featured,
  className,
}: RowControlsProps) {
  return (
    <div className={cn("flex items-center gap-[0.4vh]", className)}>
      {onToggleFeatured ? (
        <button
          type="button"
          onClick={onToggleFeatured}
          className="text-[1.4vh] font-bold text-primary/80 hover:text-primary"
          aria-label={featured ? "Unmark as featured" : "Mark as featured"}
        >
          {featured ? "F" : "f"}
        </button>
      ) : null}
      <button
        type="button"
        onClick={onMoveUp}
        className="text-[1.4vh] font-bold text-primary/80 hover:text-primary"
        aria-label="Move up"
      >
        Up
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        className="text-[1.4vh] font-bold text-primary/80 hover:text-primary"
        aria-label="Move down"
      >
        Dn
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="text-[1.4vh] font-bold text-primary/80 hover:text-primary"
        aria-label="Remove"
      >
        X
      </button>
    </div>
  );
}

const sizeLabels = ["9\"", "12\"", "14\"", "16\"", "18\""];

type SectionCardProps = {
  title?: string;
  children: ReactNode;
};

function SectionCard({ title, children }: SectionCardProps) {
  return (
    <div className="bg-card rounded-[1vh] border border-border overflow-hidden flex flex-col min-h-0 p-[1.2vh]">
      {title ? (
        <h2 className="font-[family-name:var(--font-heading)] text-[3vh] font-bold text-primary uppercase border-b border-border pb-[0.4vh] mb-[0.8vh]">
          {title}
        </h2>
      ) : null}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto pr-[0.4vh]">
          {children}
        </div>
      </div>
    </div>
  );
}

function chunkWithStart<T>(items: T[], columns: number) {
  if (items.length === 0) return [] as { start: number; items: T[] }[];
  const size = Math.max(1, Math.ceil(items.length / columns));
  return Array.from({ length: columns }, (_, col) => {
    const start = col * size;
    return { start, items: items.slice(start, start + size) };
  }).filter((group) => group.items.length > 0);
}

function getPremiumPrices(pizza: S3Data["premiumPizzas"][number]) {
  if (pizza.prices && pizza.prices.length === sizeLabels.length) {
    return pizza.prices;
  }
  return sizeLabels.map(() => pizza.price);
}

export default function Screen3() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const {
    state: data,
    set: setData,
    reset: resetData,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo<S3Data>(defaultS3Data);
  const [editMode, setEditMode] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [dirty, setDirty] = useState(false);
  const lastSavedRef = useRef<S3Data>(defaultS3Data);

  const updateData = useCallback(
    (updater: (prev: S3Data) => S3Data) => {
      setData((prev) => updater(prev));
      setSaveState("idle");
    },
    [setData]
  );

  useEffect(() => {
    let active = true;
    fetch("/api/menu/s3", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((payload: S3Data) => {
        if (!active) return;
        resetData(payload);
        lastSavedRef.current = payload;
        setSaveState("idle");
      })
      .catch(() => {
        // keep defaults if fetch fails
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const hasChanges =
      JSON.stringify(data) !== JSON.stringify(lastSavedRef.current);
    setDirty(hasChanges);
  }, [data]);

  useEffect(() => {
    if (!editMode) return;
    const handleKeydown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      if (!event.ctrlKey && !event.metaKey) return;
      const key = event.key.toLowerCase();
      if (key === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          if (canRedo) redo();
        } else if (canUndo) {
          undo();
        }
      } else if (key === "y") {
        event.preventDefault();
        if (canRedo) redo();
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [editMode, undo, redo, canUndo, canRedo]);

  const saveChanges = async () => {
    setSaveState("saving");
    try {
      const response = await fetch("/api/menu/s3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Save failed");
      setSaveState("saved");
      lastSavedRef.current = data;
      setDirty(false);
      setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setSaveState("error");
    }
  };

  const pizzaGroups = chunkWithStart(data.pizzas, 3);
  const premiumGroups = chunkWithStart(data.premiumPizzas, 2);

  return (
    <main className="w-screen h-screen bg-background text-foreground flex flex-col overflow-hidden p-[1.5vh] relative">
      <div className="absolute top-[1vh] right-[1.5vh] z-20 flex items-center gap-[0.6vh]">
        <button
          type="button"
          onClick={() => setEditMode((prev) => !prev)}
          className="text-[1.6vh] uppercase font-bold border border-border rounded px-[1vh] py-[0.4vh]"
        >
          {editMode ? "Done" : "Edit"}
        </button>
        <button
          type="button"
          onClick={saveChanges}
          disabled={!dirty || saveState === "saving"}
          className={cn(
            "text-[1.6vh] uppercase font-bold border border-border rounded px-[1vh] py-[0.4vh]",
            (!dirty || saveState === "saving") && "opacity-50 cursor-not-allowed"
          )}
        >
          {saveState === "saving" ? "Saving..." : "Save"}
        </button>
        {saveState === "saved" ? (
          <span className="text-[1.4vh] text-primary">Saved</span>
        ) : null}
        {saveState === "error" ? (
          <span className="text-[1.4vh] text-destructive">Save failed</span>
        ) : null}
      </div>

      <div className="text-center shrink-0 mb-[1vh]">
        <h1 className="font-[family-name:var(--font-heading)] text-[6vh] font-bold text-primary uppercase tracking-wider">
          Pizza Menu / Menu Pizza
        </h1>
        <p className="text-muted-foreground text-[3vh]">Classic, premium, and add-ons</p>
      </div>

      <div className="relative flex-1 min-h-0">
        <div
          className={cn(
            "absolute inset-0 transition-all duration-500 ease-in-out",
            currentSlide === 0
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-full pointer-events-none"
          )}
        >
          <div className="h-full grid grid-cols-3 gap-[1.5vh] pb-[4vh]">
            {pizzaGroups.map((group, groupIndex) => {
              return (
                <SectionCard key={groupIndex}>
                  <div className="space-y-[0.8vh]">
                    {group.items.map((pizza, itemIndex) => {
                      const pizzaIndex = group.start + itemIndex;
                      return (
                        <div
                          key={pizzaIndex}
                          className="relative rounded-[0.8vh] border border-border/40 overflow-hidden h-[34vh]"
                        >
                          {pizza.image ? (
                            <img
                              src={pizza.image}
                              alt={pizza.nameEn}
                              className="absolute inset-0 w-full h-full object-cover scale-125"
                            />
                          ) : null}
                          <div className="absolute inset-0 bg-gradient-to-t from-background/75 via-background/35 to-transparent" />
                          <div className="absolute top-[0.6vh] left-[0.6vh] z-10 max-w-[70%] rounded-[0.5vh] bg-black/70 px-[0.8vh] py-[0.5vh]">
                            {editMode ? (
                              <div className="flex flex-col gap-[0.3vh]">
                                <input
                                  value={pizza.nameEn}
                                  onChange={(event) =>
                                    updateData((prev) => ({
                                      ...prev,
                                      pizzas: updateItem(prev.pizzas, pizzaIndex, {
                                        nameEn: event.target.value,
                                      }),
                                    }))
                                  }
                                  className={cn(
                                    inputBaseClass,
                                    "w-full text-[2vh] font-bold uppercase text-white border-white/30"
                                  )}
                                />
                                <input
                                  value={pizza.nameFr}
                                  onChange={(event) =>
                                    updateData((prev) => ({
                                      ...prev,
                                      pizzas: updateItem(prev.pizzas, pizzaIndex, {
                                        nameFr: event.target.value,
                                      }),
                                    }))
                                  }
                                  className={cn(
                                    inputBaseClass,
                                    "w-full text-[1.3vh] text-white/80 border-white/20"
                                  )}
                                />
                              </div>
                            ) : (
                              <>
                                <div className="text-[2.1vh] font-bold uppercase tracking-wide text-white">
                                  {pizza.nameEn}
                                </div>
                                <div className="text-[1.3vh] text-white/80">{pizza.nameFr}</div>
                              </>
                            )}
                          </div>
                          {editMode ? (
                            <RowControls
                              className="absolute top-[0.6vh] right-[0.6vh] z-10"
                              onMoveUp={() =>
                                updateData((prev) => ({
                                  ...prev,
                                  pizzas: moveItem(prev.pizzas, pizzaIndex, -1),
                                }))
                              }
                              onMoveDown={() =>
                                updateData((prev) => ({
                                  ...prev,
                                  pizzas: moveItem(prev.pizzas, pizzaIndex, 1),
                                }))
                              }
                              onRemove={() =>
                                updateData((prev) => ({
                                  ...prev,
                                  pizzas: removeItem(prev.pizzas, pizzaIndex),
                                }))
                              }
                            />
                          ) : null}
                          <div className="absolute inset-0 z-10 flex flex-col">
                            <div className="mt-auto w-full bg-background/50 border-t border-border/40 px-[1vh] py-[0.6vh]">
                              <div className="grid grid-cols-5 gap-x-[1vh] text-center text-[1.6vh] text-muted-foreground font-bold">
                                {sizeLabels.map((size) => (
                                  <span key={size}>{size}</span>
                                ))}
                              </div>
                              <div className="mt-[0.2vh] grid grid-cols-5 gap-x-[1vh] text-center">
                                {sizeLabels.map((_, priceIndex) => (
                                  <div key={priceIndex}>
                                    {editMode ? (
                                      <input
                                        value={pizza.prices[priceIndex] ?? ""}
                                        onChange={(event) => {
                                          const nextPrices = [...pizza.prices];
                                          nextPrices[priceIndex] = event.target.value;
                                          updateData((prev) => ({
                                            ...prev,
                                            pizzas: updateItem(prev.pizzas, pizzaIndex, {
                                              prices: nextPrices,
                                            }),
                                          }));
                                        }}
                                        className={cn(
                                          inputBaseClass,
                                          "w-[6vh] text-center text-[1.7vh] font-bold text-primary"
                                        )}
                                      />
                                    ) : (
                                      <span className="font-bold text-primary text-[1.8vh]">
                                        ${pizza.prices[priceIndex]}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {editMode && groupIndex === pizzaGroups.length - 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        updateData((prev) => ({
                          ...prev,
                          pizzas: [
                            ...prev.pizzas,
                            {
                              nameEn: "New Pizza",
                              nameFr: "Nouvelle Pizza",
                              image: "/images/pizzas/pepperoni.png",
                              prices: ["0.00", "0.00", "0.00", "0.00", "0.00"],
                            },
                          ],
                        }))
                      }
                      className="mt-[0.6vh] text-left text-[1.6vh] font-bold text-primary/80 hover:text-primary"
                    >
                      + Add pizza
                    </button>
                  ) : null}
                </SectionCard>
              );
            })}
          </div>
        </div>

        <div
          className={cn(
            "absolute inset-0 transition-all duration-500 ease-in-out",
            currentSlide === 1
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-full pointer-events-none"
          )}
        >
          <div className="h-full grid grid-cols-3 gap-[1.5vh] pb-[4vh]">
            {premiumGroups.map((group, groupIndex) => {
              return (
                <SectionCard key={groupIndex}>
                  <div className="space-y-[0.8vh]">
                    {group.items.map((pizza, itemIndex) => {
                      const pizzaIndex = group.start + itemIndex;
                      const premiumPrices = getPremiumPrices(pizza);
                      return (
                        <div
                          key={pizzaIndex}
                          className="relative rounded-[0.8vh] border border-border/40 overflow-hidden h-[34vh]"
                        >
                          {pizza.image ? (
                            <img
                              src={pizza.image}
                              alt={pizza.nameEn}
                              className="absolute inset-0 w-full h-full object-cover scale-125"
                            />
                          ) : null}
                          <div className="absolute inset-0 bg-gradient-to-t from-background/75 via-background/35 to-transparent" />
                          <div className="absolute top-[0.6vh] left-[0.6vh] z-10 max-w-[70%] rounded-[0.5vh] bg-black/70 px-[0.8vh] py-[0.5vh]">
                            {editMode ? (
                              <div className="flex flex-col gap-[0.3vh]">
                                <input
                                  value={pizza.nameEn}
                                  onChange={(event) =>
                                    updateData((prev) => ({
                                      ...prev,
                                      premiumPizzas: updateItem(prev.premiumPizzas, pizzaIndex, {
                                        nameEn: event.target.value,
                                      }),
                                    }))
                                  }
                                  className={cn(
                                    inputBaseClass,
                                    "w-full text-[2vh] font-bold uppercase text-white border-white/30"
                                  )}
                                />
                                <input
                                  value={pizza.nameFr}
                                  onChange={(event) =>
                                    updateData((prev) => ({
                                      ...prev,
                                      premiumPizzas: updateItem(prev.premiumPizzas, pizzaIndex, {
                                        nameFr: event.target.value,
                                      }),
                                    }))
                                  }
                                  className={cn(
                                    inputBaseClass,
                                    "w-full text-[1.3vh] text-white/80 border-white/20"
                                  )}
                                />
                              </div>
                            ) : (
                              <>
                                <div className="text-[2.1vh] font-bold uppercase tracking-wide text-white">
                                  {pizza.nameEn}
                                </div>
                                <div className="text-[1.3vh] text-white/80">{pizza.nameFr}</div>
                              </>
                            )}
                          </div>
                          {editMode ? (
                            <RowControls
                              className="absolute top-[0.6vh] right-[0.6vh] z-10"
                              onMoveUp={() =>
                                updateData((prev) => ({
                                  ...prev,
                                  premiumPizzas: moveItem(prev.premiumPizzas, pizzaIndex, -1),
                                }))
                              }
                              onMoveDown={() =>
                                updateData((prev) => ({
                                  ...prev,
                                  premiumPizzas: moveItem(prev.premiumPizzas, pizzaIndex, 1),
                                }))
                              }
                              onRemove={() =>
                                updateData((prev) => ({
                                  ...prev,
                                  premiumPizzas: removeItem(prev.premiumPizzas, pizzaIndex),
                                }))
                              }
                              onToggleFeatured={() =>
                                updateData((prev) => ({
                                  ...prev,
                                  premiumPizzas: updateItem(prev.premiumPizzas, pizzaIndex, {
                                    featured: !pizza.featured,
                                  }),
                                }))
                              }
                              featured={pizza.featured}
                            />
                          ) : null}
                          <div className="absolute inset-0 z-10 flex flex-col">
                            <div className="mt-auto w-full bg-background/50 border-t border-border/40 px-[1vh] py-[0.6vh]">
                              <div className="grid grid-cols-5 gap-x-[1vh] text-center text-[1.6vh] text-muted-foreground font-bold">
                                {sizeLabels.map((size) => (
                                  <span key={size}>{size}</span>
                                ))}
                              </div>
                              <div className="mt-[0.2vh] grid grid-cols-5 gap-x-[1vh] text-center">
                                {sizeLabels.map((_, priceIndex) => (
                                  <div key={priceIndex}>
                                    {editMode ? (
                                      <input
                                        value={premiumPrices[priceIndex] ?? ""}
                                        onChange={(event) => {
                                          const nextPrices = [...premiumPrices];
                                          nextPrices[priceIndex] = event.target.value;
                                          updateData((prev) => ({
                                            ...prev,
                                            premiumPizzas: updateItem(prev.premiumPizzas, pizzaIndex, {
                                              prices: nextPrices,
                                              price: nextPrices[0] ?? pizza.price,
                                            }),
                                          }));
                                        }}
                                        className={cn(
                                          inputBaseClass,
                                          "w-[6vh] text-center text-[1.7vh] font-bold text-primary"
                                        )}
                                      />
                                    ) : (
                                      <span className="font-bold text-primary text-[1.8vh]">
                                        ${premiumPrices[priceIndex]}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {editMode && groupIndex === premiumGroups.length - 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        updateData((prev) => ({
                          ...prev,
                          premiumPizzas: [
                            ...prev.premiumPizzas,
                            {
                              nameEn: "New Premium",
                              nameFr: "Nouveau",
                              image: "/images/pizzas/classic.png",
                              featured: false,
                              price: "0.00",
                            },
                          ],
                        }))
                      }
                      className="mt-[0.6vh] text-left text-[1.6vh] font-bold text-primary/80 hover:text-primary"
                    >
                      + Add premium
                    </button>
                  ) : null}
                </SectionCard>
              );
            })}

            <SectionCard title="Add-Ons">
              <div className="grid grid-cols-6 gap-[0.5vh] text-center mb-[0.8vh]">
                <div />
                {sizeLabels.map((size) => (
                  <span key={size} className="text-[1.6vh] text-muted-foreground font-bold">
                    {size}
                  </span>
                ))}
              </div>

              <div className="flex flex-col gap-[0.8vh]">
                {data.addons.map((addon, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-6 gap-[0.5vh] items-center text-center border-b border-border/30 pb-[0.8vh]"
                  >
                    <div className="text-left">
                      {editMode ? (
                        <input
                          value={addon.nameEn}
                          onChange={(event) =>
                            updateData((prev) => ({
                              ...prev,
                              addons: updateItem(prev.addons, index, {
                                nameEn: event.target.value,
                              }),
                            }))
                          }
                          className={cn(inputBaseClass, "w-full text-[1.6vh] font-bold")}
                        />
                      ) : (
                        <p className="font-bold text-[1.8vh] text-foreground leading-tight">{addon.nameEn}</p>
                      )}
                      {editMode ? (
                        <input
                          value={addon.nameFr}
                          onChange={(event) =>
                            updateData((prev) => ({
                              ...prev,
                              addons: updateItem(prev.addons, index, {
                                nameFr: event.target.value,
                              }),
                            }))
                          }
                          className={cn(inputBaseClass, "w-full text-[1.2vh] text-muted-foreground")}
                        />
                      ) : (
                        <p className="text-[1.2vh] text-muted-foreground">{addon.nameFr}</p>
                      )}
                      {editMode ? (
                        <RowControls
                          className="mt-[0.4vh]"
                          onMoveUp={() =>
                            updateData((prev) => ({
                              ...prev,
                              addons: moveItem(prev.addons, index, -1),
                            }))
                          }
                          onMoveDown={() =>
                            updateData((prev) => ({
                              ...prev,
                              addons: moveItem(prev.addons, index, 1),
                            }))
                          }
                          onRemove={() =>
                            updateData((prev) => ({
                              ...prev,
                              addons: removeItem(prev.addons, index),
                            }))
                          }
                        />
                      ) : null}
                    </div>
                    {addon.prices.map((price, priceIndex) => (
                      <div key={priceIndex}>
                        {editMode ? (
                          <input
                            value={price}
                            onChange={(event) => {
                              const nextPrices = [...addon.prices];
                              nextPrices[priceIndex] = event.target.value;
                              updateData((prev) => ({
                                ...prev,
                                addons: updateItem(prev.addons, index, {
                                  prices: nextPrices,
                                }),
                              }));
                            }}
                            className={cn(inputBaseClass, "w-[6vh] text-center text-[1.4vh] font-bold text-primary")}
                          />
                        ) : (
                          <span className="font-bold text-primary text-[1.6vh]">${price}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              {editMode ? (
                <button
                  type="button"
                  onClick={() =>
                    updateData((prev) => ({
                      ...prev,
                      addons: [
                        ...prev.addons,
                        {
                          nameEn: "New Add-on",
                          nameFr: "Nouveau",
                          prices: ["0.00", "0.00", "0.00", "0.00", "0.00"],
                        },
                      ],
                    }))
                  }
                  className="mt-[0.6vh] text-left text-[1.6vh] font-bold text-primary/80 hover:text-primary"
                >
                  + Add add-on
                </button>
              ) : null}
            </SectionCard>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-[1vh] mt-[1vh] shrink-0">
        <button
          type="button"
          aria-label="Show slide 1"
          aria-current={currentSlide === 0}
          onClick={() => setCurrentSlide(0)}
          className={cn(
            "w-[1.5vh] h-[1.5vh] rounded-full transition-all duration-300 cursor-pointer",
            currentSlide === 0 ? "bg-primary scale-125" : "bg-muted"
          )}
        />
        <button
          type="button"
          aria-label="Show slide 2"
          aria-current={currentSlide === 1}
          onClick={() => setCurrentSlide(1)}
          className={cn(
            "w-[1.5vh] h-[1.5vh] rounded-full transition-all duration-300 cursor-pointer",
            currentSlide === 1 ? "bg-primary scale-125" : "bg-muted"
          )}
        />
      </div>

      <MenuFooter />
    </main>
  );
}
