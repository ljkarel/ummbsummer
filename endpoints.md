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


### /activities
Gets all the activities for the logged in user.


### /sections
Gets a list of all sections and their members

### /sections/scores
Gets the point totals for each section. Can specify a week via query parameter, otherwise return scores for all weeks.

### /sections/<section_name>/scores

### /members/<member_id>
GET: Gets the member information for the given member

### /members/<member_id>/preferences
PUT: Updates the user's preferences
