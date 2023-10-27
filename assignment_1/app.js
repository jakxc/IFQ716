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
         try {
            // get title from url
            const title = req.url.split("/")[3];
            // get movie
            const movie = await getMovieByTitle(title);
            const statusCode = title && title.length > 0
                                ? movie["Error"] ? 500 : 200 
                            :   400;
            const obj = title && title.length > 0 
                    ?  movie["Error"] ? { error: true, message: movie["Error"] } : movie
                    : { error: true, message: "You must supply a title!" } 

            // set the status code and content-type
            res.writeHead(statusCode, { "Content-Type": "application/json" });
            // send the data
            res.end(JSON.stringify(obj));
        } catch (err) {
            // set the status code and content-type
            res.writeHead(500, { "Content-Type": "application/json" });
            // send the error
            res.end(JSON.stringify({ error: true, message: err }));
        }
    } else if ((url.match(/\/movies\/data\/([a-zA-Z0-9])/) || url.startsWith("/movies/data/")) && method === 'GET') {
        try {
            // get title from url
            const id = req.url.split("/")[3];
            // get movie
            const movie = await getMovieById(id);
            const streaming = await getStreamingById(getMovieId(movie));
            const combinedData = combineMovieData(movie, streaming);
            console.log(combinedData);
            const statusCode = id && id.length > 0
                                ? combinedData["Error"] ? 500 : 200 
                            :   400;
                    const obj = id && id.length > 0 
                    ?  combinedData["Error"] ? { error: true, message: combinedData["Error"] } : combinedData
                    : { error: true, message: "You must supply an imdbID!" } 

            // set the status code and content-type
            res.writeHead(statusCode, { "Content-Type": "application/json" });
            // send the data
            res.end(JSON.stringify(obj));
        } catch (err) {
            // set the status code and content-type
            res.writeHead(500, { "Content-Type": "application/json" });
            // send the error
            res.end(JSON.stringify({ error: true, message: err }));
        }
    } else if ((url.match(/\/posters\/([a-zA-Z0-9])/) || url.startsWith("/posters/")) && method === 'GET') {
        try {
            // get id from url
            const id = req.url.split("/")[2];
            // get movie
            const movie = await getMovieById(id);
            const statusCode = id || id.length > 0 ? 200 : 400;
            const url = movie["Error"] ? "" : getMoviePoster(movie);
            console.log(url);
            const imageFile = await convertUrlToImage(url);
            // set the status code and content-type
            // console.log(imageBuffer);
            res.writeHead(statusCode, { "Content-Type": "image/png" });
            // send the data
            console.log(imageFile)
            res.end(imageFile);
        } catch (err) {
            // send the error
            res.end(JSON.stringify({ error: true, message: err }));
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
            const imageBuffer =  convertUrlToFile(url);

            // send the data
            res.send(imageBuffer);
        } catch (err) {
            // set the status code and content-type
            res.writeHead(500, { "Content-Type": "application/json" });
            // send the error
            res.end(JSON.stringify({ error: true, message: err }));
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