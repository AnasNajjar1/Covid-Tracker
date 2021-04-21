import React, { useState, useEffect } from 'react';
import { FormControl, Select, MenuItem, Card, CardContent  } from '@material-ui/core';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import { prettyPrintStat, sortData } from './utils';
import LineGraph from './LineGraph';
import 'leaflet/dist/leaflet.css';
import './App.css';


function App() {

  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");

  const onCountryChange = async (e) => {
    const countryCode = e.target.value;

    const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all?yesterday=true' : `https://disease.sh/v3/covid-19/countries/${countryCode}?yesterday=true&strict=true`;

    await fetch(url)
          .then(res => res.json())
          .then(data => {
            setCountry(countryCode);
            setCountryInfo(data);
            setMapCenter({ ...mapCenter , lat: data.countryInfo.lat, lng: data.countryInfo.long});
            setMapZoom(4);
          });

  };

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then(res => res.json())
    .then(data => {
      setCountryInfo(data);
    });
  }, []);


  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
            .then((res) => res.json())
            .then((data) => {
              const countries = data.map((country) => ({
                  name: country.country,
                  value: country.countryInfo.iso2 //UK, FR..
              }
             ));
             const sortedData = sortData(data);
             setMapCountries(data);
             setTableData(sortedData);
             setCountries(countries);
            })
    };
    getCountriesData();
  }, []);

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
            <h1>COVID-19 Stats</h1>
            <FormControl className="app__dropdown">
              <Select
                variant="outlined"
                onChange={onCountryChange}
                value={country}
              >
                <MenuItem value="worldwide">Worldwide</MenuItem>
                {
                  countries.map((country) => 
                    <MenuItem value={country.value}>{ country.name }</MenuItem>
                  )
                }
              </Select>
            </FormControl>
          </div>

          <div className="app__stats"> 
                <InfoBox
                  title="Coronavirus Cases"
                  isRed
                  active={casesType==="cases"}
                  cases={prettyPrintStat(countryInfo.todayCases)}
                  total={prettyPrintStat(countryInfo.cases)}
                  onClick={e => setCasesType("cases")}
                />
                <InfoBox 
                  title="Recovered" 
                  active={casesType==="recovered"}
                  cases={prettyPrintStat(countryInfo.todayRecovered)} 
                  total={prettyPrintStat(countryInfo.recovered)}
                  onClick={e => setCasesType("recovered")}
                />
                <InfoBox 
                  title="Deaths" 
                  isRed
                  active={casesType==="deaths"}
                  cases={prettyPrintStat(countryInfo.todayDeaths)} 
                  total={prettyPrintStat(countryInfo.deaths)} 
                  onClick={e => setCasesType("deaths")}
                />
          </div>
          <Map
            countries={mapCountries}
            center={mapCenter}
            zoom={mapZoom}
            casesType={casesType}
          />
      </div>
      <Card className="app__right">
           <CardContent>
             <h3>Live Cases By Country</h3>
             <Table countries={tableData} />
             <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
             <LineGraph className="app__graph" casesType={casesType} />
           </CardContent>
      </Card> 
    </div>
  );
}

export default App;
