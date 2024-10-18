const apiKey = "0c867bbb26b3ceef3bb63b4c1ce4d38c";
const apiUrlCurrent = "https://api.openweathermap.org/data/2.5/weather?units=metric&";
const apiUrlForecast = "https://api.openweathermap.org/data/2.5/forecast?units=metric&";

let barChart, doughnutChart, lineChart; // Declare chart variables to update later

const cityInput = document.getElementById('city-input');
const getWeatherBtn = document.getElementById('get-weather-btn');
const tempElement = document.getElementById('temp');
const humidityElement = document.getElementById('humidity');
const windSpeedElement = document.getElementById('wind-speed');
const weatherIcon = document.getElementById('weather-icon');

// Fetch Current Weather Data by City Name or Lat/Lon
async function fetchCurrentWeather(query) {
  try {
    const response = await fetch(`${apiUrlCurrent}${query}&appid=${apiKey}`);
    const data = await response.json();

    if (response.ok) {
      updateCurrentWeather(data);
      fetchWeatherForecast(query); // Fetch forecast data based on query (city or lat/lon)
    } else {
      alert("City not found. Please try again.");
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
    alert("Error fetching weather data. Please try again later.");
  }
}

// Fetch Weather Forecast Data by City Name or Lat/Lon
async function fetchWeatherForecast(query) {
  try {
    const response = await fetch(`${apiUrlForecast}${query}&appid=${apiKey}`);
    const data = await response.json();

    if (response.ok) {
      updateForecastCharts(data); // Update charts with new forecast data
    } else {
      alert("Forecast data not found.");
    }
  } catch (error) {
    console.error("Error fetching forecast data:", error);
  }
}

// Update Current Weather Section
function updateCurrentWeather(data) {
  const weatherCondition = data.weather[0].main.toLowerCase();
  const weatherWidget = document.getElementById('weather-widget');
  
  // Update weather details
  tempElement.textContent = Math.round(data.main.temp);
  humidityElement.textContent = data.main.humidity;
  windSpeedElement.textContent = data.wind.speed;
  document.querySelector('.city-name').textContent = data.name;
  document.querySelector('.weather-description').textContent = data.weather[0].description;
  weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
  
  // Change background based on weather condition
  if (weatherCondition.includes("rain")) {
    weatherWidget.style.backgroundImage = "url('rain.jpg')";
  } else if (weatherCondition.includes("cloud")) {
    weatherWidget.style.backgroundImage = "url('clouds.jpg')";
  } else if (weatherCondition.includes("clear") || weatherCondition.includes("sunny")) {
    weatherWidget.style.backgroundImage = "url('sunny.jpg')";
  } else if (weatherCondition.includes("snow")) {
    weatherWidget.style.backgroundImage = "url('snow.jpg')";
  } else if (weatherCondition.includes("storm") || weatherCondition.includes("thunderstorm")) {
    weatherWidget.style.backgroundImage = "url('storm.jpg')";
  } else {
    weatherWidget.style.backgroundImage = "url('default.jpg')";  // Fallback background
  }
  
  weatherWidget.style.backgroundSize = 'cover';  // Ensure the background covers the widget properly
}

// Update Forecast Charts
function updateForecastCharts(data) {
  const temperatures = [];
  const weatherConditions = {};
  const labels = [];

  // Extract relevant data for the next 5 days (first 5 forecast points)
  data.list.slice(0, 5).forEach((forecast) => {
    temperatures.push(forecast.main.temp);
    const condition = forecast.weather[0].main;

    // Track the occurrence of different weather conditions
    if (weatherConditions[condition]) {
      weatherConditions[condition] += 1;
    } else {
      weatherConditions[condition] = 1;
    }

    labels.push(new Date(forecast.dt_txt).toLocaleDateString());
  });

  // If charts already exist, destroy them to redraw with new data
  if (barChart) barChart.destroy();
  if (doughnutChart) doughnutChart.destroy();
  if (lineChart) lineChart.destroy();

  // Vertical Bar Chart (Temperature)
  const barCtx = document.getElementById('barChart').getContext('2d');
  barChart = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Temperature (°C)',
        data: temperatures,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }],
    },
    options: {
      animation: {
        delay: 1000,
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  // Doughnut Chart (Weather Conditions)
  const doughnutCtx = document.getElementById('doughnutChart').getContext('2d');
  doughnutChart = new Chart(doughnutCtx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(weatherConditions),
      datasets: [{
        data: Object.values(weatherConditions),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      }],
    },
    options: {
      animation: {
        delay: 500,
      },
    },
  });

  // Line Chart (Temperature Change)
  const lineCtx = document.getElementById('lineChart').getContext('2d');
  lineChart = new Chart(lineCtx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Temperature (°C)',
        data: temperatures,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        fill: false,
      }],
    },
    options: {
      animation: {
        tension: {
          duration: 1000,
          easing: 'easeOutElastic',
          from: 1,
          to: 0,
          loop: true,
        },
      },
    },
  });
}

// Get weather for user's current location using Geolocation
function getUserLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      fetchCurrentWeather(`lat=${lat}&lon=${lon}`); // Fetch weather using lat/lon
    }, () => {
      alert("Geolocation failed. Please enter a city manually.");
    });
  } else {
    alert("Geolocation is not supported by your browser.");
  }
}

// Event Listener for the "Get Weather" button
getWeatherBtn.addEventListener('click', () => {
  const city = cityInput.value;
  if (city) {
    fetchCurrentWeather(`q=${city}`);
  } else {
    alert("Please enter a city name.");
  }
});

// Fetch weather for user's location on page load
window.addEventListener('load', () => {
  getUserLocationWeather();
});
