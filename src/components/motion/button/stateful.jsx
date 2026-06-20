"use client";;
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Loader2, X } from "lucide-react";
import { forwardRef, useLayoutEffect, useRef, useState } from "react";
import { EASE_OUT, EASE_OUT_CSS, SPRING_SWAP } from "@/lib/ease";
import { Button } from "./base";

const CASCADE_STAGGER = 0.025;
const ROLL_BLUR = "blur(6px)";

const CASCADE_LETTER_VARIANTS = {
  initial: { opacity: 0, y: "105%", filter: ROLL_BLUR },
  animate: (delay = 0) => ({
    opacity: 1,
    y: "0%",
    filter: "blur(0px)",
    transition: { ...SPRING_SWAP, delay },
  }),
  exit: (delay = 0) => ({
    opacity: 0,
    y: "-105%",
    filter: ROLL_BLUR,
    transition: { duration: 0.16, ease: EASE_OUT, delay: delay * 0.5 },
  }),
};

const ICON_VARIANTS = {
  initial: { opacity: 0, y: 14, filter: ROLL_BLUR },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: SPRING_SWAP,
  },
  exit: {
    opacity: 0,
    y: -14,
    filter: ROLL_BLUR,
    transition: { duration: 0.16, ease: EASE_OUT },
  },
};

function IconSlot({
  keyId,
  children
}) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      key={keyId}
      variants={ICON_VARIANTS}
      initial={reduce ? { opacity: 0 } : "initial"}
      animate={reduce ? { opacity: 1 } : "animate"}
      exit={reduce ? { opacity: 0 } : "exit"}
      transition={reduce ? { duration: 0.15 } : undefined}
      className="inline-grid shrink-0 place-items-center will-change-[opacity,filter,transform]">
      {children}
    </motion.span>
  );
}

function TextSlot({
  value,
  children
}) {
  const reduce = useReducedMotion();
  const measureRef = useRef(null);
  const [width, setWidth] = useState();
  const label = typeof children === "string" ? children : null;
  const cascade = label !== null && !reduce;

  useLayoutEffect(() => {
    const nextWidth = measureRef.current?.offsetWidth;
    if (!nextWidth) return;
    setWidth((currentWidth) =>
      currentWidth === nextWidth ? currentWidth : nextWidth);
  });

  return (
    <span
      className="relative inline-block overflow-hidden whitespace-nowrap align-bottom"
      style={{
        width,
        transition: reduce ? undefined : `width 220ms ${EASE_OUT_CSS}`,
      }}>
      <span
        ref={measureRef}
        aria-hidden
        className="invisible inline-block whitespace-nowrap">
        {children}
      </span>
      {cascade ? (
        <>
          <span className="sr-only">{label}</span>
          <AnimatePresence initial={false}>
            <motion.span
              key={`cascade-${value}`}
              aria-hidden
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute left-0 top-0 inline-block whitespace-pre">
              {label.split("").map((char, index) => (
                <motion.span
                  // biome-ignore lint/suspicious/noArrayIndexKey: position is the slot identity.
                  key={index}
                  custom={index * CASCADE_STAGGER}
                  variants={CASCADE_LETTER_VARIANTS}
                  className="inline-block whitespace-pre will-change-[opacity,filter,transform]">
                  {char}
                </motion.span>
              ))}
            </motion.span>
          </AnimatePresence>
        </>
      ) : (
        <AnimatePresence initial={false}>
          <motion.span
            key={`text-${value}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, filter: ROLL_BLUR }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -14, filter: ROLL_BLUR }}
            transition={reduce ? { duration: 0.15 } : SPRING_SWAP}
            className="absolute left-0 top-0 inline-block will-change-[opacity,filter,transform]">
            {children}
          </motion.span>
        </AnimatePresence>
      )}
    </span>
  );
}

export const StatefulButton = forwardRef(function StatefulButton(
  {
    state = "idle",
    children,
    loadingText = "Loading",
    successText = "Done",
    errorText = "Try again",
    icon,
    disabled,
    ...rest
  },
  ref,
) {
  const reduce = useReducedMotion();
  const isBusy = state === "loading";
  const stateText =
    state === "loading"
      ? loadingText
      : state === "success"
        ? successText
        : state === "error"
        ? errorText
        : children;
  const textKey =
    typeof stateText === "string" ? `${state}-${stateText}` : state;

  return (
    <Button ref={ref} disabled={disabled || isBusy} aria-busy={isBusy} {...rest}>
      <motion.span
        layout={!reduce}
        transition={SPRING_SWAP}
        aria-live="polite"
        className="relative inline-flex items-center justify-center gap-2 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          {state === "loading" ? (
            <IconSlot keyId="loading-icon">
              <Loader2 className="h-4 w-4 animate-spin" />
            </IconSlot>
          ) : null}
          {state === "success" ? (
            <IconSlot keyId="success-icon">
              <Check className="h-4 w-4" />
            </IconSlot>
          ) : null}
          {state === "error" ? (
            <IconSlot keyId="error-icon">
              <X className="h-4 w-4" />
            </IconSlot>
          ) : null}
        </AnimatePresence>

        <TextSlot value={textKey}>{stateText}</TextSlot>

        <AnimatePresence mode="popLayout" initial={false}>
          {state === "idle" && icon ? (
            <IconSlot keyId="idle-icon">{icon}</IconSlot>
          ) : null}
        </AnimatePresence>
      </motion.span>
    </Button>
  );
});
