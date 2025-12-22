
import React, { useState } from 'react';
import GeneratorForm from './components/GeneratorForm';
import BrandDashboard from './components/BrandDashboard';
import ChatBot from './components/ChatBot';
import { generateBrandIdentity, generateLogos } from './services/geminiService';
import { BrandIdentity, ImageSize, LogoResult } from './types';

const App: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [brandData, setBrandData] = useState<BrandIdentity | null>(null);
  const [logos, setLogos] = useState<LogoResult>({ primary: null, secondary: null, variations: [] });
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (mission: string, size: ImageSize) => {
    setIsGenerating(true);
    setError(null);
    setBrandData(null);
    setLogos({ primary: null, secondary: null, variations: [] });

    try {
      // 1. Generate text first to give immediate feedback
      const identity = await generateBrandIdentity(mission);
      setBrandData(identity);

      // 2. Generate images in background/parallel but we wait here for simplicity in this flow
      // Note: We might want to show the dashboard with loading skeletons for images.
      const generatedLogos = await generateLogos(mission, size);
      setLogos(generatedLogos);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while generating your brand.");
      // If we got partial data (text but image failed), we keep the text
      if (!brandData && !logos.primary) {
          // total failure
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateLogo = (type: 'primary' | 'secondary', newImage: string) => {
      setLogos(prev => ({
          ...prev,
          [type]: newImage,
          // If primary changes, verify variations clear or keep them? 
          // Mantle philosophy: If the coat changes, the variations might be outdated, but let's keep them for now.
      }));
  };

  return (
    <div className="min-h-screen bg-page text-main selection:bg-accent selection:text-on-accent transition-colors duration-300">
      
      {/* Navbar */}
      <nav className="w-full border-b border-dim bg-page/80 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-lg border border-dim overflow-hidden">
               <img src="/logo.webp" alt="Mantle Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold text-main tracking-tight font-serif">Mantle</span>
          </div>
          <div className="flex gap-4 text-sm font-medium text-muted">
             <span className="hidden sm:inline opacity-70">Stagware Product Suite</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {!brandData && !isGenerating && (
            <div className="text-center mb-16 space-y-4 animate-fade-in-up">
                <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-main via-accent to-muted font-serif pb-2 leading-tight">
                    Weave Your Mantle.
                </h1>
                <p className="text-xl text-muted max-w-2xl mx-auto font-light leading-relaxed">
                    Your code is the muscle; your brand is the Mantle. 
                    Establish the regal "coat" your application wears for every season.
                </p>
            </div>
        )}

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
                {brandData && <BrandDashboard data={brandData} logos={logos} onUpdateLogo={handleUpdateLogo} />}
            </div>
        )}

      </main>
      
      {/* Footer */}
      <footer className="w-full border-t border-dim py-8 mt-12 bg-page transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted text-sm">
            &copy; {new Date().getFullYear()} Stagware. The Mantle Identity Layer.
        </div>
      </footer>

      {/* Chat Widget */}
      <ChatBot brandData={brandData || undefined} />

    </div>
  );
};

export default App;
