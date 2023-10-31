import * as dotenv from 'dotenv';
import { writeFileSync, existsSync } from 'fs';

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
        currentPage = parseInt(currentPage);
        return data["totalResults"] 
        ? { 
            ...data, 
            prev: currentPage <= 1 ? "N/A" : `${IMDB_URL}/?apikey=[yourkey]&s=${title}&page=${currentPage - 1}`, 
            next: currentPage >= Math.ceil(parseInt(data["totalResults"]) / 10) ? "N/A" : `${IMDB_URL}/?apikey=[yourkey]&s=${title}&page=${currentPage + 1}` }
        : data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export const getMovieById = async (id) => {
    try {
        const res = await fetch(`${IMDB_URL}/?apikey=${IMDB_API_KEY}&i=${id}`);
        const data = await res.json();
        return data;
    } catch (err) {
        console.log(err);
        throw err;
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
        throw err;
    }
}

export const combineMovieData = (movieData, streamingData) => {
    if (movieData["Error"]) throw Error(movieData["message"]);
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
        throw err;
    }
}

export const writeToFile = (path, data) => {
    // Write the data to the filesystem
    writeFileSync(path, data, (err) => {
        if (err) {
            console.log(err)
            throw err;
        }
        
        console.log("Data written successfully to file path.");
    });
}


