import axios from 'axios';

export const BASE_URL = 'https://ummbsummer.com'

export const api = axios.create({
    baseURL: `${BASE_URL}/api/`,
});

