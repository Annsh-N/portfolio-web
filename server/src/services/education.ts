import type { EducationSnapshot } from "../../../shared/types.js";

const PURDUE_COORDS = {
  latitude: 40.4237,
  longitude: -86.9212,
};

function describeWeather(code: number): string {
  if (code === 0) return "Clear";
  if ([1, 2].includes(code)) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Atmospheric";
}

function describeAqi(value: number): string {
  if (value <= 50) return "Good";
  if (value <= 100) return "Moderate";
  if (value <= 150) return "Unhealthy for sensitive groups";
  if (value <= 200) return "Unhealthy";
  if (value <= 300) return "Very unhealthy";
  return "Hazardous";
}

export async function getEducationSnapshot(): Promise<EducationSnapshot> {
  const now = new Date();
  try {
    const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
    weatherUrl.searchParams.set("latitude", String(PURDUE_COORDS.latitude));
    weatherUrl.searchParams.set("longitude", String(PURDUE_COORDS.longitude));
    weatherUrl.searchParams.set("current", "temperature_2m,weather_code");
    weatherUrl.searchParams.set("temperature_unit", "fahrenheit");

    const aqiUrl = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
    aqiUrl.searchParams.set("latitude", String(PURDUE_COORDS.latitude));
    aqiUrl.searchParams.set("longitude", String(PURDUE_COORDS.longitude));
    aqiUrl.searchParams.set("current", "us_aqi");

    const [weatherResponse, aqiResponse] = await Promise.all([
      fetch(weatherUrl, { headers: { accept: "application/json" } }),
      fetch(aqiUrl, { headers: { accept: "application/json" } }),
    ]);

    const weatherJson = (await weatherResponse.json()) as {
      current?: {
        temperature_2m: number;
        weather_code: number;
      };
    };
    const aqiJson = (await aqiResponse.json()) as {
      current?: {
        us_aqi: number;
      };
    };

    if (!weatherJson.current || !aqiJson.current) {
      throw new Error("Missing current weather");
    }

    return {
      school: "Purdue University",
      timezone: "America/Indiana/Indianapolis",
      cityLabel: "West Lafayette, IN",
      weather: {
        temperatureF: Math.round(weatherJson.current.temperature_2m),
        condition: describeWeather(weatherJson.current.weather_code),
        fetchedAt: now.toISOString(),
      },
      aqi: {
        value: Math.round(aqiJson.current.us_aqi),
        category: describeAqi(aqiJson.current.us_aqi),
        fetchedAt: now.toISOString(),
      },
      localTimeIso: now.toISOString(),
    };
  } catch {
    return {
      school: "Purdue University",
      timezone: "America/Indiana/Indianapolis",
      cityLabel: "West Lafayette, IN",
      weather: {
        temperatureF: 61,
        condition: "Calm cloud cover",
        fetchedAt: now.toISOString(),
      },
      aqi: {
        value: 46,
        category: "Good",
        fetchedAt: now.toISOString(),
      },
      localTimeIso: now.toISOString(),
    };
  }
}
