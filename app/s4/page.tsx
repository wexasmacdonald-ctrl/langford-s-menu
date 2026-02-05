"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MenuFooter } from "@/components/menu/menu-footer";
import { cn } from "@/lib/utils";
import { defaultS4Data } from "@/lib/menu-defaults";
import type { S4Data } from "@/lib/menu-types";
import { useUndoRedo } from "@/hooks/use-undo-redo";

type SaveState = "idle" | "saving" | "saved" | "error";

type ImageProps = {
  src: string;
  alt: string;
  className?: string;
  overlayClassName?: string;
};

const inputBaseClass =
  "bg-transparent border border-border/60 rounded px-[0.4vh] py-[0.2vh] text-foreground";

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

function updateItem<T extends object>(items: T[], index: number, patch: Partial<T>) {
  return items.map((item, idx) => (idx === index ? { ...item, ...patch } : item));
}

function CardImage({ src, alt, className, overlayClassName }: ImageProps) {
  return (
    <div className={cn("relative w-full h-[12vh] overflow-hidden", className)}>
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-background/70 via-background/35 to-transparent",
          overlayClassName
        )}
      />
    </div>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-[1vh] border border-border overflow-hidden flex flex-col min-h-0">
      {children}
    </div>
  );
}

function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "font-[family-name:var(--font-heading)] text-[2.1vh] font-bold uppercase text-primary border-b border-border/60 px-[1vh] py-[0.6vh]",
        className
      )}
    >
      {children}
    </div>
  );
}

function MicroHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-primary text-primary-foreground text-[2vh] font-bold uppercase px-[0.8vh] py-[0.4vh]">
      {children}
    </div>
  );
}

