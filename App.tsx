
import React, { useState, useEffect } from 'react';
import GeneratorForm from './components/GeneratorForm';
import BrandDashboard from './components/BrandDashboard';
import ApiKeyModal from './components/ApiKeyModal';
import LandingPage from './components/LandingPage';
import FeaturesPage from './components/FeaturesPage';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Footer from './components/Footer';
import { generateBrandIdentity, generateLogos, regenerateSingleLogo } from './services/geminiService';
import { BrandIdentity, ImageSize, LogoResult } from './types';

type ViewState = 'landing' | 'features' | 'app';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [isGenerating, setIsGenerating] = useState(false);
  const [brandData, setBrandData] = useState<BrandIdentity | null>(null);
  const [logos, setLogos] = useState<LogoResult>({ primary: null, secondary: null, variations: [] });
  const [error, setError] = useState<string | null>(null);

  // Load key from storage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      setCurrentView('app'); // Skip landing if user has been here before
    }
  }, []);

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
    if (!apiKey) return;

    setIsGenerating(true);
    setError(null);
    setBrandData(null);
    setLogos({ primary: null, secondary: null, variations: [] });

    try {
      // 1. Generate text first to give immediate feedback
      const identity = await generateBrandIdentity(apiKey, mission);
      setBrandData(identity);

      // 2. Generate images in background/parallel
      const generatedLogos = await generateLogos(apiKey, mission, size);
      setLogos(generatedLogos);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while generating your brand.");
      // Check for auth errors
      if (err.message && (err.message.includes("401") || err.message.includes("API key"))) {
          setError("Invalid API Key. Please check your key.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateLogo = (type: 'primary' | 'secondary', newImage: string) => {
      setLogos(prev => ({
          ...prev,
          [type]: newImage,
      }));
  };

  const handleRegenerateLogo = async (type: 'primary' | 'secondary', feedback?: string) => {
      if (!apiKey || !brandData) return;
      
      try {
          const newImage = await regenerateSingleLogo(apiKey, brandData.mission, type, feedback);
          if (newImage) {
            handleUpdateLogo(type, newImage);
          }
      } catch (e) {
          console.error("Failed to regenerate", e);
          alert("Failed to regenerate logo. Please try again.");
      }
  };

  // View Routing
  if (currentView === 'landing') {
    return <LandingPage onEnter={() => setCurrentView('app')} onLearnMore={() => setCurrentView('features')} />;
  }

  if (currentView === 'features') {
    return <FeaturesPage onBack={() => setCurrentView('landing')} onEnter={() => setCurrentView('app')} />;
  }

  // App View
  return (
    <div className="min-h-screen bg-page text-main selection:bg-accent selection:text-on-accent transition-colors duration-300">
      
      {!apiKey && <ApiKeyModal onSave={handleSaveKey} />}

      <Navbar 
        onLogoClick={() => setCurrentView('landing')} 
        onClearKey={handleClearKey} 
        hasApiKey={!!apiKey} 
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
                    apiKey={apiKey} 
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
