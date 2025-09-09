# Dynamic Portfolio Website API Documentation

## Table of Contents

- [Public Data Endpoints](#public-data-endpoints)
- [Authentication](#authentication)
- [Admin Dashboard](#admin-dashboard)
  - [SEO Management](#seo-management)
  - [Home Section](#home-section)
  - [About Section](#about-section)
  - [Projects Section](#projects-section)
  - [Skills Section](#skills-section)
  - [CV Section](#cv-section)
  - [Footer Section](#footer-section)
- [Contact](#contact)

---

## Public Data Endpoints

### Get Home Page Data

```http
GET /api/home/main/data
```

Returns comprehensive home page data including personal info, statistics, about section, featured projects, and footer information.

**Response Example:**

```json
{
  "HomeLogo": "1234567890123.png",
  "DisplayName": "Aziz Kammoun",
  "MainRoles": ["Full Stack Developer", "Software Engineer", "Tech Consultant"],
  "description": "Passionate software developer with 5+ years of experience building scalable web applications.",
  "Clients_Counting": 25,
  "Rateing": 4.9,
  "Stats": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "StatsNumber": "50+",
      "StatsLabel": "Projects Completed",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "StatsNumber": "5+",
      "StatsLabel": "Years Experience",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "AboutUs": {
    "_id": "507f1f77bcf86cd799439020",
    "AboutUsTitle": "Building innovative digital solutions",
    "AboutUsDescription": "I specialize in creating modern, scalable web applications using cutting-edge technologies.",
    "AboutSkills": [
      "React.js",
      "Node.js",
      "TypeScript",
      "MongoDB",
      "AWS",
      "Docker"
    ]
  },
  "AboutUsSlides": {
    "_id": "507f1f77bcf86cd799439020",
    "AboutUsSlides": [
      {
        "_id": "507f1f77bcf86cd799439021",
        "slideImage": "service-web-dev.png",
        "slideTitle": "Web Development",
        "slideDescription": "Full-stack web development using modern frameworks and technologies.",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "_id": "507f1f77bcf86cd799439022",
        "slideImage": "service-mobile.png",
        "slideTitle": "Mobile Development",
        "slideDescription": "Cross-platform mobile applications for iOS and Android.",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  },
  "FeaturedProjects": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "Title": "E-commerce Platform",
      "ShortDescription": "Modern e-commerce solution with real-time analytics and inventory management.",
      "Description": "Built a comprehensive e-commerce platform featuring:\n\n* Secure payment processing\n* Real-time inventory tracking\n* Advanced analytics dashboard\n* Multi-vendor support\n* Mobile-responsive design",
      "Image": "1234567890124.png",
      "ProjectLiveUrl": "https://demo-ecommerce.example.com",
      "Project_technologies": [
        "React.js",
        "Node.js",
        "MongoDB",
        "Stripe API",
        "AWS"
      ],
      "Porject_Status": "completed",
      "Featured": true,
      "createdAt": "2024-02-01T14:20:00.000Z",
      "updatedAt": "2024-02-01T14:20:00.000Z"
    }
  ],
  "FooterInfo": {
    "_id": "507f1f77bcf86cd799439040",
    "FooterTitle": "Professional Portfolio",
    "FooterDescription": "Let's collaborate on your next project. Get in touch to discuss how we can bring your ideas to life.",
    "OwnerEmail": "contact@azizkammoun.com",
    "OwnerPhone": "+1 (555) 123-4567",
    "OwnerAddress": "San Francisco, CA"
  },
  "footersociallinks": {
    "_id": "507f1f77bcf86cd799439040",
    "FooterSocialLinks": [
      {
        "_id": "507f1f77bcf86cd799439041",
        "SocialIcon": "LinkedIn",
        "SocialLink": "https://www.linkedin.com/in/azizkammoun"
      },
      {
        "_id": "507f1f77bcf86cd799439042",
        "SocialIcon": "Github",
        "SocialLink": "https://www.linkedin.com/in/azizkammoun"
      }
    ]
  }
}
```

### Get Projects Data

```http
GET /api/show/projects
```

Returns all projects (both featured and non-featured) with complete project details.

**Response Example:**

```json
[
  {
    "_id": "507f1f77bcf86cd799439030",
    "Title": "E-commerce Platform",
    "ShortDescription": "Modern e-commerce solution with real-time analytics and inventory management.",
    "Description": "Built a comprehensive e-commerce platform featuring secure payment processing, real-time inventory tracking, and advanced analytics dashboard.",
    "Image": "1234567890124.png",
    "ProjectLiveUrl": "https://demo-ecommerce.example.com",
    "Project_technologies": ["React.js", "Node.js", "MongoDB", "Stripe API"],
    "Porject_Status": "completed",
    "Featured": true
  },
  {
    "_id": "507f1f77bcf86cd799439031",
    "Title": "Task Management App",
    "ShortDescription": "Collaborative project management tool with real-time updates.",
    "Description": "Developed a comprehensive task management application with team collaboration features, real-time notifications, and progress tracking.",
    "Image": "1234567890125.png",
    "ProjectLiveUrl": "https://taskapp.example.com",
    "Project_technologies": ["Vue.js", "Express.js", "PostgreSQL", "Socket.io"],
    "Porject_Status": "completed",
    "Featured": false
  }
]
```

### Get Skills Data

```http
GET /api/show/skills
```

Returns all skills organized by categories with skill levels.

**Response Example:**

```json
{
  "SkillsData": [
    {
      "_id": "507f1f77bcf86cd799439050",
      "Category": "Frontend Development",
      "SkillName": "React.js",
      "Skill_Level": 95
    },
    {
      "_id": "507f1f77bcf86cd799439051",
      "Category": "Frontend Development",
      "SkillName": "TypeScript",
      "Skill_Level": 88
    },
    {
      "_id": "507f1f77bcf86cd799439052",
      "Category": "Backend Development",
      "SkillName": "Node.js",
      "Skill_Level": 92
    },
    {
      "_id": "507f1f77bcf86cd799439053",
      "Category": "Database",
      "SkillName": "MongoDB",
      "Skill_Level": 87
    },
    {
      "_id": "507f1f77bcf86cd799439054",
      "Category": "Cloud Services",
      "SkillName": "AWS",
      "Skill_Level": 82
    },
    {
      "_id": "507f1f77bcf86cd799439055",
      "Category": "Languages",
      "SkillName": "English",
      "Skill_Level": 95
    }
  ]
}
```

### Get CV Data

```http
GET /api/show/cv
```

Returns CV file information for download functionality.

**Response Example:**

```json
{
  "FindCv": {
    "_id": "507f1f77bcf86cd799439060",
    "Cv": "1234567890126.pdf"
  }
}
```

### Get Page SEO Data

```http
GET /api/seo/:page
```

**Parameters:**

- `page` (string): Page identifier (`home`, `projects`, `skills`, `cv`, `contact`)

Returns SEO metadata for the specified page.

**Response Example:**

```json
{
  "_id": "507f1f77bcf86cd799439070",
  "Page": "home",
  "Title": "Aziz Kammoun | Full Stack Developer Portfolio",
  "Description": "Professional portfolio showcasing full-stack development projects, skills, and experience in modern web technologies.",
  "Keywords": [
    "full stack developer",
    "web development",
    "react",
    "node.js",
    "portfolio"
  ],
  "SocialTitle": "Aziz Kammoun - Full Stack Developer",
  "SocialDescription": "Explore my portfolio featuring innovative web applications and software solutions.",
  "PageUrl": "https://azizkammoun.com",
  "SocialImage": "https://azizkammoun.com/images/social-preview.jpg",
  "TwitterTitle": "Aziz Kammoun Portfolio",
  "TwitterDescription": "Full Stack Developer specializing in React, Node.js, and cloud technologies.",
  "TwitterImage": "https://azizkammoun.com/images/twitter-card.jpg",
  "createdAt": "2024-01-10T09:15:00.000Z",
  "updatedAt": "2024-01-10T09:15:00.000Z"
}
```

### Get Static SEO Data

```http
GET /api/seo/static
```

Returns static SEO data applied to all pages.

**Response Example:**

```json
{
  "_id": "507f1f77bcf86cd799439080",
  "WebLogo": "https://azizkammoun.com/logo.png",
  "Author": "Aziz Kammoun",
  "WebsiteName": "Aziz Kammoun Portfolio",
  "LangCode": "en",
  "Lang": "English",
  "CountryCode": "US",
  "City": "San Francisco",
  "Geographic": "37.7749;-122.4194",
  "ICBM": "37.7749, -122.4194",
  "createdAt": "2024-01-10T09:15:00.000Z",
  "updatedAt": "2024-01-10T09:15:00.000Z"
}
```

---

## Authentication

### Admin Login

```http
POST /auth/admin
```

**Request Body:**

```json
{
  "userName": "admin",
  "password": "securePassword123"
}
```

**Success Response:**

```json
{
  "message": "Logged successfully",
  "access": true,
  "cookie": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....."
}
```

### Admin Logout

```http
POST /auth/logout
```

Clears authentication cookies and logs out the admin user.

**Success Response:**

```json
{
  "message": "Logged out successfully"
}
```

**Error Response:**

```json
{
  "message": "You have already logged out."
}
```

### Verify JWT Token

```http
GET /api/verify/jwt
```

Verifies admin authentication status. Use this endpoint before any admin dashboard action.

**Success Response:**

```json
{
  "message": "Valid Token - Access Granted",
  "access": true
}
```

**Error Response:**

```json
{
  "message": "Invalid or expired token You Need to LOGIN AGAIN",
  "access": false
}
```

---

## Admin Dashboard

### SEO Management

#### Edit Page SEO

```http
PUT /api/edit/seo/:page
```

**Parameters:**

- `page` (string): Page identifier (`home`, `projects`, `skills`, `cv`, `contact`)

**Request Body (all fields optional):**

```json
{
  "Title": "Professional Developer Portfolio | Aziz Kammoun",
  "Description": "Full-stack developer specializing in modern web applications with React, Node.js, and cloud technologies.",
  "Keywords": ["web developer", "react developer", "node.js", "full stack"],
  "SocialTitle": "Aziz Kammoun - Professional Web Developer",
  "SocialDescription": "Creating innovative web solutions with modern technologies",
  "PageUrl": "https://azizkammoun.com",
  "SocialImage": "https://azizkammoun.com/images/og-image.jpg",
  "TwitterTitle": "Aziz Kammoun | Web Developer",
  "TwitterDescription": "Full stack developer creating amazing web experiences",
  "TwitterImage": "https://azizkammoun.com/images/twitter-image.jpg"
}
```

#### Edit Static SEO

```http
PUT /api/edit/static/seo
```

**Request Body (all fields optional):**

```json
{
  "WebLogo": "https://azizkammoun.com/assets/logo.png",
  "Author": "Aziz Kammoun",
  "WebsiteName": "Aziz Kammoun Portfolio",
  "LangCode": "en",
  "Lang": "English",
  "CountryCode": "US",
  "City": "San Francisco",
  "Geographic": "37.7749;-122.4194",
  "ICBM": "37.7749, -122.4194"
}
```

### Home Section

#### Update Logo

```http
PUT /api/home/update/logo?folder=logo
```

**Query Parameters:**

- `folder`: `logo` (required)

**Request Body:**

- `image`: Image file (multipart/form-data)

#### Edit Home Data

```http
PUT /api/home/edit/homedata
```

**Request Body (all fields optional):**

```json
{
  "DisplayName": "Aziz Kammoun",
  "MainRoles": ["Full Stack Developer", "Software Engineer", "Tech Lead"],
  "description": "Experienced developer passionate about creating scalable web applications",
  "Clients_Counting": 30,
  "Rateing": 4.8
}
```

#### Add Statistics

```http
POST /api/home/add/stat
```

**Request Body (all fields required):**

```json
{
  "StatsNumber": "100+",
  "StatsLabel": "Projects Delivered"
}
```

#### Delete Statistics

```http
DELETE /api/home/delete/stat/:id
```

**Parameters:**

- `id` (string): MongoDB ObjectId

#### Update Statistics

```http
PUT /api/home/update/stat/:id
```

**Parameters:**

- `id` (string): MongoDB ObjectId

**Request Body (all fields optional):**

```json
{
  "StatsNumber": "150+",
  "StatsLabel": "Happy Clients"
}
```

### About Section

#### Edit About Data

```http
PUT /api/about/edit/aboutdata
```

**Request Body (all fields optional):**

```json
{
  "AboutUsTitle": "Passionate About Innovation",
  "AboutUsDescription": "I'm a full-stack developer with 5+ years of experience building scalable web applications.",
  "AboutSkills": ["JavaScript", "React", "Node.js", "Python", "AWS", "Docker"]
}
```

#### Add About US Slides

```http
POST /api/aboutslide/add/slide?folder=aboutimg
```

**Query Parameters:**

- `folder`: `aboutimg` (required)

**Request Body (all fields required):**

```json
{
  "slideTitle": "Web Development",
  "slideDescription": "Building modern, responsive web applications with cutting-edge technologies"
}
```

- `slideImage`: Image file (multipart/form-data)

#### Delete About Us Slide

```http
DELETE /api/aboutslide/delete/slide/:id
```

**Parameters:**

- `id` (string): MongoDB ObjectId

#### Edit About Slide

```http
PUT /api/aboutslide/edit/slide/:id
```

**Parameters:**

- `id` (string): MongoDB ObjectId

**Request Body (all fields optional):**

```json
{
  "slideTitle": "Mobile Development",
  "slideDescription": "Creating cross-platform mobile applications"
}
```

- `slideImage`: Image file (optional, multipart/form-data)

### Projects Section

#### Add Project

```http
POST /api/projects/add/project?folder=projectsimg
```

**Query Parameters:**

- `folder`: `projectsimg` (required)

**Request Body:**

```json
{
  "Title": "Task Management System",
  "ShortDescription": "Collaborative project management platform",
  "Description": "A comprehensive task management system with real-time collaboration, file sharing, and progress tracking capabilities.",
  "Image": "https://example.com/project-image.jpg",
  "ProjectLiveUrl": "https://taskmanager.example.com",
  "Project_technologies": ["React", "Node.js", "MongoDB", "Socket.io"],
  "Porject_Status": "completed",
  "Featured": true
}
```

**Field Requirements:**

- `Title`: Required, minimum 3 characters
- `ShortDescription`: Required, minimum 1 character
- `Description`: Required, minimum 10 characters
- `Image`: Optional, Must Be multipart/form-data **Url Not Supported**
- `ProjectLiveUrl`: Optional, must be valid URI
- `Project_technologies`: Optional array
- `Porject_Status`: Required, see valid values below
- `Featured`: Optional boolean, defaults to false

**Valid Status Values:**
`completed`, `in progress`, `planning`, `planned`, `on hold`, `canceled`, `prototype`, `launched`, `metrics`, `awarded`, `passed`, `achievement`, `archived`

#### Delete Project

```http
DELETE /api/projects/delete/:id
```

**Parameters:**

- `id` (string): MongoDB ObjectId

#### Edit Project

```http
PUT /api/projects/edit/:id
```

**Parameters:**

- `id` (string): MongoDB ObjectId

**Request Body:** Same structure as Add Project (all fields optional)

#### Remove Project Image

```http
PUT /api/projects/image/remove/:id
```

**Parameters:**

- `id` (string): MongoDB ObjectId

### Skills Section

#### Add Skill

```http
POST /api/skills/add/skill
```

**Request Body (all fields required):**

```json
{
  "Category": "Frontend Development",
  "SkillName": "Vue.js",
  "Skill_Level": 85
}
```

#### Edit Skill

```http
PUT /api/skills/edit/skill/:id
```

**Parameters:**

- `id` (string): MongoDB ObjectId

**Request Body (all fields optional):**

```json
{
  "Category": "Backend Development",
  "SkillName": "Python",
  "Skill_Level": 90
}
```

#### Delete Skill

```http
DELETE /api/skills/delete/skill/:id
```

**Parameters:**

- `id` (string): MongoDB ObjectId

### CV Section

#### Add CV

```http
POST /api/cv/add/?folder=mycv
```

**Query Parameters:**

- `folder`: `mycv` (required)

**Request Body:**

- `cv`: PDF file (multipart/form-data)

#### Delete CV

```http
DELETE /api/cv/delete/:id
```

**Parameters:**

- `id` (string): MongoDB ObjectId

### Footer Section

#### Add Social Platform

```http
POST /api/footer/platform/add
```

**Request Body (all fields required):**

```json
{
  "SocialIcon": "Twitter",
  "SocialLink": "https://twitter.com/azizkammoun"
}
```

**Valid Social Icons:**
`Facebook`, `Twitter`, `Instagram`, `LinkedIn`, `Github`, `Youtube`, `Mail`, `Twitch`, `Globe`, `Discord`, `Telegram`, `Pinterest`, `Fiverr`, `Reddit`, `TikTok`, `Snapchat`, `Vimeo`, `WhatsApp`, `Slack`, `Dribbble`, `Behance`, `Website`, `Email`, `Phone`

#### Delete Social Platform

```http
DELETE /api/footer/platform/delete/:id
```

**Parameters:**

- `id` (string): MongoDB ObjectId

#### Edit Social Platform

```http
PUT /api/footer/platform/edit/:id
```

**Parameters:**

- `id` (string): MongoDB ObjectId

**Request Body (all fields optional):**

```json
{
  "SocialIcon": "Github",
  "SocialLink": "https://github.com/azizkammoun"
}
```

#### Edit Footer Data

```http
PUT /api/footer/edit/footerdata
```

**Request Body (all fields optional):**

```json
{
  "FooterTitle": "Professional Portfolio",
  "FooterDescription": "Building innovative solutions for the modern web",
  "OwnerEmail": "contact@azizkammoun.com",
  "OwnerPhone": "+216 1234567",
  "OwnerAddress": "Tunisia, Tn"
}
```

---

## Contact

### Send Contact Message

```http
POST /api/contact
```

**Request Body (all fields required):**

```json
{
  "fullname": "Jane Smith",
  "address": "jane.smith@company.com",
  "subject": "Project Collaboration Inquiry",
  "message": "Hello, I'm interested in discussing a potential web development project. Would you be available for a consultation?"
}
```

**Field Requirements:**

- `fullname`: Required, sender's full name
- `address`: Required, valid email address
- `subject`: Required, message subject
- `message`: Required, minimum 10 characters

**Success Response:**

```json
{
  "success": true,
  "data": {
    "id": "5f1376c9-1d3a-4b28-90c8-a95a51350301"
  }
}
```

**Rate Limit Block:**

```json
{
  "message": "Rate limit exceeded. Blocked for 2 hours. Strike 1/5."
}
```

---

## Response Patterns & Error Handling

### Standard Success Responses

- **POST operations**: `{ "message": "Created successfully", "success": true }`
- **PUT operations**: `{ "message": "Updated successfully", "success": true }`
- **DELETE operations**: `{ "message": "Deleted successfully", "success": true }`

### Error Responses

**401 Unauthorized:**

```json
{
  "message": "Invalid or expired token You Need to LOGIN AGAIN",
  "access": false
}
```

**400 Bad Request:**

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**404 Not Found:**

```json
{
  "message": "Resource not found",
  "error": "The requested resource does not exist"
}
```

**500 Internal Server Error:**

```json
{
  "message": "Internal server error",
  "error": "An unexpected error occurred"
}
```

### Data Structure Notes

- All records include MongoDB `_id`, `createdAt`, and `updatedAt`
- Image fields store filenames, not full URLs
- File uploads use multipart/form-data
- Supported image formats: JPG, PNG, GIF, WEBP
- CV uploads accept PDF files
- Skill levels are integers 0-100
- Project descriptions support markdown formatting

### Authentication Requirements

- All admin endpoints require valid JWT authentication
- Verify authentication with `/api/verify/jwt` before admin operations
- Sessions expire after extended inactivity
- Use `/auth/logout` to clear authentication state
