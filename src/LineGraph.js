import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import numeral from 'numeral';


const options = {
    legend: {
        display: false
    }, 
    elements: {
        point: {
            radius: 0
        }, 
    }, 
    maintainAspectRatio: false,
    tooltips: {
        mode: "index", 
        intersect: false,
        callbacks: {
            label: function(tooltipItem, data) {
                return numeral(tooltipItem.value).format("+0,0");
            },
        },
    },
    scales: {
        xAxes: [
            {
            type: "time", 
            time: {
                format: "MM/DD/YY", 
                tooltipFormat: "ll"
            },
        },
      ],
      yAxes : [
          {
              gridLines: {
                  display: false,
              },
              ticks: {
                  callback: function(value, index, values) {
                      return numeral(value).format("0a");
                  },
              },
          },
      ],
    },
};

const buildChartData = (data, casesType="cases") => {
    const chartData = [];
    let lastDataPoint;

    for(let date in data.cases) {
        if(lastDataPoint) {
            let newDataPoint = {
                x: date,
                y: data[casesType][date] - lastDataPoint
            };
            chartData.push(newDataPoint);
        }
        lastDataPoint = data[casesType][date];
    }
    return chartData;
};
const LineGraph = ({ casesType = "cases", ...props }) => {

    const [data, setData] = useState({});
    const [backgroundColor, setBackgroundColor] = useState("");
    const [borderColor, setBorderColor] = useState("");
    useEffect(() => {
        if(casesType==='cases' || casesType==='deaths') {
            setBackgroundColor("rgba(204, 16, 52, 0.5)");
            setBorderColor( "#CC1034");
        } else if(casesType==='recovered') {
            setBackgroundColor("rgba(125, 215, 29, 1)");
            setBorderColor("#218c1d");
        }
        const fetchData = async () => {
            await fetch("https://disease.sh/v3/covid-19/historical/all?lastdays=120")
            .then(res => res.json())
            .then((data) => {
                let chartData = buildChartData(data, casesType);
                setData(chartData);
            });
        };
        fetchData();
    }, [casesType]);

    return (
        <div className={props.className}>
            {data?.length > 0 && (
                <Line 
                    options={options}
                    data={{
                        datasets: [{
                            backgroundColor: backgroundColor,
                            borderColor: borderColor,
                            data: data
                        },]
                    }} />
                )}
        </div>
    )
}

export default LineGraph
