# momonga

Momonga counts likes, and downloaded papers, and posters.
This project is build for [Google Firebase](https://firebase.google.com).

# REST API

## Endpoints

### `GET /api/likes`

Returns the list of the key and like count pair.

#### Query Params

* `dates`
    * If `true`, the result contains the date list.

### `GET /api/likes/:key`

Returns an item contains the key, like count, and registered dates.

### `POST /api/likes/:key`

Register like to the key.

### `GET /api/downloads/papers/:path`

Returns the url of the specified paper for downloading and increments the download count.

### `GET /api/downloads/posters/:path`

Returns the url of the specified poster for downloading and increments the download count.

### `GET /api/downloadcount/:type`

Returns the list of the key and download count pair.

#### Query Params

* `all`
    * If `true`, the result contains the list of dates, and ip addresses.


### `GET /api/downloadcount/papers/:path`

### `GET /api/downloadcount/posters/:path`