export default function Screen4() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const {
    state: data,
    set: setData,
    reset: resetData,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo<S4Data>(defaultS4Data);
  const [editMode, setEditMode] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [dirty, setDirty] = useState(false);
  const lastSavedRef = useRef<S4Data>(defaultS4Data);

  const updateData = useCallback(
    (updater: (prev: S4Data) => S4Data) => {
      setData((prev) => updater(prev));
      setSaveState("idle");
    },
    [setData]
  );

  useEffect(() => {
    let active = true;
    fetch("/api/menu/s4", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((payload: S4Data) => {
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
  }, [resetData]);

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
      const response = await fetch("/api/menu/s4", {
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

  const listRowClass =
    "grid grid-cols-[1fr_auto] gap-x-[1vh] items-center text-[1.6vh]";
  const tableHeaderClass =
    "text-[1.3vh] uppercase tracking-wide text-muted-foreground font-bold";

  return (
    <main className="w-screen h-screen bg-background text-foreground flex flex-col overflow-hidden p-[1.5vh] relative s4-font-shrink">
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
        {editMode ? (
          <input
            value={data.header.title}
            onChange={(event) =>
              updateData((prev) => ({
                ...prev,
                header: { ...prev.header, title: event.target.value },
              }))
            }
            className={cn(
              inputBaseClass,
              "text-center w-full text-[5.4vh] font-bold uppercase tracking-wider text-primary border-primary/40"
            )}
          />
        ) : (
          <h1 className="font-[family-name:var(--font-heading)] text-[5.4vh] font-bold text-primary uppercase tracking-wider">
            {data.header.title}
          </h1>
        )}
        <p className="text-muted-foreground text-[2.4vh]">
          Snackables, favorites, and classics
        </p>
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
          <div className="h-full grid grid-cols-[1fr_1fr_1fr_1.35fr] gap-[1.2vh]">
            <SectionCard>
              <CardImage src="/images/s4/finger-foods.png" alt="Finger foods" />
              <CardHeader className="text-[1.9vh]">
                {editMode ? (
                  <input
                    value={data.slideA.fingerFoodsTitle}
                    onChange={(event) =>
                      updateData((prev) => ({
                        ...prev,
                        slideA: {
                          ...prev.slideA,
                          fingerFoodsTitle: event.target.value,
                        },
                      }))
                    }
                    className={cn(inputBaseClass, "w-full text-primary border-primary/40")}
                  />
                ) : (
                  data.slideA.fingerFoodsTitle
                )}
              </CardHeader>
              <div className="flex-1 min-h-0 overflow-y-auto px-[1vh] py-[0.8vh] space-y-[0.6vh]">
                {data.items.fingerFoods.map((item, index) => (
                  <div key={index} className={listRowClass}>
                    {editMode ? (
                      <input
                        value={item.name}
                        onChange={(event) =>
                          updateData((prev) => ({
                            ...prev,
                            items: {
                              ...prev.items,
                              fingerFoods: updateItem(prev.items.fingerFoods, index, {
                                name: event.target.value,
                              }),
                            },
                          }))
                        }
                        className={cn(inputBaseClass, "w-full")}
                      />
                    ) : (
                      <span>{item.name}</span>
                    )}
                    {editMode ? (
                      <input
                        value={item.price}
                        onChange={(event) =>
                          updateData((prev) => ({
                            ...prev,
                            items: {
                              ...prev.items,
                              fingerFoods: updateItem(prev.items.fingerFoods, index, {
                                price: event.target.value,
                              }),
                            },
                          }))
                        }
                        className={cn(inputBaseClass, "w-[6vh] text-right text-primary font-bold")}
                      />
                    ) : (
                      <span className="text-primary font-bold">${item.price}</span>
                    )}
                  </div>
                ))}

                <div className="pt-[0.6vh] border-t border-border/40">
                  <div className="text-[1.6vh] font-bold uppercase text-primary">
                    {editMode ? (
                      <input
                        value={data.slideA.partyPackTitle}
                        onChange={(event) =>
                          updateData((prev) => ({
                            ...prev,
                            slideA: { ...prev.slideA, partyPackTitle: event.target.value },
                          }))
                        }
                        className={cn(inputBaseClass, "w-full text-primary border-primary/40")}
                      />
                    ) : (
                      data.slideA.partyPackTitle
                    )}
                  </div>
                  {editMode ? (
                    <input
                      value={data.slideA.partyPackDescription}
                      onChange={(event) =>
                        updateData((prev) => ({
                          ...prev,
                          slideA: {
                            ...prev.slideA,
                            partyPackDescription: event.target.value,
                          },
                        }))
                      }
                      className={cn(inputBaseClass, "w-full text-[1.2vh] text-muted-foreground")}
                    />
                  ) : (
                    <p className="text-[1.2vh] text-muted-foreground">
                      {data.slideA.partyPackDescription}
                    </p>
                  )}
                  <div className="text-primary font-bold text-[1.8vh]">
                    {editMode ? (
                      <input
                        value={data.slideA.partyPackPrice}
                        onChange={(event) =>
                          updateData((prev) => ({
                            ...prev,
                            slideA: { ...prev.slideA, partyPackPrice: event.target.value },
                          }))
                        }
                        className={cn(inputBaseClass, "w-[8vh] text-primary font-bold")}
                      />
                    ) : (
                      <>${data.slideA.partyPackPrice}</>
                    )}
                  </div>
                </div>
              </div>
            </SectionCard>
            <SectionCard>
              <CardImage src="/images/s4/poutine.png" alt="Poutine" />
              <CardHeader>
                {editMode ? (
                  <input
                    value={data.slideA.poutineTitle}
                    onChange={(event) =>
                      updateData((prev) => ({
                        ...prev,
                        slideA: { ...prev.slideA, poutineTitle: event.target.value },
                      }))
                    }
                    className={cn(inputBaseClass, "w-full text-primary border-primary/40")}
                  />
                ) : (
                  data.slideA.poutineTitle
                )}
              </CardHeader>
              <div className="flex-1 min-h-0 overflow-y-auto px-[1vh] py-[0.8vh] space-y-[0.6vh]">
                {data.items.poutine.map((item, index) => (
                  <div key={index} className={listRowClass}>
                    {editMode ? (
                      <input
                        value={item.name}
                        onChange={(event) =>
                          updateData((prev) => ({
                            ...prev,
                            items: {
                              ...prev.items,
                              poutine: updateItem(prev.items.poutine, index, {
                                name: event.target.value,
                              }),
                            },
                          }))
                        }
                        className={cn(inputBaseClass, "w-full")}
                      />
                    ) : (
                      <span>{item.name}</span>
                    )}
                    {editMode ? (
                      <input
                        value={item.price}
                        onChange={(event) =>
                          updateData((prev) => ({
                            ...prev,
                            items: {
                              ...prev.items,
                              poutine: updateItem(prev.items.poutine, index, {
                                price: event.target.value,
                              }),
                            },
                          }))
                        }
                        className={cn(inputBaseClass, "w-[6vh] text-right text-primary font-bold")}
                      />
                    ) : (
                      <span className="text-primary font-bold">${item.price}</span>
                    )}
                  </div>
                ))}

                <div className="pt-[0.6vh] border-t border-border/40">
                  <div className="text-[1.3vh] uppercase text-muted-foreground font-bold">
                    {editMode ? (
                      <input
                        value={data.slideA.poutineAddonsTitle}
                        onChange={(event) =>
                          updateData((prev) => ({
                            ...prev,
                            slideA: { ...prev.slideA, poutineAddonsTitle: event.target.value },
                          }))
                        }
                        className={cn(inputBaseClass, "w-full text-muted-foreground")}
                      />
                    ) : (
                      data.slideA.poutineAddonsTitle
                    )}
                  </div>
                  <div className="mt-[0.4vh] space-y-[0.4vh]">
                    {data.items.poutineAddons.map((item, index) => (
                      <div key={index} className={listRowClass}>
                        {editMode ? (
                          <input
                            value={item.name}
                            onChange={(event) =>
                              updateData((prev) => ({
                                ...prev,
                                items: {
                                  ...prev.items,
                                  poutineAddons: updateItem(prev.items.poutineAddons, index, {
                                    name: event.target.value,
                                  }),
                                },
                              }))
                            }
                            className={cn(inputBaseClass, "w-full")}
                          />
                        ) : (
                          <span>{item.name}</span>
                        )}
                        {editMode ? (
                          <input
                            value={item.price}
                            onChange={(event) =>
                              updateData((prev) => ({
                                ...prev,
                                items: {
                                  ...prev.items,
                                  poutineAddons: updateItem(prev.items.poutineAddons, index, {
                                    price: event.target.value,
                                  }),
                                },
                              }))
                            }
                            className={cn(inputBaseClass, "w-[6vh] text-right text-primary font-bold")}
                          />
                        ) : (
                          <span className="text-primary font-bold">${item.price}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <CardImage src="/images/s4/fried-chicken.png" alt="Fried chicken" />
              <div className="flex-1 min-h-0 overflow-y-auto">
                <MicroHeader>
                  {editMode ? (
                    <input
                      value={data.slideA.friedChickenTitle}
                      onChange={(event) =>
                        updateData((prev) => ({
                          ...prev,
                          slideA: { ...prev.slideA, friedChickenTitle: event.target.value },
                        }))
                      }
                      className={cn(inputBaseClass, "w-full text-primary-foreground border-white/30")}
                    />
                  ) : (
                    data.slideA.friedChickenTitle
                  )}
                </MicroHeader>
                <div className="px-[1vh] py-[0.8vh] space-y-[0.6vh]">
                  {data.items.friedChicken.map((item, index) => (
                    <div key={index} className={listRowClass}>
                      {editMode ? (
                        <input
                          value={item.name}
                          onChange={(event) =>
                            updateData((prev) => ({
                              ...prev,
                              items: {
                                ...prev.items,
                                friedChicken: updateItem(prev.items.friedChicken, index, {
                                  name: event.target.value,
                                }),
                              },
                            }))
                          }
                          className={cn(inputBaseClass, "w-full")}
                        />
                      ) : (
                        <span>{item.name}</span>
                      )}
                      {editMode ? (
                        <input
                          value={item.price}
                          onChange={(event) =>
                            updateData((prev) => ({
                              ...prev,
                              items: {
                                ...prev.items,
                                friedChicken: updateItem(prev.items.friedChicken, index, {
                                  price: event.target.value,
                                }),
                              },
                            }))
                          }
                          className={cn(inputBaseClass, "w-[6vh] text-right text-primary font-bold")}
                        />
                      ) : (
                        <span className="text-primary font-bold">${item.price}</span>
                      )}
                    </div>
                  ))}
                </div>
                <MicroHeader>
                  {editMode ? (
                    <input
                      value={data.slideA.hotDogsTitle}
                      onChange={(event) =>
                        updateData((prev) => ({
                          ...prev,
                          slideA: { ...prev.slideA, hotDogsTitle: event.target.value },
                        }))
                      }
                      className={cn(inputBaseClass, "w-full text-primary-foreground border-white/30")}
                    />
                  ) : (
                    data.slideA.hotDogsTitle
                  )}
                </MicroHeader>
                <div className="px-[1vh] py-[0.8vh] space-y-[0.6vh]">
                  {data.items.hotDogs.map((item, index) => (
                    <div key={index} className={listRowClass}>
                      {editMode ? (
                        <input
                          value={item.name}
                          onChange={(event) =>
                            updateData((prev) => ({
                              ...prev,
                              items: {
                                ...prev.items,
                                hotDogs: updateItem(prev.items.hotDogs, index, {
                                  name: event.target.value,
                                }),
                              },
                            }))
                          }
                          className={cn(inputBaseClass, "w-full")}
                        />
                      ) : (
                        <span>{item.name}</span>
                      )}
                      {editMode ? (
                        <input
                          value={item.price}
                          onChange={(event) =>
                            updateData((prev) => ({
                              ...prev,
                              items: {
                                ...prev.items,
                                hotDogs: updateItem(prev.items.hotDogs, index, {
                                  price: event.target.value,
                                }),
                              },
                            }))
                          }
                          className={cn(inputBaseClass, "w-[6vh] text-right text-primary font-bold")}
                        />
                      ) : (
                        <span className="text-primary font-bold">${item.price}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <CardImage src="/images/s4/sandwiches.png" alt="Sandwiches and wraps" />
              <CardHeader>
                {editMode ? (
                  <input
                    value={data.slideA.sandwichWrapsTitle}
                    onChange={(event) =>
                      updateData((prev) => ({
                        ...prev,
                        slideA: { ...prev.slideA, sandwichWrapsTitle: event.target.value },
                      }))
                    }
                    className={cn(inputBaseClass, "w-full text-primary border-primary/40")}
                  />
                ) : (
                  data.slideA.sandwichWrapsTitle
                )}
              </CardHeader>
              <div className="flex-1 min-h-0 overflow-y-auto px-[1vh] py-[0.8vh]">
                <div className="grid grid-cols-[1fr_auto_auto] gap-x-[1vh] mb-[0.6vh]">
                  {editMode ? (
                    <input
                      value={data.slideA.sandwichWrapsHeaders[0]}
                      onChange={(event) =>
                        updateData((prev) => ({
                          ...prev,
                          slideA: {
                            ...prev.slideA,
                            sandwichWrapsHeaders: [
                              event.target.value,
                              prev.slideA.sandwichWrapsHeaders[1],
                              prev.slideA.sandwichWrapsHeaders[2],
                            ],
                          },
                        }))
                      }
                      className={cn(inputBaseClass, "w-full", tableHeaderClass)}
                    />
                  ) : (
                    <span className={tableHeaderClass}>{data.slideA.sandwichWrapsHeaders[0]}</span>
                  )}
                  {editMode ? (
                    <input
                      value={data.slideA.sandwichWrapsHeaders[1]}
                      onChange={(event) =>
                        updateData((prev) => ({
                          ...prev,
                          slideA: {
                            ...prev.slideA,
                            sandwichWrapsHeaders: [
                              prev.slideA.sandwichWrapsHeaders[0],
                              event.target.value,
                              prev.slideA.sandwichWrapsHeaders[2],
                            ],
                          },
                        }))
                      }
                      className={cn(inputBaseClass, "w-[6vh] text-right", tableHeaderClass)}
                    />
                  ) : (
                    <span className={cn(tableHeaderClass, "text-right")}>{data.slideA.sandwichWrapsHeaders[1]}</span>
                  )}
                  {editMode ? (
                    <input
                      value={data.slideA.sandwichWrapsHeaders[2]}
                      onChange={(event) =>
                        updateData((prev) => ({
                          ...prev,
                          slideA: {
                            ...prev.slideA,
                            sandwichWrapsHeaders: [
                              prev.slideA.sandwichWrapsHeaders[0],
                              prev.slideA.sandwichWrapsHeaders[1],
                              event.target.value,
                            ],
                          },
                        }))
                      }
                      className={cn(inputBaseClass, "w-[6vh] text-right", tableHeaderClass)}
                    />
                  ) : (
                    <span className={cn(tableHeaderClass, "text-right")}>{data.slideA.sandwichWrapsHeaders[2]}</span>
                  )}
                </div>

                <div className="space-y-[0.6vh]">
                  {data.items.sandwichWraps.map((item, index) => (
                    <div key={index} className="grid grid-cols-[1fr_auto_auto] gap-x-[1vh] items-center text-[1.6vh]">
                      {editMode ? (
                        <input
                          value={item.name}
                          onChange={(event) =>
                            updateData((prev) => ({
                              ...prev,
                              items: {
                                ...prev.items,
                                sandwichWraps: updateItem(prev.items.sandwichWraps, index, {
                                  name: event.target.value,
                                }),
                              },
                            }))
                          }
                          className={cn(inputBaseClass, "w-full")}
                        />
                      ) : (
                        <span>{item.name}</span>
                      )}
                      {editMode ? (
                        <input
                          value={item.price}
                          onChange={(event) =>
                            updateData((prev) => ({
                              ...prev,
                              items: {
                                ...prev.items,
                                sandwichWraps: updateItem(prev.items.sandwichWraps, index, {
                                  price: event.target.value,
                                }),
                              },
                            }))
                          }
                          className={cn(inputBaseClass, "w-[6vh] text-right text-primary font-bold")}
                        />
                      ) : (
                        <span className="text-primary font-bold">${item.price}</span>
                      )}
                      {editMode ? (
                        <input
                          value={item.withFries}
                          onChange={(event) =>
                            updateData((prev) => ({
                              ...prev,
                              items: {
                                ...prev.items,
                                sandwichWraps: updateItem(prev.items.sandwichWraps, index, {
                                  withFries: event.target.value,
                                }),
                              },
                            }))
                          }
                          className={cn(inputBaseClass, "w-[6vh] text-right text-primary font-bold")}
                        />
                      ) : (
                        <span className="text-primary font-bold">${item.withFries}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
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
          <div className="h-full grid grid-cols-[1fr_1fr_1.15fr_1.15fr] gap-[1.2vh]">
            <SectionCard>
              <CardImage
                src="/images/s4/burger.png"
                alt="Burgers"
                className="h-[12vh]"
                overlayClassName="from-background/60 via-background/30"
              />
              <MicroHeader>
                {editMode ? (
                  <input
                    value={data.slideB.burgersTitle}
                    onChange={(event) =>
                      updateData((prev) => ({
                        ...prev,
                        slideB: { ...prev.slideB, burgersTitle: event.target.value },
                      }))
                    }
                    className={cn(inputBaseClass, "w-full text-primary-foreground border-white/30")}
                  />
                ) : (
                  data.slideB.burgersTitle
                )}
              </MicroHeader>
              <div className="px-[1vh] py-[0.8vh] space-y-[0.6vh]">
                <div className="grid grid-cols-[1fr_auto_auto] gap-x-[1vh]">
                  <span className={tableHeaderClass}>Burger</span>
                  <span className={cn(tableHeaderClass, "text-right")}>Price</span>
                  <span className={cn(tableHeaderClass, "text-right")}>+ Fries</span>
                </div>
                {data.items.burgers.map((item, index) => (
                  <div key={index} className="grid grid-cols-[1fr_auto_auto] gap-x-[1vh] items-center text-[1.6vh]">
                    {editMode ? (
                      <input
                        value={item.name}
                        onChange={(event) =>
                          updateData((prev) => ({
                            ...prev,
                            items: {
                              ...prev.items,
                              burgers: updateItem(prev.items.burgers, index, {
                                name: event.target.value,
                              }),
                            },
                          }))
                        }
                        className={cn(inputBaseClass, "w-full")}
                      />
                    ) : (
                      <span>{item.name}</span>
                    )}
                    {editMode ? (
                      <input
                        value={item.base}
                        onChange={(event) =>
                          updateData((prev) => ({
                            ...prev,
                            items: {
                              ...prev.items,
                              burgers: updateItem(prev.items.burgers, index, {
                                base: event.target.value,
                              }),
                            },
                          }))
                        }
                        className={cn(inputBaseClass, "w-[6vh] text-right text-primary font-bold")}
                      />
                    ) : (
                      <span className="text-primary font-bold">${item.base}</span>
                    )}
                    {editMode ? (
                      <input
                        value={item.withFries}
                        onChange={(event) =>
                          updateData((prev) => ({
                            ...prev,
                            items: {
                              ...prev.items,
                              burgers: updateItem(prev.items.burgers, index, {
                                withFries: event.target.value,
                              }),
                            },
                          }))
                        }
                        className={cn(inputBaseClass, "w-[6vh] text-right text-primary font-bold")}
                      />
                    ) : (
                      <span className="text-primary font-bold">${item.withFries}</span>
                    )}
                  </div>
                ))}
              </div>
              <CardImage
                src="/images/s4/fries.png"
                alt="Fries"
                className="h-[10vh]"
              />
              <MicroHeader>
                {editMode ? (
                  <input
                    value={data.slideB.friesTitle}
                    onChange={(event) =>
                      updateData((prev) => ({
                        ...prev,
                        slideB: { ...prev.slideB, friesTitle: event.target.value },
                      }))
                    }
                    className={cn(inputBaseClass, "w-full text-primary-foreground border-white/30")}
                  />
                ) : (
                  data.slideB.friesTitle
                )}
              </MicroHeader>
              <div className="flex-1 min-h-0 overflow-y-auto px-[1vh] py-[0.8vh] space-y-[0.6vh]">
                {data.items.fries.map((item, index) => (
                  <div key={index} className={listRowClass}>
                    {editMode ? (
                      <input
                        value={item.name}
                        onChange={(event) =>
                          updateData((prev) => ({
                            ...prev,
                            items: {
                              ...prev.items,
                              fries: updateItem(prev.items.fries, index, {
                                name: event.target.value,
                              }),
                            },
                          }))
                        }
                        className={cn(inputBaseClass, "w-full")}
                      />
                    ) : (
                      <span>{item.name}</span>
                    )}
                    {editMode ? (
                      <input
                        value={item.price}
                        onChange={(event) =>
                          updateData((prev) => ({
                            ...prev,
                            items: {
                              ...prev.items,
                              fries: updateItem(prev.items.fries, index, {
                                price: event.target.value,
                              }),
                            },
                          }))
                        }
                        className={cn(inputBaseClass, "w-[6vh] text-right text-primary font-bold")}
                      />
                    ) : (
                      <span className="text-primary font-bold">${item.price}</span>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
            <SectionCard>
              <CardImage src="/images/s4/chicken-wings.png" alt="Chicken wings" />
              <CardHeader>
                {editMode ? (
                  <input
                    value={data.slideB.chickenWingsTitle}
                    onChange={(event) =>
                      updateData((prev) => ({
                        ...prev,
                        slideB: { ...prev.slideB, chickenWingsTitle: event.target.value },
                      }))
                    }
                    className={cn(inputBaseClass, "w-full text-primary border-primary/40")}
                  />
                ) : (
                  data.slideB.chickenWingsTitle
                )}
              </CardHeader>
              <div className="px-[1vh] py-[0.8vh]">
                <div className="text-[1.3vh] uppercase text-muted-foreground font-bold mb-[0.5vh]">
                  {editMode ? (
                    <input
                      value={data.slideB.wingsFlavorsTitle}
                      onChange={(event) =>
                        updateData((prev) => ({
                          ...prev,
                          slideB: { ...prev.slideB, wingsFlavorsTitle: event.target.value },
                        }))
                      }
                      className={cn(inputBaseClass, "w-full text-muted-foreground")}
                    />
                  ) : (
                    data.slideB.wingsFlavorsTitle
                  )}
                </div>
                <div className="grid grid-cols-2 gap-[0.4vh] text-[1.4vh]">
                  {data.items.wingsFlavors.map((flavor, index) => (
                    <div key={index}>
                      {editMode ? (
                        <input
                          value={flavor}
                          onChange={(event) =>
                            updateData((prev) => ({
                              ...prev,
                              items: {
                                ...prev.items,
                                wingsFlavors: prev.items.wingsFlavors.map((item, idx) =>
                                  idx === index ? event.target.value : item
                                ),
                              },
                            }))
                          }
                          className={cn(inputBaseClass, "w-full")}
                        />
                      ) : (
                        <span>{flavor}</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-[0.8vh] space-y-[0.6vh]">
                  {data.items.wingsSizes.map((item, index) => (
                    <div key={index} className={listRowClass}>
                      {editMode ? (
                        <input
                          value={item.name}
                          onChange={(event) =>
                            updateData((prev) => ({
                              ...prev,
                              items: {
                                ...prev.items,
                                wingsSizes: updateItem(prev.items.wingsSizes, index, {
                                  name: event.target.value,
                                }),
                              },
                            }))
                          }
                          className={cn(inputBaseClass, "w-full")}
                        />
                      ) : (
                        <span>{item.name}</span>
                      )}
                      {editMode ? (
                        <input
                          value={item.price}
                          onChange={(event) =>
                            updateData((prev) => ({
                              ...prev,
                              items: {
                                ...prev.items,
                                wingsSizes: updateItem(prev.items.wingsSizes, index, {
                                  price: event.target.value,
                                }),
                              },
                            }))
                          }
                          className={cn(inputBaseClass, "w-[6vh] text-right text-primary font-bold")}
                        />
                      ) : (
                        <span className="text-primary font-bold">${item.price}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <CardImage src="/images/s4/breakfast.png" alt="Breakfast" />
              <CardHeader>
                {editMode ? (
                  <input
                    value={data.slideB.breakfastTitle}
                    onChange={(event) =>
                      updateData((prev) => ({
                        ...prev,
                        slideB: { ...prev.slideB, breakfastTitle: event.target.value },
                      }))
                    }
                    className={cn(inputBaseClass, "w-full text-primary border-primary/40")}
                  />
                ) : (
                  data.slideB.breakfastTitle
                )}
              </CardHeader>
              <div className="flex-1 min-h-0 overflow-y-auto px-[1vh] py-[0.8vh] space-y-[0.6vh]">
                {data.items.breakfastItems.map((item, index) => (
                  <div key={index} className="space-y-[0.3vh]">
                    <div className={listRowClass}>
                      {editMode ? (
                        <input
                          value={item.name}
                          onChange={(event) =>
                            updateData((prev) => ({
                              ...prev,
                              items: {
                                ...prev.items,
                                breakfastItems: updateItem(prev.items.breakfastItems, index, {
                                  name: event.target.value,
                                }),
                              },
                            }))
                          }
                          className={cn(inputBaseClass, "w-full")}
                        />
                      ) : (
                        <span>{item.name}</span>
                      )}
                      {editMode ? (
                        <input
                          value={item.price}
                          onChange={(event) =>
                            updateData((prev) => ({
                              ...prev,
                              items: {
                                ...prev.items,
                                breakfastItems: updateItem(prev.items.breakfastItems, index, {
                                  price: event.target.value,
                                }),
                              },
                            }))
                          }
                          className={cn(inputBaseClass, "w-[6vh] text-right text-primary font-bold")}
                        />
                      ) : (
                        <span className="text-primary font-bold">${item.price}</span>
                      )}
                    </div>
                    <div className="text-[1.2vh] text-muted-foreground">
                      {editMode ? (
                        <input
                          value={item.detail}
                          onChange={(event) =>
                            updateData((prev) => ({
                              ...prev,
                              items: {
                                ...prev.items,
                                breakfastItems: updateItem(prev.items.breakfastItems, index, {
                                  detail: event.target.value,
                                }),
                              },
                            }))
                          }
                          className={cn(inputBaseClass, "w-full text-[1.2vh] text-muted-foreground")}
                        />
                      ) : (
                        item.detail
                      )}
                    </div>
                  </div>
                ))}

                <div className="pt-[0.6vh] border-t border-border/40">
                  <div className="text-[1.3vh] uppercase text-muted-foreground font-bold">
                    {editMode ? (
                      <input
                        value={data.slideB.breakfastExtrasTitle}
                        onChange={(event) =>
                          updateData((prev) => ({
                            ...prev,
                            slideB: { ...prev.slideB, breakfastExtrasTitle: event.target.value },
                          }))
                        }
                        className={cn(inputBaseClass, "w-full text-muted-foreground")}
                      />
                    ) : (
                      data.slideB.breakfastExtrasTitle
                    )}
                  </div>
                  <div className="mt-[0.4vh] space-y-[0.4vh]">
                    {data.items.breakfastExtras.map((item, index) => (
                      <div key={index} className={listRowClass}>
                        {editMode ? (
                          <input
                            value={item.name}
                            onChange={(event) =>
                              updateData((prev) => ({
                                ...prev,
                                items: {
                                  ...prev.items,
                                  breakfastExtras: updateItem(prev.items.breakfastExtras, index, {
                                    name: event.target.value,
                                  }),
                                },
                              }))
                            }
                            className={cn(inputBaseClass, "w-full")}
                          />
                        ) : (
                          <span>{item.name}</span>
                        )}
                        {editMode ? (
                          <input
                            value={item.price}
                            onChange={(event) =>
                              updateData((prev) => ({
                                ...prev,
                                items: {
                                  ...prev.items,
                                  breakfastExtras: updateItem(prev.items.breakfastExtras, index, {
                                    price: event.target.value,
                                  }),
                                },
                              }))
                            }
                            className={cn(inputBaseClass, "w-[6vh] text-right text-primary font-bold")}
                          />
                        ) : (
                          <span className="text-primary font-bold">${item.price}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>
            <SectionCard>
              <CardImage src="/images/s4/shawarma.png" alt="Shawarma" />
              <CardHeader>
                {editMode ? (
                  <input
                    value={data.slideB.shawarmaTitle}
                    onChange={(event) =>
                      updateData((prev) => ({
                        ...prev,
                        slideB: { ...prev.slideB, shawarmaTitle: event.target.value },
                      }))
                    }
                    className={cn(inputBaseClass, "w-full text-primary border-primary/40")}
                  />
                ) : (
                  data.slideB.shawarmaTitle
                )}
              </CardHeader>
              <div className="flex-1 min-h-0 overflow-y-auto px-[1vh] py-[0.8vh] space-y-[0.6vh]">
                <div>
                  <MicroHeader>
                    {editMode ? (
                      <input
                        value={data.slideB.shawarmaSectionTitle}
                        onChange={(event) =>
                          updateData((prev) => ({
                            ...prev,
                            slideB: { ...prev.slideB, shawarmaSectionTitle: event.target.value },
                          }))
                        }
                        className={cn(inputBaseClass, "w-full text-primary-foreground border-white/30")}
                      />
                    ) : (
                      data.slideB.shawarmaSectionTitle
                    )}
                  </MicroHeader>
                  <div className="mt-[0.6vh] space-y-[0.6vh]">
                    {data.items.shawarmaItems.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-[1fr_auto_auto] gap-x-[1vh] items-center text-[1.5vh]"
                      >
                        {editMode ? (
                          <input
                            value={item.name}
                            onChange={(event) =>
                              updateData((prev) => ({
                                ...prev,
                                items: {
                                  ...prev.items,
                                  shawarmaItems: updateItem(prev.items.shawarmaItems, index, {
                                    name: event.target.value,
                                  }),
                                },
                              }))
                            }
                            className={cn(inputBaseClass, "w-full")}
                          />
                        ) : (
                          <span>{item.name}</span>
                        )}
                        {editMode ? (
                          <input
                            value={item.price}
                            onChange={(event) =>
                              updateData((prev) => ({
                                ...prev,
                                items: {
                                  ...prev.items,
                                  shawarmaItems: updateItem(prev.items.shawarmaItems, index, {
                                    price: event.target.value,
                                  }),
                                },
                              }))
                            }
                            className={cn(inputBaseClass, "w-[6vh] text-right text-primary font-bold")}
                          />
                        ) : (
                          <span className="text-primary font-bold">${item.price}</span>
                        )}
                        {editMode ? (
                          <input
                            value={item.withGarlic ?? ""}
                            onChange={(event) =>
                              updateData((prev) => ({
                                ...prev,
                                items: {
                                  ...prev.items,
                                  shawarmaItems: updateItem(prev.items.shawarmaItems, index, {
                                    withGarlic: event.target.value,
                                  }),
                                },
                              }))
                            }
                            placeholder=""
                            className={cn(inputBaseClass, "w-[6vh] text-right text-primary font-bold")}
                          />
                        ) : (
                          <span className="text-primary font-bold">
                            {item.withGarlic ? `$${item.withGarlic}` : ""}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <MicroHeader>
                    {editMode ? (
                      <input
                        value={data.slideB.fishSectionTitle}
                        onChange={(event) =>
                          updateData((prev) => ({
                            ...prev,
                            slideB: { ...prev.slideB, fishSectionTitle: event.target.value },
                          }))
                        }
                        className={cn(inputBaseClass, "w-full text-primary-foreground border-white/30")}
                      />
                    ) : (
                      data.slideB.fishSectionTitle
                    )}
                  </MicroHeader>
                  <div className="mt-[0.6vh] space-y-[0.6vh]">
                    {data.items.fishItems.map((item, index) => (
                      <div key={index} className={listRowClass}>
                        {editMode ? (
                          <input
                            value={item.name}
                            onChange={(event) =>
                              updateData((prev) => ({
                                ...prev,
                                items: {
                                  ...prev.items,
                                  fishItems: updateItem(prev.items.fishItems, index, {
                                    name: event.target.value,
                                  }),
                                },
                              }))
                            }
                            className={cn(inputBaseClass, "w-full")}
                          />
                        ) : (
                          <span>{item.name}</span>
                        )}
                        {editMode ? (
                          <input
                            value={item.price}
                            onChange={(event) =>
                              updateData((prev) => ({
                                ...prev,
                                items: {
                                  ...prev.items,
                                  fishItems: updateItem(prev.items.fishItems, index, {
                                    price: event.target.value,
                                  }),
                                },
                              }))
                            }
                            className={cn(inputBaseClass, "w-[6vh] text-right text-primary font-bold")}
                          />
                        ) : (
                          <span className="text-primary font-bold">${item.price}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <MicroHeader>
                    {editMode ? (
                      <input
                        value={data.slideB.saladsSectionTitle}
                        onChange={(event) =>
                          updateData((prev) => ({
                            ...prev,
                            slideB: { ...prev.slideB, saladsSectionTitle: event.target.value },
                          }))
                        }
                        className={cn(inputBaseClass, "w-full text-primary-foreground border-white/30")}
                      />
                    ) : (
                      data.slideB.saladsSectionTitle
                    )}
                  </MicroHeader>
                  <div className="mt-[0.6vh] grid grid-cols-[1fr_auto_auto] gap-x-[1vh]">
                    {editMode ? (
                      <input
                        value={data.slideB.saladsHeaders[0]}
                        onChange={(event) =>
                          updateData((prev) => ({
                            ...prev,
                            slideB: {
                              ...prev.slideB,
                              saladsHeaders: [
                                event.target.value,
                                prev.slideB.saladsHeaders[1],
                                prev.slideB.saladsHeaders[2],
                              ],
                            },
                          }))
                        }
                        className={cn(inputBaseClass, "w-full", tableHeaderClass)}
                      />
                    ) : (
                      <span className={tableHeaderClass}>{data.slideB.saladsHeaders[0]}</span>
                    )}
                    {editMode ? (
                      <input
                        value={data.slideB.saladsHeaders[1]}
                        onChange={(event) =>
                          updateData((prev) => ({
                            ...prev,
                            slideB: {
                              ...prev.slideB,
                              saladsHeaders: [
                                prev.slideB.saladsHeaders[0],
                                event.target.value,
                                prev.slideB.saladsHeaders[2],
                              ],
                            },
                          }))
                        }
                        className={cn(inputBaseClass, "w-[6vh] text-right", tableHeaderClass)}
                      />
                    ) : (
                      <span className={cn(tableHeaderClass, "text-right")}>{data.slideB.saladsHeaders[1]}</span>
                    )}
                    {editMode ? (
                      <input
                        value={data.slideB.saladsHeaders[2]}
                        onChange={(event) =>
                          updateData((prev) => ({
                            ...prev,
                            slideB: {
                              ...prev.slideB,
                              saladsHeaders: [
                                prev.slideB.saladsHeaders[0],
                                prev.slideB.saladsHeaders[1],
                                event.target.value,
                              ],
                            },
                          }))
                        }
                        className={cn(inputBaseClass, "w-[6vh] text-right", tableHeaderClass)}
                      />
                    ) : (
                      <span className={cn(tableHeaderClass, "text-right")}>{data.slideB.saladsHeaders[2]}</span>
                    )}
                  </div>
                  <div className="mt-[0.4vh] space-y-[0.6vh]">
                    {data.items.saladSizes.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-[1fr_auto_auto] gap-x-[1vh] items-center text-[1.5vh]"
                      >
                        {editMode ? (
                          <input
                            value={item.name}
                            onChange={(event) =>
                              updateData((prev) => ({
                                ...prev,
                                items: {
                                  ...prev.items,
                                  saladSizes: updateItem(prev.items.saladSizes, index, {
                                    name: event.target.value,
                                  }),
                                },
                              }))
                            }
                            className={cn(inputBaseClass, "w-full")}
                          />
                        ) : (
                          <span>{item.name}</span>
                        )}
                        {editMode ? (
                          <input
                            value={item.small}
                            onChange={(event) =>
                              updateData((prev) => ({
                                ...prev,
                                items: {
                                  ...prev.items,
                                  saladSizes: updateItem(prev.items.saladSizes, index, {
                                    small: event.target.value,
                                  }),
                                },
                              }))
                            }
                            className={cn(inputBaseClass, "w-[6vh] text-right text-primary font-bold")}
                          />
                        ) : (
                          <span className="text-primary font-bold">${item.small}</span>
                        )}
                        {editMode ? (
                          <input
                            value={item.large}
                            onChange={(event) =>
                              updateData((prev) => ({
                                ...prev,
                                items: {
                                  ...prev.items,
                                  saladSizes: updateItem(prev.items.saladSizes, index, {
                                    large: event.target.value,
                                  }),
                                },
                              }))
                            }
                            className={cn(inputBaseClass, "w-[6vh] text-right text-primary font-bold")}
                          />
                        ) : (
                          <span className="text-primary font-bold">${item.large}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
