require("dotenv").config();

const mongoose = require("mongoose");
const InterviewQuestion = require("../models/InterviewQuestion");

const MONGODB_URI = process.env.MONGODB_URI;

const questionsData = [
  // ==========================================
  // JAVASCRIPT DEVELOPER
  // ==========================================
  {
    role: "JavaScript Developer",
    category: "JavaScript",
    difficulty: "easy",
    type: "technical",
    tags: ["javascript", "variables", "scope", "fundamentals"],
    question: "What is the difference between var, let, and const in JavaScript?",
    expectedAnswer: "var is function-scoped and hoisted with undefined initialization, allowing redeclaration. let and const are block-scoped and hoisted in a Temporal Dead Zone (TDZ). const cannot be reassigned after declaration.",
    explanation: "Introduced in ES6, let and const prevent accidental global variables and hoisting bugs common with var. const provides immutability to the binding (though object properties can still mutate)."
  },
  {
    role: "JavaScript Developer",
    category: "JavaScript",
    difficulty: "easy",
    type: "technical",
    tags: ["javascript", "closure", "functions", "scope"],
    question: "What is a closure in JavaScript and when would you use it?",
    expectedAnswer: "A closure is the combination of a function bundled together with references to its surrounding lexical environment. It gives inner functions access to outer function variables even after the outer function has finished executing.",
    explanation: "Closures are commonly used for data privacy (emulating private variables), function factories, currying, and memoization."
  },
  {
    role: "JavaScript Developer",
    category: "JavaScript",
    difficulty: "easy",
    type: "technical",
    tags: ["javascript", "hoisting", "basics"],
    question: "What is hoisting in JavaScript?",
    expectedAnswer: "Hoisting is JavaScript's default behavior of moving variable and function declarations to the top of their containing scope during the compilation phase before code execution.",
    explanation: "Function declarations are hoisted with their complete definition, var declarations are hoisted and initialized to undefined, while let and const are hoisted without initialization (TDZ)."
  },
  {
    role: "JavaScript Developer",
    category: "JavaScript",
    difficulty: "easy",
    type: "technical",
    tags: ["javascript", "types", "operators"],
    question: "What is the difference between == and === operators?",
    expectedAnswer: "== performs type coercion before comparison (loose equality), while === compares both value and type without converting types (strict equality).",
    explanation: "Strict equality (===) is recommended in modern JavaScript to avoid unexpected bugs resulting from implicit type coercion (e.g., '' == 0 is true, but '' === 0 is false)."
  },
  {
    role: "JavaScript Developer",
    category: "JavaScript",
    difficulty: "medium",
    type: "technical",
    tags: ["javascript", "promises", "async"],
    question: "Explain Promises and their different states in JavaScript.",
    expectedAnswer: "A Promise is an object representing the eventual completion or failure of an asynchronous operation. It has three states: pending (initial), fulfilled (operation completed successfully with a value), and rejected (operation failed with an error).",
    explanation: "Promises resolve callback hell through chaining (.then, .catch, .finally) and serve as the foundation for modern async/await syntax."
  },
  {
    role: "JavaScript Developer",
    category: "JavaScript",
    difficulty: "medium",
    type: "technical",
    tags: ["javascript", "async-await", "promises"],
    question: "What is async/await and how does it relate to Promises?",
    expectedAnswer: "async/await is syntactic sugar built on top of Promises. Declaring a function as async makes it return a Promise, and the await keyword pauses the execution of the function until the awaited Promise settles, allowing asynchronous code to be written in a synchronous, readable style.",
    explanation: "Errors in async/await functions can be handled using standard try/catch blocks instead of .catch() methods."
  },
  {
    role: "JavaScript Developer",
    category: "JavaScript",
    difficulty: "medium",
    type: "technical",
    tags: ["javascript", "event-loop", "concurrency", "asynchronous"],
    question: "Explain the JavaScript Event Loop, Call Stack, and Task Queues.",
    expectedAnswer: "JavaScript is single-threaded. The Call Stack executes synchronous code. Asynchronous callbacks are sent to Task Queues: Microtask Queue (Promises, queueMicrotask) and Macrotask Queue (setTimeout, setInterval, I/O). The Event Loop continuously checks if the Call Stack is empty, draining microtasks first before picking the next macrotask.",
    explanation: "Microtasks always have higher execution priority than macrotasks upon call stack completion."
  },
  {
    role: "JavaScript Developer",
    category: "JavaScript",
    difficulty: "medium",
    type: "technical",
    tags: ["javascript", "this", "functions", "objects"],
    question: "How does the 'this' keyword work in JavaScript and how do arrow functions differ?",
    expectedAnswer: "In standard functions, 'this' is dynamically determined at runtime based on how the function is invoked (global, object method, or constructor). Arrow functions do not have their own 'this' binding; they lexically inherit 'this' from their enclosing parent scope.",
    explanation: "call(), apply(), and bind() can explicitly set 'this' for traditional functions, but have no effect on arrow function context."
  },
  {
    role: "JavaScript Developer",
    category: "JavaScript",
    difficulty: "hard",
    type: "technical",
    tags: ["javascript", "event-delegation", "dom", "events"],
    question: "What is Event Delegation in JavaScript and why is it useful?",
    expectedAnswer: "Event Delegation is a pattern where a single event listener is attached to a parent element to manage events for all of its child elements, utilizing the Event Bubbling phase.",
    explanation: "It reduces memory consumption by avoiding adding listeners to hundreds of child nodes and automatically handles dynamically added elements without needing new listeners."
  },
  {
    role: "JavaScript Developer",
    category: "JavaScript",
    difficulty: "hard",
    type: "technical",
    tags: ["javascript", "memory-leaks", "garbage-collection", "performance"],
    question: "What causes memory leaks in JavaScript and how do you prevent them?",
    expectedAnswer: "Memory leaks occur when memory allocated to objects is no longer needed by the program but cannot be reclaimed by the garbage collector. Common causes: undeclared global variables, forgotten timers/intervals, unremoved DOM event listeners, and lingering closures holding references to large objects.",
    explanation: "Prevent them by cleaning up intervals and event listeners on unmount/teardown, using WeakMap/WeakSet, and profiling memory using Chrome DevTools Memory tab."
  },
  {
    role: "JavaScript Developer",
    category: "JavaScript",
    difficulty: "hard",
    type: "technical",
    tags: ["javascript", "prototypes", "inheritance", "oop"],
    question: "Explain prototypal inheritance and prototype chains in JavaScript.",
    expectedAnswer: "In JavaScript, objects inherit properties and methods directly from other objects through their prototype link (__proto__ / Object.getPrototypeOf). When a property is accessed, JS traverses up the prototype chain until the property is found or null (Object.prototype's proto) is reached.",
    explanation: "ES6 'class' syntax is syntactic sugar over JS's underlying prototypal inheritance model."
  },

  // ==========================================
  // FRONTEND DEVELOPER
  // ==========================================
  {
    role: "Frontend Developer",
    category: "Frontend",
    difficulty: "easy",
    type: "technical",
    tags: ["frontend", "css", "html", "box-model"],
    question: "Explain the CSS Box Model and the difference between content-box and border-box.",
    expectedAnswer: "The CSS Box Model consists of content, padding, border, and margin. In content-box (default), width and height apply only to content; padding and border add to the total element size. In border-box, width and height include content, padding, and border, keeping sizing predictable.",
    explanation: "Setting * { box-sizing: border-box; } is standard in modern web development for manageable layouts."
  },
  {
    role: "Frontend Developer",
    category: "Frontend",
    difficulty: "easy",
    type: "technical",
    tags: ["frontend", "html5", "semantics", "accessibility"],
    question: "What are semantic HTML tags and why are they important?",
    expectedAnswer: "Semantic HTML tags (such as <header>, <nav>, <main>, <article>, <section>, <footer>) clearly describe their meaning to both the browser and developer, providing meaningful structure instead of generic <div> tags.",
    explanation: "Semantic tags improve accessibility for screen readers, enhance search engine optimization (SEO), and make code cleaner and easier to maintain."
  },
  {
    role: "Frontend Developer",
    category: "Frontend",
    difficulty: "easy",
    type: "technical",
    tags: ["frontend", "javascript", "dom"],
    question: "What is the difference between document.getElementById and document.querySelector?",
    expectedAnswer: "getElementById specifically targets an element by its exact ID string and is slightly faster. querySelector accepts any valid CSS selector string (ID, class, attribute, pseudo-classes) and returns the first matching element.",
    explanation: "querySelector offers greater flexibility for complex CSS selectors across the DOM tree."
  },
  {
    role: "Frontend Developer",
    category: "Frontend",
    difficulty: "medium",
    type: "technical",
    tags: ["frontend", "responsive", "css-grid", "flexbox"],
    question: "What is the difference between CSS Flexbox and CSS Grid?",
    expectedAnswer: "Flexbox is designed for one-dimensional layouts (either a row OR a column), focusing on content alignment and distribution. CSS Grid is designed for two-dimensional layouts (rows AND columns simultaneously), focusing on grid track definition.",
    explanation: "Flexbox is best for components and navigation bars, while CSS Grid is best for page layout structures and complex responsive cards."
  },
  {
    role: "Frontend Developer",
    category: "Frontend",
    difficulty: "medium",
    type: "technical",
    tags: ["frontend", "storage", "cookies", "localstorage"],
    question: "Compare LocalStorage, SessionStorage, and Cookies.",
    expectedAnswer: "LocalStorage persists data indefinitely across browser sessions (5-10MB). SessionStorage persists data only for the current browser tab session (5MB). Cookies store small pieces of data (4KB) sent with every HTTP request to the server, supporting flags like HttpOnly and Secure.",
    explanation: "LocalStorage is great for theme or draft storage; Cookies with HttpOnly are suited for sensitive auth tokens."
  },
  {
    role: "Frontend Developer",
    category: "Frontend",
    difficulty: "medium",
    type: "technical",
    tags: ["frontend", "performance", "debounce", "throttle"],
    question: "What is the difference between Debouncing and Throttling?",
    expectedAnswer: "Debouncing delays function execution until a specified delay has elapsed since the last time the event was triggered (e.g. search autocomplete). Throttling enforces a maximum number of times a function can be executed over a period of time (e.g. window resize/scroll listeners).",
    explanation: "Both techniques prevent UI freeze and excessive network/render calls during rapid user inputs."
  },
  {
    role: "Frontend Developer",
    category: "Frontend",
    difficulty: "hard",
    type: "technical",
    tags: ["frontend", "web-vitals", "performance", "seo"],
    question: "What are Core Web Vitals and how do you optimize them?",
    expectedAnswer: "Core Web Vitals are Google's metrics for user experience: LCP (Largest Contentful Paint - loading speed, <2.5s), INP/FID (Interaction to Next Paint - responsiveness, <200ms), and CLS (Cumulative Layout Shift - visual stability, <0.1).",
    explanation: "Optimize LCP by compressing images and caching; INP by reducing main-thread JS blocking; and CLS by reserving width/height for images and ads."
  },
  {
    role: "Frontend Developer",
    category: "Frontend",
    difficulty: "hard",
    type: "technical",
    tags: ["frontend", "security", "xss", "csrf", "csp"],
    question: "How do you protect a frontend application against XSS and CSRF attacks?",
    expectedAnswer: "Against XSS: sanitize all user-generated content, use framework built-in escaping (React JSX escapes by default), avoid dangerouslySetInnerHTML, and set a Content Security Policy (CSP). Against CSRF: use SameSite cookie attributes (SameSite=Strict/Lax), anti-CSRF tokens, and custom request headers.",
    explanation: "CSP headers restrict unauthorized scripts from loading or executing in the client's browser."
  },

  // ==========================================
  // REACT DEVELOPER
  // ==========================================
  {
    role: "React Developer",
    category: "React",
    difficulty: "easy",
    type: "technical",
    tags: ["react", "basics", "vdom"],
    question: "What is React and what is the Virtual DOM?",
    expectedAnswer: "React is a declarative, component-based JavaScript library for building user interfaces. The Virtual DOM is an in-memory lightweight representation of the real DOM. When component state changes, React updates the Virtual DOM first, computes differences via a diffing algorithm, and efficiently updates only the changed parts in the real DOM.",
    explanation: "This avoids expensive direct DOM manipulations, resulting in high performance rendering."
  },
  {
    role: "React Developer",
    category: "React",
    difficulty: "easy",
    type: "technical",
    tags: ["react", "jsx", "syntax"],
    question: "What is JSX in React?",
    expectedAnswer: "JSX stands for JavaScript XML. It is a syntax extension for JavaScript that allows writing HTML-like markup directly inside JavaScript code. It gets transpiled (by Babel/SWC) into React.createElement() calls.",
    explanation: "JSX requires returning a single parent element or a React Fragment (<>...</>) and uses camelCase for attributes (e.g., className, onClick)."
  },
  {
    role: "React Developer",
    category: "React",
    difficulty: "easy",
    type: "technical",
    tags: ["react", "props", "state", "components"],
    question: "What is the difference between State and Props in React?",
    expectedAnswer: "Props are read-only inputs passed from parent to child components (unidirectional data flow). State is mutable data managed locally within a component that triggers a re-render when modified.",
    explanation: "Props are immutable from the receiver's perspective; State is managed privately via useState/useReducer."
  },
  {
    role: "React Developer",
    category: "React",
    difficulty: "easy",
    type: "technical",
    tags: ["react", "hooks", "usestate"],
    question: "Why should you not modify React state directly (e.g., state.count = 5)?",
    expectedAnswer: "Directly mutating state does not trigger React's component re-render cycle. State updates must use the setter function (setState or setCount) to notify React to schedule a re-render and compute Virtual DOM changes.",
    explanation: "Immutability also ensures previous and next states can be compared accurately in memoization and devtools."
  },
  {
    role: "React Developer",
    category: "React",
    difficulty: "medium",
    type: "technical",
    tags: ["react", "hooks", "useeffect", "lifecycle"],
    question: "Explain the useEffect hook and its dependency array behavior.",
    expectedAnswer: "useEffect lets you perform side effects in functional components (such as API calls, subscriptions, and DOM changes). With no dependency array, it runs after every render. With an empty array ([]), it runs once on mount. With dependencies ([a, b]), it runs when specified dependencies change. A cleanup function returned runs on unmount or before the effect re-runs.",
    explanation: "Proper cleanup inside useEffect prevents memory leaks like uncleared timers and dangling event listeners."
  },
  {
    role: "React Developer",
    category: "React",
    difficulty: "medium",
    type: "technical",
    tags: ["react", "hooks", "usememo", "usecallback", "performance"],
    question: "What is the difference between useMemo and useCallback?",
    expectedAnswer: "useMemo caches the result of a calculation between renders: useMemo(() => computeExpensiveValue(a, b), [a, b]). useCallback caches a function definition itself between renders: useCallback(() => handleClick(), [deps]) to avoid recreating functions passed to optimized child components.",
    explanation: "Both are optimization hooks designed to prevent unnecessary recalculations and re-renders of memoized child components (React.memo)."
  },
  {
    role: "React Developer",
    category: "React",
    difficulty: "medium",
    type: "technical",
    tags: ["react", "context-api", "state-management"],
    question: "What is Context API in React and when would you use it?",
    expectedAnswer: "The Context API provides a way to pass data deeply through the component tree without having to pass props down manually at every level (prop drilling). It is ideal for global state like themes, user authentication data, and locale preferences.",
    explanation: "While great for low-frequency global updates, large rapidly changing states are better handled with Redux Toolkit, Zustand, or Jotai to avoid wide re-render trees."
  },
  {
    role: "React Developer",
    category: "React",
    difficulty: "hard",
    type: "technical",
    tags: ["react", "reconciliation", "fiber", "internals"],
    question: "Explain React Reconciliation and the React Fiber architecture.",
    expectedAnswer: "Reconciliation is the process through which React compares the previous Virtual DOM tree with the new one using a heuristic O(n) diffing algorithm. React Fiber is the complete rewrite of React's core engine that enables incremental rendering—breaking rendering work into small units and pausing/prioritizing updates based on urgency.",
    explanation: "Keys in lists provide stable identities so React can match elements between renders instead of tearing down and rebuilding entire DOM subtrees."
  },
  {
    role: "React Developer",
    category: "React",
    difficulty: "hard",
    type: "technical",
    tags: ["react", "optimization", "performance", "code-splitting"],
    question: "How would you optimize performance in a large-scale React application?",
    expectedAnswer: "1. Code splitting using React.lazy and Suspense. 2. Memoization using React.memo, useMemo, and useCallback. 3. Virtualizing large lists with react-window or react-virtualized. 4. Keeping state local to prevent wide re-renders. 5. Debouncing/throttling fast inputs. 6. Optimizing bundle size and assets.",
    explanation: "Using React DevTools Profiler helps identify components causing frequent re-renders or sluggish commit phases."
  },
  {
    role: "React Developer",
    category: "React",
    difficulty: "hard",
    type: "technical",
    tags: ["react", "custom-hooks", "patterns"],
    question: "How do you design a Custom Hook in React and what are its rules?",
    expectedAnswer: "A custom hook is a JavaScript function whose name starts with 'use' and that can call other React hooks. It extracts reusable component logic (like data fetching, form handling, or window resizing) without duplicating stateful logic across components.",
    explanation: "Custom hooks follow the standard Rules of Hooks: only call hooks at the top level and only call them from React function components or other custom hooks."
  },

  // ==========================================
  // NODE.JS DEVELOPER
  // ==========================================
  {
    role: "Node.js Developer",
    category: "Node.js",
    difficulty: "easy",
    type: "technical",
    tags: ["nodejs", "runtime", "v8"],
    question: "What is Node.js and how does it work?",
    expectedAnswer: "Node.js is an open-source, cross-platform JavaScript runtime environment built on Chrome's V8 engine and libuv. It uses an event-driven, non-blocking I/O model that makes it lightweight and efficient for data-intensive real-time applications across distributed devices.",
    explanation: "Node.js offloads asynchronous I/O operations (file system, network) to libuv's thread pool while the main thread runs the JS event loop."
  },
  {
    role: "Node.js Developer",
    category: "Node.js",
    difficulty: "easy",
    type: "technical",
    tags: ["nodejs", "express", "middleware"],
    question: "What is Express middleware and how does the next() function work?",
    expectedAnswer: "Middleware functions in Express have access to the request object (req), response object (res), and the next middleware function (next). Middleware can execute code, modify req/res, end the request-response cycle, or call next() to pass control to the next handler.",
    explanation: "If a middleware does not call next() or send a response, the request will hang indefinitely."
  },
  {
    role: "Node.js Developer",
    category: "Node.js",
    difficulty: "easy",
    type: "technical",
    tags: ["nodejs", "modules", "commonjs", "esmodules"],
    question: "What is the difference between CommonJS and ES Modules in Node.js?",
    expectedAnswer: "CommonJS uses require() and module.exports, loading modules synchronously at runtime. ES Modules use import and export statements, which are statically analyzed at compile-time and support asynchronous loading.",
    explanation: "Node.js supports ES Modules natively when configured via 'type': 'module' in package.json or using .mjs file extensions."
  },
  {
    role: "Node.js Developer",
    category: "Node.js",
    difficulty: "medium",
    type: "technical",
    tags: ["nodejs", "eventemitter", "events", "patterns"],
    question: "What is EventEmitter in Node.js and how do you use it?",
    expectedAnswer: "EventEmitter is a core Node.js module (events) that facilitates communication between objects in Node.js. An emitter object emits named events that cause previously registered listener functions to be called synchronously.",
    explanation: "Core Node modules like http.Server, fs streams, and child_process inherit from EventEmitter."
  },
  {
    role: "Node.js Developer",
    category: "Node.js",
    difficulty: "medium",
    type: "technical",
    tags: ["nodejs", "error-handling", "express"],
    question: "How do you implement global error handling in an Express application?",
    expectedAnswer: "Define an error-handling middleware function with four parameters: (err, req, res, next). Express identifies this signature as the error handler. In async routes, wrap controllers with try/catch and pass errors to next(err) or use express-async-errors.",
    explanation: "Centralized error handling prevents server crashes and ensures consistent JSON error responses across all endpoints."
  },
  {
    role: "Node.js Developer",
    category: "Node.js",
    difficulty: "hard",
    type: "technical",
    tags: ["nodejs", "streams", "buffers", "performance"],
    question: "Explain Node.js Streams and why they are important for large data processing.",
    expectedAnswer: "Streams are collection objects that let you read data from a source or write data to a destination in continuous chunks instead of loading the entire file or payload into RAM all at once. Types: Readable, Writable, Duplex, and Transform.",
    explanation: "Using pipeline() or .pipe() prevents out-of-memory errors when streaming gigabytes of video or large CSV/database dumps."
  },
  {
    role: "Node.js Developer",
    category: "Node.js",
    difficulty: "hard",
    type: "technical",
    tags: ["nodejs", "clustering", "scaling", "pm2"],
    question: "How would you scale a Node.js application to handle high traffic?",
    expectedAnswer: "1. Vertical scaling: Use the Node.js Cluster module or PM2 cluster mode to spawn worker processes across all CPU cores. 2. Horizontal scaling: Deploy containerized instances behind a reverse proxy/load balancer (Nginx, AWS ALB). 3. Caching: Use Redis for session state and cached query results. 4. Asynchronous task queues: Use BullMQ or RabbitMQ for heavy background jobs.",
    explanation: "Because Node is single-threaded per process, clustering is essential to utilize multi-core servers."
  },

  // ==========================================
  // BACKEND DEVELOPER
  // ==========================================
  {
    role: "Backend Developer",
    category: "Backend",
    difficulty: "easy",
    type: "technical",
    tags: ["backend", "rest", "http", "crud"],
    question: "What is a REST API and what are standard HTTP methods used for CRUD?",
    expectedAnswer: "REST (Representational State Transfer) is an architectural style for building network applications. Standard HTTP methods map to CRUD: POST (Create), GET (Read), PUT/PATCH (Update/Partial Update), and DELETE (Delete).",
    explanation: "REST APIs use standard status codes and uniform URIs for resource representation."
  },
  {
    role: "Backend Developer",
    category: "MongoDB",
    difficulty: "easy",
    type: "technical",
    tags: ["mongodb", "database", "nosql"],
    question: "What is MongoDB and how do collections and documents compare to SQL tables and rows?",
    expectedAnswer: "MongoDB is a document-oriented NoSQL database that stores data in flexible, JSON-like BSON documents. A MongoDB Collection is equivalent to an SQL Table, and a Document inside a collection is equivalent to an SQL Row.",
    explanation: "Documents can have dynamic, nested schemas, allowing subdocuments and arrays within a single record."
  },
  {
    role: "Backend Developer",
    category: "Backend",
    difficulty: "medium",
    type: "technical",
    tags: ["backend", "auth", "jwt", "security"],
    question: "What is JWT authentication and how does it work?",
    expectedAnswer: "JSON Web Token (JWT) is a compact, URL-safe standard for securely transmitting claims between parties. A JWT consists of three parts: Header (algorithm & token type), Payload (user claims/id), and Signature (HMAC or RSA hash using secret key). The client sends the token in the Authorization: Bearer <token> header for authenticated requests.",
    explanation: "Because JWTs are stateless and self-contained, servers do not need session database lookups on each request."
  },
  {
    role: "Backend Developer",
    category: "Backend",
    difficulty: "medium",
    type: "technical",
    tags: ["backend", "auth", "security"],
    question: "What is the difference between Authentication and Authorization?",
    expectedAnswer: "Authentication (AuthN) verifies WHO a user is (e.g., logging in with email and password, MFA). Authorization (AuthZ) verifies WHAT permissions or resources an authenticated user has access to (e.g., admin role vs regular user).",
    explanation: "Authentication always happens before authorization in secure application workflows."
  },
  {
    role: "Backend Developer",
    category: "MongoDB",
    difficulty: "medium",
    type: "technical",
    tags: ["mongodb", "indexing", "performance"],
    question: "What is database indexing in MongoDB and why is it important?",
    expectedAnswer: "Indexes are special data structures (B-trees) that store a small portion of the collection's data set in an easy-to-traverse form. Without indexes, MongoDB must perform a collection scan (COLLSCAN), checking every document. With indexes, MongoDB can quickly limit the number of documents it inspects (IXSCAN).",
    explanation: "Proper indexes on frequently queried or sorted fields (e.g., user email, job createdAt) drastically speed up query times."
  },
  {
    role: "Backend Developer",
    category: "MongoDB",
    difficulty: "medium",
    type: "technical",
    tags: ["mongodb", "aggregation", "pipeline"],
    question: "What is the MongoDB Aggregation Pipeline and what are common pipeline stages?",
    expectedAnswer: "The Aggregation Pipeline is a framework for data processing where documents enter a multi-stage pipeline that transforms them into aggregated results. Common stages include: $match (filter), $group (summarize), $sort (order), $project (reshape fields), $lookup (left outer join), and $limit/$skip (pagination).",
    explanation: "Aggregation runs natively on the MongoDB server, making complex analytics much faster than querying and computing in Node.js."
  },
  {
    role: "Backend Developer",
    category: "Backend",
    difficulty: "hard",
    type: "technical",
    tags: ["backend", "security", "best-practices"],
    question: "How do you secure a Node.js Express API in production?",
    expectedAnswer: "1. Use Helmet to set secure HTTP headers. 2. Implement rate limiting (express-rate-limit) to prevent brute-force/DDoS. 3. Enable CORS with specific allowed origins. 4. Sanitize inputs against NoSQL injection and XSS (mongo-sanitize). 5. Hash passwords with bcrypt. 6. Store secrets in environment variables (.env). 7. Use HTTPS and secure cookie flags (HttpOnly, SameSite).",
    explanation: "Always validate incoming request schemas with tools like Joi or Zod before controller execution."
  },
  {
    role: "Backend Developer",
    category: "MongoDB",
    difficulty: "hard",
    type: "technical",
    tags: ["mongodb", "compound-index", "query-optimization"],
    question: "Explain the Equality, Sort, Range (ESR) rule for compound indexes in MongoDB.",
    expectedAnswer: "The ESR rule is a guideline for ordering fields in a compound index: 1. Equality: fields with exact matches come first, 2. Sort: fields used for sorting come next, 3. Range: fields queried with inequality filters ($gt, $lt, $in) come last.",
    explanation: "Following ESR ensures that the index can satisfy both the filter criteria and sorting without requiring an expensive in-memory sort."
  },

  // ==========================================
  // MERN STACK DEVELOPER
  // ==========================================
  {
    role: "MERN Stack Developer",
    category: "MERN Stack",
    difficulty: "easy",
    type: "technical",
    tags: ["mern", "architecture", "fullstack"],
    question: "What is the MERN stack and how do the four components interact?",
    expectedAnswer: "MERN comprises MongoDB (database), Express.js (backend web framework), React (frontend user interface library), and Node.js (JavaScript server runtime). The React client makes HTTP/REST requests via Axios/Fetch to Express routes on Node.js, which interacts with MongoDB via Mongoose, returning JSON data back to React.",
    explanation: "The key advantage of MERN is using one unified language (JavaScript) across the entire stack."
  },
  {
    role: "MERN Stack Developer",
    category: "MERN Stack",
    difficulty: "easy",
    type: "technical",
    tags: ["mern", "structure", "folder-structure"],
    question: "How do you structure a production-grade MERN stack project repository?",
    expectedAnswer: "Organize into separate frontend and backend directories: backend/ contains controllers, models, routes, middleware, config, and utils. frontend/ contains src with components, pages, context, hooks, services, and styles.",
    explanation: "Clear separation of concerns makes testing, deployment, and team collaboration smooth."
  },
  {
    role: "MERN Stack Developer",
    category: "MERN Stack",
    difficulty: "medium",
    type: "technical",
    tags: ["mern", "jwt", "auth-flow"],
    question: "Explain the complete end-to-end user authentication flow in a MERN stack application.",
    expectedAnswer: "1. User submits login form in React. 2. React sends POST /api/auth/login with credentials. 3. Node/Express validates user with bcrypt against MongoDB. 4. Server generates a signed JWT and returns it with user data. 5. React saves token in localStorage/cookie and attaches it to subsequent Axios request headers (Authorization: Bearer token). 6. Express middleware verifies token for protected routes.",
    explanation: "For enhanced security, refresh tokens can be stored in HttpOnly cookies while access tokens reside in memory."
  },
  {
    role: "MERN Stack Developer",
    category: "MERN Stack",
    difficulty: "medium",
    type: "technical",
    tags: ["mern", "state", "api", "cors"],
    question: "How do you handle Cross-Origin Resource Sharing (CORS) issues in MERN applications?",
    expectedAnswer: "CORS is a browser security mechanism that blocks requests from one origin (e.g. localhost:5173) to a different origin (e.g. localhost:5005). In Express, it is resolved using the 'cors' package configured with allowed origins, methods, and credentials, or by configuring a reverse proxy during production/development.",
    explanation: "Configuring credentials: true is required when passing Authorization headers or cookies across origins."
  },
  {
    role: "MERN Stack Developer",
    category: "MERN Stack",
    difficulty: "hard",
    type: "technical",
    tags: ["mern", "architecture", "rbac", "scalability"],
    question: "How would you design Role-Based Access Control (RBAC) across frontend and backend in MERN?",
    expectedAnswer: "On the backend: Store role ('candidate', 'recruiter', 'admin') on User model and create an authorize(...roles) middleware that checks if req.user.role matches required roles before controller execution. On the frontend: Create a ProtectedRoute component that verifies authentication status and user role, redirecting unauthorized users, and conditionally render UI navigation elements based on current role.",
    explanation: "Never rely solely on frontend hiding; backend endpoint authorization must strictly validate permissions on every request."
  },
  {
    role: "MERN Stack Developer",
    category: "MERN Stack",
    difficulty: "hard",
    type: "technical",
    tags: ["mern", "performance", "fullstack-optimization"],
    question: "How would you diagnose and resolve performance bottlenecks across a full MERN application?",
    expectedAnswer: "1. Frontend: Inspect bundle size with Vite visualizer, use React DevTools Profiler, virtualize long lists, and optimize images. 2. Network: Enable Gzip/Brotli compression, HTTP/2, and browser caching. 3. Backend: Profile slow endpoints, implement Redis caching, and optimize JSON serialization. 4. Database: Analyze MongoDB query execution plans via explain('executionStats') and add missing indexes.",
    explanation: "A holistic full-stack audit across all 4 tiers is necessary to ensure fast end-to-end response times."
  },

  // ==========================================
  // FULL STACK DEVELOPER
  // ==========================================
  {
    role: "Full Stack Developer",
    category: "Full Stack",
    difficulty: "easy",
    type: "technical",
    tags: ["fullstack", "http", "status-codes"],
    question: "What are the common HTTP status code ranges and give examples of each?",
    expectedAnswer: "1xx: Informational (101 Switching Protocols), 2xx: Success (200 OK, 201 Created, 204 No Content), 3xx: Redirection (301 Moved Permanently, 304 Not Modified), 4xx: Client Errors (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found), 5xx: Server Errors (500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable).",
    explanation: "Accurate HTTP status codes make API behavior clear to clients and monitoring systems."
  },
  {
    role: "Full Stack Developer",
    category: "Full Stack",
    difficulty: "easy",
    type: "technical",
    tags: ["fullstack", "git", "version-control"],
    question: "What is the difference between git merge and git rebase?",
    expectedAnswer: "git merge combines the changes of two branches and creates a new merge commit, preserving the exact branch history. git rebase rewrites project history by moving or replaying your feature branch commits on top of the tip of the target branch, creating a clean, linear history.",
    explanation: "Never rebase public shared branches because it alters commit hashes."
  },
  {
    role: "Full Stack Developer",
    category: "Full Stack",
    difficulty: "medium",
    type: "technical",
    tags: ["fullstack", "websockets", "realtime", "socketio"],
    question: "When should you choose WebSockets over traditional HTTP REST polling?",
    expectedAnswer: "Choose WebSockets when you require low-latency, bidirectional, real-time communication such as live chat applications, notifications, live financial tickers, or collaborative editing. Traditional REST is preferred for standard CRUD operations and cacheable resources.",
    explanation: "WebSockets maintain a single persistent TCP connection, eliminating the overhead of repeated HTTP headers."
  },
  {
    role: "Full Stack Developer",
    category: "Full Stack",
    difficulty: "medium",
    type: "technical",
    tags: ["fullstack", "caching", "redis", "performance"],
    question: "How does Redis caching improve full stack web application performance?",
    expectedAnswer: "Redis is an in-memory key-value data store. By caching frequent, read-heavy database query results or session data in Redis with a Time-To-Live (TTL), the backend can return responses in sub-milliseconds without hitting the primary disk-based database.",
    explanation: "Use Cache-Aside or Write-Through caching patterns and ensure proper cache invalidation on mutations."
  },
  {
    role: "Full Stack Developer",
    category: "Full Stack",
    difficulty: "hard",
    type: "technical",
    tags: ["fullstack", "microservices", "caching", "architecture"],
    question: "How do you handle database migrations and zero-downtime deployments in full stack apps?",
    expectedAnswer: "1. Expand and Contract pattern: add new database fields/tables without deleting old ones, deploy backend code that writes to both, backfill legacy data, switch reads to new schema, and finally remove deprecated fields. 2. Blue-Green / Rolling deployments using load balancers. 3. Health check endpoints to prevent routing traffic to starting instances.",
    explanation: "Database schema backward compatibility is critical during transition windows when old and new backend versions run concurrently."
  },
  {
    role: "Full Stack Developer",
    category: "Full Stack",
    difficulty: "hard",
    type: "technical",
    tags: ["fullstack", "system-design", "scalability"],
    question: "How would you design a scalable notification system supporting both real-time web alerts and emails?",
    expectedAnswer: "1. Client triggers an action (e.g. applied to job). 2. Backend publishes an event to a message queue (BullMQ/RabbitMQ). 3. Worker services consume the event: a WebSocket worker emits live notification to connected user rooms via Socket.IO, while an Email worker batches and sends emails via SendGrid/SES. 4. Notification history is persisted in MongoDB.",
    explanation: "Decoupling notification delivery via message queues prevents email or socket latencies from slowing down main API responses."
  },

  // ==========================================
  // HR INTERVIEW
  // ==========================================
  {
    role: "HR Interview",
    category: "HR",
    difficulty: "easy",
    type: "hr",
    tags: ["hr", "introduction", "background"],
    question: "Tell me about yourself and your background.",
    expectedAnswer: "Structure using the Present-Past-Future framework: 1. Present: Current role/studies and core tech stack (e.g. MERN stack, web dev). 2. Past: Notable projects, key achievements, or experiences that built your skills. 3. Future: Why you are passionate about this role and company.",
    explanation: "Keep the answer concise (90–120 seconds), professional, and aligned with the requirements of the job."
  },
  {
    role: "HR Interview",
    category: "HR",
    difficulty: "easy",
    type: "hr",
    tags: ["hr", "motivation", "company-fit"],
    question: "Why do you want to join our company?",
    expectedAnswer: "Highlight specific aspects of the company's product, tech culture, recent innovations, and mission that resonate with your career goals. Explain how your skills allow you to contribute meaningfully to their growth.",
    explanation: "Avoid generic answers like 'you are a great company'; demonstrate you have researched their work."
  },
  {
    role: "HR Interview",
    category: "HR",
    difficulty: "easy",
    type: "hr",
    tags: ["hr", "strengths", "self-awareness"],
    question: "What are your key strengths and what is an area of improvement you are working on?",
    expectedAnswer: "State 2-3 genuine strengths with brief real-world examples (e.g., problem solving, fast learner, team communication). For weakness, pick a real skill you are actively improving and describe the proactive steps you are taking to master it.",
    explanation: "Avoid cliché pseudo-weaknesses like 'I am a perfectionist'; focus on genuine self-awareness and learning."
  },
  {
    role: "HR Interview",
    category: "HR",
    difficulty: "medium",
    type: "behavioral",
    tags: ["hr", "behavioral", "star-method", "problem-solving"],
    question: "Describe a significant technical or project challenge you faced and how you overcame it.",
    expectedAnswer: "Use the STAR method: Situation (project context), Task (the roadblock or bug), Action (your diagnostic approach and solution implemented), and Result (measurable outcome, learnings, and positive impact on the team).",
    explanation: "Focus on YOUR specific contributions and analytical thinking rather than just team actions."
  },
  {
    role: "HR Interview",
    category: "HR",
    difficulty: "medium",
    type: "behavioral",
    tags: ["hr", "teamwork", "conflict-resolution"],
    question: "How do you handle disagreements or conflicts with team members or managers?",
    expectedAnswer: "Focus on open communication, active listening, and depersonalizing technical decisions by focusing on project goals, objective data, and trade-offs. If a consensus is not reached, respect team decisions and commit to the chosen path.",
    explanation: "Shows emotional intelligence, professional maturity, and dedication to team success."
  },
  {
    role: "HR Interview",
    category: "HR",
    difficulty: "medium",
    type: "behavioral",
    tags: ["hr", "deadlines", "time-management"],
    question: "How do you prioritize tasks when working under tight deadlines?",
    expectedAnswer: "Break down requirements into must-have and nice-to-have features (MoSCoW method), communicate transparently with stakeholders early if timelines slip, eliminate distractions, and focus on delivering high-quality core functionality first.",
    explanation: "Demonstrates organization and proactive communication under pressure."
  },
  {
    role: "HR Interview",
    category: "HR",
    difficulty: "hard",
    type: "behavioral",
    tags: ["hr", "failure", "growth-mindset"],
    question: "Describe a time when you failed or made a mistake on a project. What did you learn from it?",
    expectedAnswer: "Acknowledge the mistake with accountability (e.g., missed edge-case, delayed delivery), explain the immediate remediation taken to fix the issue, and highlight the preventive safeguards you put in place afterward (e.g., automated tests, checklists).",
    explanation: "Shows resilience, accountability, and a growth mindset rather than blame-shifting."
  },
  {
    role: "HR Interview",
    category: "HR",
    difficulty: "hard",
    type: "hr",
    tags: ["hr", "value-proposition", "hiring"],
    question: "Why should we hire you over other candidates?",
    expectedAnswer: "Connect your specific technical toolkit, problem-solving mindset, fast learning ability, and passion for the company's domain directly to the problems their team is solving right now. Emphasize reliability and cultural contribution.",
    explanation: "Focus on your unique combination of skills, adaptability, and positive attitude."
  },
  {
    role: "HR Interview",
    category: "HR",
    difficulty: "hard",
    type: "hr",
    tags: ["hr", "career-goals", "vision"],
    question: "Where do you see yourself in five years?",
    expectedAnswer: "Express enthusiasm for growing into a deep subject matter expert or technical lead, taking ownership of scalable system architecture, mentoring junior developers, and continuing to deliver measurable value to the organization.",
    explanation: "Reassures the employer that you are looking for long-term growth and stability with the company."
  }
];

const seedInterviewQuestions = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not set in environment variables");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully.");

    // Delete existing interview questions to avoid duplicates and re-seed cleanly
    const deleted = await InterviewQuestion.deleteMany({});
    console.log(`Cleared ${deleted.deletedCount} existing questions.`);

    const created = await InterviewQuestion.insertMany(questionsData);

    console.log("");
    console.log("==========================================");
    console.log(`SUCCESS: ${created.length} INTERVIEW QUESTIONS SEEDED!`);
    console.log("==========================================");

    // Summary counts by category & role
    const roleCounts = {};
    created.forEach((q) => {
      roleCounts[q.role] = (roleCounts[q.role] || 0) + 1;
    });

    console.log("Breakdown by Role:");
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`  - ${role}: ${count} questions`);
    });

    console.log("==========================================");

    process.exit(0);
  } catch (error) {
    console.error("SEEDING ERROR:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedInterviewQuestions();
}

module.exports = { questionsData, seedInterviewQuestions };
