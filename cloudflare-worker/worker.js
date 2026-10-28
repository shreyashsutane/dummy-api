// Cloudflare Worker: 0ms Cold-Start Dummy API
// Runs globally on Cloudflare Edge (100,000 requests/day free forever)

const firstNames = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"];
const roles = ["Software Engineer", "Frontend Developer", "Product Manager", "DevOps Engineer", "Data Scientist", "UI/UX Designer", "QA Lead", "Marketing Specialist", "Operations Manager", "Security Analyst"];
const statuses = ["active", "pending", "inactive", "suspended"];
const cities = ["New York", "San Francisco", "London", "Berlin", "Tokyo", "Singapore", "Austin", "Toronto", "Sydney", "Amsterdam", "Paris", "Bangalore"];
const bioTemplates = [
  "Passionate about building scalable systems and clean architectures.",
  "Enjoys solving complex problems and collaborating with diverse teams.",
  "Experienced leader driving modern developer workflows and productivity.",
  "Specialized in resilient backend systems and intuitive user interfaces.",
  "Advocate for test-driven development and continuous improvement."
];

// Simple Mulberry32 PRNG for deterministic seeds
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

function stringToSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function generateUUID(rand) {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (rand() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function generateItems(count, rand) {
  const items = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const fn = firstNames[Math.floor(rand() * firstNames.length)];
    const ln = lastNames[Math.floor(rand() * lastNames.length)];
    const fullName = `${fn} ${ln}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`;
    const role = roles[Math.floor(rand() * roles.length)];
    const status = statuses[Math.floor(rand() * statuses.length)];
    const city = cities[Math.floor(rand() * cities.length)];
    const bio = bioTemplates[Math.floor(rand() * bioTemplates.length)];
    const phone = `+1-555-${String(Math.floor(rand() * 9000) + 1000)}`;
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${fn}${ln}`;
    const createdTimestamp = new Date(now - Math.floor(rand() * 365 * 24 * 60 * 60 * 1000)).toISOString();

    items.push({
      id: generateUUID(rand),
      name: fullName,
      email: email,
      role: role,
      status: status,
      phone: phone,
      avatar: avatar,
      city: city,
      bio: bio,
      created_at: createdTimestamp
    });
  }

  return items;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Standard CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    if (url.pathname === "/api/items" || url.pathname === "/api/users") {
      let count = parseInt(url.searchParams.get("count") || url.searchParams.get("limit") || url.searchParams.get("n") || "10", 10);
      if (isNaN(count) || count < 1) count = 10;
      if (count > 1000) count = 1000;

      // Optional seed
      const seedParam = url.searchParams.get("seed");
      const rand = seedParam ? mulberry32(stringToSeed(seedParam)) : Math.random;

      // Optional delay
      const delayParam = url.searchParams.get("delay");
      if (delayParam) {
        const ms = parseInt(delayParam, 10);
        if (!isNaN(ms) && ms > 0 && ms <= 5000) {
          await new Promise(r => setTimeout(r, ms));
        }
      }

      const items = generateItems(count, rand);
      return new Response(JSON.stringify(items, null, 2), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // Default: Root info
    const info = {
      message: "Free Dummy API on Cloudflare Edge (0ms Cold Start)",
      status: "healthy",
      latency: "0ms cold start globally",
      endpoints: [
        { path: "/api/items", method: "GET", description: "Returns array of N dummy objects with 10 fields" },
        { path: "/api/users", method: "GET", description: "Alias for /api/items" },
        { path: "/health", method: "GET", description: "Health check endpoint" }
      ],
      query_parameters: {
        count: "Number of items (1-1000, default 10). Aliases: 'limit', 'n'",
        seed: "Deterministic string/number for reproducible results",
        delay: "Simulated delay in ms (e.g. ?delay=300)"
      },
      example_urls: [
        "/api/items?count=5",
        "/api/users?count=25&seed=my-seed",
        "/api/items?count=10&delay=300"
      ]
    };

    return new Response(JSON.stringify(info, null, 2), {
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
};
