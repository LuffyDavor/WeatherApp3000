const searchButton = document.querySelector('button');
const searchInput = document.querySelector('.search-bar');
const weatherCard = document.querySelector('#card');

const cityTitle = weatherCard.querySelector('.card-title');
const weatherIcon = weatherCard.querySelector('.icon');
const degrees = weatherCard.querySelector('.degrees');
const description = weatherCard.querySelector('.description');
const humidity = weatherCard.querySelector('.humidity');
const wind = weatherCard.querySelector('.wind');
const minTemp = weatherCard.querySelector('.min-temp');
const maxTemp = weatherCard.querySelector('.max-temp');
const feelsLike = weatherCard.querySelector('.feels-like');


const weatherForecastEl = document.getElementById('weather-forecast');
const currentTempEl = document.getElementById('current-temp');

const apiKeyOpenWeather = '3b29dd8348d1ffdf12ff6a41a5f5cf13';
const apiKeyWeatherApi = 'b7d19015ca4d4bc7a2c73024232002';
let apiUrl; let forecastUrl; let weatherApiUrl;

class Weather {
  constructor() {
    // Empty constructor
  }
  
  fillFromOpenWeatherMap(data) {
    this.city = data.name;
    this.icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
    this.temp = Math.round(data.main.temp);
    this.description = data.weather[0].description;
    this.humidity = data.main.humidity;
    this.wind = data.wind.speed;
    this.minTemp = Math.round(data.main.temp_min);
    this.maxTemp = Math.round(data.main.temp_max);
    this.feelsLike = Math.round(data.main.feels_like);
  }
  
  fillFromWeatherApi(data) {
    this.city = data.location.name;
    this.icon = `https:${data.current.condition.icon}`;
    this.temp = data.current.temp_c;
    this.description = data.current.condition.text;
    this.humidity = data.current.humidity;
    this.wind = data.current.wind_kph;
    this.feelsLike = data.current.feelslike_c;
  }
  fillFromForecast(data) {
    this.icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
    this.description = data.weather[0].description;
    this.minTemp = Math.round(data.main.temp_min);
    this.maxTemp = Math.round(data.main.temp_max);
  }
}

const weather1 = new Weather();
const weather2 = new Weather();

// Get user's current location as default city
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(position => {

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKeyOpenWeather}&units=metric`;
    forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKeyOpenWeather}&units=metric`;
    weatherApiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKeyWeatherApi}&q=${latitude},${longitude}`;

    updateWeather(apiUrl, forecastUrl, weatherApiUrl);

  }, error => {
    // Set default city to London if there is an error finding user location
    console.error(error);
    apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=Vienna&appid=${apiKeyOpenWeather}&units=metric`; 
    forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=$Vienna&appid=${apiKeyOpenWeather}&units=metric`;
    weatherApiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKeyWeatherApi}&q=Vienna`;
    updateWeather(apiUrl, forecastUrl, weatherApiUrl);

  });
} else {
  // Set default city to London if user does not share location
  apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=Vienna&appid=${apiKeyOpenWeather}&units=metric`;
  forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=Vienna&appid=${apiKeyOpenWeather}&units=metric`;
  weatherApiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKeyWeatherApi}&q=Vienna`;
  updateWeather(apiUrl, forecastUrl, weatherApiUrl);
}

// Add click event listener to search button
searchButton.addEventListener('click', () => {
  const city = searchInput.value;
  console.log(city);
  apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKeyOpenWeather}&units=metric`;
  forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKeyOpenWeather}&units=metric`;
  weatherApiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKeyWeatherApi}&q=${city}`; 
  updateWeather(apiUrl, forecastUrl, weatherApiUrl);
});

