# Adding Example Brand Packages to Mantle

This guide explains how to add your own pre-made brand examples that users can preview and download **without needing a Gemini API key**.

---

## Quick Start

1. **Unzip** a brand package you've generated with Mantle
2. **Copy** the folder into `public/examples/`
3. **Register** it in `public/examples/index.json`

---

## Folder Structure

Each example must follow this exact structure:

```
public/examples/
├── index.json                    # Registry of all examples
├── EXAMPLES_README.md            # This file
│
├── your-brand-name/              # Your example folder
│   ├── mantle-identity.json      # REQUIRED - Brand identity data
│   ├── mantle.css                # REQUIRED - CSS theme variables
│   ├── README.md                 # Optional - Brand guide
│   └── sigils/                   # Logo assets folder
│       ├── primary-sigil.png           # REQUIRED - Main logo
│       ├── primary-sigil-transparent.png
│       ├── primary-sigil.svg
│       ├── secondary-crest.png         # REQUIRED - Secondary mark
│       ├── secondary-crest-transparent.png
│       ├── secondary-crest.svg
│       ├── variation-simplified.png    # Optional variations
│       ├── variation-simplified-transparent.png
│       ├── variation-simplified.svg
│       ├── variation-monochrome.png
│       ├── variation-monochrome-transparent.png
│       ├── variation-monochrome.svg
│       ├── variation-outline.png
│       ├── variation-outline-transparent.png
│       └── variation-outline.svg
```

---

## Step-by-Step Instructions

### 1. Generate a Brand Package

Use Mantle normally with your API key to generate a brand. Click **"Download Package"** to get the ZIP file.

### 2. Unzip the Package

Extract the ZIP file. You'll get a folder like `MyBrand_Mantle_Package/` containing:
- `mantle-identity.json`
- `mantle.css`
- `README.md`
- `sigils/` folder with logo files

### 3. Rename and Copy the Folder

Rename the folder to a URL-friendly name (lowercase, hyphens, no spaces):
- ✅ `tech-startup`
- ✅ `eco-brand`
- ❌ `My Brand Name`
- ❌ `Tech Startup!`

Copy it to `public/examples/`:
```
public/examples/tech-startup/
```

### 4. Register in index.json

Open `public/examples/index.json` and add your example:

```json
{
  "examples": [
    {
      "id": "tech-startup",
      "name": "Tech Startup",
      "description": "A modern tech startup brand with vibrant colors and clean typography.",
      "folder": "tech-startup"
    },
    {
      "id": "eco-brand",
      "name": "Eco Brand",
      "description": "An environmentally conscious brand with earthy tones.",
      "folder": "eco-brand"
    }
  ]
}
```

**Fields:**
| Field | Description |
|-------|-------------|
| `id` | Unique identifier (use folder name) |
| `name` | Display name shown in the gallery |
| `description` | Short description (1-2 sentences) |
| `folder` | Folder name inside `public/examples/` |

---

## Required Files

At minimum, each example needs:

| File | Purpose |
|------|---------|
| `mantle-identity.json` | Brand data (colors, fonts, theme, etc.) |
| `mantle.css` | CSS variables for the theme |
| `sigils/primary-sigil.png` | Primary logo image |
| `sigils/secondary-crest.png` | Secondary logo/mark |

---

## mantle-identity.json Format

This file must match the `BrandIdentity` TypeScript interface:

```json
{
  "mission": "Your brand mission statement",
  "tagline": "Your Brand Name",
  "brandVoice": "Professional, innovative, trustworthy",
  "colors": [
    {
      "hex": "#6366F1",
      "name": "Primary Blue",
      "usage": "Primary",
      "detailedUsage": "Main brand color for buttons and links",
      "contrastInfo": "Use with white text"
    }
  ],
  "theme": {
    "light": {
      "background": "#FFFFFF",
      "surface": "#F9FAFB",
      "textPrimary": "#1F2937",
      "textSecondary": "#6B7280",
      "accent": "#6366F1",
      "border": "#E5E7EB"
    },
    "dark": {
      "background": "#111827",
      "surface": "#1F2937",
      "textPrimary": "#F9FAFB",
      "textSecondary": "#9CA3AF",
      "accent": "#818CF8",
      "border": "#374151"
    }
  },
  "typography": {
    "headerFamily": "Inter",
    "bodyFamily": "Inter",
    "reasoning": "Why these fonts were chosen"
  }
}
```

---

## Tips

- **Image Quality**: Use high-quality PNG images (at least 512x512px)
- **Transparent PNGs**: Include `-transparent.png` versions for better previews
- **SVG Files**: Include SVG versions for scalable downloads
- **Descriptions**: Write compelling descriptions to help users understand each brand style
- **Variety**: Include diverse examples (tech, creative, corporate, eco, etc.)

---

## Testing Your Example

1. Run the dev server: `npm run dev`
2. Go to the landing page
3. Scroll to "Example Brand Packages" section
4. Click **Preview** on your example
5. Verify all logos and data display correctly
6. Click **↓ ZIP** to test the download

---

## Troubleshooting

**Example not showing?**
- Check `index.json` is valid JSON (no trailing commas)
- Verify the `folder` name matches exactly

**Logos not loading?**
- Ensure files are in `sigils/` subfolder
- Check filenames match exactly (case-sensitive)
- Verify images are valid PNG files

**Preview looks broken?**
- Validate `mantle-identity.json` has all required fields
- Check for JSON syntax errors

---

## Example index.json

```json
{
  "examples": [
    {
      "id": "template-brand",
      "name": "Template Brand",
      "description": "A sample brand package demonstrating the full Mantle output structure.",
      "folder": "template-brand"
    },
    {
      "id": "your-new-brand",
      "name": "Your New Brand",
      "description": "Add your description here.",
      "folder": "your-new-brand"
    }
  ]
}
```
