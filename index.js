import { apiKey } from "./secrets.js";
import express from "express";
import axios from "axios";


const app = express();
const port = 3000;
const apiURL = "https://api.openweathermap.org/data/2.5/weather"

let latitude = null;
let longitude = null;

function toTitleCase(text) {
    let stringWords = text.split(" ");
    let capitalizedWords = [];
    stringWords.forEach((word) => {
        capitalizedWords.push(word[0].toUpperCase() + word.slice(1, word.length).toLowerCase());
    });

    let capitlizedText = capitalizedWords.join(" ");
    return capitlizedText;
}

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
    if (!!latitude && !!longitude) {
        let apiCallParams = {lat: latitude, lon: longitude, units: "metric", appid: apiKey}
        try {
            const r = await axios.get(apiURL, {params: apiCallParams});
            const result = r.data;
            const region = result.name;
            const country = result.sys.country;
            const image = result.weather[0].icon;
            const imageURL = `https://openweathermap.org/img/wn/${image}@4x.png`;
            const condition = toTitleCase(result.weather[0].description);
            const temp = Math.round(result.main.temp);
            const feel = Math.round(result.main["feels_like"]);
            const humidityPercentage = Math.round(result.main.humidity);
            const windSpeed = Math.round(result.wind.speed);
            const windDir = Math.round(result.wind.deg);

            let data = {
                location: `${region}, ${country}`,
                imageURL: imageURL,
                condition: condition,
                temp: temp,
                feel: feel,
                humidity: humidityPercentage,
                windSpeed: windSpeed,
                windDirection: windDir,
                lat: latitude,
                lon: longitude,
            }

            res.render("index.ejs", data);
            latitude = null;
            longitude = null;
        } catch (error) {
            console.log(`${error.message}\n${error.response?.message}`);
            res.render("index.ejs", {lat: "error", lon: "error"});
        }
    } else {
        res.render("index.ejs");
        latitude = null;
        longitude = null;
    }
});

app.post("/search", (req, res) => {
    latitude = req.body.lat;
    longitude = req.body.lon;
    res.redirect("/");
})


app.listen(port, () => {
    console.log(`Listening on port ${port}.`);
});