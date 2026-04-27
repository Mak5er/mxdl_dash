"use client";

import { useEffect, useRef, useState } from "react";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
};

export function Reveal({ children, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} transition duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

type CountUpValueProps = {
  value: number | null | undefined;
  fallback?: string;
  className?: string;
};

export function CountUpValue({
  value,
  fallback = "Not available",
  className,
}: CountUpValueProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const displayValueRef = useRef(0);
  const [active, setActive] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active || typeof value !== "number" || !Number.isFinite(value)) {
      return;
    }

    const duration = 1300;
    const startValue = displayValueRef.current;
    const delta = value - startValue;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = Math.round(startValue + delta * eased);
      displayValueRef.current = nextValue;
      setDisplayValue(nextValue);

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        displayValueRef.current = value;
        setDisplayValue(value);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, value]);

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return (
      <span ref={ref} className={className}>
        {fallback}
      </span>
    );
  }

  return (
    <span ref={ref} className={className}>
      {displayValue.toLocaleString("en")}
    </span>
  );
}
