# Modern Portfolio Website

A stunning, responsive portfolio website built with React and modern web technologies. Features a modular CSS approach with component-specific styling to avoid style conflicts.

## ✨ Features

- **Modern Design**: Dark theme with gradient animations and smooth transitions
- **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **Modular CSS**: Component-specific CSS modules to prevent style conflicts
- **Dynamic Content**: Ready for backend integration with placeholder data structure
- **Interactive Elements**: Hover effects, animations, and smooth scrolling
- **Professional Layout**: Navbar, Hero, Stats, About, Projects, and Footer sections

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or pnpm

### Installation

1. Clone or download the project
2. Navigate to the project directory:
   ```bash
   cd portfolio-website
   ```

3. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   pnpm run dev
   ```

5. Open your browser and visit `http://localhost:5173`

## 📁 Project Structure

```
portfolio-website/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images and media files
│   │   └── developer-portrait.png
│   ├── components/        # React components
│   │   ├── Navbar/
│   │   │   ├── Navbar.jsx
│   │   │   └── Navbar.module.css
│   │   ├── Footer/
│   │   │   ├── Footer.jsx
│   │   │   └── Footer.module.css
│   │   └── Home/
│   │       ├── Home.jsx
│   │       └── Home.module.css
│   ├── App.jsx           # Main App component
│   ├── App.css           # Global styles with Tailwind
│   └── main.jsx          # Entry point
├── package.json
└── README.md
```

## 🎨 Design Features

### Hero Section
- Animated typing effect for role titles
- Professional developer portrait with glow effects
- Gradient background with floating orbs
- Call-to-action buttons with hover animations

### Stats Section
- Animated counters with gradient text
- Professional metrics display
- Responsive grid layout

### About Section
- Service cards with hover effects
- Animated skill bubbles
- Professional description and services

### Projects Section
- Project cards with overlay effects
- Technology tags
- Hover animations and transitions

### Footer
- Comprehensive contact information
- Social media links
- Newsletter signup
- Quick navigation links

## 🔧 Customization

### Adding New Pages
1. Create a new component in `src/components/`
2. Follow the CSS module pattern: `ComponentName.jsx` + `ComponentName.module.css`
3. Import and use in `App.jsx`

### Modifying Content
- **Personal Info**: Update name, role, and description in `Home.jsx`
- **Stats**: Modify the `stats` array in `Home.jsx`
- **Projects**: Update the `featuredProjects` array in `Home.jsx`
- **Contact Info**: Update contact details in `Footer.jsx`

### Styling
- Each component has its own CSS module file
- Global styles are in `App.css`
- Use CSS custom properties for consistent theming
- Responsive breakpoints: 1024px, 768px, 480px

## 🌐 Backend Integration

The website is designed for easy backend integration:

### Dynamic Content Structure
```javascript
// Example API endpoints structure
const apiEndpoints = {
  profile: '/api/profile',      // Personal info, bio, contact
  stats: '/api/stats',          // Achievement numbers
  projects: '/api/projects',    // Project portfolio
  skills: '/api/skills',        // Technical skills
  services: '/api/services'     // Service offerings
};
```

### Data Models
```javascript
// Project model example
const project = {
  id: number,
  title: string,
  description: string,
  image: string,
  technologies: string[],
  liveUrl: string,
  githubUrl: string,
  featured: boolean
};
```

## 📱 Responsive Design

- **Desktop**: Full layout with side-by-side sections
- **Tablet**: Stacked layout with adjusted spacing
- **Mobile**: Single column with mobile navigation menu

## 🛠 Technologies Used

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **CSS Modules**: Component-scoped styling
- **Lucide React**: Modern icon library
- **Modern CSS**: Flexbox, Grid, Custom Properties
- **Responsive Design**: Mobile-first approach

## 🚀 Deployment

### Build for Production
```bash
npm run build
# or
pnpm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

### Recommended Hosting
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## 📝 Notes

- The website uses placeholder content that can be easily replaced with dynamic data
- All images should be optimized for web use
- The design follows modern web standards and accessibility guidelines
- CSS modules prevent style conflicts when adding new components

## 🎯 Next Steps

1. **Add More Pages**: Skills, Projects detail, CV, Contact form
2. **Backend Integration**: Connect to your existing backend API
3. **SEO Optimization**: Add meta tags, structured data
4. **Performance**: Implement lazy loading, image optimization
5. **Analytics**: Add Google Analytics or similar tracking

## 📞 Support

For questions or customization help, refer to the component documentation in each CSS module file.

---

**Built with ❤️ using modern web technologies**

