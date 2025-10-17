# Ray Tracing Simulator

An interactive 2D ray-tracing visualization tool built with Vue.js and PixiJS.

## Project Structure

```
raytracing-simulator/
├── src/
│   ├── main.js                      # Vue app entry
│   ├── App.vue                      # Root component
│   ├── components/
│   │   └── canvas/
│   │       └── CanvasContainer.vue  # PixiJS canvas wrapper
│   ├── pixi/
│   │   └── core/
│   │       └── PixiApp.js           # PixiJS application
│   └── styles/
│       └── main.css                 # Global styles
├── index.html
├── package.json
├── vite.config.js
├── Dockerfile                       # Production build
├── Dockerfile.dev                   # Development build
└── nginx.conf                       # Nginx configuration
```

## Getting Started

### Local Development (without Docker)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   ```
   http://localhost:5173
   ```

### Docker Development

1. **Build and run development container:**
   ```bash
   npm run docker:dev
   ```

2. **Open in browser:**
   ```
   http://localhost:5173
   ```

### Docker Production

1. **Build production image:**
   ```bash
   npm run docker:build
   ```

2. **Run production container:**
   ```bash
   npm run docker:run
   ```

3. **Open in browser:**
   ```
   http://localhost:8080
   ```

### Manual Docker Commands

**Development:**
```bash
docker build -f Dockerfile.dev -t raytracing-dev .
docker run -p 5173:5173 -v $(pwd)/src:/app/src -v $(pwd)/index.html:/app/index.html raytracing-dev
```

**Production:**
```bash
docker build -t raytracing-prod .
docker run -p 8080:80 raytracing-prod
```

## Tech Stack

- **Vue 3** - UI framework
- **Pinia** - State management
- **PixiJS** - WebGL rendering
- **Vite** - Build tool
- **Docker** - Containerization

## Next Steps

- Add simulation stores (Pinia)
- Implement geometric objects
- Build ray-tracing engine
- Add spatial acceleration structures
- Create UI controls and panels