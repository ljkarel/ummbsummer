## Frontend Endpoints

### /
Home page; has graphs and statistics

### /login
Login page; landing point for website when users are not logged in. Includes button to sign in with Google. Users are redirected back to this page when they have a login error. After successfully signing in with Google, users will be redirected to the home page if they've already registered, otherwise the registration page if they've not registered yet.

### /register
Strava authentication page; landing point for website when users are logged in but not registered.

### /activities
Member activity page; displays all activities logged by the app for the given member.

### /profile

### /settings

### /gallery

### /about

### /rules

### /privacy


## Backend Endpoints
All backend endpoints are prepended with /api

### /admin


### /auth

### /auth/login

### /auth/callback

### /auth/logout


### /strava/login

### /strava/callback


### /members/
GET: Gets registration information for all sections and members.

### /members/me/
GET: Gets all information for the logged in member.

### /members/me/preferences/
GET: Gets preferences for the logged in member.
PUT: Updates preferences for the logged in member.

### /activities
GET: Gets all activities for the logged in member.

### /metrics/me/?week=<week_number>
GET: Gets the weekly points for the logged in member. Optionally specify a single week to return.

### /metrics/sections/<slug:section_slug>/?week=<week_number>
GET: Get the weekly section score for section with <section_name>. Optionally specify a single week to return.

### /metrics/scoreboard/?week=<week_number>
GET: Get all section scores. Optionally specify a single week to return.
