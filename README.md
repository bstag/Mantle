
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

## Technologies

*   **Frontend**: React, TypeScript, Vite
*   **Styling**: Tailwind CSS (Semantic theming)
*   **AI Models**:
    *   `gemini-3-pro-preview` (Text, Strategy, Chat)
    *   `gemini-3-pro-image-preview` (Logo Generation, Editing)

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

3.  **Configure Environment**
    Create a `.env` file in the root directory based on the example.
    ```bash
    cp .env.example .env
    ```

4.  **Add API Key**
    Get your API key from [Google AI Studio](https://aistudio.google.com/).
    Edit `.env` and add your key:
    ```env
    API_KEY=your_actual_api_key_here
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```

## Usage

1.  **Establish Authority**: Enter your company's core mission in the text area.
2.  **Select Resolution**: Choose the desired resolution for your assets (1K, 2K, 4K).
3.  **Assume the Mantle**: Click generate and watch as the AI weaves your brand identity.
4.  **Refine**: Use the chat widget or the "Reshape" buttons on logos to tweak details.
5.  **Export**: Download the ZIP package to get your icons and CSS variables for immediate implementation.

## License

MIT
