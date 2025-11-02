import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Code, Eye, Sparkles, Check, X } from 'lucide-react';

interface AnimationTemplate {
  id?: string;
  name: string;
  description?: string;
  category: string;
  patternType: string;
  durationType: string;
  easing: string;
  keyframes: Array<Record<string, any>>;
  animationProperties?: Record<string, any>;
  tags?: string[];
}

interface MotionAnimationGeneratorProps {
  onComplete?: (animation: AnimationTemplate) => void;
  initialPrompt?: string;
}

export const MotionAnimationGenerator: React.FC<MotionAnimationGeneratorProps> = ({
  onComplete,
  initialPrompt = ''
}) => {
  const [step, setStep] = useState(1);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [componentContext, setComponentContext] = useState('');
  const [category, setCategory] = useState('entrance');
  const [pattern, setPattern] = useState('fade');
  
  // AI generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAnimation, setGeneratedAnimation] = useState<AnimationTemplate | null>(null);
  const [aiReasoning, setAiReasoning] = useState('');
  
  // Preview
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
  
  // Customization
  const [customAnimation, setCustomAnimation] = useState<AnimationTemplate | null>(null);

  const categories = [
    { value: 'entrance', label: 'Entrance', icon: '📥', description: 'Elements entering the screen' },
    { value: 'exit', label: 'Exit', icon: '📤', description: 'Elements leaving the screen' },
    { value: 'transition', label: 'Transition', icon: '🔄', description: 'State or view transitions' },
    { value: 'emphasis', label: 'Emphasis', icon: '⭐', description: 'Drawing attention' },
    { value: 'utility', label: 'Utility', icon: '🔧', description: 'Functional animations' }
  ];

  const patterns = [
    { value: 'fade', label: 'Fade', description: 'Simple opacity changes' },
    { value: 'container_transform', label: 'Container Transform', description: 'Container size/position changes' },
    { value: 'shared_axis', label: 'Shared Axis', description: 'Movement along X/Y axis' },
    { value: 'fade_through', label: 'Fade Through', description: 'Fade out then in' },
    { value: 'slide', label: 'Slide', description: 'Slide in/out' },
    { value: 'scale', label: 'Scale', description: 'Size changes' },
    { value: 'elevation_change', label: 'Elevation', description: 'Shadow/depth changes' }
  ];

  const durations = [
    { value: 'extra_short1', label: 'Extra Short (50ms)', use: 'Icon changes' },
    { value: 'short1', label: 'Short (150ms)', use: 'Small areas' },
    { value: 'medium1', label: 'Medium (300ms)', use: 'Default motion' },
    { value: 'long1', label: 'Long (500ms)', use: 'Large areas' }
  ];

  const easings = [
    { value: 'emphasized', label: 'Emphasized', description: 'Default MD3 curve' },
    { value: 'emphasized_decelerate', label: 'Decelerate', description: 'Incoming elements' },
    { value: 'emphasized_accelerate', label: 'Accelerate', description: 'Outgoing elements' },
    { value: 'standard', label: 'Standard', description: 'Alternative curve' }
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate AI generation (replace with actual Ollama API call)
      const response = await fetch('/api/animations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          componentContext,
          category,
          patternType: pattern
        })
      });

      const data = await response.json();
      setGeneratedAnimation(data.animation);
      setCustomAnimation(data.animation);
      setAiReasoning(data.reasoning);
      setStep(3);
    } catch (error) {
      console.error('Generation error:', error);
      // Fallback to manual creation
      setGeneratedAnimation({
        name: `${pattern}-animation`,
        category,
        patternType: pattern,
        durationType: 'medium1',
        easing: 'emphasized',
        keyframes: [
          { offset: 0, opacity: 0, transform: 'translateY(20px)' },
          { offset: 1, opacity: 1, transform: 'translateY(0)' }
        ]
      });
      setStep(3);
    } finally {
      setIsGenerating(false);
    }
  };

  const playAnimation = () => {
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 2000);
  };

  const generateCSS = (animation: AnimationTemplate | null) => {
    if (!animation) return '';
    
    const keyframeCSS = animation.keyframes.map((kf, i) => {
      const offset = (kf.offset * 100).toFixed(0);
      const props = Object.entries(kf)
        .filter(([key]) => key !== 'offset')
        .map(([key, value]) => `  ${key}: ${value};`)
        .join('\n');
      return `  ${offset}% {\n${props}\n  }`;
    }).join('\n\n');

    return `@keyframes ${animation.name} {\n${keyframeCSS}\n}\n\n.${animation.name} {\n  animation: ${animation.name} var(--md-motion-duration-${animation.durationType}) var(--md-motion-easing-${animation.easing}) both;\n}`;
  };

  const handleSave = async () => {
    if (!customAnimation) return;
    
    try {
      const response = await fetch('/api/animations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...customAnimation,
          generatedFromPrompt: prompt,
          aiGenerated: !!generatedAnimation
        })
      });

      const saved = await response.json();
      onComplete?.(saved);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Motion Animation Generator
          </h1>
          <p className="text-gray-600">Create Material Design 3 compliant animations with AI</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center gap-4">
          {[
            { num: 1, label: 'Define' },
            { num: 2, label: 'Generate' },
            { num: 3, label: 'Customize' },
            { num: 4, label: 'Preview' },
            { num: 5, label: 'Save' }
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className={`flex items-center gap-2 ${step >= s.num ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s.num ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                </div>
                <span className="text-sm font-medium">{s.label}</span>
              </div>
              {idx < 4 && (
                <div className={`h-0.5 w-12 ${step > s.num ? 'bg-purple-600' : 'bg-gray-300'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Define */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <h2 className="text-2xl font-bold mb-4">Define Your Animation</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">What do you want to animate?</label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
                placeholder="E.g., 'A button that slides in from the right with a subtle bounce'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Component Context (optional)</label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="E.g., 'Button', 'Modal', 'Card'"
                value={componentContext}
                onChange={(e) => setComponentContext(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Animation Category</label>
              <div className="grid grid-cols-5 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      category === cat.value
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{cat.icon}</div>
                    <div className="font-semibold text-sm">{cat.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{cat.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Motion Pattern</label>
              <div className="grid grid-cols-2 gap-3">
                {patterns.map((pat) => (
                  <button
                    key={pat.value}
                    onClick={() => setPattern(pat.value)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      pattern === pat.value
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="font-semibold">{pat.label}</div>
                    <div className="text-sm text-gray-500">{pat.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!prompt}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Generate
            </button>
          </div>
        )}

        {/* Step 2: Generate */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <h2 className="text-2xl font-bold mb-4">Generate Animation</h2>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="font-medium mb-2">Your Request:</p>
              <p className="text-gray-700">{prompt}</p>
              {componentContext && (
                <p className="text-sm text-gray-600 mt-2">For: {componentContext}</p>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Animation
                </>
              )}
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full border-2 border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50"
            >
              Back
            </button>
          </div>
        )}

        {/* Step 3: Customize */}
        {step === 3 && customAnimation && (
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <h2 className="text-2xl font-bold mb-4">Customize Animation</h2>

            {aiReasoning && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-medium text-blue-900 mb-2">AI Reasoning:</p>
                <p className="text-blue-800 text-sm">{aiReasoning}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Animation Name</label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={customAnimation.name}
                  onChange={(e) => setCustomAnimation({ ...customAnimation, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Duration</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={customAnimation.durationType}
                  onChange={(e) => setCustomAnimation({ ...customAnimation, durationType: e.target.value })}
                >
                  {durations.map((d) => (
                    <option key={d.value} value={d.value}>{d.label} - {d.use}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Easing Curve</label>
                <div className="grid grid-cols-2 gap-3">
                  {easings.map((e) => (
                    <button
                      key={e.value}
                      onClick={() => setCustomAnimation({ ...customAnimation, easing: e.value })}
                      className={`p-3 rounded-lg border-2 text-left ${
                        customAnimation.easing === e.value
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="font-semibold text-sm">{e.label}</div>
                      <div className="text-xs text-gray-500">{e.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(4)}
                className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700"
              >
                Preview Animation
              </button>
              <button
                onClick={() => setStep(2)}
                className="px-6 border-2 border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50"
              >
                Regenerate
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Preview */}
        {step === 4 && customAnimation && (
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Preview Animation</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('visual')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    viewMode === 'visual' ? 'bg-purple-600 text-white' : 'bg-gray-100'
                  }`}
                >
                  <Eye className="w-4 h-4 inline mr-2" />
                  Visual
                </button>
                <button
                  onClick={() => setViewMode('code')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    viewMode === 'code' ? 'bg-purple-600 text-white' : 'bg-gray-100'
                  }`}
                >
                  <Code className="w-4 h-4 inline mr-2" />
                  Code
                </button>
              </div>
            </div>

            {viewMode === 'visual' ? (
              <div className="bg-gray-50 rounded-lg p-12 flex items-center justify-center min-h-[400px]">
                <div
                  className={`bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-lg shadow-lg text-xl font-semibold ${
                    isPlaying ? customAnimation.name : ''
                  }`}
                >
                  Preview Element
                </div>
              </div>
            ) : (
              <div className="bg-gray-900 text-green-400 rounded-lg p-6 font-mono text-sm overflow-x-auto">
                <pre>{generateCSS(customAnimation)}</pre>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={playAnimation}
                disabled={isPlaying}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Play
              </button>
              <button
                onClick={() => setIsPlaying(false)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <button
                onClick={() => setStep(5)}
                className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700"
              >
                Save Animation
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 border-2 border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50"
              >
                Back to Customize
              </button>
            </div>

            {/* Inject animation styles */}
            <style>{`
              @keyframes ${customAnimation.name} {
                ${customAnimation.keyframes.map(kf => {
                  const offset = (kf.offset * 100).toFixed(0);
                  const props = Object.entries(kf)
                    .filter(([key]) => key !== 'offset')
                    .map(([key, value]) => `${key}: ${value};`)
                    .join(' ');
                  return `${offset}% { ${props} }`;
                }).join('\n')}
              }
              .${customAnimation.name} {
                animation: ${customAnimation.name} var(--md-motion-duration-${customAnimation.durationType}) var(--md-motion-easing-${customAnimation.easing}) both;
              }
            `}</style>
          </div>
        )}

        {/* Step 5: Save */}
        {step === 5 && (
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">Save Animation</h2>
            <p className="text-gray-600">Your animation is ready to be saved to the library.</p>

            {customAnimation && (
              <div className="bg-gray-50 rounded-lg p-6 text-left">
                <h3 className="font-semibold mb-3">Animation Details:</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {customAnimation.name}</p>
                  <p><span className="font-medium">Category:</span> {customAnimation.category}</p>
                  <p><span className="font-medium">Pattern:</span> {customAnimation.patternType}</p>
                  <p><span className="font-medium">Duration:</span> {customAnimation.durationType}</p>
                  <p><span className="font-medium">Easing:</span> {customAnimation.easing}</p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleSave}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
              >
                Save to Library
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-6 border-2 border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50"
              >
                Back to Preview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MotionAnimationGenerator;
