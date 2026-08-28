const fs = require('fs');
const path = require('path');

const files = {
  'index.md': `# Satwik Raj
## Full Stack & IoT Developer

CSE student building at the intersection of hardware and software — IoT systems, web apps, and Python automation.

---

### Projects

#### 1. The Global Grid
*Personal*
A premium international digital newspaper site blending traditional print journalism with modern web technology — category sections, a daily print-style front page, searchable archive, bookmarks, and downloadable PDF editions.
**Tech:** Next.js, React, Tailwind CSS

#### 2. Smart Delivery System
*Personal*
A full-stack logistics platform implementing 13 classic algorithms (Dijkstra, Floyd-Warshall, Knapsack, Kruskal/Prim, N-Queens & more) to optimize delivery routing, resource allocation, and network topography — with live order tracking and an admin panel.
**Tech:** React, Node.js, MySQL, DSA

#### 3. Food Ordering System
*Personal*
CLI-based food ordering app in Python with full MySQL persistence. Handles menu browsing, order placement, and order history end-to-end. Designed the full database schema — users, menu items, orders, and order items with relational integrity.
**Tech:** Python, MySQL, CLI, DBMS, OOP

---

### Skills

**Programming:** Python, JavaScript, Java, C
**Web & Database:** HTML5 / CSS3, Node.js, MySQL, MongoDB
**IoT & Hardware:** Arduino, NodeMCU / ESP8266, Sensors
**Tools & DevOps:** Git, GitHub, VS Code, Linux, React, ML, Docker
**Web & Interactive:** Animation, Infinite Scroll, Transitions, 3D, Canvas API, Three.js, CSS FX

---

### Certifications

#### Agentic AI Saksham
*CAPABL & RV INSTITUTE OF MANAGEMENT*
Successfully participated in the two-day Agentic AI Saksham workshop — a collaborative initiative with RV Institute of Management and Capabl. The program offered deep insights into Generative AI, Agentic AI architectures, and contemporary AI technologies with hands-on exposure to real-world applications.

---

*Links:*
- [About](/about)
- [Contact](/contact)
- [Privacy Policy](/privacy)
`,
  'about.md': `# About Satwik Raj

I'm **Satwik Raj** — a Computer Science & Engineering student passionate about turning ideas into real software. I work across the stack, from backend Python scripts to IoT hardware, from CLI tools to browser games.

Currently deep-diving into **AI & automation**, and the intersection of **hardware + software**.

## Details
- **Role:** CSE Student & Developer
- **Location:** India 🇮🇳
- **Focus:** IoT · Web · Python · AI
- **Status:** Open to Opportunities

I'm actively seeking opportunities to apply my skills in software development, systems engineering, and intelligent automation. With experience ranging from full-stack logistics platforms to embedded systems and microcontrollers, I enjoy bridging the gap between the physical and digital worlds. My background includes intensive projects like the Smart Delivery System (implementing complex DSA) and The Global Grid (a full-scale digital newspaper). Check out my projects for more details!

[← Back to Home](/)
`,
  'contact.md': `# Contact

**LET'S TALK.**

Whether you have a question, a project proposal, or just want to say hi, my inbox is always open. I'm currently open to new opportunities and collaborations in software engineering, full-stack web development, and IoT systems.

You can reach me via email at **raj0.0satwik@gmail.com**, or connect with me on LinkedIn and GitHub. I try my best to get back to all inquiries within 24-48 hours. Looking forward to connecting!

- **Email:** raj0.0satwik@gmail.com
- **GitHub:** [satwik88](https://github.com/satwik88)
- **LinkedIn:** [satwikraj](https://linkedin.com/in/satwikraj)
- **Instagram:** [satwik._23](https://instagram.com/satwik._23)

[← Back to Home](/)
`,
  'privacy.md': `# Privacy Policy

### 1. No Tracking or Analytics
This portfolio website respects your privacy. I do not use Google Analytics, Vercel Web Analytics, or any other third-party tracking scripts. There are no cookies set by this site for tracking user behavior, and your visits remain completely private. The only logs collected are the standard, anonymized server logs handled automatically by my hosting provider (Vercel) to ensure the site's security and performance.

### 2. Contact Form Submissions
If you choose to use the contact form on the home page, the information you provide (Name, Email, Message) is sent via **Formspree** (formspree.io), a secure third-party form handling service. Formspree processes this data solely for the purpose of forwarding your message to my personal email inbox. Your information will never be sold, shared, or used for marketing purposes. By submitting the contact form, you consent to this data processing.

### 3. External Links
This site contains links to external platforms like GitHub, LinkedIn, and Instagram. Once you navigate away from \`satwik.is-a.dev\`, the privacy policies of those respective platforms will apply. I am not responsible for the privacy practices of other websites.

[← Back to Home](/)
`
};

Object.entries(files).forEach(([filename, content]) => {
  const filePath = path.join(process.cwd(), filename);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Generated ${filename}`);
});
