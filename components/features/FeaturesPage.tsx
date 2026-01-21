import React from 'react';
import Navigation from './Navigation';
import Footer from '../common/Footer';
import FeatureSection from './FeatureSection';
import PrivacySection from './PrivacySection';

interface FeaturesPageProps {
  onBack: () => void;
  onEnter: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const FeaturesPage: React.FC<FeaturesPageProps> = ({ onBack, onEnter, theme, onToggleTheme }) => {
  return (
    <div className="min-h-screen bg-page text-main selection:bg-accent selection:text-on-accent transition-colors duration-300">
      <Navigation onBack={onBack} onEnter={onEnter} theme={theme} onToggleTheme={onToggleTheme} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Header */}
        <div className="text-center mb-24 animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-bold font-serif mb-6">The Architecture of Identity</h1>
            <p className="text-xl text-muted max-w-2xl mx-auto font-light">
                Mantle is not just a logo generator. It is a comprehensive design system engine powered by the latest reasoning models from Google.
            </p>
        </div>

        <FeatureSection
          badge="The Mind"
          title="Gemini 3 Pro Reasoning"
          description={
            <>
              Most brand tools pick random colors. Mantle <strong>reads</strong> your mission statement. Using the advanced reasoning capabilities of Gemini 3 Pro, it deduces the psychological impact your brand needs to have.
            </>
          }
          listItems={[
            'Analyzes brand voice and tone',
            'Selects accessible, WCAG-compliant colors',
            'Pairs Google Fonts based on historical context'
          ]}
          visualContent={
            <div className="bg-surface border border-dim rounded-2xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-[60px] rounded-full -mr-10 -mt-10 pointer-events-none"></div>
              <div className="font-mono text-xs text-muted space-y-2">
                <div className="flex gap-2"><span className="text-accent">INPUT:</span> "A stoic logistics firm for interstellar travel."</div>
                <div className="h-px bg-dim w-full my-2"></div>
                <div className="flex gap-2"><span className="text-green-500">VOICE:</span> "Authoritative, Industrial, Celestial."</div>
                <div className="flex gap-2"><span className="text-blue-500">COLOR:</span> "Void Black (#0B0C10) & Starlight Silver (#C5C6C7)"</div>
                <div className="flex gap-2"><span className="text-purple-500">FONT:</span> "Space Grotesk + Inter"</div>
              </div>
            </div>
          }
        />

        <FeatureSection
          badge="The Sigil"
          title="Vector-Ready Forging"
          description='Mantle creates "Sigils" (Primary Logos) and "Crests" (Secondary Marks) that are designed to be used in real applications.'
          additionalContent={
            <p className="text-muted">
              Beyond standard generation, Mantle includes a <strong>Reshaping Engine</strong> that lets you refine logos with natural language, and a <strong>Vectorizer</strong> that converts your logo into raw SVG code for perfect scaling.
            </p>
          }
          visualContent={
            <div className="grid grid-cols-2 gap-4">
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
          }
          reverse
        />

        <FeatureSection
          badge="The Seasons"
          title="Automatic Theming"
          description={
            <>
              A brand isn&apos;t static. It changes with the environment. Mantle generates a &quot;Summer Mantle&quot; (Light Mode) and &quot;Winter Mantle&quot; (Dark Mode) for every identity.
            </>
          }
          additionalContent={
            <p className="text-muted">
              We provide ready-to-paste CSS variables that handle color contrast and semantic token mapping for you.
            </p>
          }
          visualContent={
            <div className="bg-surface border border-dim rounded-2xl p-6 shadow-2xl relative">
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
          }
        />

        <PrivacySection onEnter={onEnter} />

      </main>
      
      <Footer />
    </div>
  );
};

export default FeaturesPage;
