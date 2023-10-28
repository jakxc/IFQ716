import * as dotenv from 'dotenv';

dotenv.config();

const IMDB_API_KEY = process.env.IMDBAPI_KEY;
const IMDB_URL = "http://www.omdbapi.com";

const RAPID_API_KEY = process.env.RAPIDAPI_KEY;
const RAPID_URL = "https://streaming-availability.p.rapidapi.com"

export const getMovieByTitle = async (title) => {
    try {
        const res = await fetch(`${IMDB_URL}/?apikey=${IMDB_API_KEY}&s=${title}`);
        const data = await res.json();
        console.log(data);
        return data;
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
    if (movieData["Error"]) return movieData;
    return { details: movieData || {}, streamingInfo: streamingData["result"] 
    ? streamingData["result"]["streamingInfo"] ? streamingData["result"]["streamingInfo"] : {} 
    : {} };
}

export const getMovieId = (movie) => {
    return movie["imdbID"] ? movie["imdbID"] : "";
}

export const getMoviePoster = (movie) => {
    return movie["Poster"] ? movie["Poster"] : "";
}

export const imageUrlToBase64 =  async (url) => {
    try {
        const res = await fetch(url);
        const blob = await res.arrayBuffer();
        const base64String = `data:image/png;base64,${Buffer.from(
            blob,
        ).toString('base64')}`;
        return base64String;
    } catch (err) {
        console.log(err);
    }
}
