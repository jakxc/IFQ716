import * as http from "http";
import fs from "fs";

const data = [
    "Siamese",
    "Persian",
    "Maine Coon",
    "Bengal",
    "Scottish Fold",
    "British Shorthair",
    "Sphynx",
    "Abyssinian",
    "American Shorthair",
    "Russian Blue",
    "Ragdoll",
    "Devon Rex",
    "Birman",
    "Siberian",
    "Manx",
    "Exotic Shorthair",
    "Burmese",
    "Tonkinese",
    "Savannah",
    "Himalayan",
    "Egyptian Mau"
];

function routing(req, res) {
    const url = req.url;
    const method = req.method;
    if (url.startsWith("/data")) {
        if (method == "GET") {
            // The form page
            res.writeHead(200, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              });
            res.write(JSON.stringify(data));
            res.end();
        }
    } else if (url.startsWith("/login")) {
        if (method == "POST") {
            // The add page
            res.write("Login");
            res.end();
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

http.createServer(routing).listen(3000, function () {
    console.log("server start at port 3000"); //the server object listens on port
});