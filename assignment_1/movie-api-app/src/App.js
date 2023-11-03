import { useState } from "react";
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    endpoint: "",
    title: "",
    id: "",
    page: 1,
    file: ""
  })

  const [content, setContent] = useState("");

  const handleChange = (e) => {
    e.preventDefault();
    const { name, value, type, files } = e.target;

    setFormData(prev => {
      return {
        ...prev,
        [name]: type === "file" ? files[0] : value
      }
    })
    console.log(formData);
  }

  const makeAPICall = (e) => {
    e.preventDefault();
    let apiUrl = "";
    let method = "GET";
    let contentType = "application/json"
    let endpoint = formData.endpoint;

    switch(true) {
      case (endpoint.startsWith("/movies/search")):
        apiUrl = `http://localhost:3000/movies/search?title=${formData.title}&page=${formData.page}`;
        break;
      case (endpoint.startsWith("/movies/data")):
        apiUrl = `http://localhost:3000/movies/search?id=${formData.id}`;
        break;
      case (endpoint.startsWith("/posters")):
        apiUrl = `http://localhost:3000/posters/${formData.id}`;
        contentType = "image/png"
        break;
      case (endpoint.startsWith("/posters/add")):
        apiUrl = `http://localhost:3000/posters/add/${formData.id}`;
        method = "POST";
        break;
      default: 
        console.log("Endpoint is not applicable");
        break;
    }

    if (method === "GET") {
      console.log(apiUrl);
      fetch(apiUrl, {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        headers: {
          "Content-Type": contentType,
       }
      })
      .then(res => res.json())
      .then(data => {
        console.log("data: " + data);
        setContent(data);
      })
    } else if (method === "POST") {
      fetch(apiUrl, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        headers: {
          "Content-Type": "application/json",
        },
        body: formData.file,
      })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        setContent(data);
      });
    }
  }

  return (
    <div className="App">
      <form onSubmit={makeAPICall}>
        <div>
          <select name="endpoint" onChange={handleChange}>
            <option value="/movies/search/:title">/movies/search/:title</option>
            <option value="/movies/data/:id">/movies/data/:id</option>
            <option value="/posters/:id">/posters/:id</option>
            <option value="/posters/add/:id">/posters/:id</option>
          </select>
        </div>
        <div>
          <label>Movie title</label>
          <input 
            type="text"  
            name="title"
            value={formData.title} 
            onChange={handleChange} 
          />
        </div>
        <div>
          <label>Movie id</label>
          <input 
            type="text"  
            name="id"
            value={formData.id} 
            onChange={handleChange} 
          />
        </div>
        <div>
          <label>Current page</label>
          <input 
            type="number"  
            name="page"
            value={formData.page} 
            onChange={handleChange} 
          />
        </div>
        <div>
          <label>Upload Poster</label>
          <input 
            type="file"  
            name="file"
            value={formData.file} 
            onChange={handleChange} 
          />
        </div>
        <button onClick={makeAPICall}>Submit</button>
      </form>
      <div>{content}</div>
    </div>
  );
}

export default App;
