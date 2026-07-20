/**
 * Projects Stacking Cards Component
 * Written in plain React.createElement — no JSX, no Babel required.
 * Loaded as a native ES module directly in the browser.
 */

import React, { useRef } from "https://esm.sh/react@18";
import ReactDOM from "https://esm.sh/react-dom@18/client";
import {
  motion,
  useScroll,
  useTransform,
} from "https://esm.sh/framer-motion@10";

const e = React.createElement;

const projects = [
  {
    number: "01",
    category: "Personal",
    name: "The Global Grid",
    image: "assets/global_grid.png",
    bullets: [
      "A premium international digital newspaper site blending traditional print journalism with modern web technology — category sections, a daily print-style front page, searchable archive, bookmarks, and downloadable PDF editions."
    ],
    tech: ["Next.js", "React", "Tailwind CSS"],
    github: "https://github.com/satwik88/The-Global-Grid",
    live: "https://the-global-grid.vercel.app/",
  },
  {
    number: "02",
    category: "Personal",
    name: "Smart Delivery System",
    image: "assets/smart_delivery.png",
    bullets: [
      "A full-stack logistics platform implementing 13 classic algorithms (Dijkstra, Floyd-Warshall, Knapsack, Kruskal/Prim, N-Queens & more) to optimize delivery routing, resource allocation, and network topography — with live order tracking and an admin panel."
    ],
    tech: ["React", "Node.js", "MySQL", "DSA"],
    github: "https://github.com/satwik88/Smart-Delivery-System",
    live: "https://smart-delivery-system-beta.vercel.app",
  },
  {
    number: "03",
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
];

/* ── Card Component ──────────────────────────────────────── */
const Card = ({
  number,
  category,
  name,
  image,
  bullets,
  tech,
  github,
  live,
  index,
  totalCards,
  sectionProgress,
}) => {
  const targetScale = 1 - (totalCards - 1 - index) * 0.05;
  const start = index / totalCards;
  const end = (index + 1) / totalCards;
  const scale = useTransform(sectionProgress, [start, end], [1, targetScale]);

  const handleImageError = (ev) => {
    ev.target.style.display = "none";
    ev.target.nextSibling.style.display = "flex";
  };

  /* GitHub SVG path */
  const githubSvg = e(
    "svg",
    { viewBox: "0 0 16 16", width: "14", height: "14", fill: "currentColor" },
    e("path", {
      fillRule: "evenodd",
      d: "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z",
    })
  );

  /* Lock SVG path */
  const lockSvg = e(
    "svg",
    { viewBox: "0 0 16 16", width: "13", height: "13", fill: "currentColor" },
    e("path", {
      fillRule: "evenodd",
      d: "M8 1a3.5 3.5 0 00-3.5 3.5V6H3.75A1.75 1.75 0 002 7.75v5.5C2 14.215 2.785 15 3.75 15h8.5A1.75 1.75 0 0014 13.25v-5.5A1.75 1.75 0 0012.25 6H11.5V4.5A3.5 3.5 0 008 1zm2 5V4.5a2 2 0 10-4 0V6h4zM3.75 7.5h8.5a.25.25 0 01.25.25v5.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-5.5a.25.25 0 01.25-.25zM8 9a1 1 0 100 2 1 1 0 000-2z",
    })
  );

  /* External Link SVG path */
  const externalSvg = e(
    "svg",
    { viewBox: "0 0 24 24", width: "14", height: "14", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
    e("path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }),
    e("polyline", { points: "15 3 21 3 21 9" }),
    e("line", { x1: "10", y1: "14", x2: "21", y2: "3" })
  );

  const actionBtn = [];
  
  if (live) {
    actionBtn.push(
      e(
        "a",
        {
          key: "live",
          href: live,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "github-ghost-btn",
          title: "Open Live Demo in new tab",
        },
        externalSvg,
        "Live Demo"
      )
    );
  }

  if (github) {
    actionBtn.push(
      e(
        "a",
        {
          key: "github",
          href: github,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "github-ghost-btn",
          title: "Open GitHub Repository in new tab",
        },
        githubSvg,
        "GitHub"
      )
    );
  }

  if (actionBtn.length === 0) {
    actionBtn.push(
      e(
        "span",
        { key: "private", className: "private-repo-badge", title: "This repository is private" },
        lockSvg,
        "Private Repo"
      )
    );
  }

  return e(
    "div",
    {
      className: "card-sticky-container",
      style: { top: `calc(24px + ${index * 28}px)`, zIndex: index + 1 },
    },
    e(
      motion.div,
      { className: "react-project-card", style: { scale } },

      /* Top Row */
      e(
        "div",
        { className: "card-top-row" },
        e(
          "div",
          { className: "card-top-left" },
          e("span", { className: "card-num" }, number),
          e("span", { className: "card-category-tag" }, category),
          e("h3", { className: "card-project-name" }, name)
        )
      ),

      /* Bottom Row */
      e(
        "div",
        { className: "card-bottom-row" },

        /* Left column — screenshot */
        e(
          "div",
          { className: "card-left-col" },
          e(
            "div",
            { className: "card-img-wrap" },
            e("img", {
              src: image,
              alt: name,
              className: "card-screenshot",
              onError: handleImageError,
            }),
            e("div", {
              className: "card-fallback-img",
              style: {
                display: "none",
                width: "100%",
                height: "100%",
                background: "var(--proj-img-wrap-bg)",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                color: "var(--proj-muted)",
              },
            },
              e("span", {
                style: {
                  fontSize: "4.5rem",
                  fontWeight: 800,
                  fontFamily: "var(--mono)",
                  opacity: 0.15,
                  lineHeight: 1,
                },
              }, number),
              e("span", {
                style: {
                  fontSize: "1.25rem",
                  fontFamily: "var(--sans)",
                  marginTop: "0.5rem",
                  fontWeight: 700,
                  color: "var(--proj-muted)",
                },
              }, name)
            )
          )
        ),

        /* Right column — details */
        e(
          "div",
          { className: "card-right-col" },
          e(
            "ul",
            { className: "card-bullets" },
            ...bullets.map((bullet, idx) => e("li", { key: idx }, bullet))
          ),
          e(
            "div",
            { className: "card-tech-section" },
            e(
              "div",
              { className: "card-tech-pills" },
              ...tech.map((pill, idx) =>
                e("span", { key: idx, className: "card-tech-pill" }, pill)
              )
            )
          ),
          e("div", { className: "card-actions" }, actionBtn)
        )
      )
    )
  );
};

/* ── ProjectsSection Component ───────────────────────────── */
const ProjectsSection = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  return e(
    "div",
    { ref: sectionRef, className: "react-projects-inner" },

    /* Title block */
    e(
      "div",
      { className: "react-projects-title-wrap" },
      e("p", { className: "react-projects-pre" }, "////// EXPLORING THE LAB"),
      e("h2", { className: "react-projects-title" }, "Project")
    ),

    /* Stacking cards */
    e(
      "div",
      { className: "sticky-cards-stack" },
      ...projects.map((project, index) =>
        e(Card, {
          key: project.number,
          ...project,
          index,
          totalCards: projects.length,
          sectionProgress: scrollYProgress,
        })
      )
    )
  );
};

/* ── Mount ───────────────────────────────────────────────── */
const container = document.getElementById("react-projects-root");
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(e(React.StrictMode, null, e(ProjectsSection, null)));
}
