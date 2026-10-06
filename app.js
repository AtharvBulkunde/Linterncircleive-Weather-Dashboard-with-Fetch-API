/* =========================================================
   Live Weather Dashboard
   Defaults: Nashik & Pune (auto-loaded on page load)
   API: Open-Meteo (no API key required)
   ========================================================= */

// ---------- DOM refs ----------
const form        = document.getElementById('search-form');
const input       = document.getElementById('city-input');
const errorMsg    = document.getElementById('error-msg');
const dashboard   = document.getElementById('dashboard');
const loader      = document.getElementById('loader');

const cityNameEl    = document.getElementById('city-name');
const countryEl     = document.getElementById('country');
const currentIconEl = document.getElementById('current-icon');
const currentTempEl = document.getElementById('current-temp');
const currentDescEl = document.getElementById('current-desc');
const currentExtra  = document.getElementById('current-extra');
const forecastGrid  = document.getElementById('forecast-grid');

// ---------- Default cities (fixed lat/lon — no geocoding needed) ----------
const DEFAULT_CITIES = [
  { id: 'card-nashik', name: 'Nashik', country: 'Maharashtra, India', lat: 19.9975, lon: 73.7898 },
  { id: 'card-pune',   name: 'Pune',   country: 'Maharashtra, India', lat: 18.5204, lon: 73.8567 },
];

// ---------- Weather code map ----------
const WEATHER_CODES = {
  0:  { desc: 'Clear sky',           icon: '☀️' },
  1:  { desc: 'Mainly clear',        icon: '🌤️' },
  2:  { desc: 'Partly cloudy',       icon: '⛅' },
  3:  { desc: 'Overcast',            icon: '☁️' },
  45: { desc: 'Fog',                 icon: '🌫️' },
  48: { desc: 'Rime fog',            icon: '🌫️' },
  51: { desc: 'Light drizzle',       icon: '🌦️' },
  53: { desc: 'Drizzle',             icon: '🌦️' },
  55: { desc: 'Dense drizzle',       icon: '🌧️' },
  61: { desc: 'Slight rain',         icon: '🌧️' },
  63: { desc: 'Moderate rain',       icon: '🌧️' },
  65: { desc: 'Heavy rain',          icon: '🌧️' },
  71: { desc: 'Slight snow',         icon: '🌨️' },
  73: { desc: 'Moderate snow',       icon: '🌨️' },
  75: { desc: 'Heavy snow',          icon: '❄️' },
  80: { desc: 'Rain showers',        icon: '🌦️' },
  81: { desc: 'Heavy showers',       icon: '🌧️' },
  82: { desc: 'Violent showers',     icon: '⛈️' },
  95: { desc: 'Thunderstorm',        icon: '⛈️' },
  96: { desc: 'Thunderstorm + hail', icon: '⛈️' },
  99: { desc: 'Severe thunderstorm', icon: '⛈️' },
};

function getWeatherInfo(code) {
  return WEATHER_CODES[code] || { desc: 'Unknown', icon: '❓' };
}

function emojiToIconUrl(emoji, size = 96) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <text x="50%" y="55%" font-size="${size * 0.75}" text-anchor="middle"
          dominant-baseline="middle">${emoji}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// ---------- UI helpers ----------
function showLoader(v) { loader.classList.toggle('hidden', !v); }
function showError(msg) { errorMsg.textContent = msg || ''; }

