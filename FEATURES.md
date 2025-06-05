# Blog Website Features

## 🚀 Publishing Workflow

### Article States
- **Draft**: Articles saved as drafts (closed issues with "draft" label)
- **Published**: Live articles visible to all visitors (open issues)
- **Archived**: Hidden articles accessible only to admins (closed issues with "archived" label)

### Publishing Actions
- **Publish**: Convert draft to published article
- **Unpublish**: Move published article back to draft
- **Archive**: Archive published articles
- **Preview**: Preview drafts and archived articles

### Admin Controls
- Publishing controls available on article detail pages for admins
- Bulk management in admin dashboard
- Status indicators and badges
- Confirmation dialogs for state changes

## ⚙️ Configurable Settings

### Site Information
- Site name and description
- Keywords for SEO
- Logo and favicon URLs

### Appearance Customization
- Primary and accent colors
- Custom CSS injection
- Logo customization
- Theme variables

### Social Media Integration
- Twitter, GitHub, LinkedIn, Facebook, Instagram links
- Automatic icon display in footer
- Configurable social sharing

### Content Settings
- Articles per page
- Featured tags
- Author information display
- Comments enable/disable

### SEO & Analytics
- Default meta image
- Google Analytics integration
- Custom meta tags
- Structured data

### Advanced Customization
- Custom CSS injection
- Custom header/footer HTML
- Theme variable overrides
- Print styles

## 🎨 Theme System

### CSS Variables
\`\`\`css
:root {
  --primary-color: #0070f3;
  --accent-color: #f5a623;
}
\`\`\`

### Dynamic Styling
- Real-time color updates
- Custom CSS injection
- Responsive design
- Dark mode support

### Component Theming
- Consistent color scheme
- Hover effects
- Transition animations
- Accessibility compliance

## 📊 Admin Dashboard

### Content Management
- Published articles overview
- Draft articles management
- Archived articles access
- Quick status changes

### Analytics
- Article count by status
- Tag usage statistics
- Comment statistics
- Performance metrics

### Bulk Operations
- Multi-select articles
- Batch status changes
- Bulk tagging
- Export functionality

## 🔧 API Integration

### Publishing Endpoints
- `POST /api/articles/[number]/publish`
- `POST /api/articles/[number]/unpublish`
- `POST /api/articles/[number]/archive`

### Settings Management
- `GET /api/settings` - Fetch current settings
- `POST /api/settings` - Save settings
- Automatic caching and validation

### Enhanced Article API
- Draft creation
- Status filtering
- Bulk operations
- Preview access

## 🎯 User Experience

### Preview System
- Safe preview for drafts
- Admin-only access
- Full article rendering
- Comment preview

### Status Indicators
- Visual status badges
- Color-coded states
- Progress indicators
- Action confirmations

### Responsive Design
- Mobile-first approach
- Touch-friendly controls
- Adaptive layouts
- Performance optimization

## 🔒 Security & Permissions

### Admin Controls
- Role-based access
- Secure API endpoints
- Token validation
- Permission checks

### Content Protection
- Draft visibility control
- Archive access restriction
- Preview authentication
- Secure state changes

## 📱 Mobile Experience

### Touch Optimization
- Large touch targets
- Swipe gestures
- Mobile navigation
- Responsive images

### Performance
- Lazy loading
- Image optimization
- Code splitting
- Caching strategies

## 🌐 SEO Optimization

### Meta Tags
- Dynamic titles
- Custom descriptions
- Open Graph tags
- Twitter cards

### Structured Data
- Article schema
- Author information
- Publication dates
- Tag relationships

### Performance
- Server-side rendering
- Static generation
- Image optimization
- Core Web Vitals

## 🔄 Workflow Integration

### Content Lifecycle
1. Create draft
2. Edit and preview
3. Publish when ready
4. Archive when outdated

### Collaboration
- Author assignments
- Review workflow
- Comment system
- Version tracking

### Automation
- Auto-save drafts
- Scheduled publishing
- Backup creation
- Performance monitoring
