import * as http from "http";
import { readFile, writeFileSync, existsSync } from "fs";
import { fileTypeFromBuffer } from "file-type";
import { 
    getMovieById, 
    getMovieByTitle, 
    getStreamingById, 
    combineMovieData,
    getMoviePoster,
    convertUrlToBuffer,
 } from "./utils.js"

const PORT = process.env.PORT || 3000;

const routing =  async (req, res) => {
    const url = req.url;
    const method = req.method;

    if ((url.match(/\/movies\/search\?([a-zA-Z0-9])/) || url.startsWith("/movies/search")) && method.toLowerCase() === "get") { 
        res.setHeader("Access-Control-Allow-Origin", "*");   
        res.setHeader("Content-Type", "application/json"); 
       
        try {
            const params = new URLSearchParams(req.url.split("?")[1]);
            const title = params.get("title")
            const page = params.get("page") || 1;
            const movies = await getMovieByTitle(title, page);
           
            switch (true) {
                case (!title || title.length === 0):
                    res.writeHead(400);
                    res.write(JSON.stringify({ error: true, message: "You must supply a title!" }));
                    res.end();
                    break;
                case (!parseInt(page) ): 
                    res.writeHead(400);
                    res.write(JSON.stringify({ error: true, message: "You must supply a valid page number!" }));
                    res.end();
                    break;
                case (!movies["totalResults"]):
                    res.writeHead(404);
                    res.write(JSON.stringify({ message: `${movies["Error"]}` }));
                    res.end();
                    break;
                default:
                    res.writeHead(200);
                    res.write(JSON.stringify(movies));
                    res.end();
                    break;
            }

        } catch (err) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: true, message: err["message"] || "Unknown error occured!" }));
        }
    } else if ((url.match(/\/movies\/data\?([a-zA-Z0-9])/) || url.startsWith("/movies/data")) && method.toLowerCase() === "get") {
        res.setHeader("Access-Control-Allow-Origin", "*");   
        res.setHeader("Content-Type", "application/json");

        try {
            // get id from url
            const params = new URLSearchParams(req.url.split("?")[1]);
            const id = params.get("id");
            const country = params.get("country");
            const movie = await getMovieById(id);
            const streaming = await getStreamingById(id);
            const combinedData = combineMovieData(movie, streaming);

            switch (true) {
                case (!id || id.length === 0):
                    res.writeHead(400);
                    res.write(JSON.stringify({ error: true, message: "You must supply an imdbID!" }));
                    res.end();
                    break;
                case (movie["Response"] === "False"):
                    res.writeHead(404);
                    res.write(JSON.stringify({ message: movie["Error"] }));
                    res.end();
                    break;
                default:
                    const filteredStreamingData = { 
                        ...combinedData, 
                         streamingInfo: country ? { [country]: combinedData["streamingInfo"][country] } : combinedData["streamingInfo"]}
                    res.writeHead(200);
                    res.write(JSON.stringify(filteredStreamingData));
                    res.end();
                    break;
            }
        } catch (err) {
            // send the error
            res.writeHead(500);
            res.end(JSON.stringify({ error: true, message: err["message"] || "Unknown error occured!" }));
        }
    } else if ((url.match(/\/posters\/([a-zA-Z0-9])/) || url.startsWith("/posters/")) && method.toLowerCase() === "get") {    
        res.setHeader("Access-Control-Allow-Origin", "*");   

        try {
            const id = req.url.split("/")[2];
            const movie = await getMovieById(id);
            const posterUrl = getMoviePoster(movie);
            const filePath = `./posters/${id}.png`;

            switch (true) {
                case (!id || id.length === 0):
                    res.setHeader("Content-Type", "application/json");
                    res.writeHead(400);
                    res.write(JSON.stringify({ error: true, message: "You must supply an imdbID!" }));
                    res.end();
                    break;
                case (movie["Response"] === "False"):
                    res.setHeader("Content-Type", "application/json"); 
                    res.writeHead(404);
                    res.write(JSON.stringify({ message: movie["Error"] }));
                    res.end();
                    break;
                case (!existsSync(filePath) && !posterUrl):
                    res.setHeader("Content-Type", "application/json");
                    res.writeHead(404);
                    res.write(JSON.stringify({ message: "Poster not found!" }));
                    res.end();
                    break;
                case (existsSync(filePath)): 
                    readFile(filePath, "binary", (err, data) => {
                        if (err) {
                            console.log(err);
                            throw err;
                        };

                        res.setHeader("Content-Type", "image/png");
                        res.writeHead(200);
                        res.write(data, "binary");
                        res.end();
                    });
                    break;
                default:
                    const buffer = await convertUrlToBuffer(posterUrl);   
                    const fileType = await fileTypeFromBuffer(buffer);
                    const imgExtRegex = new RegExp(/(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$/);

                    if (!imgExtRegex.test(fileType["ext"])) {
                        res.setHeader("Content-Type", "application/json");
                        res.writeHead(400);
                        res.write(JSON.stringify({ error: true, message: "Incorrect file type!" }));
                        res.end();
                    } else {
                        writeFileSync(filePath, buffer, (err) => {
                            if (err) {
                                console.log(err)
                                throw err;
                            }
                            
                            console.log("Data written successfully to file path.");
                        });

                        readFile(filePath, "binary", (err, data) => {
                            if (err) {
                                throw err;
                            };

                            res.setHeader("Content-Type", "image/png");
                            res.writeHead(200);
                            res.write(data, "binary");
                            res.end();
                        });
                    }
                    break;
            }
        } catch (err) {
            res.setHeader("Content-Type", "application/json");
            res.writeHead(500);
            res.end(JSON.stringify({ error: true, message: err["message"] || "Unknown error occured!" }));
        }
    } else if ((url.match(/\/posters\/add\/([a-zA-Z0-9])/) || url.startsWith("/posters/add")) && method.toLowerCase() === "post") {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader("Content-Type", "application/json");

        let body = [];
        req.on("data", (chunk) => {
            body.push(chunk);
        });
        req.on("end", async () => {
            const id = req.url.split("/")[3];
            const movie = await getMovieById(id);
            const buffer = Buffer.concat(body);
            const filePath = `./posters/${id}.png`;
            const fileType = await fileTypeFromBuffer(buffer);
            const imgExtRegex = new RegExp(/(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$/);

            try {
                switch (true) {
                    case (!id || id.length === 0):
                        res.writeHead(400);
                        res.write(JSON.stringify({ error: true, message: "You must supply an imdbID!" }));
                        res.end();
                        break;
                    case (movie["Response"] === "False"):
                        res.writeHead(404);
                        res.write(JSON.stringify({ message: movie["Error"] }));
                        res.end();
                        break;
                    case (!body || body.length === 0):
                        res.writeHead(400);
                        res.write(JSON.stringify({ error: true, message: "You must supply an image file!" }));
                        res.end();
                        break;
                    case (!imgExtRegex.test(fileType["ext"])):
                        res.writeHead(400);
                        res.write(JSON.stringify({ error: true, message: "Incorrect file type!" }));
                        res.end();
                        break;
                    case (existsSync(filePath)):
                        res.writeHead(400);
                        res.write(JSON.stringify({
                            "error": true,
                            "message": "Poster for this movie already exists!"
                        }));
                        res.end();  
                        break;
                    default: 
                        writeFileSync(filePath, buffer, (err) => {
                            if (err) {
                                console.log(err)
                                throw err;
                            }
                            
                            console.log("Data written successfully to file path.");         
                        });

                        res.writeHead(201);
                        res.write(JSON.stringify({
                            "error": false,
                            "message": "Poster Uploaded Successfully!"
                        }));
                        res.end();  
                        break;
                }
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: true, message: err["message"] || "Unknown error occured!" }));
            }
        })
    } else {
        // No page matched the url
        res.writeHead(404);
        res.write("No matching page");
        res.end();
    }
}

const server = http.createServer(routing);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})