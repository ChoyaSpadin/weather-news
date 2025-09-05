import sun from "../assets/avatars/sun.png";
import cloud from "../assets/avatars/cloud.png";
import rain from "../assets/avatars/rain.png";
import snow from "../assets/avatars/snow.png";
import storm from "../assets/avatars/storm.png";
import mist from "../assets/avatars/mist.png";

export function getAvatar(weather) {
  const main = weather.toLowerCase();

  if (main.includes("clear")) return sun;
  if (main.includes("cloud")) return cloud;
  if (main.includes("rain") || main.includes("drizzle")) return rain;
  if (main.includes("snow")) return snow;
  if (main.includes("thunderstorm")) return storm;
  if (main.includes("mist") || main.includes("fog") || main.includes("haze"))
    return mist;

  return sun; // fallback
}
