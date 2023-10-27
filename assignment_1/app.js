import * as http from "http";
import { 
    getMovieById, 
    getMovieByTitle, 
    getStreamingById, 
    combineMovieData,
    getMovieId,
    getMoviePoster,
    convertUrlToImage
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
            // get movie
            const movies = await getMovieByTitle(title);
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
            const streaming = await getStreamingById(getMovieId(movie));
            const combinedData = combineMovieData(movie, streaming);

            switch (true) {
                case (!id || id.length === 0):
                    statusCode = 400;
                    content = { error: true, message: "You must supply an imdbID!" };
                    break;
                case (movie["Error"]):
                    statusCode = 500;
                    content = { error: true, message: movie["Error"] };
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
            console.log(movie)
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
                case (!movie["Poster"]): 
                    statusCode = 500;
                    type = "image/png";
                    content = { error: true, message: "No poster found for this id." };
                    break;
                default:
                    statusCode = 200;
                    url = getMoviePoster(movie);
                    console.log("poster url: " + url);
                    content = await convertUrlToImage(url);       
                    break;
            }
            res.writeHead(statusCode, { "Content-Type": `${type}` });
            res.write(content);
            res.end();
        } catch (err) {
            // send the error
            console.log("error: " + err);
            res.end(JSON.stringify({ error: true, message: err["message"] }));
        }
    } else if ((url.match(/\/posters\/add\/([a-zA-Z0-9])/) || url.startsWith("/posters/add")) && method === 'POST') {
        // set the status code and content-type
        res.writeHead(statusCode, { "Content-Type": "image/png" });
        try {
            // get id from url
            const id = req.url.split("/")[2];
            // get movie
            const movie = await getMovieById(id);
            const statusCode = id || id.length > 0 ? 200 : 400;
            const url = movie["Error"] ? "" : getMoviePoster(movie);
            const imageBuffer =  convertUrlToImage(url);

            // send the data
            res.end(imageBuffer);
        } catch (err) {
            // set the status code and content-type
            res.writeHead(500, { "Content-Type": "application/json" });
            // send the error
            res.end(JSON.stringify({ error: true, message: err["message"] }));
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