// Add Enter event listener to search bar
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && searchInput.value.trim() !== '') {
    const city = searchInput.value;
    console.log(city);
    apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKeyOpenWeather}&units=metric`;
    forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKeyOpenWeather}&units=metric`;
    weatherApiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKeyWeatherApi}&q=${city}`; 
    updateWeather(apiUrl, forecastUrl, weatherApiUrl);
  }
});


// Functions to update the weather cards with the data
function updateWeather(apiUrl, forecastUrl, weatherApiUrl) {
  Promise.all([
    fetch(apiUrl).then(response => response.json()),
    fetch(forecastUrl).then(response => response.json()),
    fetch(weatherApiUrl).then(response => response.json())
  ])
  .then(data => {
    const [apiData, forecastData, weatherApiData] = data;
    console.log(apiData, forecastData, weatherApiData);

    weather1.fillFromOpenWeatherMap(apiData);
    showWeatherData(forecastData);
    weather2.fillFromWeatherApi(weatherApiData);

    console.log(weather1,weather2);
    showWeatherData(forecastData);
    displayWeather(weather1, weather2);
    selectBackground();
  })

  .catch(displayError);
}


function displayWeather(weather1, weather2) {
  cityTitle.textContent = `Weather in ${weather1.city}`;
  weatherIcon.src = weather1.icon;
  degrees.textContent = Math.round((weather1.temp + weather2.temp) / 2) + '??C';
  description.textContent = weather1.description;
  humidity.textContent = `Humidity: ${Math.round((weather1.humidity + weather2.humidity) / 2)}%`;
  wind.textContent = `Wind Speed: ${Math.round((weather1.wind + weather2.wind) / 2)} km/h`;
  minTemp.textContent = `Min: ${Math.round(weather1.minTemp)}??C`;
  maxTemp.textContent = `Max: ${Math.round(weather1.maxTemp)}??C`;
  feelsLike.textContent = `Feels Like: ${Math.round((weather1.feelsLike + weather2.feelsLike) / 2)}??C`;
}

function displayError(error) {
  console.error(error);
  alert("Location Does Not Exist!");
}


function selectBackground(){
  switch (true) {
    case /clear/i.test(weather1.description):
      document.body.style.backgroundImage = "url('/img/clear.png')";
      break;
    case /drizzle/i.test(weather1.description):
      document.body.style.backgroundImage = "url('/img/drizzle1.png')";
      break;
    case /clouds/i.test(weather1.description):
      document.body.style.backgroundImage = "url('/img/clouds.png')";
      break;
    case /rain/i.test(weather1.description):
      document.body.style.backgroundImage = "url('/img/rain1.png')";
      break;
    case /thunderstorm/i.test(weather1.description):
      document.body.style.backgroundImage = "url('/img/thunderstorm.png')";
      break;
    case /snow/i.test(weather1.description):
      document.body.style.backgroundImage = "url('/img/snow.png')";
      break;
    default:
      document.body.style.backgroundImage = "url('/img/default.png')";
  }
}



//FORECAST UPDATE
function showWeatherData(data) {
  let forecastHTML = '';


  for (let i = 0; i < 5; i++) {
    forecastList = data["list"]
    forecastMainData = forecastList[i*8]["main"]
    forecastWind = forecastList[i*8]["wind"]
    forecastWeather = forecastList[i*8]["weather"]
    forecastWeatherDesc = forecastWeather[0]["description"]
    forecastHumidity = forecastMainData["humidity"]
    forecastFeelsLike = forecastMainData["feels_like"]
    forecastWindSpeed = forecastWind["speed"]
    const forecast = new Weather();
    forecast.fillFromForecast(data.list[i*8]);
    forecastHTML += `
    <div class="weather-forecast" id="weather-forecast">
      <div class="card">
        <div class="weather-forecast-item">
          <p class="forecast-day">${getDayOfWeek(i)}</p>
          <div class="forecast-details">
            <img src="${forecast.icon}" alt="${forecast.description}" class="forecast-icon">
            <h5 class="weatherDescription">${forecastWeatherDesc}</h5>
            <h5 class="forecast-temp"><span class="min-temp">${forecast.minTemp}??C min</span> / <span class="max-temp">${forecast.maxTemp}??C max</span></h5>
          </div>
          <div class="focus-content">
            <p class="forecast-description">Feels Like: ${forecastFeelsLike}??C</p>
            <p class="forecast-description">Humidity: ${forecastHumidity}%</p>
            <p class="forecast-description">Wind Speed: ${forecastWindSpeed}km/h</p>
          </div>
        </div>
      </div>
    </div>
    `;
  }
  
  weatherForecastEl.innerHTML = forecastHTML;
  //currentTempEl.textContent = `Current: ${Math.round(data.list[0].main.temp)}??C`;
}

function getDayOfWeek(offset) {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return daysOfWeek[date.getDay()];
}




