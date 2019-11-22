# Pulp Developer Guidelines

This documentation describes the api endpoints in `routes/api.js`. It should describe what the endpoint does, parameters it takes, and the message or json object returned to the server. 

## User API endpoints

## Place API endpoints
### create_place
- Description: create a new place as specified in the request's body. This is only called once when someone check in for the first time.
- Parameters: takes in the information as specified in the Place schema in the request's body
- Return values:
    - Upon success, it prints "New place <place_id> has been created" to the server.
    - Upon failure, it sends a 500 (server error) responses along with an error message.

### get_place
- Description: returns the details of a place with weighted ratings. Currently, the rating is calculated by giving a 1.5x weight for ratings from user's Facebook friends and 1x weight for general ratings.
- Parameters: takes in the place_id and an array of ids of a user's Facebook friends in the request's body.
- Return values: returns the Place object in json to the server if place_id is found and null otherwise.

### search_place_if_exists
- Description: check if a place exists in the database.
- Parameters: takes in a place name and an array of ids of a user's Facebook friends in the request's body.
- Return values: returns the Place object in json to the server if place with same name is found and null otherwise.

## Review API endpoints