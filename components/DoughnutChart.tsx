"use client";

import { Chart as ChartJS, ArcElement, Legend, Tooltip } from "chart.js";
import React from "react";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ accounts }: DoughnutChartProps) => {
  const data = {
    datasets: [
      {
        label: "Banks",
        data: [1250, 2500, 3750, 4500],
        backgroundColor: ["#0747b6", "#2265d8", "#2f91fa", "#2254f9"],
      },
    ],

    labels:['Bank 1', 'Bank 2', 'Bank 3', 'Bank 4'],
  };

  return <Doughnut data={data} options={{ cutout: "65%", plugins : {
    legend: {
        display : false,
    }
  } }} />;
};

export default DoughnutChart;
