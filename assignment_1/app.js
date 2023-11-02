import * as http from "http";
import { readFile, existsSync } from "fs";
import { 
    getMovieById, 
    getMovieByTitle, 
    getStreamingById, 
    combineMovieData,
    getMoviePoster,
    imageUrlToBuffer,
    writeToFile
 } from "./utils.js"

const PORT = process.env.PORT || 3000;

const routing =  async (req, res) => {
    const url = req.url;
    const method = req.method;

    if ((url.match(/\/movies\/search\/([a-zA-Z0-9])/) || url.startsWith("/movies/search/")) && method === 'GET') {
        try {
            // get title from params
            const params = new URLSearchParams(req.url.split("/")[3]);
            const title = params.toString().split("=&").length > 1 ? params.toString().split("=&")[0] : params.toString().split("=")[0];
            // get page from url
            const page = params.get("page") || 1;
            // get movie
            const movies = await getMovieByTitle(title, page);
           
            res.setHeader( "Access-Control-Allow-Origin", "*");
            switch (true) {
                case (!title || title.length === 0):
                    res.statusCode = 400;
                    res.setHeader("Content-Type", "application/json");
                    res.write(JSON.stringify({ error: true, message: "You must supply a title!" }));
                    res.end();
                    break;
                default:
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.write(JSON.stringify(movies));
                    res.end();
                    break;
            }

        } catch (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: true, message: err["message"] }));
        }
    } else if ((url.match(/\/movies\/data\/([a-zA-Z0-9])/) || url.startsWith("/movies/data/")) && method === 'GET') {
        try {
            // get id from url
            const params = new URLSearchParams(req.url.split("/")[3]);
            const id = params.toString().split("=&").length > 1 ? params.toString().split("=&")[0] :params.toString().split("=")[0];
            const movie = await getMovieById(id);
            const streaming = await getStreamingById(id);
            const combinedData = combineMovieData(movie, streaming);

            res.setHeader( "Access-Control-Allow-Origin", "*");
            switch (true) {
                case (!id || id.length === 0):
                    res.statusCode = 400;
                    res.setHeader("Content-Type", "application/json");
                    res.write(JSON.stringify({ error: true, message: "You must supply an imdbID!" }));
                    res.end();
                    break;
                default:
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.write(JSON.stringify(combinedData));
                    res.end();
                    break;
            }
        } catch (err) {
            // send the error
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: true, message: err["message"] }));
        }
    } else if ((url.match(/\/posters\/([a-zA-Z0-9])/) || url.startsWith("/posters/")) && method === 'GET') {       
        try {
            // get id from url
            const id = req.url.split("/")[2];
            const filePath = `./posters/${id}.png`;

            res.setHeader( "Access-Control-Allow-Origin", "*");
            switch (true) {
                case (!id || id.length === 0):
                    res.statusCode = 400;
                    res.setHeader("Content-Type", "application/json");
                    res.write(JSON.stringify({ error: true, message: "You must supply an imdbID!" }));
                    res.end();
                    break;
                default:
                    if (existsSync(filePath)) {
                        readFile(filePath, "binary", (err, data) => {
                            if (err) {
                                console.log(err);
                                throw err;
                            };
    
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "image/png");
                            res.write(data, "binary");
                            res.end();
                        });
                    } else {
                        // get movie
                        const movie = await getMovieById(id);
                        //get poster
                        const posterUrl = getMoviePoster(movie);
                        const imageBuffer = await imageUrlToBuffer(posterUrl);   
        
                        writeToFile(filePath, imageBuffer);
                        readFile(filePath, "binary", (err, data) => {
                            if (err) {
                                throw err;
                            };

                            res.statusCode = 200;
                            res.setHeader("Content-Type", "image/png");
                            res.write(data, "binary");
                            res.end();
                        });
                    }
                    break;
            }
        } catch (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: true, message: err["message"] }));
        }
    } else if ((url.match(/\/posters\/add\/([a-zA-Z0-9])/) || url.startsWith("/posters/add")) && method === "POST") {
        // set the status code and content-type
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Content-Type", "application/json");

        let body = [];
        req.on("data", (chunk) => {
            body.push(chunk);
        });
        req.on("end", () => {
            const id = req.url.split("/")[3];
            const data = Buffer.concat(body);

            try {
                const response = writeToFile(`./posters/${id}.png`, data);
                res.statusCode = 200;
                res.write(JSON.stringify({
                    "error": false,
                    "message": "Poster Uploaded Successfully"
                }));
                res.end();  
            } catch (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: true, message: err["message"] }));
            }
        })
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