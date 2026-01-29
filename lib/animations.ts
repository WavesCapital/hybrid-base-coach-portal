import { theme } from "./theme";

/** Staggered entrance animation for list items */
export const staggeredItem = (index: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { ...theme.spring, delay: index * 0.05 },
  },
});

/** Expand/collapse animation for collapsible sections */
export const expandCollapse = {
  initial: { height: 0, opacity: 0 },
  animate: {
    height: "auto" as const,
    opacity: 1,
    transition: theme.spring,
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: theme.springLight,
  },
};

/** Slide-up animation for drawers/modals */
export const slideUp = {
  initial: { y: "100%" },
  animate: {
    y: 0,
    transition: theme.spring,
  },
  exit: {
    y: "100%",
    transition: theme.springLight,
  },
};

/** Backdrop fade animation */
export const backdropFade = {
  initial: { opacity: 0 },
  animate: { opacity: 0.8 },
  exit: { opacity: 0 },
};
