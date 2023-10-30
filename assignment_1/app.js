import * as http from "http";
import { 
    getMovieById, 
    getMovieByTitle, 
    getStreamingById, 
    combineMovieData,
    getMoviePoster,
    imageUrlToBuffer,
    writeToFile,
    readFromFile
 } from "./utils.js"

const PORT = process.env.PORT || 3000;

const routing =  async (req, res) => {
    const url = req.url;
    const method = req.method;

    if ((url.match(/\/movies\/search\/([a-zA-Z0-9])/) || url.startsWith("/movies/search/")) && method === 'GET') {
        let statusCode = 200;
        let content = "";
        try {
            // get title from url
            const title = req.url.split("/")[3];
            // get page from url
            const page = req.url.split("/")[4] || 1;

            // get movie
            const movies = await getMovieByTitle(title, page);
            console.log(movies);
            switch (true) {
                case (!title || title.length === 0):
                    statusCode = 400;
                    content = { error: true, message: "You must supply a title!" };
                    break;
                case (movies["Error"]):
                    statusCode = 500;
                    content = { error: true, message: movies["Error"] };
                    break;
                default:
                    statusCode = 200;
                    content = movies;
                    break;
            }

            res.writeHead(statusCode, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            });
            res.write(JSON.stringify(content));
            res.end();
        } catch (err) {
            res.end(JSON.stringify({ error: true, message: err["message"] }));
        }
    } else if ((url.match(/\/movies\/data\/([a-zA-Z0-9])/) || url.startsWith("/movies/data/")) && method === 'GET') {
        let statusCode = 200;
        let content = "";
        try {
            // get id from url
            const id = req.url.split("/")[3];
            const movie = await getMovieById(id);
            const streaming = await getStreamingById(id);
            const combinedData = combineMovieData(movie, streaming);

            switch (true) {
                case (!id || id.length === 0):
                    statusCode = 400;
                    content = { error: true, message: "You must supply an imdb ID!" };
                    break;
                case (combinedData["error"]):
                    console.log(combinedData)
                    statusCode = 500;
                    content = combinedData;
                    break;
                default:
                    statusCode = 200;
                    content = combinedData;
                    break;
            }

            res.writeHead(statusCode, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            });
            res.write(JSON.stringify(content));
            res.end();
        } catch (err) {
            // send the error
            res.end(JSON.stringify({ error: true, message: err["message"] }));
        }
    } else if ((url.match(/\/posters\/([a-zA-Z0-9])/) || url.startsWith("/posters/")) && method === 'GET') {
        let statusCode = 200;
        let type = "image/png";
        let content = "";
       
        try {
            // get id from url
            const id = req.url.split("/")[2];
            // get movie
            const movie = await getMovieById(id);
            const posterUrl = getMoviePoster(movie);
            
            switch (true) {
                case (!id || id.length === 0):
                    statusCode = 400;
                    type = "application/json"
                    content = { error: true, message: "You must supply an imdbID!" };
                    break;
                case (movie["Error"]):
                    statusCode = 500;
                    type = "application/json"
                    content = { error: true, message: movie["Error"] };
                    break;
                case (!posterUrl): 
                    statusCode = 500;
                    type = "application/json";
                    content = { error: true, message: "No poster found for this id." };
                    break;
                case (imageUrlToBuffer(posterUrl)["error"]):
                    statusCode = 500;
                    type = "application/json";
                    content = { error: true, message: "Unable to retrieve poster." };
                    break;
                default:
                    statusCode = 200;
                    type = "image/png";
                    const imageBuffer = await imageUrlToBuffer(posterUrl);   
                    const filePath = `./posters/${id}.png`
                    content = imageBuffer;    
                    break;
            }
            res.writeHead(statusCode, { 
                "Content-Type": `${type}`,
                "Access-Control-Allow-Origin": "*",
            });
            res.write(content);
            res.end();
        } catch (err) {
            res.end(JSON.stringify({ error: true, message: err["message"] }));
        }
    } else if ((url.match(/\/posters\/add\/([a-zA-Z0-9])/) || url.startsWith("/posters/add")) && method === "POST") {
        // set the status code and content-type
        res.writeHead(200, { 
            "Content-Type": "image/png", 
            "Access-Control-Allow-Origin": "*",
        });
        let body = [];
        req.on("data", (chunk) => {
            body.push(chunk);
        });
        req.on("end", () => {
            const id = req.url.split("/")[3];
            const data = Buffer.concat(body);

            const response = writeToFile(`./posters/${id}.png`, data);
            if (response["error"]) {
                res.write(JSON.stringify({
                    "error": true,
                    "message": response["message"]
                }));
            } else {  
                res.write(JSON.stringify({
                    "error": false,
                    "message": "Poster Uploaded Successfully"
                }));
            }

            res.end();   
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