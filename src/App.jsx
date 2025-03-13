import React, { useEffect, useState } from "react";
import axios from "axios";
import "@fontsource/inter";
import {
  Card,
  Grid2 as Grid,
  Typography,
  CardContent,
  AppBar,
  Toolbar,
  TextField,
  CircularProgress,
  Autocomplete,
} from "@mui/material";

import {
  DeviceThermostat as DeviceThermostatIcon,
  SearchRounded as SearchIcon,
  North as NorthIcon,
  South as SouthIcon,
  WaterDrop as WaterIcon,
  Air as AirIcon,
} from "@mui/icons-material";

import "./App.css";

const api = {
  key: import.meta.env.VITE_API_KEY,
  base: "https://api.openweathermap.org/data/2.5/",
  geo: "https://api.openweathermap.org/geo/1.0/direct?",
};

function App() {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    if (query.length < 2) {
      setOptions([]);
      return;
    }

    setLoading(true);
    axios
      .get(`${api.geo}q=${query}&limit=5&appid=${api.key}`)
      .then((res) => {
        const uniqueCities = new Map();
        res.data.forEach((city) => {
          const key = `${city.name}, ${city.country}`;
          if (!uniqueCities.has(key)) {
            uniqueCities.set(key, city);
          }
        });

        setOptions([...uniqueCities.values()]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query]);

  function formataData(data) {
    let date = new Date(data * 1000);
    let hours = date.getHours().toString().padStart(2, "0");
    let minutes = date.getMinutes().toString().padStart(2, "0");

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
    if (!searchData) return;
  
    try {
      const res = await axios.get(
        `${api.base}forecast?lat=${searchData.lat}&lon=${searchData.lon}&appid=${api.key}&lang=pt_br&units=metric`
      );
  
      setForecast(res.data);
  
      const weatherData = {
        city: res.data.city.name,
        temp: res.data.list[0].main.temp,
        tempMax: res.data.list[0].main.temp_max,
        tempMin: res.data.list[0].main.temp_min,
        humidity: res.data.list[0].main.humidity,
        feels_like: res.data.list[0].main.feels_like,
      };
  
      await axios.post("http://localhost:5000/weather", weatherData);
  
      console.log("Dados salvos no MongoDB:", weatherData);
  
    } catch (error) {
      console.error("Erro ao buscar previsão do tempo:", error);
    }
  };
  

  return (
    <>
      <AppBar position="fixed">
        <Toolbar id="toolbar">
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            WebWeather
          </Typography>
        </Toolbar>
      </AppBar>

      <div style={{ marginTop: "100px" }}>
        <main className="app">
          <Grid
            container
            spacing={1}
            alignItems="center"
            justifyContent="center"
          >
            <Grid item>
              <Autocomplete
                freeSolo
                options={options}
                getOptionLabel={(option) => `${option.name}, ${option.country}`}
                loading={loading}
                onInputChange={(event, newInputValue) =>
                  setQuery(newInputValue)
                }
                onChange={(event, selectedCity) => buscaClima(selectedCity)}
                sx={{ width: 300 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Procure uma cidade"
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      end: (
                        <>
                          {loading ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.end}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>

          {forecast && (
            <div>
              <Typography variant="h5" marginTop={3} textAlign="center">
                {forecast.city.name}, {forecast.city.country}
              </Typography>

              <Grid container spacing={3} justifyContent="center" marginTop={5}>
                {forecast.list.slice(0, 5).map((f, index) => (
                  <Grid item key={index}>
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
                        <Typography variant="body2" fontWeight={2}>
                          {f.weather[0].description}
                        </Typography>

                        <Grid container spacing={3} justifyContent="center" mt={1}>
                          <Grid item xs={4}>
                            <Typography
                              variant="body2"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                mb: 1,
                              }}
                            >
                              <NorthIcon fontSize="small" />{" "}
                              {f.main.temp_max.toFixed()}°
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                mb: 1,
                              }}
                            >
                              <SouthIcon fontSize="small" />{" "}
                              {f.main.temp_min.toFixed()}°
                            </Typography>
                          </Grid>

                          <Grid item xs={4}>
                            <Typography
                              variant="body2"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                mb: 1,
                              }}
                            >
                              <AirIcon fontSize="small" />{" "}
                              {f.wind.speed.toFixed(1)} m/s
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: "3px",
                                mb: 1,
                              }}
                            >
                              <WaterIcon fontSize="small" /> {f.main.humidity}%
                            </Typography>
                          </Grid>
                        </Grid>

                        <Typography
                          variant="body2"
                          sx={{
                            display: "flex",
                            gap: "2px",
                            marginTop: 1,
                          }}
                        >
                          <DeviceThermostatIcon fontSize="small" /> Sensação
                          térmica: {f.main.feels_like.toFixed()}°
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default App;
