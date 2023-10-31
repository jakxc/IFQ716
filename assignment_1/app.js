import * as http from "http";
import { readFile } from "fs";
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
            // get title from url
            const title = req.url.split("/")[3];
            // get page from url
            const page = req.url.split("/")[4] || 1;
            // get movie
            const movies = await getMovieByTitle(title, page);
            res.setHeader( "Access-Control-Allow-Origin", "*");
            switch (true) {
                case (!title || title.length === 0):
                    res.setHeader("status", 400);
                    res.setHeader("Content-Type", "application/json");
                    res.write(JSON.stringify({ error: true, message: "You must supply a title!" }));
                    res.end();
                    break;
                default:
                    res.setHeader("status", 200);
                    res.setHeader("Content-Type", "application/json");
                    res.write(JSON.stringify(movies));
                    res.end();
                    break;
            }

        } catch (err) {
            res.setHeader("status", 500);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: true, message: err["message"] }));
        }
    } else if ((url.match(/\/movies\/data\/([a-zA-Z0-9])/) || url.startsWith("/movies/data/")) && method === 'GET') {
        try {
            // get id from url
            const id = req.url.split("/")[3];
            const movie = await getMovieById(id);
            console.log(movie);
            const streaming = await getStreamingById(id);
            const combinedData = combineMovieData(movie, streaming);

            res.setHeader( "Access-Control-Allow-Origin", "*");
            switch (true) {
                case (!id || id.length === 0):
                    res.setHeader("status", 400);
                    res.setHeader("Content-Type", "application/json");
                    res.write(JSON.stringify({ error: true, message: "You must supply an imdbID!" }));
                    res.end();
                    break;
                default:
                    res.setHeader("status", 200);
                    res.setHeader("Content-Type", "application/json");
                    res.write(JSON.stringify(combinedData));
                    res.end();
                    break;
            }
        } catch (err) {
            // send the error
            res.setHeader("status", 500);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: true, message: err["message"] }));
        }
    } else if ((url.match(/\/posters\/([a-zA-Z0-9])/) || url.startsWith("/posters/")) && method === 'GET') {       
        try {
            // get id from url
            const id = req.url.split("/")[2];
            // get movie
            const movie = await getMovieById(id);
            const posterUrl = getMoviePoster(movie);
            
            res.setHeader( "Access-Control-Allow-Origin", "*");
            switch (true) {
                case (!id || id.length === 0):
                    res.setHeader("status", 400);
                    res.setHeader("Content-Type", "application/json");
                    res.write(JSON.stringify({ error: true, message: "You must supply an imdbID!" }));
                    res.end();
                    break;
                case (movie["Error"]):
                    res.setHeader("status", 500);
                    res.setHeader("Content-Type", "application/json");
                    res.write(JSON.stringify({ error: true, message: movie["Error"] }));
                    res.end();
                    break;
                case (!posterUrl): 
                    res.setHeader("status", 500);
                    res.setHeader("Content-Type", "application/json");
                    res.write(JSON.stringify({ error: true, message: "Unable to retrieve poster for this id." }));
                    res.end();
                    break;
                default:
                    const imageBuffer = await imageUrlToBuffer(posterUrl);   
                    const filePath = `./posters/${id}.png`
                    writeToFile(filePath, imageBuffer);
                    readFile(filePath, "binary", (err, data) => {
                        if (err) {
                            console.log(err);
                            // return { error: true, message: err["message"] }
                        };

                        res.setHeader("status", 200);
                        res.setHeader("Content-Type", "image/png");
                        res.write(data, "binary");
                        res.end();
                    });
                    break;
            }
        } catch (err) {
            res.setHeader("status", 500);
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
                res.setHeader("status", 200);
                res.write(JSON.stringify({
                    "error": false,
                    "message": "Poster Uploaded Successfully"
                }));
                res.end();  
            } catch (err) {
                res.setHeader("status", 500);
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