import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8081/api',
});

// We need a way to set the token. 
// Since axios logic is outside React components, we can intercept requests 
// and get the token if we store it, OR we ask the component to pass the header.
// A common pattern with Clerk is to use `useAuth` hook to get the token 
// and pass it in the request config. 
// But an interceptor is cleaner if we can access the session.
// For simplicity in React, we'll expose a helper or just set the header before calls in the services.

// Start with a clean instance.
export default api;
