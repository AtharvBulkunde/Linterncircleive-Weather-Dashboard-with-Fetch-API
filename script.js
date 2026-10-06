```javascript
// ==========================================
// LIVE WEATHER DASHBOARD
// ==========================================

const API_KEY = "c1a854ec9086ae6df5f67230f7f4709b";

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
// EVENT LISTENERS
// ==========================================

searchBtn.addEventListener("click", searchWeather);

cityInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        searchWeather();
    }

});


// ==========================================
// SEARCH WEATHER
// ==========================================

async function searchWeather() {

    const city = cityInput.value.trim();

    // Clear previous error
    errorMessage.textContent = "";

    // Validate input
    if (city === "") {

        errorMessage.textContent =
            "Please enter a city name.";

        return;
    }

    try {

        // Loading state
        searchBtn.textContent = "Loading...";
        searchBtn.disabled = true;

        // --------------------------------------
        // STEP 1: Get city coordinates
        // --------------------------------------

        const location =
            await getCoordinates(city);

        // --------------------------------------
        // STEP 2: Get current weather
        // --------------------------------------

        const currentWeather =
            await getCurrentWeather(
                location.lat,
                location.lon
            );

        // --------------------------------------
        // STEP 3: Get 5-day forecast
        // --------------------------------------

        const forecast =
            await getForecast(
                location.lat,
                location.lon
            );

        // --------------------------------------
        // STEP 4: Display current weather
        // --------------------------------------

        displayCurrentWeather(
            currentWeather,
            location
        );

        // --------------------------------------
        // STEP 5: Display forecast
        // --------------------------------------

        displayForecast(forecast);

    }

    catch (error) {

        console.error(
            "Weather Error:",
            error
        );

        errorMessage.textContent =
            error.message ||
            "Unable to load weather data.";

        clearWeather();

    }

    finally {

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

    const response =
        await fetch(url);

    if (!response.ok) {

        if (response.status === 401) {
            throw new Error(
                "Invalid API key. Check your OpenWeather API key."
            );
        }

        throw new Error(
            `Location API error: ${response.status}`
        );

    }

    const data =
        await response.json();

    if (!data || data.length === 0) {

        throw new Error(
            `City "${city}" was not found.`
        );

    }

    return data[0];

}


// ==========================================
// GET CURRENT WEATHER
// ==========================================

async function getCurrentWeather(lat, lon) {

    const url =
        `${CURRENT_API}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    const response =
        await fetch(url);

    if (!response.ok) {

        const errorData =
            await response.json()
                .catch(() => ({}));

        if (response.status === 401) {

            throw new Error(
                "Invalid API key. Check your OpenWeather API key."
            );

        }

        throw new Error(
            errorData.message ||
            `Weather API error: ${response.status}`
        );

    }

    return await response.json();

}


// ==========================================
// GET 5-DAY FORECAST
// ==========================================

async function getForecast(lat, lon) {

    const url =
        `${FORECAST_API}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    const response =
        await fetch(url);

    if (!response.ok) {

        const errorData =
            await response.json()
                .catch(() => ({}));

        if (response.status === 401) {

            throw new Error(
                "Invalid API key. Check your OpenWeather API key."
            );

        }

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

function displayCurrentWeather(
    data,
    location
) {

    // City
    cityName.textContent =
        `${location.name}, ${location.country}`;

    // Date
    date.textContent =
        formatDate(new Date());

    // Temperature
    temperature.textContent =
        Math.round(data.main.temp);

    // Feels like
    feelsLike.textContent =
        Math.round(data.main.feels_like);

    // Humidity
    humidity.textContent =
        `${data.main.humidity}%`;

    // Wind
    wind.textContent =
        `${data.wind.speed} m/s`;

    // Pressure
    pressure.textContent =
        `${data.main.pressure} hPa`;

    // Visibility
    visibility.textContent =
        data.visibility
            ? `${(data.visibility / 1000).toFixed(1)} km`
            : "-- km";

    // Description
    weatherDescription.textContent =
        data.weather[0].description;

    // Weather icon
    const iconCode =
        data.weather[0].icon;

    weatherIcon.src =
        `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    weatherIcon.alt =
        data.weather[0].description;

}


// ==========================================
// DISPLAY 5-DAY FORECAST
// ==========================================

function displayForecast(data) {

    // Clear old forecast
    forecastContainer.innerHTML = "";

    const dailyForecasts = {};

    // OpenWeather forecast gives data
    // every 3 hours.

    data.list.forEach(function (item) {

        const dateKey =
            item.dt_txt.split(" ")[0];

        // Select first forecast
        // for each day.

        if (!dailyForecasts[dateKey]) {

            dailyForecasts[dateKey] =
                item;

        }

    });

    // Take first 5 days
    const days =
        Object.values(
            dailyForecasts
        ).slice(0, 5);


    // Create forecast cards
    days.forEach(function (day) {

        const card =
            document.createElement("div");

        card.className =
            "forecast-card";

        // Day name
        const dayName =
            new Date(day.dt * 1000)
                .toLocaleDateString(
                    "en-US",
                    {
                        weekday: "short"
                    }
                );

        // Weather icon
        const icon =
            day.weather[0].icon;

        // Description
        const description =
            day.weather[0].description;

        // Temperature
        const temp =
            Math.round(day.main.temp);


        // Card HTML
        card.innerHTML = `

            <h3>${dayName}</h3>

            <img
                src="https://openweathermap.org/img/wn/${icon}@2x.png"
                alt="${description}"
            >

            <div class="forecast-temp">
                ${temp}°C
            </div>

            <div class="forecast-description">
                ${description}
            </div>

        `;


        // Add card
        forecastContainer.appendChild(card);

    });

}


// ==========================================
// FORMAT DATE
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

    weatherIcon.alt = "";

    forecastContainer.innerHTML = "";

}


// ==========================================
// DEFAULT CITY
// ==========================================

// Default city
cityInput.value = "Nashik";

// Load weather automatically
searchWeather();
```
