import http from "http";
import { readFile, writeFile } from "fs";
const path = "guests.json";

async function displayGuestsData(req, res) {
  try {
    const response = await fetch(path);
    const data = await response.json();
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(JSON.parse(data)));
    res.end();
  } catch (e) {
      console.log(e.message);
      res.end();
  }
}

async function routing(req, res) {
 const url = req.url;
 if (url.startsWith("/form")) {
   // The form page
    res.writeHead(200, { "Content-Type": "text/html" }); // http header
    res.write(`
    <form action=/add method="post">
      <div>
        <label for="firstName">First Name</label>
        <input id="firstName" name="firstName">
        <label for="lastName">Last Name</label>
        <input id="lastName" name="lastName">
      </div><br>
      <div>
        <label>Please select a gender</label><br>
        <label for="male">Male</label>
        <input type="radio" id="male" name="gender" value="male">
        <label for="female">Female</label>
        <input type="radio" id="female" name="gender" value="female"><br>
      </div><br>
      <div>
        <label for="comments">Leave a comment!</label><br>
        <textarea id="comments" name="comments" rows="4" cols="50"></textarea>
      </div>
      <input type="submit">
    </form>
    `);
    res.end();
 } else if (url.startsWith("/add")) {
   // The add page
   let body = '';
   req.on('data', (chunk) => {
       body += chunk;
   });

   readFile(path, function (err, data) {
     if (err) {
       res.write(`<pre>Error: ${err.message}</pre>`);
       res.end();
       return;
     }

     // Try to read from the guestbook. If it fails, set the guest book to empty
     let guestBook = [];
     try {
       guestBook = JSON.parse(data);
     } catch (e) {
      console.log(e.message);
      guestBook = [];
     }

     const [firstName, lastName, gender, comments] = body.split('&').map(el => el.split("=")[1]); // Get the part of the url after the first "?"
     guestBook.push({ 
      firstName: firstName, 
      lastName: lastName,
      gender: gender,
      comments: comments
    }); // Get the name param and add it to the guestbook

     // Write the updated guestbook to the filesystem
     writeFile(path, JSON.stringify(guestBook), (err) => {
       if (err) {
         res.write(`<pre>Error: ${err.message}</pre>`);
         res.end();
         return;
       }
      res.write(`<pre>Successfully added guest <b>${firstName}${lastName.length > 0 ? " " + lastName : ""}</b> to guest book!<pre>`); 
       res.end();
     });
   });
  } else if (url.startsWith("/read")) {
    let guestBook = await displayGuestsData(req, res);
    console.log(guestBook);
    res.end();
  } else {
    // No page matched the url
    res.write("No matching page");
    res.end();
  }
}
//create a server object:
http.createServer(routing).listen(3000, function () {
 console.log("server start at port 3000"); //the server object listens on port 3000
});

