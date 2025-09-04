# Dynamic Theme System

This application uses a dynamic CSS-based theme system that allows developers to easily customize the main color scheme without modifying individual components.

## How It Works

The theme system uses CSS custom properties (CSS variables) defined in `/src/index.css`. These variables are then used in custom utility classes that replace standard Tailwind color classes.

## Current Theme: Purple

The application is currently configured with a purple theme. The main colors are:

- **Primary Purple**: Used for navigation bar, buttons, and main interactive elements
- **Light Purple**: Used for backgrounds, accents, and hover states  
- **Purple Text**: Used for headings, links, and important text

## Customizing the Theme

To change the theme colors, simply update the CSS variables in `/src/index.css`:

```css
:root {
  /* Primary theme colors - Change these to customize the theme */
  --theme-primary-900: 109 40 217;     /* Deep purple */
  --theme-primary-800: 124 58 237;     /* Dark purple */  
  --theme-primary-700: 139 92 246;     /* Medium purple */
  --theme-primary-600: 147 111 255;    /* Light purple */
  --theme-primary-500: 156 163 255;    /* Lighter purple */
  
  /* Theme accent colors */
  --theme-accent-50: 245 243 255;      /* Very light purple */
  --theme-accent-100: 237 233 254;     /* Light purple background */
  --theme-accent-200: 221 214 254;     /* Purple border */
  
  /* Text colors */
  --theme-text-primary: 88 28 135;     /* Dark purple text */
  --theme-text-secondary: 107 33 168;  /* Medium purple text */
}
```

### Example: Changing to Blue Theme

To switch to a blue theme, replace the RGB values:

```css
:root {
  /* Blue theme colors */
  --theme-primary-900: 30 58 138;      /* Deep blue */
  --theme-primary-800: 37 99 235;      /* Dark blue */  
  --theme-primary-700: 59 130 246;     /* Medium blue */
  --theme-primary-600: 96 165 250;     /* Light blue */
  --theme-primary-500: 147 197 253;    /* Lighter blue */
  
  /* Blue accent colors */
  --theme-accent-50: 239 246 255;      /* Very light blue */
  --theme-accent-100: 219 234 254;     /* Light blue background */
  --theme-accent-200: 191 219 254;     /* Blue border */
  
  /* Blue text colors */
  --theme-text-primary: 30 64 175;     /* Dark blue text */
  --theme-text-secondary: 37 99 235;   /* Medium blue text */
}
```

### Example: Changing to Green Theme

To switch to a green theme:

```css
:root {
  /* Green theme colors */
  --theme-primary-900: 20 83 45;       /* Deep green */
  --theme-primary-800: 22 101 52;      /* Dark green */  
  --theme-primary-700: 34 197 94;      /* Medium green */
  --theme-primary-600: 74 222 128;     /* Light green */
  --theme-primary-500: 134 239 172;    /* Lighter green */
  
  /* Green accent colors */
  --theme-accent-50: 240 253 244;      /* Very light green */
  --theme-accent-100: 220 252 231;     /* Light green background */
  --theme-accent-200: 187 247 208;     /* Green border */
  
  /* Green text colors */
  --theme-text-primary: 20 83 45;      /* Dark green text */
  --theme-text-secondary: 22 101 52;   /* Medium green text */
}
```

## Available Theme Classes

The following custom classes are available for use in components:

### Background Colors
- `bg-theme-primary` - Main theme color
- `bg-theme-primary-dark` - Darker variant for hover states
- `bg-theme-primary-light` - Lighter variant
- `bg-theme-accent-light` - Light accent background
- `bg-theme-accent-border` - Accent background for borders

### Text Colors
- `text-theme-primary` - Primary theme text color
- `text-theme-secondary` - Secondary theme text color
- `text-theme-light` - Light theme text color

### Border Colors
- `border-theme-primary` - Primary theme border
- `border-theme-accent` - Accent border color

### Interactive States
- `hover:bg-theme-primary-dark` - Hover background
- `hover:text-theme-primary` - Hover text color
- `focus:ring-theme-primary` - Focus ring color
- `focus:border-theme-primary` - Focus border color

## Components Using Theme

All major components have been updated to use the theme system:

- Navigation bar (`src/navbar.jsx`)
- Login/Register pages (`src/pages/Login.jsx`, `src/pages/Register.jsx`)
- Home page (`src/pages/Home.jsx`)
- Ticker Metrics page (`src/pages/TickerMetrics.jsx`)
- Portfolio page (`src/pages/Portfolio.jsx`)
- Users page (`src/pages/Users.jsx`)
- All components in `src/components/`

## Benefits

1. **Easy Customization**: Change colors in one file to update the entire theme
2. **Consistent Design**: All components use the same color variables
3. **No Extra Dependencies**: Uses native CSS custom properties
4. **Developer Friendly**: Clear naming convention and documentation
5. **Maintainable**: Centralized theme management

## Tips

- RGB values are used instead of hex to allow for transparency modifications
- The color scale follows a standard pattern (50 = lightest, 900 = darkest)
- Test your color combinations for accessibility (contrast ratios)
- Consider creating multiple theme files for light/dark mode support