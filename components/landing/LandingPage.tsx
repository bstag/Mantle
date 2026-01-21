
import React from 'react';

interface LandingPageProps {
  onEnter: () => void;
  onLearnMore: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter, onLearnMore }) => {
  return (
    <div className="min-h-screen bg-page text-main selection:bg-accent selection:text-on-accent transition-colors duration-300 flex flex-col">
      {/* Navigation */}
      <nav className="w-full border-b border-dim bg-page/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-surface/50 flex items-center justify-center overflow-hidden p-0.5">
               <img src="/logo.webp" alt="Mantle" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold text-main tracking-tight font-serif">Mantle</span>
          </div>
          <div className="flex items-center gap-6">
             <button 
                onClick={onLearnMore}
                className="text-sm font-medium text-muted hover:text-main transition-colors hidden sm:block"
            >
                Features
            </button>
            <button 
                onClick={onEnter}
                className="text-sm font-medium text-accent hover:text-main transition-colors"
            >
                Enter Application &rarr;
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-20 pb-32 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <div className="inline-block px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium tracking-wide uppercase mb-6 animate-fade-in">
                    Stagware Product Suite
                </div>
                <h1 className="text-5xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-main via-accent to-muted font-serif mb-6 leading-tight animate-fade-in-up">
                    Weave Your<br />Identity.
                </h1>
                <p className="text-xl md:text-2xl text-muted max-w-2xl mx-auto font-light leading-relaxed mb-10 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                    Your code is the muscle; your brand is the Mantle. 
                    Generate enterprise-grade design systems, logos, and strategies in seconds.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                    <button 
                        onClick={onEnter}
                        className="px-8 py-4 bg-accent text-on-accent rounded-lg font-bold text-lg shadow-xl hover:scale-105 transition-transform duration-200"
                    >
                        Forge Your Brand
                    </button>
                    <button 
                        onClick={onLearnMore}
                        className="px-8 py-4 bg-surface border border-dim text-main rounded-lg font-medium text-lg hover:bg-page transition-colors"
                    >
                        Learn More
                    </button>
                </div>
            </div>
            
            {/* Abstract Background Element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        </section>

        {/* Features Grid Summary */}
        <section id="features" className="py-24 bg-surface border-y border-dim">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Feature 1 */}
                    <div className="space-y-4 p-6 rounded-2xl bg-page border border-dim hover:border-accent transition-colors duration-300">
                        <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold font-serif text-main">The Sigil</h3>
                        <p className="text-muted leading-relaxed">
                            Generate minimalist, vector-ready logos. Refine them with natural language and export SVG favicons instantly.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="space-y-4 p-6 rounded-2xl bg-page border border-dim hover:border-accent transition-colors duration-300">
                        <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                        </div>
                        <h3 className="text-xl font-bold font-serif text-main">The Thread</h3>
                        <p className="text-muted leading-relaxed">
                            Seasonal theming automatically creates Summer (Light) and Winter (Dark) color palettes with copy-paste CSS.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="space-y-4 p-6 rounded-2xl bg-page border border-dim hover:border-accent transition-colors duration-300">
                        <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
                           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold font-serif text-main">The Steward</h3>
                        <p className="text-muted leading-relaxed">
                            An embedded AI brand consultant that helps you refine your voice, strategy, and design decisions.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        {/* Social Proof / Trusted By (Mock) */}
        <section className="py-20 text-center">
             <p className="text-sm font-bold text-muted uppercase tracking-widest mb-8">Powered By</p>
             <div className="flex justify-center items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                <span className="text-xl font-bold font-serif text-main">Google Gemini</span>
             </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-dim py-8 bg-surface">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted text-sm">
            &copy; {new Date().getFullYear()} Stagware. The Mantle Identity Layer.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
