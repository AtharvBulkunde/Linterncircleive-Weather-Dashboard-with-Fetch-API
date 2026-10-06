```javascript
// ==========================================
// LIVE WEATHER DASHBOARD
// ==========================================

// Add your OpenWeatherMap API key here
const API_KEY = "c1a854ec9086ae6df5f67230f7f4709b";

// API URLs
const CURRENT_API =
    "https://api.openweathermap.org/data/2.5/weather";

const FORECAST_API =
    "https://api.openweathermap.org/data/2.5/forecast";

// DOM Elements
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

cityInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        searchWeather();
    }

});


// ==========================================
// SEARCH WEATHER
// ==========================================

async function searchWeather() {

    const city = cityInput.value.trim();

    errorMessage.textContent = "";

    // Validation
    if (city === "") {

        errorMessage.textContent =
            "Please enter a city name.";

        return;
    }

    if (API_KEY === "YOUR_API_KEY") {

        errorMessage.textContent =
            "Please add your OpenWeatherMap API key in script.js.";

        return;
    }

    try {

        searchBtn.textContent = "Loading...";
        searchBtn.disabled = true;

        // Fetch current weather
        const currentData = await getCurrentWeather(city);

        // Fetch forecast
        const forecastData = await getForecast(city);

        // Display data
        displayCurrentWeather(currentData);

        displayForecast(forecastData);

    }

    catch (error) {

        console.error(error);

        errorMessage.textContent =
            "City not found or weather data unavailable.";

        clearWeather();

    }

    finally {

        searchBtn.textContent = "Search";
        searchBtn.disabled = false;

    }
}


// ==========================================
// FETCH CURRENT WEATHER
// ==========================================

async function getCurrentWeather(city) {

    const url =
        `${c1a854ec9086ae6df5f67230f7f4709b}?q=${encodeURIComponent(city)}&appid=${c1a854ec9086ae6df5f67230f7f4709b}&units=metric`;

    const response = await fetch(url);

    if (!response.ok) {

        throw new Error("City not found");

    }

    return await response.json();
}


// ==========================================
// FETCH 5-DAY FORECAST
// ==========================================

async function getForecast(city) {

    const url =
        `${c1a854ec9086ae6df5f67230f7f4709b}?q=${encodeURIComponent(city)}&appid=${c1a854ec9086ae6df5f67230f7f4709b}&units=metric`;

    const response = await fetch(url);

    if (!response.ok) {

        throw new Error("Forecast unavailable");

    }

    return await response.json();
}


// ==========================================
// DISPLAY CURRENT WEATHER
// ==========================================

function displayCurrentWeather(data) {

    cityName.textContent =
        `${data.name}, ${data.sys.country}`;

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
        `${(data.visibility / 1000).toFixed(1)} km`;

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

    // OpenWeather gives data every 3 hours.
    // Select one forecast for approximately
    // each day.

    const dailyForecasts = {};

    data.list.forEach(item => {

        const dateKey =
            item.dt_txt.split(" ")[0];

        if (!dailyForecasts[dateKey]) {

            dailyForecasts[dateKey] = item;

        }

    });

    const days =
        Object.values(dailyForecasts).slice(0, 5);

    days.forEach(day => {

        const forecastCard =
            document.createElement("div");

        forecastCard.className =
            "forecast-card";

        const dayName =
            new Date(day.dt * 1000)
                .toLocaleDateString("en-US", {
                    weekday: "short"
                });

        const iconCode =
            day.weather[0].icon;

        forecastCard.innerHTML = `

            <h3>${dayName}</h3>

            <img
                src="https://openweathermap.org/img/wn/${iconCode}@2x.png"
                alt="${day.weather[0].description}"
            >

            <div class="forecast-temp">
                ${Math.round(day.main.temp)}°C
            </div>

            <div class="forecast-description">
                ${day.weather[0].description}
            </div>

        `;

        forecastContainer.appendChild(
            forecastCard
        );

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
// CLEAR WEATHER DATA
// ==========================================

function clearWeather() {

    cityName.textContent = "Search a city";
    date.textContent = "--";

    temperature.textContent = "--";
    feelsLike.textContent = "--";
    humidity.textContent = "--%";
    wind.textContent = "-- m/s";
    pressure.textContent = "-- hPa";
    visibility.textContent = "-- km";

    weatherDescription.textContent = "--";

    weatherIcon.src = "";

    forecastContainer.innerHTML = "";

}


// ==========================================
// DEFAULT CITY
// ==========================================

// Change this to any city you want.
cityInput.value = "Nashik";

// Load default weather
searchWeather();
```
