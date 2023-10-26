import * as dotenv from 'dotenv'
dotenv.config();

const IMDB_API_KEY = process.env.IMDB_API_KEY;
const IMDB_URL = "http://www.omdbapi.com";

const RAPID_API_KEY = process.env.RAPID_API_KEY;
const RAPID_URL = "https://streaming-availability.p.rapidapi.com"

export const getRatingsByTitle = async (title) => {
    try {
        const res = await fetch(`${IMDB_URL}/?apikey=${IMDB_API_KEY}&t=${title}`);
        const data = await res.json();
        console.log(data);
        if (data["Error"]) return data;
        return { id: data["imdbID"] || "", title: data["Title"] || "", ratings: data["Ratings"] || [] };
    } catch (err) {
        console.log(err);
        return err;
    }
}

export const getRatingsById = async (id) => {
    try {
        const res = await fetch(`${IMDB_URL}/?apikey=${IMDB_API_KEY}&i=${id}`);
        const data = await res.json();
        if (data["Error"]) return data;
        return { id: data["imdbID"] || "", title: data["Title"] || "", ratings: data["Ratings"] || [] };
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
        return { id: data["imdbId"] || "", title: data["title"] || "", streamingInfo: data["result"] ? data["result"]["streamingInfo"] || {} : {} };
    } catch (err) {
        console.error(err);
        return err;
    }
}

export const combineMovieData = (ratingsData, streamingData) => {
    let obj = Object.assign({}, ratingsData);

    if (ratingsData["Error"]) return ratingsData;
    return {...obj, streamingInfo: streamingData["streamingInfo"] || {} };
}

export const getPosterById = async (id) => {
    try {
        const res = await fetch(`${IMDB_URL}/?apikey=${IMDB_API_KEY}&i=${id}`);
        const data = await res.json();
        if (data["Error"]) return data;
        return { poster: data["Poster"] || "" };
    } catch (err) {
        console.log(err);
        return err;
    }
}