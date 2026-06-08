import React, { useRef } from "https://esm.sh/react@18";
import ReactDOM from "https://esm.sh/react-dom@18/client";
import {
  motion,
  useScroll,
  useTransform,
} from "https://esm.sh/framer-motion@10";

const projects = [
  {
    number: "01",
    category: "Personal",
    name: "Personal Website",
    image: "assets/portfolio.png",
    bullets: [
      "Interactive developer portfolio with a reactive 3D WebGL particle field using Three.js",
      "Glassmorphism UI with dark/light mode toggle and smooth circle-wipe transition animation",
      "Smooth single-page panel architecture with custom navigation and scroll progress",
    ],
    tech: ["HTML5", "CSS3", "Vanilla JS", "Three.js", "UI/UX"],
    github: "https://github.com/satwik88/SR_DEV_LAB",
  },
  {
    number: "02",
    category: "Personal",
    name: "Food Ordering System",
    image: "assets/food_ordering.png",
    bullets: [
      "CLI-based food ordering app in Python with full MySQL persistence",
      "Handles menu browsing, order placement, and order history end-to-end",
      "Designed the full database schema — users, menu items, orders, and order items with relational integrity",
    ],
    tech: ["Python", "MySQL", "CLI", "DBMS", "OOP"],
    github: "https://github.com/satwik88/Food-Ordering-System",
  },
  {
    number: "03",
    category: "Personal",
    name: "Snake Game",
    image: "assets/snake_game.png",
    bullets: [
      "Browser Snake clone built in vanilla JS — no frameworks, pure canvas rendering",
      "Features neon UI, local high score storage, and 3 selectable difficulty speeds",
      "Focused on clean game loop logic and smooth 60fps canvas animation",
    ],
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas API", "localStorage"],
    github: "https://github.com/satwik88/Snake",
  },
];

const Card = ({
  number,
  category,
  name,
  image,
  bullets,
  tech,
  github,
  index,
  totalCards,
  sectionProgress,
}) => {
  // Calculate target scale according to formula: targetScale = 1 - (totalCards - 1 - index) * 0.05
  const targetScale = 1 - (totalCards - 1 - index) * 0.05;

  // Slice of the total section progress for this specific card
  const start = index / totalCards;
  const end = (index + 1) / totalCards;

  // Transform scale and opacity dynamically based on section scroll progress slice
  const scale = useTransform(sectionProgress, [start, end], [1, targetScale]);

  // Custom dark dimming effect overlay: as subsequent cards stack over, dim the background slightly
  const dimOpacity = useTransform(sectionProgress, [start, end], [0, 0.45]);

  // Fallback for image load error
  const handleImageError = (e) => {
    e.target.style.display = "none";
    e.target.nextSibling.style.display = "flex";
  };

  return (
    <div
      className="card-sticky-container"
      style={{ top: `calc(24px + ${index * 28}px)`, zIndex: index + 1 }}
    >
      <motion.div className="react-project-card" style={{ scale }}>
        {/* Dimming overlay removed as per user request to not darken cards */}

        {/* Top Row: large number, category tag, project name */}
        <div className="card-top-row">
          <div className="card-top-left">
            <span className="card-num">{number}</span>
            <span className="card-category-tag">{category}</span>
            <h3 className="card-project-name">{name}</h3>
          </div>
        </div>

        {/* Bottom Row: columns */}
        <div className="card-bottom-row">
          {/* Left Column (40% width): project screenshot */}
          <div className="card-left-col">
            <div className="card-img-wrap">
              <img
                src={image}
                alt={name}
                className="card-screenshot"
                onError={handleImageError}
              />
              <div
                className="card-fallback-img"
                style={{
                  display: "none",
                  width: "100%",
                  height: "100%",
                  background: "var(--proj-img-wrap-bg)",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  color: "var(--proj-muted)",
                }}
              >
                <span
                  style={{
                    fontSize: "4.5rem",
                    fontWeight: 800,
                    fontFamily: "var(--mono)",
                    opacity: 0.15,
                    lineHeight: 1,
                  }}
                >
                  {number}
                </span>
                <span
                  style={{
                    fontSize: "1.25rem",
                    fontFamily: "var(--sans)",
                    marginTop: "0.5rem",
                    fontWeight: 700,
                    color: "var(--proj-muted)",
                  }}
                >
                  {name}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column (60% width): descriptions, tech stack pills, github button */}
          <div className="card-right-col">
            <ul className="card-bullets">
              {bullets.map((bullet, idx) => (
                <li key={idx}>{bullet}</li>
              ))}
            </ul>

            <div className="card-tech-section">
              <div className="card-tech-pills">
                {tech.map((pill, idx) => (
                  <span key={idx} className="card-tech-pill">
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            <div className="card-actions">
              {github ? (
                <a
                  href={github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="github-ghost-btn"
                  title="Open GitHub Repository in new tab"
                >
                  <svg
                    viewBox="0 0 16 16"
                    width="14"
                    height="14"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
                    ></path>
                  </svg>
                  GitHub
                </a>
              ) : (
                <span
                  className="private-repo-badge"
                  title="This repository is private"
                >
                  <svg
                    viewBox="0 0 16 16"
                    width="13"
                    height="13"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 1a3.5 3.5 0 00-3.5 3.5V6H3.75A1.75 1.75 0 002 7.75v5.5C2 14.215 2.785 15 3.75 15h8.5A1.75 1.75 0 0014 13.25v-5.5A1.75 1.75 0 0012.25 6H11.5V4.5A3.5 3.5 0 008 1zm2 5V4.5a2 2 0 10-4 0V6h4zM3.75 7.5h8.5a.25.25 0 01.25.25v5.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-5.5a.25.25 0 01.25-.25zM8 9a1 1 0 100 2 1 1 0 000-2z"
                    ></path>
                  </svg>
                  Private Repo
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ProjectsSection = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={sectionRef} className="react-projects-inner">
      {/* Title block */}
      <div className="react-projects-title-wrap">
        <p className="react-projects-pre">////// EXPLORING THE LAB</p>
        <h2 className="react-projects-title">Project</h2>
      </div>

      {/* Stacking list */}
      <div className="sticky-cards-stack">
        {projects.map((project, index) => (
          <Card
            key={project.number}
            {...project}
            index={index}
            totalCards={projects.length}
            sectionProgress={scrollYProgress}
          />
        ))}
      </div>
    </div>
  );
};

// Mount the React component
// Render to both Desktop and Mobile React roots
const rootNodeDesktop = document.getElementById("react-projects-root");
if (rootNodeDesktop) {
  const rootDesktop = ReactDOM.createRoot(rootNodeDesktop);
  rootDesktop.render(
    <React.StrictMode>
      <ProjectsSection />
    </React.StrictMode>
  );
}

const rootNodeMobile = document.getElementById("react-projects-root-mobile");
if (rootNodeMobile) {
  const rootMobile = ReactDOM.createRoot(rootNodeMobile);
  rootMobile.render(
    <React.StrictMode>
      <ProjectsSection />
    </React.StrictMode>
  );
}
