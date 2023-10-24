import * as http from "http";
import * as dotenv from 'dotenv'
dotenv.config();

const API_KEY = process.env.API_KEY;
const IMDB_URL = "http://www.omdbapi.com";
const PORT = process.env.PORT || 3000;

const getMovieByTitle = async (title) => {
    console.log(API_KEY);
    const res = await fetch(`${IMDB_URL}/?apikey=${API_KEY}&t=${title}`);
    const data = await res.json();
    console.log(data);
    return data;
}

const getMovieById = async (id) => {
    console.log(API_KEY);
    const res = await fetch(`${IMDB_URL}/?apikey=${API_KEY}&i=${id}`);
    const data = await res.json();
    console.log(data);
    return data;
}

const routing =  async (req, res) => {
    const url = req.url;
    const method = req.method;
    if (url.match(/\/movies\/search\/([a-zA-Z0-9])/) && method === 'GET') {
         try {
            // get title from url
            const title = req.url.split("/")[3];
            // get todo
            const movie = await getMovieByTitle(title);

            if (movie.length === 0) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end({
                    "error": true,
                    "message": "You must supply a title!"
                  })
            }

            // set the status code and content-type
            res.writeHead(200, { "Content-Type": "application/json" });
            // send the data
            res.end(JSON.stringify(movie));
        } catch (err) {
            // set the status code and content-type
            res.writeHead(400, { "Content-Type": "application/json" });
            // send the error
            res.end(JSON.stringify({ message: err }));
        }
    } else if (url.match(/\/movies\/data\/([a-zA-Z0-9])/) && method === 'GET') {
        try {
            // get title from url
            const id = req.url.split("/")[3];
            // get todo
            const movie = await getMovieById(id);

            if (id.length === 0) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end({
                    "error": true,
                    "message": "You must supply an imdbID!"
                })
            }

            // set the status code and content-type
            res.writeHead(200, { "Content-Type": "application/json" });
            // send the data
            res.end(JSON.stringify(movie));
        } catch (err) {
            // set the status code and content-type
            res.writeHead(500, { "Content-Type": "application/json" });
            // send the error
            res.end(JSON.stringify({ error: true, message: err }));
        }
    } else if (url.startsWith("/client")) {
        if (method == "GET") {
            const filename = "client.html"; // The Filename to read from

            // Try to read the file
            fs.readFile(filename, "binary", function (err, data) {
                // If there is an error, output the message as JSON and return
                if (err) {
                    res.writeHead(500, { "Content-Type": "application/json" });
                    res.write(JSON.stringify({ error: err }));
                    res.end();
                    return;
                }

                // Respond with the HTML file
                res.writeHead(200, { "Content-Type": "text/html" });
                res.write(data, "binary");
                res.end();
            });
        }
    } else if (url.startsWith("/add")) {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', () => {
            const formData = new URLSearchParams(body);
            const cat = formData.get("cat");
            data.push(cat);
            res.write(`${cat} has been successfully added!`);
           res.end();   
        })
    } else if (url.startsWith("/delete")) {
        console.log(method);
        if (method == "OPTIONS") {
            res.writeHead(200, {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "OPTIONS, DELETE",
            });
            res.end();
        }
        if (method == "DELETE") {
          res.writeHead(200, {
            "Access-Control-Allow-Origin": "*",
          });
          res.write("delete");
          res.end();
        }
    } else {
        // No page matched the url
        res.write("No matching page");
        res.end();
    }
}

const server = http.createServer(routing);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})