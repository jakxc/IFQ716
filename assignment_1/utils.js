import * as dotenv from 'dotenv'
dotenv.config();

const IMDB_API_KEY = process.env.IMDB_API_KEY;
const IMDB_URL = "http://www.omdbapi.com";


const RAPID_API_KEY = process.env.RAPID_API_KEY;
const RAPID_URL = "https://streaming-availability.p.rapidapi.com/countries"


export const getMovieByTitle = async (title) => {
    const res = await fetch(`${IMDB_URL}/?apikey=${IMDB_API_KEY}&t=${title}`);
    const data = await res.json();
    console.log(data);
    return data;
}

export const getMovieById = async (id) => {
    const res = await fetch(`${IMDB_URL}/?apikey=${IMDB_API_KEY}&i=${id}`);
    const data = await res.json();
    console.log(data);
    return data;
}

export const getStreamingByTitle = async(title) => {
    const url = `https://streaming-availability.p.rapidapi.com/search/title?title=${title}&country=us&show_type=all&output_language=en`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '43fbece10emshfeb5489d7b9d79bp1de3b7jsn247e7fc59f21',
            'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.text();
        console.log(result);
    } catch (error) {
        console.error(error);
    }
}