
import React, { useState, useEffect, useMemo } from 'react';
import GeneratorForm from './components/app/GeneratorForm';
import BrandDashboard from './components/dashboard/BrandDashboard';
import ApiKeyModal from './components/app/ApiKeyModal';
import LandingPage from './components/landing/LandingPage';
import FeaturesPage from './components/features/FeaturesPage';
import Navbar from './components/app/Navbar';
import Hero from './components/landing/Hero';
import Footer from './components/common/Footer';
import { LoadedExample } from './services/exampleService';
import { BrandIdentity, ImageSize, LogoResult } from './types';
import { BrandStudioError, LogoKind } from './modules/brand-studio/BrandStudio';
import { createGeminiBrandStudio } from './modules/brand-studio/geminiBrandStudio';

type ViewState = 'landing' | 'features' | 'app' | 'example-preview';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [isGenerating, setIsGenerating] = useState(false);
  const [brandData, setBrandData] = useState<BrandIdentity | null>(null);
  const [logos, setLogos] = useState<LogoResult>({ primary: null, secondary: null, variations: [] });
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isExampleMode, setIsExampleMode] = useState(false);
  const brandStudio = useMemo(() => apiKey ? createGeminiBrandStudio(apiKey) : null, [apiKey]);

  // Load key and theme from storage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      setCurrentView('app'); // Skip landing if user has been here before
    }
    
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSaveKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
  };

  const handleClearKey = () => {
      localStorage.removeItem('gemini_api_key');
      setApiKey(null);
      setBrandData(null);
      setCurrentView('landing'); // Go back to landing page on logout
  }

  const handleGenerate = async (mission: string, size: ImageSize) => {
    if (!brandStudio) return;

    setIsGenerating(true);
    setError(null);
    setBrandData(null);
    setLogos({ primary: null, secondary: null, variations: [] });

    try {
      const draft = await brandStudio.generateBrand({ mission, imageSize: size });
      setBrandData(draft.identity);
      setLogos(draft.logos);
    } catch (err: unknown) {
      console.error(err);
      setError(toUserMessage(err));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateLogo = (type: LogoKind, newImage: string) => {
      setLogos(prev => ({
          ...prev,
          [type]: newImage,
      }));
  };

  const handleRegenerateLogo = async (type: LogoKind, feedback?: string) => {
    if (!brandStudio || !brandData) return;

    try {
      const newImage = await brandStudio.regenerateLogo({ mission: brandData.mission, kind: type, feedback });
      handleUpdateLogo(type, newImage);
    } catch (error) {
      console.error('Failed to regenerate', error);
      alert(toUserMessage(error));
    }
  };

  const handleRefineLogo = async (type: LogoKind, instruction: string) => {
    if (!brandStudio) return;
    const image = logos[type];
    if (!image) return;

    const refinedImage = await brandStudio.refineLogo({ image, instruction });
    handleUpdateLogo(type, refinedImage);
  };

  const handleGenerateVariations = async () => {
    if (!brandStudio || !logos.primary) return;
    const variations = await brandStudio.generateVariations(logos.primary);
    setLogos(previous => ({ ...previous, variations }));
  };

  const handleViewExample = (example: LoadedExample) => {
    setBrandData(example.identity);
    setLogos(example.logos);
    setIsExampleMode(true);
    setCurrentView('example-preview');
  };

  const handleExitExampleMode = () => {
    setIsExampleMode(false);
    setBrandData(null);
    setLogos({ primary: null, secondary: null, variations: [] });
    setCurrentView('landing');
  };

  // View Routing
  if (currentView === 'landing') {
    return <LandingPage onEnter={() => setCurrentView('app')} onLearnMore={() => setCurrentView('features')} onViewExample={handleViewExample} theme={theme} onToggleTheme={toggleTheme} />;
  }

  if (currentView === 'features') {
    return <FeaturesPage onBack={() => setCurrentView('landing')} onEnter={() => setCurrentView('app')} theme={theme} onToggleTheme={toggleTheme} />;
  }

  // Example Preview View (read-only, no API key required)
  if (currentView === 'example-preview' && brandData) {
    return (
      <div className="min-h-screen bg-page text-main selection:bg-accent selection:text-on-accent transition-colors duration-300">
        <Navbar 
          onLogoClick={handleExitExampleMode} 
          onClearKey={() => {}}
          hasApiKey={false}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
          {/* Example Mode Banner */}
          <div className="mb-8 p-4 bg-accent/10 border border-accent/30 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-main font-medium">Viewing Example Brand</span>
              <span className="text-muted text-sm">— This is a read-only preview</span>
            </div>
            <button
              onClick={handleExitExampleMode}
              className="px-4 py-2 bg-surface border border-dim text-main rounded-lg text-sm font-medium hover:bg-page transition-colors"
            >
              ← Back to Gallery
            </button>
          </div>

          <BrandDashboard 
            data={brandData} 
            logos={logos} 
            isReadOnly={true}
          />
        </main>
        <Footer />
      </div>
    );
  }

  // App View
  return (
    <div className="min-h-screen bg-page text-main selection:bg-accent selection:text-on-accent transition-colors duration-300">
      
      {!apiKey && <ApiKeyModal onSave={handleSaveKey} />}

      <Navbar 
        onLogoClick={() => setCurrentView('landing')} 
        onClearKey={handleClearKey} 
        hasApiKey={!!apiKey}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        
        {!brandData && !isGenerating && <Hero />}

        {/* Form is always visible at top or center until generated */}
        <div className={`transition-all duration-700 ease-in-out ${brandData ? 'mb-12' : 'mb-0'}`}>
             <GeneratorForm onGenerate={handleGenerate} isGenerating={isGenerating} />
        </div>

        {/* Error Message */}
        {error && (
            <div className="max-w-3xl mx-auto mt-8 p-4 bg-red-900/10 border border-red-500/50 rounded-lg text-red-500 flex items-center gap-3 animate-fade-in">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
            </div>
        )}

        {/* Results */}
        {(brandData || isGenerating) && (
            <div className={`transition-opacity duration-1000 ${brandData ? 'opacity-100' : 'opacity-0'}`}>
                {brandData && apiKey && 
                  <BrandDashboard 
                    data={brandData} 
                    logos={logos} 
                    onUpdateLogo={handleUpdateLogo} 
                    onRegenerateLogo={handleRegenerateLogo}
                    onRefineLogo={handleRefineLogo}
                    onGenerateVariations={handleGenerateVariations}
                  />
                }
            </div>
        )}

      </main>
      
      <Footer />

    </div>
  );
};

export default App;

function toUserMessage(error: unknown): string {
  if (error instanceof BrandStudioError) return error.message;
  return error instanceof Error
    ? error.message
    : 'An unexpected error occurred while generating your brand.';
}
