/**
 * Motion Design Showcase
 * Demonstrating Material Design 3.0 motion principles and patterns
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Wind,
  Waves,
  Sparkles,
  Heart,
  Star,
  Award,
  Target,
  Compass,
  Layers,
  Grid3X3,
  Move,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Settings,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  User,
  MessageCircle,
  Bell,
  Calendar,
  MapPin,
  Loader,
  CheckCircle,
  X,
  Plus,
  Minus,
  Search,
  Filter,
  Menu,
  Maximize,
  Minimize
} from 'lucide-react';

interface MotionPreset {
  name: string;
  duration: number;
  easing: number[];
  description: string;
  category: 'entrance' | 'exit' | 'emphasis' | 'transition';
}

interface AnimationDemo {
  name: string;
  component: React.ReactNode;
  description: string;
  category: string;
}

const MotionDesignShowcase: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState('overview');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showGrid, setShowGrid] = useState(false);

  // Material Design 3.0 Motion Presets
  const motionPresets: MotionPreset[] = [
    {
      name: 'Emphasized',
      duration: 500,
      easing: [0.05, 0.7, 0.1, 1.0],
      description: 'For important state changes and expressive moments',
      category: 'emphasis'
    },
    {
      name: 'Standard',
      duration: 300,
      easing: [0.2, 0.0, 0.0, 1.0],
      description: 'For common interactions and state changes',
      category: 'transition'
    },
    {
      name: 'Emphasized Decelerate',
      duration: 400,
      easing: [0.05, 0.7, 0.1, 1.0],
      description: 'For elements entering the screen',
      category: 'entrance'
    },
    {
      name: 'Emphasized Accelerate',
      duration: 200,
      easing: [0.3, 0.0, 0.8, 0.15],
      description: 'For elements exiting the screen',
      category: 'exit'
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.2, 0.0, 0.0, 1.0]
      }
    }
  };

  const cardVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: [0.2, 0.0, 0.0, 1.0]
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1,
        ease: [0.2, 0.0, 0.0, 1.0]
      }
    }
  };

  // Interactive button animation
  const ButtonDemo = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    return (
      <motion.div className="space-y-4">
        <h3 className="text-lg font-semibold">Interactive Button States</h3>
        <div className="flex space-x-4">
          <motion.button
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
            variants={cardVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            transition={{ duration: 0.2, ease: [0.2, 0.0, 0.0, 1.0] }}
          >
            Hover & Press Me
          </motion.button>

          <motion.button
            className="px-6 py-3 border border-primary text-primary rounded-lg font-medium"
            whileHover={{
              backgroundColor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            Outlined Button
          </motion.button>
        </div>

        <div className="text-sm text-muted-foreground">
          State: {isPressed ? 'Pressed' : isHovered ? 'Hovered' : 'Normal'}
        </div>
      </motion.div>
    );
  };

  // Stagger animation demo
  const StaggerDemo = () => {
    const [items, setItems] = useState([1, 2, 3, 4, 5]);

    const addItem = () => setItems([...items, items.length + 1]);
    const removeItem = () => setItems(items.slice(0, -1));

    return (
      <motion.div className="space-y-4">
        <h3 className="text-lg font-semibold">Staggered Animations</h3>
        <div className="flex space-x-2">
          <motion.button
            className="px-4 py-2 bg-green-600 text-white rounded"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addItem}
          >
            <Plus className="h-4 w-4" />
          </motion.button>
          <motion.button
            className="px-4 py-2 bg-red-600 text-white rounded"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={removeItem}
            disabled={items.length === 0}
          >
            <Minus className="h-4 w-4" />
          </motion.button>
        </div>

        <motion.div
          className="flex flex-wrap gap-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item}
                className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold"
                variants={itemVariants}
                layout
                exit={{
                  scale: 0,
                  opacity: 0,
                  transition: { duration: 0.2 }
                }}
              >
                {item}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    );
  };

  // Morphing shapes demo
  const MorphingDemo = () => {
    const [shape, setShape] = useState<'circle' | 'square' | 'triangle'>('circle');

    const shapes = {
      circle: { borderRadius: '50%', rotate: 0 },
      square: { borderRadius: '0%', rotate: 0 },
      triangle: { borderRadius: '0%', rotate: 180 }
    };

    return (
      <motion.div className="space-y-4">
        <h3 className="text-lg font-semibold">Shape Morphing</h3>
        <div className="flex space-x-2">
          {(['circle', 'square', 'triangle'] as const).map((shapeType) => (
            <motion.button
              key={shapeType}
              className={`px-4 py-2 rounded capitalize ${
                shape === shapeType ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShape(shapeType)}
            >
              {shapeType}
            </motion.button>
          ))}
        </div>

        <div className="flex justify-center">
          <motion.div
            className="w-24 h-24 bg-gradient-to-br from-primary to-primary/60"
            animate={shapes[shape]}
            transition={{
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94] // Material emphasized easing
            }}
          />
        </div>
      </motion.div>
    );
  };

  // Page transition demo
  const PageTransitionDemo = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const pages = [1, 2, 3];

    const pageVariants = {
      initial: { opacity: 0, x: 100 },
      in: { opacity: 1, x: 0 },
      out: { opacity: 0, x: -100 }
    };

    const pageTransition = {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    };

    return (
      <motion.div className="space-y-4">
        <h3 className="text-lg font-semibold">Page Transitions</h3>
        <div className="flex items-center space-x-4">
          <motion.button
            className="p-2 rounded-full bg-muted"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>

          <div className="relative w-64 h-32 border rounded-lg overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10"
                variants={pageVariants}
                initial="initial"
                animate="in"
                exit="out"
                transition={pageTransition}
              >
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">Page {currentPage}</div>
                  <div className="text-sm text-muted-foreground">
                    {currentPage === 1 && "Welcome to the motion showcase"}
                    {currentPage === 2 && "Exploring Material Design principles"}
                    {currentPage === 3 && "Advanced animation techniques"}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.button
            className="p-2 rounded-full bg-muted"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentPage(Math.min(pages.length, currentPage + 1))}
            disabled={currentPage === pages.length}
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>

        <div className="flex justify-center space-x-2">
          {pages.map((page) => (
            <motion.button
              key={page}
              className={`w-2 h-2 rounded-full ${
                currentPage === page ? 'bg-primary' : 'bg-muted'
              }`}
              whileHover={{ scale: 1.2 }}
              onClick={() => setCurrentPage(page)}
            />
          ))}
        </div>
      </motion.div>
    );
  };

  // Loading states demo
  const LoadingDemo = () => {
    const [isLoading, setIsLoading] = useState(false);

    const startLoading = () => {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 3000);
    };

    return (
      <motion.div className="space-y-4">
        <h3 className="text-lg font-semibold">Loading States</h3>
        <motion.button
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startLoading}
          disabled={isLoading}
        >
          {isLoading ? (
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span>Loading...</span>
            </motion.div>
          ) : (
            'Start Loading'
          )}
        </motion.button>

        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  className="w-2 h-2 bg-primary rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.5, 1]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0
                  }}
                />
                <motion.div
                  className="w-2 h-2 bg-primary rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.5, 1]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0.2
                  }}
                />
                <motion.div
                  className="w-2 h-2 bg-primary rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.5, 1]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0.4
                  }}
                />
              </div>

              <motion.div
                className="w-full bg-muted rounded-full h-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="bg-primary h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3, ease: 'easeInOut' }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Gesture-based animations
  const GestureDemo = () => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotate = useTransform(x, [-100, 100], [-10, 10]);

    return (
      <motion.div className="space-y-4">
        <h3 className="text-lg font-semibold">Gesture-Based Animations</h3>
        <div className="flex justify-center">
          <motion.div
            className="w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-lg cursor-grab active:cursor-grabbing flex items-center justify-center text-white font-bold"
            style={{ x, y, rotate }}
            drag
            dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
            whileDrag={{ scale: 1.1 }}
            dragElastic={0.2}
          >
            Drag Me
          </motion.div>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          Position: ({Math.round(x.get())}, {Math.round(y.get())})
        </div>
      </motion.div>
    );
  };

  const demos: AnimationDemo[] = [
    {
      name: 'Buttons',
      component: <ButtonDemo />,
      description: 'Interactive button states with hover and press animations',
      category: 'Interaction'
    },
    {
      name: 'Stagger',
      component: <StaggerDemo />,
      description: 'Staggered entrance animations for lists and grids',
      category: 'Layout'
    },
    {
      name: 'Morphing',
      component: <MorphingDemo />,
      description: 'Shape morphing with smooth transitions',
      category: 'Transform'
    },
    {
      name: 'Page Transitions',
      component: <PageTransitionDemo />,
      description: 'Smooth page transitions with directional movement',
      category: 'Navigation'
    },
    {
      name: 'Loading States',
      component: <LoadingDemo />,
      description: 'Loading indicators and progress animations',
      category: 'Feedback'
    },
    {
      name: 'Gestures',
      component: <GestureDemo />,
      description: 'Drag and gesture-based interactions',
      category: 'Interaction'
    }
  ];

  const renderActiveDemo = () => {
    if (activeDemo === 'overview') {
      return (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {demos.map((demo) => (
            <motion.div
              key={demo.name}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="border rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveDemo(demo.name.toLowerCase())}
            >
              <h4 className="font-semibold mb-2">{demo.name}</h4>
              <p className="text-sm text-muted-foreground mb-3">{demo.description}</p>
              <div className="text-xs text-primary font-medium">{demo.category}</div>
            </motion.div>
          ))}
        </motion.div>
      );
    }

    const demo = demos.find(d => d.name.toLowerCase() === activeDemo);
    return demo ? demo.component : <div>Demo not found</div>;
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Motion Design Showcase
          </h1>
          <p className="text-xl text-muted-foreground">
            Material Design 3.0 motion principles in action
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          className="flex items-center justify-between mb-8 p-4 bg-card rounded-lg border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveDemo('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeDemo === 'overview'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              Overview
            </button>
            {demos.map((demo) => (
              <button
                key={demo.name}
                onClick={() => setActiveDemo(demo.name.toLowerCase())}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeDemo === demo.name.toLowerCase()
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                {demo.name}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm">Speed:</span>
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="px-2 py-1 border rounded"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>

            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded ${showGrid ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        {/* Motion Presets Reference */}
        <motion.div
          className="mb-8 p-6 bg-muted/50 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Material Design Motion Presets
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {motionPresets.map((preset) => (
              <div key={preset.name} className="text-sm">
                <div className="font-medium">{preset.name}</div>
                <div className="text-muted-foreground">
                  {preset.duration}ms • {preset.category}
                </div>
                <div className="text-xs mt-1">{preset.description}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Demo Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDemo}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {renderActiveDemo()}
          </motion.div>
        </AnimatePresence>

        {/* Grid Overlay */}
        {showGrid && (
          <div className="fixed inset-0 pointer-events-none z-50">
            <div className="absolute inset-0 opacity-10">
              <div className="h-full w-full" style={{
                backgroundImage: `
                  linear-gradient(to right, #000 1px, transparent 1px),
                  linear-gradient(to bottom, #000 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MotionDesignShowcase;