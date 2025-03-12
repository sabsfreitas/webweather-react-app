import React, { useEffect, useState } from "react";
import axios from "axios";
import '@fontsource/inter';
// Material-UI Components
import {
  Card,
  Grid2,
  Typography,
  CardContent,
  AppBar,
  CssBaseline,
  Toolbar,
  TextField,
  Fab,
  Box,
} from "@mui/material";
// Material-UI Icons
import {
  SearchRounded as SearchIcon,
  South as SouthIcon,
  North as NorthIcon,
  Water as WaterIcon,
} from "@mui/icons-material";

import "./App.css";
// import Chart from "./components/Chart";

const api = {
  key: "02e3d77820cfd9ee3e6ca048fb4e10b4",
  base: "https://api.openweathermap.org/data/2.5/",
  geo: "https://api.openweathermap.org/geo/1.0/",
  default: "http://api.openweathermap.org/geo/1.0/direct?q=pelotas",
};

function App() {
  const [query, setQuery] = useState("");
  const [forecast, setForecast] = useState(null);
  // const [chart, setChart] = useState({});

  useEffect(() => {
    if (forecast) {
      axios.post("http://localhost:5000/weather", {
        city: forecast.city.name,
        temp: forecast.list[0].main.temp,
        tempMax: forecast.list[0].main.temp_min,
        tempMin: forecast.list[0].main.temp_max,
        humidity: forecast.list[0].main.humidity,
        feels_like: forecast.list[0].main.feels_like,
      });
    }
  }, [forecast]);

  const buscaLatLon = async () => {
    try {
      let res;
      if (query === "") {
        res = await axios.get(api.default);
      } else {
        res = await axios.get(
          `${api.geo}direct?q=${query}&limit=1&appid=${api.key}`
        );
      }

      if (!res.data || res.data.length === 0) {
        console.log("Nenhuma cidade encontrada!");
        return;
      }

      console.log("Resposta da API:", res.data);

      setQuery("");
      buscaClima(res.data[0]);
    } catch (error) {
      console.error("Erro ao buscar cidade:", error);
    }
  };

  function formataData(data) {
    var date = new Date(data * 1000);
    var hours = date.getHours().toString().padStart(2, "0"); // Garante dois dígitos (ex: 06, 12)
    var minutes = date.getMinutes().toString().padStart(2, "0"); // Garante dois dígitos (ex: 00, 05)
  
    return (
      date.getDate() +
      "/" +
      (date.getMonth() + 1) +
      "/" +
      date.getFullYear() +
      " " +
      hours +
      ":" +
      minutes
    );
  }
  

  const buscaClima = async (searchData) => {
    if (
      !searchData ||
      typeof searchData.lat === "undefined" ||
      typeof searchData.lon === "undefined"
    ) {
      console.error("Erro: dados de latitude/longitude inválidos", searchData);
      return;
    }

    const lat = searchData.lat;
    const lon = searchData.lon;

    let url = `${api.base}forecast?lat=${lat}&lon=${lon}&appid=${api.key}&lang=pt_br&units=metric`;
    try {
      const forecastFetch = await axios.get(url);
      setForecast(forecastFetch.data);
      // setChart({
      //   labels: forecastFetch.data.list.map((day) => formataData(day.dt)),
      //   datasets: [
      //     {
      //       label: "Temperatura",
      //       data: forecastFetch.data.list.map((f) => f.main.temp),
      //       backgroundColor: "purple",
      //       borderColor: "rgb(171, 150, 185)",
      //     },
      //   ],
      // });
    } catch (error) {
      console.error("Erro ao buscar previsão do tempo:", error);
    }
  };

  return (
    <>
      <header>
        <AppBar position="fixed" id="toolbar">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              WebWeather
            </Typography>
          </Toolbar>
        </AppBar>
      </header>

      <div style={{ marginTop: "100px" }}>
        <main className="app">
          <Grid2
            container
            spacing={1}
            alignItems="center"
            justifyContent="center"
          >
            <Grid2 item>
              <TextField
                id="searchBox"
                onChange={(e) => setQuery(e.target.value)}
                value={query}
                variant="outlined"
                label="Procure uma cidade"
              />
            </Grid2>
            <Grid2 item>
              <Fab aria-label="search" size="small" color="secondary" onClick={buscaLatLon}>
                <SearchIcon />
              </Fab>
            </Grid2>
          </Grid2>

          {forecast && (
            <div>
              <Typography variant="h5" id="cityName" marginTop={3}>
                {forecast.city.name}
              </Typography>
              

              <Grid2 container spacing={2} justifyContent="center" marginTop={5}>
                {forecast.list.slice(0, 5).map(
                  (
                    f,
                    index
                  ) => (
                    <Grid2 item key={index}>
                      <Card
                        variant="outlined"
                        sx={{
                          width: 180,
                          padding: 2,
                          textAlign: "center",
                          backgroundColor: "rgb(171, 150, 185)",
                        }}
                      >
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {formataData(f.dt)}
                          </Typography>

                          <img
                            src={`http://openweathermap.org/img/w/${f.weather[0].icon}.png`}
                            alt={f.weather[0].description}
                            width="50"
                          />
                          <Typography variant="body2">
                            {f.weather[0].description}
                          </Typography>

                          <Typography variant="body2">
                            <NorthIcon fontSize="small" /> Máx:{" "}
                            {f.main.temp_max.toFixed()}°
                          </Typography>
                          <Typography variant="body2">
                            <SouthIcon fontSize="small" /> Mín:{" "}
                            {f.main.temp_min.toFixed()}°
                          </Typography>

                          <Typography variant="body2">
                            🌡 Sensação: {f.main.feels_like.toFixed()}°
                          </Typography>

                          <Typography variant="body2">
                            <WaterIcon fontSize="small" /> Umidade:{" "}
                            {f.main.humidity}%
                          </Typography>

                          <Typography variant="body2">
                            💨 Vento: {f.wind.speed.toFixed(1)} m/s
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid2>
                  )
                )}
              </Grid2>
            </div>
          )}

          {/* {forecast && (
            <div style={{ width: "100%", backgroundColor: "white" }}>
              <Chart charData={chart} />
            </div>
          )} */}
        </main>
      </div>
    </>
  );
}

export default App;
