const express = require("express");
const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");
const cors = require("cors");

const app = express();
app.use(cors());

// Set up the serial port for Arduino connection (adjust COM port or /dev/ttyUSBx)
const port = new SerialPort("COM3", { baudRate: 9600 });
const parser = new Readline();
port.pipe(parser);

let sensorData = {
  node1: { temperature: null, humidity: null },
  node2: { temperature: null, humidity: null },
  node3: { temperature: null, humidity: null, thermal: null },
};

// Parse the incoming data from LoRa
parser.on("data", (line) => {
  console.log(`Received: ${line}`);
  const regex =
    /Node (\d) signal  Temp: ([\d.]+)C, Hum: ([\d.]+)(?: Thermal: ([\d.]+))?/;
  const match = regex.exec(line);

  if (match) {
    const node = match[1];
    const temp = parseFloat(match[2]);
    const hum = parseFloat(match[3]);
    const thermal = match[4] ? parseFloat(match[4]) : null;

    sensorData[`node${node}`].temperature = temp;
    sensorData[`node${node}`].humidity = hum;
    if (thermal !== null) sensorData[`node${node}`].thermal = thermal;
  }
});

// API to get sensor data
app.get("/sensor-data", (req, res) => {
  res.json(sensorData);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
