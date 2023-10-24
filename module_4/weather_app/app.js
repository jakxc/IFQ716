import * as http from "http";
import "dotenv/config";

const API_KEY = process.env.WEATHERAPI_KEY;
const WEATHERAPI_BASE = "http://api.weatherapi.com/v1";

async function weather(res) {
    fetch(`${WEATHERAPI_BASE}/current.json?key=${API_KEY}&q=Brisbane`)
    .then(res => res.json())
    .then(data => {
        res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
        res.write(JSON.stringify(data));
        res.end();
    })
    .catch(err => {
      res.write(err);
    }); 
}

function routing(req, res) {
  const url = req.url;
  const method = req.method;
  if (url.startsWith("/weather") && method == "GET") {
    weather(res);
  } else {
    // No page matched the url
    res.write("No matching page");
    res.end();
  }
}
http.createServer(routing).listen(3000, function () {
  console.log("server start at port 3000"); //the server object listens on port
});