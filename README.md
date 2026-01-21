
# Mantle | The Identity Layer

**Mantle** is an AI-powered brand identity engine designed for developers and founders. It acts as the "Identity Layer" for your software, generating a comprehensive, seasonally-aware "Brand Bible" from a single mission statement.

Part of the **Stagware** product suite, Mantle treats branding as a regal "coat" your application wears. It moves beyond simple color pickers to generate authoritative, enterprise-grade design systems.

## Features

*   **Identity Generation**: Transforms a mission statement into a complete brand strategy (Voice, Tagline, Typography).
*   **Sigil Forging**: Utilizes Gemini's advanced image generation to create minimalist, vector-style primary logos ("Sigils") and secondary marks ("Crests").
*   **Seasonal Theming**: Automatically generates "Summer Mantle" (Light Mode) and "Winter Mantle" (Dark Mode) color schemes with copy-paste CSS variables.
*   **Reshaping**: Refine generated logos using natural language instructions (e.g., "Make it simpler," "Add a golden crown").
*   **Variations**: Automatically produces simplified, monochrome (ink stamp), and outline versions of your logos.
*   **The Mantle Steward**: An embedded AI consultant that offers advice on brand usage and strategy.
*   **Export**: Download a PDF Brand Guide or a full ZIP package containing all assets and code snippets.
*   **Bring Your Own Key (BYOK)**: Securely authenticates using your own Google Gemini API key. Keys are stored locally in your browser and are never sent to a backend server.

## Technologies

*   **Frontend**: React 19, TypeScript, Vite 6
*   **Styling**: Tailwind CSS (CDN, Semantic theming)
*   **Build Tool**: Vite with standard bundling (all dependencies bundled for production)
*   **Deployment**: Cloudflare Pages
*   **AI Models**:
    *   `gemini-3-pro-preview` (Text, Strategy, Chat)
    *   `gemini-3-pro-image-preview` (Logo Generation, Editing)
*   **Key Dependencies**:
    *   `@google/genai` - Gemini API client
    *   `html2canvas` - Screenshot generation
    *   `jspdf` - PDF export
    *   `jszip` - Asset packaging

## Setup & Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-org/mantle.git
    cd mantle
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:3000`

4.  **Build for Production**
    ```bash
    npm run build
    ```
    This creates an optimized production build in the `dist/` folder.

5.  **Preview Production Build**
    ```bash
    npm run preview
    ```
    Test the production build locally before deploying.

## Deployment to Cloudflare Pages

### Via Cloudflare Dashboard (Recommended)

1.  **Push to Git**: Ensure your code is pushed to GitHub, GitLab, or Bitbucket.
2.  **Connect to Cloudflare Pages**:
    *   Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
    *   Navigate to **Pages** → **Create a project**
    *   Connect your Git repository
3.  **Configure Build Settings**:
    *   **Framework preset**: `Vite`
    *   **Build command**: `npm run build`
    *   **Build output directory**: `dist`
    *   **Node version**: `18` or higher (recommended: `20`)
4.  **Environment Variables**: Not required - this app uses BYOK (Bring Your Own Key) with client-side storage
5.  **Deploy**: Click **Save and Deploy**

The deployment includes:
- SPA routing via `_redirects` file
- Security headers via `_headers` file
- Optimized asset caching

### Via Wrangler CLI

1.  **Install Wrangler**:
    ```bash
    npm install -g wrangler
    ```
2.  **Authenticate**:
    ```bash
    wrangler login
    ```
3.  **Build and Deploy**:
    ```bash
    npm run build
    wrangler pages deploy dist --project-name=mantle
    ```

## Usage

1.  **Authenticate**: Upon loading the app, enter your Google Gemini API Key. You can get one for free at [Google AI Studio](https://aistudio.google.com/).
2.  **Establish Authority**: Enter your company's core mission in the text area.
3.  **Select Resolution**: Choose the desired resolution for your assets (1K, 2K, 4K).
4.  **Assume the Mantle**: Click generate and watch as the AI weaves your brand identity.
5.  **Refine**: Use the chat widget or the "Reshape" buttons on logos to tweak details.
6.  **Export**: Download the ZIP package to get your icons and CSS variables for immediate implementation.

## Project Structure

```
mantle/
├── components/          # React components
│   ├── ApiKeyModal.tsx
│   ├── BrandDashboard.tsx
│   ├── ChatBot.tsx
│   ├── FeaturesPage.tsx
│   ├── GeneratorForm.tsx
│   └── LandingPage.tsx
├── services/           # API services
│   └── geminiService.ts
├── public/             # Static assets
│   ├── _headers        # Cloudflare Pages headers
│   └── _redirects      # SPA routing configuration
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
├── types.ts            # TypeScript type definitions
├── vite.config.ts      # Vite configuration
└── wrangler.toml       # Cloudflare Pages configuration
```

## Development Notes

- **No backend required**: All AI interactions happen client-side using the Gemini API
- **Privacy-first**: API keys are stored in browser localStorage, never transmitted to any server
- **Standard Vite setup**: All dependencies are bundled for optimal production performance
- **Responsive design**: Works on desktop, tablet, and mobile devices

## License

MIT
