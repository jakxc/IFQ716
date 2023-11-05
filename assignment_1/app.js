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

    if ((url.match(/\/movies\/search\?([a-zA-Z0-9])/) || url.startsWith("/movies/search")) && method === 'GET') { 
        res.setHeader("Access-Control-Allow-Origin", "*");   
       
        try {
            // get title from params
            const params = new URLSearchParams(req.url.split("?")[1]);
            const title = params.get("title")
            // get page from url
            const page = params.get("page") || 1;
            // get movie
            const movies = await getMovieByTitle(title, page);
           
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
    } else if ((url.match(/\/movies\/data\?([a-zA-Z0-9])/) || url.startsWith("/movies/data")) && method === 'GET') {
        res.setHeader("Access-Control-Allow-Origin", "*");   

        try {
            // get id from url
            const params = new URLSearchParams(req.url.split("?")[1]);
            const id = params.get("id");
            const movie = await getMovieById(id);
            const streaming = await getStreamingById(id);
            const combinedData = combineMovieData(movie, streaming);

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
        res.setHeader("Access-Control-Allow-Origin", "*");   

        try {
            const id = req.url.split("/")[2];
            const movie = await getMovieById(id);
            const posterUrl = getMoviePoster(movie);
            const buffer = await convertUrlToBuffer(posterUrl);   
            const filePath = `./posters/${id}.png`;
            const fileType = await fileTypeFromBuffer(buffer);
            console.log(fileType)
            const imgExtRegex = new RegExp(/(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$/);

            switch (true) {
                case (!id || id.length === 0):
                    res.statusCode = 400;
                    res.setHeader("Content-Type", "application/json");
                    res.write(JSON.stringify({ error: true, message: "You must supply an imdbID!" }));
                    res.end();
                    break;
                case (!imgExtRegex.test(fileType["ext"])):
                    res.statusCode = 400;
                    res.setHeader("Content-Type", "application/json");
                    res.write(JSON.stringify({ error: true, message: "Incorrect file type!" }));
                    res.end();
                    break;
                case (existsSync(filePath)): 
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
                    break;
                default:
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

                        res.statusCode = 200;
                        res.setHeader("Content-Type", "image/png");
                        res.write(data, "binary");
                        res.end();
                    });
                    break;
            }
        } catch (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: true, message: err["message"] }));
        }
    } else if ((url.match(/\/posters\/add\/([a-zA-Z0-9])/) || url.startsWith("/posters/add")) && method === "POST") {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS']);
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Access-Control-Allow-Credentials', true);

        let body = [];
        req.on("data", (chunk) => {
            body.push(chunk);
        });
        req.on("end", async () => {
            const id = req.url.split("/")[3];
            const buffer = Buffer.concat(body);
            const filePath = `./posters/${id}.png`;
            const fileType = await fileTypeFromBuffer(buffer);
            const imgExtRegex = new RegExp(/(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$/);

            try {
                switch (true) {
                    case (!id || id.length === 0):
                        res.statusCode = 400;
                        res.setHeader("Content-Type", "application/json");
                        res.write(JSON.stringify({ error: true, message: "You must supply an imdbID!" }));
                        res.end();
                        break;
                    case (!body || body.length === 0):
                        res.statusCode = 400;
                        res.setHeader("Content-Type", "application/json");  
                        res.write(JSON.stringify({ error: true, message: "You must supply an image file!" }));
                        res.end();
                        break;
                    case (!imgExtRegex.test(fileType["ext"])):
                        res.statusCode = 400;
                        res.setHeader("Content-Type", "application/json");  
                        res.write(JSON.stringify({ error: true, message: "Incorrect file type!" }));
                        res.end();
                        break;
                    case (existsSync(filePath)):
                        res.statusCode = 400;
                        res.setHeader("Content-Type", "application/json");
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
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.write(JSON.stringify({
                            "error": false,
                            "message": "Poster Uploaded Successfully!"
                        }));
                        res.end();  
                        break;
                }
            } catch (err) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
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