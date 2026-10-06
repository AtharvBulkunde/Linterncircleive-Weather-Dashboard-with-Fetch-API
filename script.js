```javascript
// ==========================================
// LIVE WEATHER DASHBOARD
// ==========================================

const API_KEY = "c7ea3b1efbc297b9f7fa664338ff62f3";

const GEO_API =
    "https://api.openweathermap.org/geo/1.0/direct";

const CURRENT_API =
    "https://api.openweathermap.org/data/2.5/weather";

const FORECAST_API =
    "https://api.openweathermap.org/data/2.5/forecast";

// ==========================================
// DOM ELEMENTS
// ==========================================

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const errorMessage = document.getElementById("errorMessage");

const cityName = document.getElementById("cityName");
const date = document.getElementById("date");

const temperature = document.getElementById("temperature");
const weatherIcon = document.getElementById("weatherIcon");
const weatherDescription =
    document.getElementById("weatherDescription");

const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");

const forecastContainer =
    document.getElementById("forecast");

// ==========================================
// EVENTS
// ==========================================

searchBtn.addEventListener("click", searchWeather);

cityInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        searchWeather();
    }
});

// ==========================================
// MAIN SEARCH FUNCTION
// ==========================================

async function searchWeather() {

    const city = cityInput.value.trim();

    errorMessage.textContent = "";

    if (!city) {
        errorMessage.textContent =
            "Please enter a city name.";
        return;
    }

    try {

        searchBtn.textContent = "Loading...";
        searchBtn.disabled = true;

        // ------------------------------------------
        // STEP 1: Convert city name to coordinates
        // ------------------------------------------

        const location = await getCoordinates(city);

        // ------------------------------------------
        // STEP 2: Get current weather
        // ------------------------------------------

        const currentWeather =
            await getCurrentWeather(
                location.lat,
                location.lon
            );

        // ------------------------------------------
        // STEP 3: Get 5-day forecast
        // ------------------------------------------

        const forecast =
            await getForecast(
                location.lat,
                location.lon
            );

        // ------------------------------------------
        // STEP 4: Display data
        // ------------------------------------------

        displayCurrentWeather(
            currentWeather,
            location
        );

        displayForecast(forecast);

    } catch (error) {

        console.error("Weather Error:", error);

        errorMessage.textContent =
            error.message ||
            "Unable to load weather data.";

        clearWeather();

    } finally {

        searchBtn.textContent = "Search";
        searchBtn.disabled = false;

    }
}

// ==========================================
// GET CITY COORDINATES
// ==========================================

async function getCoordinates(city) {

    const url =
        `${GEO_API}?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Geocoding error: ${response.status}`
        );
    }

    const data = await response.json();

    if (!data || data.length === 0) {
        throw new Error(
            `City "${city}" was not found.`
        );
    }

    return data[0];
}

// ==========================================
// CURRENT WEATHER
// ==========================================

async function getCurrentWeather(lat, lon) {

    const url =
        `${CURRENT_API}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    const response = await fetch(url);

    if (!response.ok) {

        const errorData = await response.json()
            .catch(() => ({}));

        throw new Error(
            errorData.message ||
            `Weather API error: ${response.status}`
        );
    }

    return await response.json();
}

// ==========================================
// 5-DAY FORECAST
// ==========================================

async function getForecast(lat, lon) {

    const url =
        `${FORECAST_API}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    const response = await fetch(url);

    if (!response.ok) {

        const errorData = await response.json()
            .catch(() => ({}));

        throw new Error(
            errorData.message ||
            `Forecast API error: ${response.status}`
        );
    }

    return await response.json();
}

// ==========================================
// DISPLAY CURRENT WEATHER
// ==========================================

function displayCurrentWeather(data, location) {

    cityName.textContent =
        `${location.name}, ${location.country}`;

    date.textContent =
        formatDate(new Date());

    temperature.textContent =
        Math.round(data.main.temp);

    feelsLike.textContent =
        Math.round(data.main.feels_like);

    humidity.textContent =
        `${data.main.humidity}%`;

    wind.textContent =
        `${data.wind.speed} m/s`;

    pressure.textContent =
        `${data.main.pressure} hPa`;

    visibility.textContent =
        data.visibility
            ? `${(data.visibility / 1000).toFixed(1)} km`
            : "-- km";

    weatherDescription.textContent =
        data.weather[0].description;

    const iconCode =
        data.weather[0].icon;

    weatherIcon.src =
        `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    weatherIcon.alt =
        data.weather[0].description;
}

// ==========================================
// DISPLAY FORECAST
// ==========================================

function displayForecast(data) {

    forecastContainer.innerHTML = "";

    const dailyForecasts = {};

    data.list.forEach(item => {

        const dateKey =
            item.dt_txt.split(" ")[0];

        // Take one forecast per day
        if (!dailyForecasts[dateKey]) {
            dailyForecasts[dateKey] = item;
        }

    });

    const days =
        Object.values(dailyForecasts).slice(0, 5);

    days.forEach(day => {

        const card =
            document.createElement("div");

        card.className = "forecast-card";

        const dayName =
            new Date(day.dt * 1000)
                .toLocaleDateString("en-US", {
                    weekday: "short"
                });

        const icon =
            day.weather[0].icon;

        const description =
            day.weather[0].description;

        card.innerHTML = `

            <h3>${dayName}</h3>

            <img
                src="https://openweathermap.org/img/wn/${icon}@2x.png"
                alt="${description}"
            >

            <div class="forecast-temp">
                ${Math.round(day.main.temp)}°C
            </div>

            <div class="forecast-description">
                ${description}
            </div>

        `;

        forecastContainer.appendChild(card);

    });
}

// ==========================================
// DATE
// ==========================================

function formatDate(dateObject) {

    return dateObject.toLocaleDateString(
        "en-US",
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );
}

// ==========================================
// CLEAR WEATHER
// ==========================================

function clearWeather() {

    cityName.textContent =
        "Search a city";

    date.textContent =
        "--";

    temperature.textContent =
        "--";

    feelsLike.textContent =
        "--";

    humidity.textContent =
        "--%";

    wind.textContent =
        "-- m/s";

    pressure.textContent =
        "-- hPa";

    visibility.textContent =
        "-- km";

    weatherDescription.textContent =
        "--";

    weatherIcon.src = "";

    forecastContainer.innerHTML = "";
}

// ==========================================
// DEFAULT CITY
// ==========================================

cityInput.value = "Nashik";

searchWeather();
```
