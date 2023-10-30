import * as dotenv from 'dotenv';
import { writeFile, readFile, existsSync } from 'fs';

dotenv.config();

const IMDB_API_KEY = process.env.IMDBAPI_KEY;
const IMDB_URL = "http://www.omdbapi.com";

const RAPID_API_KEY = process.env.RAPIDAPI_KEY;
const RAPID_URL = "https://streaming-availability.p.rapidapi.com"

export const getMovieByTitle = async (title, currentPage = 1) => {
    try {
        const res = await fetch(`${IMDB_URL}/?apikey=${IMDB_API_KEY}&s=${title}&page=${currentPage}`);
        const data = await res.json();
        console.log(data);
        return { ...data, currentPage: currentPage };
    } catch (err) {
        console.log(err);
        return err;
    }
}

export const getMovieById = async (id) => {
    try {
        const res = await fetch(`${IMDB_URL}/?apikey=${IMDB_API_KEY}&i=${id}`);
        const data = await res.json();
        return data;
    } catch (err) {
        console.log(err);
        return err;
    }
}

export const getStreamingById =  async (id) => {
    const url = `${RAPID_URL}/get?output_language=en&imdb_id=${id}`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': `${RAPID_API_KEY}`,
            'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
        }
    };

    try {
        const res = await fetch(url, options);
        const data = await res.json();
        console.log(data);
        return data;
    } catch (err) {
        console.error(err);
        return err;
    }
}

export const combineMovieData = (movieData, streamingData) => {
    if (movieData["Error"] || streamingData["message"]) return { error: true, message: movieData["Error"] || streamingData["message"] };
    return { 
        details: movieData || {}, 
        streamingInfo: streamingData["result"] 
        ? streamingData["result"]["streamingInfo"] ? streamingData["result"]["streamingInfo"] : {} 
        : {} };
}

export const getMovieId = (movie) => {
    if (!movie["imdbID"]) {
       console.log("No imbd ID found.");
       return null;
    } 

    return movie["imdbID"]
}

export const getMoviePoster = (movie) => {
    if (!movie["Poster"]) {
        console.log("No movie poster found.")
        return null;
    } 
    
    return movie["Poster"] ;
}

export const imageUrlToBuffer =  async (url) => {
    try {
        const res = await fetch(url);
        const blob = await res.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);
        return imageBuffer;
    } catch (err) {
        console.log(err);
        return err;
    }
}

export const readFromFile = (path) => {
    readFile(path, (err, data) => {
        if (err) {
            console.log(err);
            return { error: true, message: err["message"] }
        };

        return data; 
    });
}

export const writeToFile = (path, data) => {
    if (existsSync(path)) {
        return { error: true, message: "This data file already exists!" };
    } else {
        // Write the data to the filesystem
        writeFile(path, data, (err) => {
            if (err) {
                console.log(err)
                return { error: true, message: err["message"] };
            }
            
            return readFromFile(path);
        });
    }
}


