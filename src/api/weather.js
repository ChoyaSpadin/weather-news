export async function getWeatherByCity(city) {
  const apiKey = import.meta.env.VITE_WEATHER_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=pt_br`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Cidade não encontrada");
  }
  return res.json();
}