// ---------- Validation ----------
function validateCity(city) {
  if (!city || city.trim().length < 2) return 'Enter a city name (min 2 characters).';
  if (!/^[a-zA-Z\s\-'.]+$/.test(city.trim())) return 'Letters, spaces, hyphens and apostrophes only.';
  return null;
}

// ---------- API calls ----------
async function geocodeCity(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Geocoding service unavailable.');
  const data = await res.json();
  if (!data.results?.length) throw new Error(`City "${city}" not found.`);
  return data.results[0];
}

async function fetchWeather(lat, lon, days = 5) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
    `&timezone=auto&forecast_days=${days}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather service unavailable.');
  return res.json();
}

// ---------- Render: default mini card (Nashik / Pune) ----------
function renderDefaultCard(city, weather) {
  const card = document.getElementById(city.id);
  if (!card) return;

  const cur  = weather.current;
  const info = getWeatherInfo(cur.weather_code);

  card.querySelector('.country').textContent =
    [city.country].filter(Boolean).join(', ');
  card.querySelector('.icon').src = emojiToIconUrl(info.icon, 64);
  card.querySelector('.icon').alt = info.desc;
  card.querySelector('.temp').textContent = `${Math.round(cur.temperature_2m)}°C`;
  card.querySelector('.desc').textContent = info.desc;
  card.querySelector('.extra').textContent =
    `💧 ${cur.relative_humidity_2m}%  🌬️ ${cur.wind_speed_10m} km/h`;

  // mini 5-day forecast strip
  const miniEl = card.querySelector('.mini-forecast');
  miniEl.innerHTML = '';
  const d = weather.daily;
  for (let i = 0; i < d.time.length; i++) {
    const dayInfo = getWeatherInfo(d.weather_code[i]);
    const date = new Date(d.time[i]);
    const label = i === 0 ? 'Today'
      : date.toLocaleDateString(undefined, { weekday: 'short' });

    const div = document.createElement('div');
    div.className = 'mini';
    div.innerHTML = `
      <div>${label}</div>
      <img src="${emojiToIconUrl(dayInfo.icon, 32)}" alt="${dayInfo.desc}" />
      <span class="hi">${Math.round(d.temperature_2m_max[i])}°</span>
      <span>${Math.round(d.temperature_2m_min[i])}°</span>
    `;
    miniEl.appendChild(div);
  }
}

// ---------- Render: main search result ----------
function renderCurrent(place, weather) {
  const cur  = weather.current;
  const info = getWeatherInfo(cur.weather_code);

  cityNameEl.textContent = place.name;
  countryEl.textContent  = [place.admin1, place.country].filter(Boolean).join(', ');
  currentIconEl.src      = emojiToIconUrl(info.icon, 96);
  currentIconEl.alt      = info.desc;
  currentTempEl.textContent = `${Math.round(cur.temperature_2m)}°C`;
  currentDescEl.textContent = info.desc;
  currentExtra.textContent  =
    `💧 ${cur.relative_humidity_2m}%   🌬️ ${cur.wind_speed_10m} km/h`;
}

function renderForecast(weather) {
  forecastGrid.innerHTML = '';
  const d = weather.daily;
  for (let i = 0; i < d.time.length; i++) {
    const info = getWeatherInfo(d.weather_code[i]);
    const date = new Date(d.time[i]);
    const label = i === 0
      ? 'Today'
      : date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });

    const card = document.createElement('div');
    card.className = 'day';
    card.innerHTML = `
      <p class="date">${label}</p>
      <img src="${emojiToIconUrl(info.icon, 48)}" alt="${info.desc}" />
      <p class="max">${Math.round(d.temperature_2m_max[i])}°</p>
      <p class="min">${Math.round(d.temperature_2m_min[i])}°</p>
    `;
    forecastGrid.appendChild(card);
  }
}

// ---------- Load defaults (Nashik + Pune) ----------
async function loadDefaultCities() {
  await Promise.all(
    DEFAULT_CITIES.map(async (city) => {
      try {
        const weather = await fetchWeather(city.lat, city.lon, 5);
        renderDefaultCard(city, weather);
      } catch (err) {
        console.error(`Failed to load ${city.name}:`, err);
        const card = document.getElementById(city.id);
        if (card) {
          card.querySelector('.desc').textContent = '⚠️ Failed to load';
        }
      }
    })
  );
}

// ---------- Search flow ----------
async function searchCity(city) {
  showError('');
  dashboard.classList.add('hidden');
  showLoader(true);

  try {
    const place   = await geocodeCity(city);
    const weather = await fetchWeather(place.latitude, place.longitude, 5);
    renderCurrent(place, weather);
    renderForecast(weather);
    dashboard.classList.remove('hidden');
    localStorage.setItem('lastCity', place.name);
  } catch (err) {
    showError(err.message);
    console.error(err);
  } finally {
    showLoader(false);
  }
}

// ---------- Events ----------
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = input.value.trim();
  const err  = validateCity(city);
  if (err) { showError(err); return; }
  searchCity(city);
});

// ---------- Init ----------
window.addEventListener('DOMContentLoaded', async () => {
  // 1) Load Nashik & Pune automatically
  await loadDefaultCities();

  // 2) If the user has searched before, re-run that search
  const last = localStorage.getItem('lastCity');
  if (last) {
    input.value = last;
    searchCity(last);
  }
});
