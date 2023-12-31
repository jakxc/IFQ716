import { writeFile, readFile, readFileSync } from 'fs';
import * as http from 'http';

const path = "./guests.json";


async function displayGuestsData(req, res) {
  try {
    res.writeHead(200, { "Content-Type": "application/json" }); // 
    const response = readFileSync(path, (err, data) => {
      if (err) {
        console.log(err);
      } 
    });
    const data = JSON.parse(response);
    for (const guest of data) {
      res.write(`First Name: ${guest.firstName} Last Name: ${guest.lastName} Age: ${guest.age} Gender: ${guest.gender} Comments: ${guest.comments}\n\n`)
    }
    res.end();
  } catch (e) {
      console.log(e.message);
      res.end(`${e.message}`);
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
        <label for="age">Age</label>
        <input type="number" id="age" name="age">
      </div><br>
      <div>
        <label>Please select a gender:</label><br>
        <label for="male">Male</label>
        <input type="radio" id="male" name="gender" value="male">
        <label for="female">Female</label>
        <input type="radio" id="female" name="gender" value="female"><br>
      </div><br>
      <div>
        <label for="comments">Leave a comment:</label><br>
        <textarea id="comments" name="comments" rows="4" cols="50"></textarea>
      </div>
      <input type="submit">
    </form>
    `);
    res.end();
 } else if (url.startsWith("/add")) {
  readFile(path, function (err, data) {
    if (err) {
        console.log(`{err.message}`)
        res.end();
        return;
    }

    // Try to read from the guestbook. If it fails, set the guest book to empty.
    let guestBook = [];
    try {
        guestBook = JSON.parse(data);
    } catch (e) {}


    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
    });
    req.on('end', () => {
        res.write('OK');
        res.end();

        // Get the name from the data
        const formData = new URLSearchParams(body);
        const firstName = formData.get("firstName");
        const lastName = formData.get("lastName");
        const age = formData.get("age");
        const gender = formData.get("gender");
        const comments = formData.get("comments");
        
        // Add the name to the guestbook
        guestBook.push( {firstName: firstName, lastName: lastName, age: age, gender: gender, comments: comments });
        
        // Write the updated guestbook to the filesystem
        writeFile(path, JSON.stringify(guestBook), (err) => {
            if (err) {
                res.end(JSON.stringify({error: 'Failed to write to guestbook.'}));
                return;
            }
            res.write("Successfully updated the guestbook");
            res.end();
        });
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

