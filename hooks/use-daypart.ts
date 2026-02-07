"use client";

import { useState, useEffect } from "react";

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type DaypartOverride = "breakfast" | "regular" | null;

export function useDaypart() {
  const [isBreakfast, setIsBreakfast] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>("monday");
  const [daypartOverride, setDaypartOverrideState] = useState<DaypartOverride>(null);
  const [dayOverride, setDayOverrideState] = useState<DayOfWeek | null>(null);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const params = new URLSearchParams(window.location.search);
      const forcedDaypart = params.get("daypart");
      const forcedDay = params.get("day");
      const storedOverride =
        typeof window !== "undefined"
          ? window.localStorage.getItem("daypartOverride")
          : null;
      const storedDayOverride =
        typeof window !== "undefined"
          ? window.localStorage.getItem("dayOverride")
          : null;
      const days: DayOfWeek[] = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      const normalizedStored =
        storedOverride === "breakfast" || storedOverride === "regular"
          ? storedOverride
          : null;
      const normalizedParam =
        forcedDaypart?.toLowerCase() === "breakfast" || forcedDaypart?.toLowerCase() === "regular"
          ? (forcedDaypart.toLowerCase() as Exclude<DaypartOverride, null>)
          : null;
      const resolvedOverride = normalizedStored ?? normalizedParam;
      if (resolvedOverride !== daypartOverride) {
        setDaypartOverrideState(resolvedOverride);
      }

      const normalizeDay = (value: string | null): DayOfWeek | null => {
        if (!value) return null;
        const normalizedDay = value.toLowerCase();
        return days.includes(normalizedDay as DayOfWeek)
          ? (normalizedDay as DayOfWeek)
          : null;
      };
      const normalizedStoredDay = normalizeDay(storedDayOverride);
      const normalizedParamDay = normalizeDay(forcedDay);
      const resolvedDayOverride = normalizedStoredDay ?? normalizedParamDay;
      if (resolvedDayOverride !== dayOverride) {
        setDayOverrideState(resolvedDayOverride);
      }

      if (resolvedOverride) {
        setIsBreakfast(resolvedOverride === "breakfast");
      } else {
        // Breakfast until 11:00 AM
        setIsBreakfast(hours < 11);
      }

      setDayOfWeek(resolvedDayOverride ?? days[now.getDay()]);
    };

    checkTime();
    // Check every minute
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [dayOverride, daypartOverride]);

  const setDaypartOverride = (value: DaypartOverride) => {
    if (typeof window !== "undefined") {
      if (value) {
        window.localStorage.setItem("daypartOverride", value);
      } else {
        window.localStorage.removeItem("daypartOverride");
      }
    }
    setDaypartOverrideState(value);
  };

  const setDayOverride = (value: DayOfWeek | null) => {
    if (typeof window !== "undefined") {
      if (value) {
        window.localStorage.setItem("dayOverride", value);
      } else {
        window.localStorage.removeItem("dayOverride");
      }
    }
    setDayOverrideState(value);
  };

  return {
    isBreakfast,
    dayOfWeek,
    daypartOverride,
    setDaypartOverride,
    dayOverride,
    setDayOverride,
  };
}
