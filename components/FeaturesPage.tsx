
import React from 'react';

interface FeaturesPageProps {
  onBack: () => void;
  onEnter: () => void;
}

const FeaturesPage: React.FC<FeaturesPageProps> = ({ onBack, onEnter }) => {
  return (
    <div className="min-h-screen bg-page text-main selection:bg-accent selection:text-on-accent transition-colors duration-300">
      {/* Navigation */}
      <nav className="w-full border-b border-dim bg-page/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-lg border border-dim overflow-hidden">
               <img src="/logo.webp" alt="Mantle" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold text-main tracking-tight font-serif">Mantle</span>
          </div>
          <div className="flex items-center gap-6">
            <button 
                onClick={onBack}
                className="text-sm font-medium text-muted hover:text-main transition-colors hidden sm:block"
            >
                Back to Home
            </button>
            <button 
                onClick={onEnter}
                className="px-4 py-2 bg-accent text-on-accent rounded-lg text-sm font-bold hover:opacity-90 transition-opacity shadow-md"
            >
                Enter App
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Header */}
        <div className="text-center mb-24 animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-bold font-serif mb-6">The Architecture of Identity</h1>
            <p className="text-xl text-muted max-w-2xl mx-auto font-light">
                Mantle is not just a logo generator. It is a comprehensive design system engine powered by the latest reasoning models from Google.
            </p>
        </div>

        {/* Feature 1: The Engine */}
        <section className="flex flex-col md:flex-row items-center gap-12 mb-24 animate-fade-in-up">
            <div className="flex-1 space-y-6">
                <div className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest">
                    The Mind
                </div>
                <h2 className="text-3xl md:text-4xl font-bold font-serif">Gemini 3 Pro Reasoning</h2>
                <p className="text-lg text-muted leading-relaxed">
                    Most brand tools pick random colors. Mantle <strong>reads</strong> your mission statement. Using the advanced reasoning capabilities of Gemini 3 Pro, it deduces the psychological impact your brand needs to have.
                </p>
                <ul className="space-y-3 mt-4">
                    {['Analyzes brand voice and tone', 'Selects accessible, WCAG-compliant colors', 'Pairs Google Fonts based on historical context'].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-main">
                            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex-1 w-full bg-surface border border-dim rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-[60px] rounded-full -mr-10 -mt-10 pointer-events-none"></div>
                <div className="font-mono text-xs text-muted space-y-2">
                    <div className="flex gap-2"><span className="text-accent">INPUT:</span> "A stoic logistics firm for interstellar travel."</div>
                    <div className="h-px bg-dim w-full my-2"></div>
                    <div className="flex gap-2"><span className="text-green-500">VOICE:</span> "Authoritative, Industrial, Celestial."</div>
                    <div className="flex gap-2"><span className="text-blue-500">COLOR:</span> "Void Black (#0B0C10) & Starlight Silver (#C5C6C7)"</div>
                    <div className="flex gap-2"><span className="text-purple-500">FONT:</span> "Space Grotesk + Inter"</div>
                </div>
            </div>
        </section>

        {/* Feature 2: The Sigil */}
        <section className="flex flex-col md:flex-row-reverse items-center gap-12 mb-24 animate-fade-in-up">
            <div className="flex-1 space-y-6">
                <div className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest">
                    The Sigil
                </div>
                <h2 className="text-3xl md:text-4xl font-bold font-serif">Vector-Ready Forging</h2>
                <p className="text-lg text-muted leading-relaxed">
                    Mantle creates "Sigils" (Primary Logos) and "Crests" (Secondary Marks) that are designed to be used in real applications.
                </p>
                <p className="text-muted">
                    Beyond standard generation, Mantle includes a <strong>Reshaping Engine</strong> that lets you refine logos with natural language, and a <strong>Vectorizer</strong> that converts your logo into raw SVG code for perfect scaling.
                </p>
            </div>
            <div className="flex-1 w-full grid grid-cols-2 gap-4">
                <div className="bg-surface border border-dim rounded-xl p-6 flex items-center justify-center aspect-square shadow-lg">
                    <svg className="w-16 h-16 text-main" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                <div className="bg-surface border border-dim rounded-xl p-6 flex items-center justify-center aspect-square shadow-lg">
                     <svg className="w-16 h-16 text-accent" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div className="col-span-2 bg-page border border-dim rounded-xl p-4 font-mono text-[10px] text-muted overflow-hidden">
                    &lt;svg viewBox="0 0 100 100"&gt;...&lt;/svg&gt;
                </div>
            </div>
        </section>

        {/* Feature 3: Seasonal Mantle */}
        <section className="flex flex-col md:flex-row items-center gap-12 mb-24 animate-fade-in-up">
            <div className="flex-1 space-y-6">
                <div className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest">
                    The Seasons
                </div>
                <h2 className="text-3xl md:text-4xl font-bold font-serif">Automatic Theming</h2>
                <p className="text-lg text-muted leading-relaxed">
                    A brand isn't static. It changes with the environment. Mantle generates a "Summer Mantle" (Light Mode) and "Winter Mantle" (Dark Mode) for every identity.
                </p>
                <p className="text-muted">
                    We provide ready-to-paste CSS variables that handle color contrast and semantic token mapping for you.
                </p>
            </div>
            <div className="flex-1 w-full bg-surface border border-dim rounded-2xl p-6 shadow-2xl relative">
                {/* CSS Code Snippet Mock */}
                 <div className="font-mono text-xs leading-loose">
                    <span className="text-muted">/* Winter Mantle (Dark) */</span><br/>
                    <span className="text-purple-500">--bg-page</span>: <span className="text-main">#0F1115</span>;<br/>
                    <span className="text-purple-500">--bg-surface</span>: <span className="text-main">#1A1C23</span>;<br/>
                    <span className="text-purple-500">--text-main</span>: <span className="text-main">#F4F6F8</span>;<br/>
                    <span className="text-purple-500">--brand-accent</span>: <span className="text-yellow-500">#D4AF37</span>;<br/>
                 </div>
                 
                 <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-page to-surface border border-dim rounded-xl flex items-center justify-center shadow-xl">
                    <div className="w-8 h-8 rounded-full bg-yellow-500"></div>
                 </div>
            </div>
        </section>

        {/* Feature 4: Privacy */}
        <section className="bg-surface border border-dim rounded-3xl p-12 text-center animate-fade-in-up">
            <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6 text-on-accent shadow-lg">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h2 className="text-3xl font-bold font-serif mb-4">Sovereign Data</h2>
            <p className="text-lg text-muted max-w-2xl mx-auto mb-8">
                Mantle operates on a <strong>Bring Your Own Key (BYOK)</strong> model. Your Gemini API key is stored locally in your browser's encrypted storage. We do not run a backend server that sees your keys. You are the sole sovereign of your data.
            </p>
            <button 
                onClick={onEnter}
                className="px-8 py-4 bg-accent text-on-accent rounded-lg font-bold text-lg shadow-xl hover:scale-105 transition-transform duration-200"
            >
                Start Weaving
            </button>
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

export default FeaturesPage;
