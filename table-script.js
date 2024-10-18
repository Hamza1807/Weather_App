const apiKey = "0c867bbb26b3ceef3bb63b4c1ce4d38c";
const apiUrlForecast = "https://api.openweathermap.org/data/2.5/forecast?q=";

const cityInput = document.getElementById('city-input');
const getForecastBtn = document.getElementById('get-forecast-btn');
const forecastTableBody = document.getElementById('forecast-table-body');
const loadingSpinner = document.getElementById('loading-spinner');
const unitToggleBtn = document.getElementById('unit-toggle-btn');

let forecastData = []; // Global array to store forecast data in Celsius
let currentPage = 1; // Track the current page
const entriesPerPage = 5; // Show 5 entries per page
let isCelsius = true; // Track the current unit (Celsius or Fahrenheit)

// Toggle between Celsius and Fahrenheit
unitToggleBtn.addEventListener('click', () => {
  isCelsius = !isCelsius;
  unitToggleBtn.textContent = isCelsius ? 'Celsius' : 'Fahrenheit';
  if (forecastData.length > 0) {
    updateForecastTable(forecastData);
  }
});

// Function to convert temperature between Celsius and Fahrenheit
function convertTemperature(temp, toCelsius) {
  return toCelsius ? (temp - 32) * (5 / 9) : (temp * 9 / 5) + 32;
}

// Fetch Forecast Data
async function fetchForecast(city) {
  document.getElementById('loading-spinner').classList.remove('hidden'); // Show spinner
  try {
    const response = await fetch(`${apiUrlForecast}${city}&units=metric&appid=${apiKey}`);
    const data = await response.json();
    document.getElementById('loading-spinner').classList.add('hidden'); // Hide spinner

    if (response.ok) {
      forecastData = extractFiveDayForecast(data.list); // Store 5-day data globally in Celsius
      const predictedData = predictNext10Days(forecastData); // Predict the next 10 days
      forecastData = [...forecastData, ...predictedData]; // Combine 5-day and predicted 10-day data
      currentPage = 1; // Reset to the first page
      updateForecastTable(forecastData);
    } else {
      alert("City not found. Please try again.");
    }
  } catch (error) {
    document.getElementById('loading-spinner').classList.add('hidden'); // Hide spinner
    console.error("Error fetching forecast data:", error);
    alert("Error fetching weather data. Please try again later.");
  }
}

// Extract daily forecast data from the API response
function extractFiveDayForecast(forecastList) {
  const fiveDayForecast = [];
  for (let i = 0; i < forecastList.length; i += 8) { // Extract every 8th forecast (24-hour interval)
    const forecast = forecastList[i];
    fiveDayForecast.push({
      tempCelsius: forecast.main.temp, // Store temperature in Celsius
      weatherDescription: forecast.weather[0].description,
      date: forecast.dt_txt.split(' ')[0],
      icon: forecast.weather[0].icon,
      day: new Date(forecast.dt_txt).toLocaleString('en-US', { weekday: 'long' })
    });
  }
  return fiveDayForecast;
}

// Predict the next 10 days based on the last 5-day forecast
function predictNext10Days(lastFiveDaysData) {
  const predictedData = [];
  for (let i = 1; i <= 10; i++) {
    const lastDay = lastFiveDaysData[lastFiveDaysData.length - 1];
    const newDate = new Date(lastDay.date);
    newDate.setDate(newDate.getDate() + i); // Increment date by 1 for each day

    // Predicting temperature by assuming a simple trend (you can modify this)
    const predictedTemp = lastDay.tempCelsius + (i * 0.5); // For example, a gradual increase of 0.5°C per day
    const predictedWeather = i % 2 === 0 ? 'clear sky' : 'partly cloudy'; // Alternating weather conditions

    predictedData.push({
      tempCelsius: predictedTemp,
      weatherDescription: predictedWeather,
      date: newDate.toISOString().split('T')[0], // Format the date as YYYY-MM-DD
      icon: '01d', // Placeholder weather icon (clear sky)
      day: newDate.toLocaleString('en-US', { weekday: 'long' })
    });
  }
  return predictedData;
}

// Update forecast table with pagination
function updateForecastTable(forecastData) {
  const unitSymbol = isCelsius ? '°C' : '°F'; // Set the unit symbol based on user choice
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;

  const currentEntries = forecastData.slice(startIndex, endIndex);

  forecastTableBody.innerHTML = ''; // Clear previous forecast

  currentEntries.forEach((day, index) => {
    const temp = isCelsius ? day.tempCelsius : convertTemperature(day.tempCelsius, false); // Convert if needed
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>Day ${startIndex + index + 1}</td>
      <td>${day.date}</td>
      <td>${Math.round(temp)}${unitSymbol}</td>
      <td>${day.weatherDescription}</td>
      <td><img src="http://openweathermap.org/img/wn/${day.icon}.png" alt="${day.weatherDescription}"></td>
    `;
    forecastTableBody.appendChild(row);
  });

  updatePaginationControls(forecastData.length);
}

// Update pagination controls based on the number of entries
function updatePaginationControls(totalEntries) {
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  document.getElementById('page-info').innerText = `Page ${currentPage} of ${totalPages}`;

  document.getElementById('prev-btn').disabled = currentPage === 1;
  document.getElementById('next-btn').disabled = currentPage === totalPages;
}

// Event listeners for pagination buttons
document.getElementById('prev-btn').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    updateForecastTable(forecastData); // Re-render table with the previous page data
  }
});

document.getElementById('next-btn').addEventListener('click', () => {
  const totalPages = Math.ceil(forecastData.length / entriesPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    updateForecastTable(forecastData); // Re-render table with the next page data
  }
});

// Fetch forecast data when the "Get 5-Day Forecast" button is clicked
getForecastBtn.addEventListener('click', () => {
  const city = cityInput.value;
  if (city) {
    fetchForecast(city);
  } else {
    alert("Please enter a city name.");
  }
});
// Add event listeners for filter/sort buttons
document.getElementById('sort-asc-btn').addEventListener('click', sortTemperaturesAscending);
document.getElementById('sort-desc-btn').addEventListener('click', sortTemperaturesDescending);
document.getElementById('filter-rain-btn').addEventListener('click', filterRainyDays);
document.getElementById('highest-temp-btn').addEventListener('click', showHighestTemperatureDay);

// Sort temperatures in ascending order
function sortTemperaturesAscending() {
  const sortedData = [...forecastData].sort((a, b) => a.tempCelsius - b.tempCelsius);
  currentPage = 1; // Reset to the first page
  updateForecastTable(sortedData);
}

// Sort temperatures in descending order
function sortTemperaturesDescending() {
  const sortedData = [...forecastData].sort((a, b) => b.tempCelsius - a.tempCelsius);
  currentPage = 1; // Reset to the first page
  updateForecastTable(sortedData);
}

// Filter days with rain
function filterRainyDays() {
  const filteredData = forecastData.filter(day => day.weatherDescription.toLowerCase().includes('rain'));
  currentPage = 1; // Reset to the first page
  updateForecastTable(filteredData);
}

// Find and display the day with the highest temperature
function showHighestTemperatureDay() {
  const highestTempDay = forecastData.reduce((prev, current) => (prev.tempCelsius > current.tempCelsius) ? prev : current);
  updateForecastTable([highestTempDay]); // Show only the highest temp day
}

// Fetch weather for user's location on page load
window.addEventListener('load', () => {
  getUserLocationWeather(); // You need to define this function if you are using it
});
