import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import classes from "./animated_list.module.css";

// Adapted from React Bits' AnimatedList (reactbits.dev): items scale+fade in as
// they scroll into view, the list has fade gradients at its scroll edges, and
// a hovered/tapped/arrow-keyed item is "selected". Changes vs the original:
// - generic items: `renderItem(item, index, selected)` + `getKey(item)` (stable
//   keys instead of index keys, so live inserts/deletes animate correctly)
// - keyboard nav is scoped to the focused list (ArrowUp/Down + Enter), not a
//   window listener that also hijacks Tab — that would break open modals
// - CSS module + theme tokens instead of the hardcoded dark palette
// - list fills its parent's height (the parent decides how tall it is)

function AnimatedItem({ children, index, selected, onMouseEnter, onClick }) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.5 });
  return (
    <motion.div
      ref={ref}
      role="option"
      aria-selected={selected}
      data-index={index}
      className={classes.item}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

export default function AnimatedList({
  items = [],
  getKey = (_, i) => i,
  renderItem,
  onItemSelect,
  showGradients = true,
  className,
}) {
  const listRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(0);

  const updateGradients = (el) => {
    const { scrollTop, scrollHeight, clientHeight } = el;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1));
  };

  // Re-evaluate the edge gradients when the item count changes (an upload can
  // make the list overflow without any scroll event).
  useEffect(() => {
    if (listRef.current) updateGradients(listRef.current);
  }, [items.length]);

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setKeyboardNav(true);
      setSelectedIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setKeyboardNav(true);
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && selectedIndex >= 0 && selectedIndex < items.length) {
      e.preventDefault();
      onItemSelect?.(items[selectedIndex], selectedIndex);
    }
  };

  // Keep the keyboard-selected item in view (with a little edge margin).
  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
    const container = listRef.current;
    const el = container.querySelector(`[data-index="${selectedIndex}"]`);
    if (el) {
      const margin = 50;
      const top = el.offsetTop;
      const bottom = top + el.offsetHeight;
      if (top < container.scrollTop + margin) {
        container.scrollTo({ top: top - margin, behavior: "smooth" });
      } else if (bottom > container.scrollTop + container.clientHeight - margin) {
        container.scrollTo({ top: bottom - container.clientHeight + margin, behavior: "smooth" });
      }
    }
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav]);

  return (
    <div className={`${classes.container}${className ? ` ${className}` : ""}`}>
      <div
        ref={listRef}
        role="listbox"
        tabIndex={0}
        className={classes.list}
        onScroll={(e) => updateGradients(e.currentTarget)}
        onKeyDown={onKeyDown}
      >
        {items.map((item, index) => (
          <AnimatedItem
            key={getKey(item, index)}
            index={index}
            selected={selectedIndex === index}
            onMouseEnter={() => setSelectedIndex(index)}
            onClick={() => {
              setSelectedIndex(index);
              onItemSelect?.(item, index);
            }}
          >
            {renderItem(item, index, selectedIndex === index)}
          </AnimatedItem>
        ))}
      </div>
      {showGradients && (
        <>
          <div className={classes.topGradient} style={{ opacity: topGradientOpacity }} />
          <div className={classes.bottomGradient} style={{ opacity: bottomGradientOpacity }} />
        </>
      )}
    </div>
  );
}
