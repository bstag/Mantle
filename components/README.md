# Components Folder Structure

This folder is organized by feature/page to improve maintainability and clarity.

## Folder Structure

### `/common`
Shared components used across multiple pages:
- `Footer.tsx` - Site footer
- `Badge.tsx` - Reusable badge component

### `/landing`
Components specific to the landing page:
- `LandingPage.tsx` - Main landing page component
- `Hero.tsx` - Hero section for landing/app pages

### `/features`
Components for the features/marketing page:
- `FeaturesPage.tsx` - Features page container
- `FeatureSection.tsx` - Reusable feature section component
- `Navigation.tsx` - Navigation bar for features page
- `PrivacySection.tsx` - Privacy/BYOK section

### `/app`
Components for the main application view:
- `GeneratorForm.tsx` - Brand generation form
- `Navbar.tsx` - Main app navigation bar
- `ApiKeyModal.tsx` - API key input modal
- `ChatBot.tsx` - Chat interface (unused currently)

### `/dashboard`
Components for the brand dashboard (results page):
- `BrandDashboard.tsx` - Main dashboard container
- `LogoCard.tsx` - Logo display card with actions
- `LogoVariationsSection.tsx` - Logo variations grid
- `TypographySection.tsx` - Typography preview section
- `ColorPaletteSection.tsx` - Color palette display
- `ThemePreviewSection.tsx` - Light/dark theme previews
- `MockUI.tsx` - UI preview component
- `CSSCodeSection.tsx` - CSS code snippet display
- `ModificationModal.tsx` - Logo edit/regenerate modal
- `ExportButtons.tsx` - PDF/ZIP export buttons

## Import Patterns

When importing components:
- From same folder: `import Component from './Component'`
- From sibling folder: `import Component from '../folder/Component'`
- From common: `import Component from '../common/Component'`
- Types/utils: `import { Type } from '../types'` or `import { util } from '../utils/utilFile'`
