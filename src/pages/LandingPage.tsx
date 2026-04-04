import React, { useEffect, useState, useCallback, forwardRef, useImperativeHandle, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, type Transition, type VariantLabels, type Target, type TargetAndTransition, type Variants } from 'framer-motion';
import { Briefcase, Activity, ShieldCheck, Cpu, ArrowRight, Twitter, Linkedin, Github } from 'lucide-react';
import { Scene3D } from '../components/Scene3D';
import LiquidEther from './LiquidEther';

function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(" ");
}

interface RotatingTextRef {
  next: () => void;
  previous: () => void;
  jumpTo: (index: number) => void;
  reset: () => void;
}

interface RotatingTextProps extends Omit<React.ComponentPropsWithoutRef<typeof motion.span>, "children" | "transition" | "initial" | "animate" | "exit"> {
  texts: string[];
  transition?: Transition;
  initial?: boolean | Target | VariantLabels;
  animate?: boolean | VariantLabels | TargetAndTransition;
  exit?: Target | VariantLabels;
  animatePresenceMode?: "sync" | "wait";
  animatePresenceInitial?: boolean;
  rotationInterval?: number;
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center" | "random" | number;
  loop?: boolean;
  auto?: boolean;
  splitBy?: "characters" | "words" | "lines" | string;
  onNext?: (index: number) => void;
  mainClassName?: string;
  splitLevelClassName?: string;
  elementLevelClassName?: string;
}

