import { motion, useInView, useAnimation, type Variant } from "framer-motion";
import { useEffect, useRef } from "react";

type Animation =
    | "fade-up"
    | "fade-in"
    | "slide-left"
    | "slide-right"
    | "scale-in"
    | "blur-in"
    | "count-up";

interface ScrollRevealProps {
    children: React.ReactNode;
    width?: "fit-content" | "100%";
    delay?: number;
    duration?: number;
    className?: string;
    animation?: Animation;
    once?: boolean;
}

const spring = { type: "spring", stiffness: 80, damping: 20 };
const smooth = { duration: 0.7, ease: [0.22, 1, 0.36, 1] };

const variants: Record<string, { hidden: Variant; visible: (d: number, dur?: number) => Variant }> = {
    "fade-up": {
        hidden: { opacity: 0, y: 40, filter: "blur(4px)" },
        visible: (d, dur) => ({ opacity: 1, y: 0, filter: "blur(0px)", transition: { ...smooth, duration: dur ?? 0.7, delay: d } }),
    },
    "fade-in": {
        hidden: { opacity: 0 },
        visible: (d, dur) => ({ opacity: 1, transition: { duration: dur ?? 0.8, ease: "easeOut", delay: d } }),
    },
    "slide-left": {
        hidden: { opacity: 0, x: -60 },
        visible: (d) => ({ opacity: 1, x: 0, transition: { ...spring, delay: d } }),
    },
    "slide-right": {
        hidden: { opacity: 0, x: 60 },
        visible: (d) => ({ opacity: 1, x: 0, transition: { ...spring, delay: d } }),
    },
    "scale-in": {
        hidden: { opacity: 0, scale: 0.9 },
        visible: (d) => ({ opacity: 1, scale: 1, transition: { ...spring, delay: d } }),
    },
    "blur-in": {
        hidden: { opacity: 0, filter: "blur(12px)", y: 15 },
        visible: (d, dur) => ({ opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: dur ?? 0.9, ease: [0.22, 1, 0.36, 1], delay: d } }),
    },
    "count-up": {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: (d) => ({ opacity: 1, y: 0, scale: 1, transition: { ...spring, delay: d } }),
    },
};

export const ScrollReveal = ({
    children,
    width = "100%",
    delay = 0,
    duration,
    className = "",
    animation = "fade-up",
    once = true,
}: ScrollRevealProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once, margin: "-60px" });
    const controls = useAnimation();

    useEffect(() => {
        if (isInView) controls.start("visible");
    }, [isInView, controls]);

    const v = variants[animation];

    return (
        <div ref={ref} style={{ position: "relative", width }} className={className}>
            <motion.div
                variants={{
                    hidden: v.hidden,
                    visible: v.visible(delay, duration),
                }}
                initial="hidden"
                animate={controls}
            >
                {children}
            </motion.div>
        </div>
    );
};
