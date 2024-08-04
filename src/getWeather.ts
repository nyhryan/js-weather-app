import { Elysia, t }  from "elysia";
import { Geocoding, WeatherData } from './types';

async function fetchJSON(url: string) {
  return fetch(url)
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(`${res.status} : ${res.statusText}`);
      }
      return res.json();
    })
    .catch(err => { throw err; });
}

export const getWeather = new Elysia()
  .get("/getWeather", async ({ query }) => {
    const cityName = encodeURIComponent(query["cityName"]);
    const units = encodeURIComponent(query["units"]);
    const API_KEY = process.env.OPEN_WEATHER_API_KEY;
    
    const GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=${API_KEY}`;

    let cityData: Geocoding;
    try {
      const cityDatas: Array<Geocoding> = await fetchJSON(GEOCODING_URL);
      if (Object.keys(cityDatas).length === 0) {
        return `<div class="not-found">City not found.</div>`;
      }      
      cityData = cityDatas[0];
    } catch (err: any) {
      console.error(err);
      return `<div class="not-found">${err.message}</div>`;
    }
    const API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${cityData.lat}&lon=${cityData.lon}&appid=${API_KEY}&units=${units}`;
    const weatherData: WeatherData = await fetchJSON(API_URL).catch(err => console.error(err));

    return `
    <div class="result">
      <div class="city">
        ${cityData.name}, ${cityData.country}
      </div>
      <div class="time">
        Data from ${new Date(weatherData.dt * 1000).toLocaleString()}
      </div>
      <div class="container">
        <div class="temp-and-icon">
          <img class="icon" src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png" />
          <p class="temp">${weatherData.main.temp.toFixed(0)}${units === "metric" ? "ºC" : "ºF"}</p>
        </div>
        <div class="desc">
          <p>${weatherData.weather[0].description}</p>
          <p>Feels like ${weatherData.main.feels_like.toFixed(0)}${units === "metric" ? "ºC" : "ºF"}</p>
          <p class="humidity">${weatherData.main.humidity}%</p>
        </div>
      </div>
    </div>
`;
  }, {
    query: t.Object({
      cityName: t.String(),
      units: t.String(),
    }),
  });