import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-page)] to-[var(--bg-card)] text-[var(--text-main)]">
      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-[var(--brand-accent)] to-purple-600 bg-clip-text text-transparent">
            Welcome to Mantle
          </h1>
          <p className="text-2xl mb-4 text-[var(--text-secondary)]">
            AI-Powered Brand Identity Generation
          </p>
          <p className="text-lg mb-8 text-[var(--text-muted)] max-w-2xl mx-auto">
            Transform your vision into a complete brand identity in minutes.
            Powered by Google's Gemini AI, Mantle creates professional brand guidelines,
            logos, and strategic insights tailored to your mission.
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-[var(--brand-accent)] text-white rounded-lg text-lg font-semibold hover:opacity-90 transition-all transform hover:scale-105 shadow-lg"
          >
            Get Started Free
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">
          Everything You Need to Build Your Brand
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="bg-[var(--bg-card)] p-6 rounded-lg shadow-md border border-[var(--border-subtle)] hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-3">Complete Brand Identity</h3>
            <p className="text-[var(--text-muted)]">
              Generate comprehensive brand guidelines including mission, vision, values,
              personality traits, and positioning strategy.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-[var(--bg-card)] p-6 rounded-lg shadow-md border border-[var(--border-subtle)] hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🎭</div>
            <h3 className="text-xl font-semibold mb-3">Professional Logos</h3>
            <p className="text-[var(--text-muted)]">
              Create primary and secondary logos with multiple variations.
              Choose from 1K, 2K, or 4K resolution for pixel-perfect quality.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[var(--bg-card)] p-6 rounded-lg shadow-md border border-[var(--border-subtle)] hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🌈</div>
            <h3 className="text-xl font-semibold mb-3">Color Palettes</h3>
            <p className="text-[var(--text-muted)]">
              Get a curated color palette with primary, secondary, and accent colors
              complete with hex codes for immediate use.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-[var(--bg-card)] p-6 rounded-lg shadow-md border border-[var(--border-subtle)] hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">✍️</div>
            <h3 className="text-xl font-semibold mb-3">Typography Guidelines</h3>
            <p className="text-[var(--text-muted)]">
              Receive professional font recommendations for headers, body text,
              and accents that align with your brand personality.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-[var(--bg-card)] p-6 rounded-lg shadow-md border border-[var(--border-subtle)] hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-3">AI Brand Strategist</h3>
            <p className="text-[var(--text-muted)]">
              Chat with an AI assistant to refine your brand strategy,
              get messaging suggestions, and explore brand applications.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-[var(--bg-card)] p-6 rounded-lg shadow-md border border-[var(--border-subtle)] hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-3">Export & Download</h3>
            <p className="text-[var(--text-muted)]">
              Download your complete brand guide as a PDF or get all assets
              in a ZIP file ready for immediate implementation.
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Mantle Section */}
      <div className="bg-[var(--bg-card)] py-16 mt-12">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Choose Mantle?
          </h2>

          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⚡</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Fast & Efficient</h3>
                <p className="text-[var(--text-muted)]">
                  What traditionally takes weeks with designers and agencies can be done in minutes.
                  Perfect for startups, side projects, or rapid prototyping.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-3xl">🔒</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
                <p className="text-[var(--text-muted)]">
                  Your API key stays in your browser using localStorage. We never send it to our servers.
                  All generation happens directly between you and Google's Gemini API.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-3xl">🎯</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Intelligence</h3>
                <p className="text-[var(--text-muted)]">
                  Leverages Google's cutting-edge Gemini AI to understand your mission and create
                  cohesive brand elements that truly represent your vision.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-3xl">💰</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Cost-Effective</h3>
                <p className="text-[var(--text-muted)]">
                  Use your own Gemini API key with Google's generous free tier.
                  No subscription fees, no hidden costs, no credit card required.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">
          How It Works
        </h2>

        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--brand-accent)] text-white flex items-center justify-center text-xl font-bold">
              1
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Enter Your Gemini API Key</h3>
              <p className="text-[var(--text-muted)]">
                Get a free API key from Google AI Studio. It's stored locally in your browser for privacy.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--brand-accent)] text-white flex items-center justify-center text-xl font-bold">
              2
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Describe Your Mission</h3>
              <p className="text-[var(--text-muted)]">
                Share your brand's purpose, target audience, or core values. The AI uses this to create your identity.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--brand-accent)] text-white flex items-center justify-center text-xl font-bold">
              3
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Generate & Refine</h3>
              <p className="text-[var(--text-muted)]">
                Watch as Mantle creates your brand identity, logos, colors, and typography. Use the AI chat to refine and explore.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--brand-accent)] text-white flex items-center justify-center text-xl font-bold">
              4
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Export & Launch</h3>
              <p className="text-[var(--text-muted)]">
                Download your brand guide PDF and asset ZIP. Start building your brand with confidence.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-[var(--brand-accent)] py-16 mt-12">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Build Your Brand?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join creators, entrepreneurs, and innovators who trust Mantle to bring their brand vision to life.
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-white text-[var(--brand-accent)] rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
          >
            Start Creating Now
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[var(--bg-card)] py-8 border-t border-[var(--border-subtle)]">
        <div className="container mx-auto px-6 text-center text-[var(--text-muted)]">
          <p>Powered by Google Gemini AI • Privacy-First • Open Source</p>
        </div>
      </div>
    </div>
  );
}
