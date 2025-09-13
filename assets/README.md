# Assets Directory

This directory contains static assets for the IntelliSent Blog.

## Structure

- `css/` - Compiled CSS files
- `js/` - JavaScript files
- `images/` - Image assets
- `fonts/` - Custom fonts (if any)

## Images

Place blog-related images in the `images/` directory:

- `logo.png` - Site logo
- `favicon.ico` - Favicon
- `hero-bg.jpg` - Hero section background
- `default-avatar.png` - Default user avatar

## Usage

Reference assets using Jekyll's relative_url filter:

```liquid
<img src="{{ '/assets/images/logo.png' | relative_url }}" alt="Logo">
<link rel="stylesheet" href="{{ '/assets/css/main.css' | relative_url }}">
<script src="{{ '/assets/js/main.js' | relative_url }}"></script>
```

## Optimization

- Images should be optimized for web (use tools like TinyPNG)
- Use WebP format when possible with fallbacks
- Consider using responsive images with srcset