const RotatingText = forwardRef<RotatingTextRef, RotatingTextProps>(
  (
    {
      texts,
      transition = { type: "spring", damping: 25, stiffness: 300 },
      initial = { y: "100%", opacity: 0 },
      animate = { y: 0, opacity: 1 },
      exit = { y: "-120%", opacity: 0 },
      animatePresenceMode = "wait",
      animatePresenceInitial = false,
      rotationInterval = 2200,
      staggerDuration = 0.01,
      staggerFrom = "last",
      loop = true,
      auto = true,
      splitBy = "characters",
      onNext,
      mainClassName,
      splitLevelClassName,
      elementLevelClassName,
      ...rest
    },
    ref
  ) => {
    const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);

    const splitIntoCharacters = (text: string): string[] => {
      if (typeof Intl !== "undefined" && Intl.Segmenter) {
        try {
          const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
          return Array.from(segmenter.segment(text), (segment) => segment.segment);
        } catch (error) {
          return text.split('');
        }
      }
      return text.split('');
    };

    const elements = useMemo(() => {
      const currentText: string = texts[currentTextIndex] ?? '';
      if (splitBy === "characters") {
        const words = currentText.split(/(\s+)/);
        let charCount = 0;
        return words.filter(part => part.length > 0).map((part) => {
          const isSpace = /^\s+$/.test(part);
          const chars = isSpace ? [part] : splitIntoCharacters(part);
          const startIndex = charCount;
          charCount += chars.length;
          return { characters: chars, isSpace: isSpace, startIndex: startIndex };
        });
      }
      if (splitBy === "words") {
        return currentText.split(/(\s+)/).filter(word => word.length > 0).map((word, i) => ({
          characters: [word], isSpace: /^\s+$/.test(word), startIndex: i
        }));
      }
      if (splitBy === "lines") {
        return currentText.split('\n').map((line, i) => ({
          characters: [line], isSpace: false, startIndex: i
        }));
      }
      return currentText.split(splitBy).map((part, i) => ({
        characters: [part], isSpace: false, startIndex: i
      }));
    }, [texts, currentTextIndex, splitBy]);

    const totalElements = useMemo(() => elements.reduce((sum, el) => sum + el.characters.length, 0), [elements]);

    const getStaggerDelay = useCallback(
      (index: number, total: number): number => {
        if (total <= 1 || !staggerDuration) return 0;
        const stagger = staggerDuration;
        switch (staggerFrom) {
          case "first": return index * stagger;
          case "last": return (total - 1 - index) * stagger;
          case "center":
            const center = (total - 1) / 2;
            return Math.abs(center - index) * stagger;
          case "random": return Math.random() * (total - 1) * stagger;
          default:
            if (typeof staggerFrom === 'number') {
              const fromIndex = Math.max(0, Math.min(staggerFrom, total - 1));
              return Math.abs(fromIndex - index) * stagger;
            }
            return index * stagger;
        }
      },
      [staggerFrom, staggerDuration]
    );

    const handleIndexChange = useCallback(
      (newIndex: number) => {
        setCurrentTextIndex(newIndex);
        onNext?.(newIndex);
      },
      [onNext]
    );

    const next = useCallback(() => {
      const nextIndex = currentTextIndex === texts.length - 1 ? (loop ? 0 : currentTextIndex) : currentTextIndex + 1;
      if (nextIndex !== currentTextIndex) handleIndexChange(nextIndex);
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    const previous = useCallback(() => {
      const prevIndex = currentTextIndex === 0 ? (loop ? texts.length - 1 : currentTextIndex) : currentTextIndex - 1;
      if (prevIndex !== currentTextIndex) handleIndexChange(prevIndex);
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    const jumpTo = useCallback(
      (index: number) => {
        const validIndex = Math.max(0, Math.min(index, texts.length - 1));
        if (validIndex !== currentTextIndex) handleIndexChange(validIndex);
      },
      [texts.length, currentTextIndex, handleIndexChange]
    );

    const reset = useCallback(() => {
      if (currentTextIndex !== 0) handleIndexChange(0);
    }, [currentTextIndex, handleIndexChange]);

    useImperativeHandle(ref, () => ({ next, previous, jumpTo, reset }), [next, previous, jumpTo, reset]);

    useEffect(() => {
      if (!auto || texts.length <= 1) return;
      const intervalId = setInterval(next, rotationInterval);
      return () => clearInterval(intervalId);
    }, [next, rotationInterval, auto, texts.length]);

    return (
      <motion.span className={cn("inline-flex flex-wrap whitespace-pre-wrap relative align-bottom pb-[10px]", mainClassName)} {...rest} layout>
        <span className="sr-only">{texts[currentTextIndex]}</span>
        <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
          <motion.div
            key={currentTextIndex}
            className={cn("inline-flex flex-wrap relative", splitBy === "lines" ? "flex-col items-start w-full" : "flex-row items-baseline")}
            layout
            aria-hidden="true"
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {elements.map((elementObj, elementIndex) => (
              <span key={elementIndex} className={cn("inline-flex", splitBy === 'lines' ? 'w-full' : '', splitLevelClassName)} style={{ whiteSpace: 'pre' }}>
                {elementObj.characters.map((char, charIndex) => {
                  const globalIndex = elementObj.startIndex + charIndex;
                  return (
                    <motion.span
                      key={`${char}-${charIndex}`}
                      initial={initial}
                      animate={animate}
                      exit={exit}
                      transition={{
                        ...transition,
                        delay: getStaggerDelay(globalIndex, totalElements),
                      }}
                      className={cn("inline-block leading-none tracking-tight", elementLevelClassName)}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </motion.span>
                  );
                })}
              </span>
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.span>
    );
  }
);
RotatingText.displayName = "RotatingText";


const FeatureNode = ({ 
  icon: Icon, 
  title, 
  description, 
  delay, 
  isLast 
}: { 
  icon: any, 
  title: string, 
  description: string, 
  delay: number, 
  isLast?: boolean 
}) => {
  return (
    <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8 w-full max-w-4xl mx-auto group">
      {/* Connector Line (Desktop) */}
      {!isLast && (
        <motion.div 
          initial={{ height: 0 }}
          whileInView={{ height: 'calc(100% + 4rem)' }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.5, delay: delay + 0.5, ease: "easeInOut" }}
          className="hidden md:block absolute left-[3.25rem] top-24 w-[2px] bg-gradient-to-b from-border via-foreground/20 to-transparent z-0 origin-top" 
        />
      )}
      
      {/* Connector Line (Mobile) */}
      {!isLast && (
        <motion.div 
          initial={{ height: 0 }}
          whileInView={{ height: 'calc(100% + 3rem)' }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.5, delay: delay + 0.5, ease: "easeInOut" }}
          className="block md:hidden absolute left-8 top-20 w-[2px] bg-gradient-to-b from-border via-foreground/20 to-transparent z-0 origin-top" 
        />
      )}

      {/* Icon Node */}
      <motion.div 
        initial={{ scale: 0, opacity: 0, rotate: -20 }}
        whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
        whileHover={{ scale: 1.1, rotate: 10, boxShadow: "0 0 20px rgba(255,255,255,0.2)" }}
        animate={{ y: [0, -5, 0] }}
        transition={{ 
          type: "spring", stiffness: 300, damping: 20, delay,
          y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: delay }
        }}
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 shrink-0 w-16 h-16 rounded-2xl bg-secondary/80 border-2 border-border/80 flex items-center justify-center backdrop-blur-xl shadow-lg cursor-pointer"
      >
        <Icon className="w-7 h-7 text-foreground transition-colors group-hover:text-foreground" />
      </motion.div>

      {/* Content */}
      <motion.div 
        initial={{ x: 20, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        whileHover={{ scale: 1.02, x: 5 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ ease: "easeOut", duration: 0.6, delay: delay + 0.1 }}
        className="flex-1 pt-2 md:pt-0 pb-12 md:pb-0 relative cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/5 to-transparent rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
        <div className="relative bg-secondary/30 border border-border/50 rounded-2xl p-8 backdrop-blur-md overflow-hidden transition-all duration-300 hover:bg-secondary/40 hover:border-foreground/30 hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.1)]">
          
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3 tracking-tight">{title}</h3>
          <p className="text-muted-foreground leading-relaxed text-base">
            {description}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const JobblifyLanding: React.FC = () => {
  const navigate = useNavigate();

  const contentDelay = 0.2;
  const itemDelayIncrement = 0.1;

  const bannerVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay: contentDelay } }
  };
  const headlineVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", delay: contentDelay + itemDelayIncrement } }
  };
  const subHeadlineVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", delay: contentDelay + itemDelayIncrement * 2 } }
  };
  const ctaVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 25, delay: contentDelay + itemDelayIncrement * 3 } }
  };

  return (
    <div className="min-h-screen relative bg-background text-foreground flex flex-col overflow-x-hidden selection:bg-foreground selection:text-background">
      <Scene3D />
      <div className="absolute top-0 left-0 w-full h-[800px] z-0 pointer-events-none opacity-60">
        <LiquidEther
          colors={[ '#ffffff', '#e0e0e0', '#cccccc' ]}
          mouseForce={20}
          cursorSize={100}
          isViscous
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>

      <main className="flex-grow flex flex-col relative z-10 w-full pt-32 pb-32">
        {/* HERO SECTION */}
        <div className="flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto w-full min-h-[60vh]">
          <motion.div
            variants={bannerVariants}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <div className="bg-secondary/40 border border-border/50 text-muted-foreground px-5 py-2 rounded-full text-sm font-medium hover:border-foreground/30 transition-all cursor-default inline-flex items-center gap-2 backdrop-blur-xl shadow-2xl">
              <Activity className="w-4 h-4 text-foreground" />
              <span className="text-foreground/90">v2.0 Protocol Live</span>
              <span className="w-1 h-1 rounded-full bg-foreground/30 mx-1"></span>
              Enhanced Node Matching
            </div>
          </motion.div>

          <motion.h1
            variants={headlineVariants}
            initial="hidden"
            animate="visible"
            className="text-5xl sm:text-6xl md:text-7xl font-bold text-foreground tracking-tight leading-[1.1] mb-8"
          >
            Decentralized Work,<br className="hidden md:block" /> Powered by{' '}
            <span className="inline-block h-[1.2em] overflow-hidden align-bottom">
              <RotatingText
                texts={['AI Agents.', 'PYUSD.', 'Web3.']}
                mainClassName="text-foreground"
                staggerFrom="last"
                initial={{ y: "-100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "110%", opacity: 0 }}
                staggerDuration={0.02}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                rotationInterval={2500}
                splitBy="characters"
                auto={true}
                loop={true}
              />
            </span>
          </motion.h1>

          <motion.p
            variants={subHeadlineVariants}
            initial="hidden"
            animate="visible"
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-14 leading-relaxed font-medium"
          >
            Jobblify is the next-generation freelance protocol. We connect top-tier talent with ambitious publishers, ensuring trust through immutable smart contracts and algorithmic verification.
          </motion.p>

          <motion.div
            variants={ctaVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <button
              onClick={() => navigate('/dashboard')}
              className="group bg-foreground text-background px-8 py-4 rounded-xl text-base font-semibold hover:opacity-90 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)] flex items-center gap-2"
            >
              Enter Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a 
              href="#protocol-chain" 
              className="px-8 py-4 rounded-xl text-base font-semibold text-foreground border border-border hover:bg-secondary/50 transition-colors backdrop-blur-md"
            >
              Explore Protocol
            </a>
          </motion.div>
        </div>

        {/* CHAINED FEATURES SECTION */}
        <div id="protocol-chain" className="w-full px-6 mt-32">
          <div className="max-w-4xl mx-auto mb-20 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">
              The Jobblify Chain
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Our infrastructure is designed sequentially to eliminate friction, guarantee payment, and perfectly match talent.
            </p>
          </div>

          <div className="flex flex-col gap-8 md:gap-16 relative">
            <FeatureNode 
              icon={Cpu}
              title="Autonomous Node Matching"
              description="Our specialized AI nodes instantly analyze your task requirements and cross-reference them against a decentralized ledger of verified freelancer profiles, ensuring a highly accurate talent alignment."
              delay={0.1}
            />
            
            <FeatureNode 
              icon={Briefcase}
              title="Agent Verification Protocol"
              description="Quality assurance isn't subjective. Our deployment agents cryptographically verify portfolio submissions, parse eligibility criteria, and enforce task prerequisites before bids are even placed."
              delay={0.2}
            />

            <FeatureNode 
              icon={ShieldCheck}
              title="PYUSD Escrow & Settlement"
              description="Capital is secured upfront via PayPal USD (PYUSD) smart contracts. Once the AI oracle validates completion, funds are released automatically and transparently—zero disputes, zero latency."
              delay={0.3}
              isLast={true}
            />
          </div>
        </div>
      </main>

      <footer className="relative w-full border-t border-border bg-background pt-16 pb-8 px-6 z-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center space-x-2">
            <Briefcase className="text-foreground w-6 h-6" />
            <span className="text-xl font-bold text-foreground tracking-tight">jobblify</span>
          </div>
          
          <div className="flex space-x-6 text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="hover:text-foreground transition-colors"><Linkedin className="w-5 h-5" /></a>
            <a href="#" className="hover:text-foreground transition-colors"><Github className="w-5 h-5" /></a>
          </div>
        </div>
        
        <div className="max-w-5xl mx-auto mt-8 border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Jobblify Protocol. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default JobblifyLanding;