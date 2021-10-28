# momonga

Momonga counts likes, and downloaded papers, and posters.
This project is build for [Google Firebase](https://firebase.google.com).

# REST API

## Endpoints

### `GET /api/likes`

Returns the list of the key and like count pair.

#### Requests

##### Query Params

* `dates`
    * If `true`, the result contains the date list.

##### Request Body

no request body.

#### Response

Respond the list of key, count and their registered dates. the registered dates are respond when `dates=true` query param are specified.

* **Content-Type**: application/json

##### no `dates` query param

```json
[
  {
    "key": "2021ses_higuchi",
    "count": 10
  }, ...
]
```

##### with `dates=true` query param

```json
[
  {
    "key": "2021ses_higuchi",
    "count": 10,
    "dates": [
      { "date": "2014-10-10T13:50:40+09:00" },
      ... 
    ]
  }, ...
]
```

`dates` has as many entries as in the `count` entry.

### `GET /api/likes/:key`

Returns an item contains the key, like count, and registered dates.

#### Requests

no request body.

#### Response

The respond json is the same as the response of in `/api/likes` with `dates=true` query param.

* **Content-Type**: application/json

```json
{
  "key": "2021ses_higuchi",
  "count": 10,
  "dates": [
    { "date": "2020-10-10T13:50:40+09:00" },
    ... 
  ]
}
```

### `POST /api/likes/:key`

Register like to the key.

#### Requests

no request body.

#### Response

The response contains the success flag, key and its count.

```json
{
  "process": "success",
  "key": "2021ses_higuchi",
  "count": 11
}
```

### `GET /api/downloads/papers/:key`

Returns the url of the specified paper for downloading and increments the download count.

#### Requests

no request body.

#### Response

* **Content-Type**: application/pdf

### `GET /api/downloads/posters/:key`

Returns the url of the specified poster for downloading and increments the download count.

#### Requests

no request body.

#### Response

* **Content-Type**: application/json

### `GET /api/downloadcount/:type`

Returns the list of the key and download count pair.

#### Requests

##### Query Params

* `all`
    * If `true`, the result contains the list of dates, and ip addresses.

##### Type

Available values are as follows.

* `paper`
* `posters`
* `presentations`

#### Response

The count of the entries of `dates` and `addresses` is the same as the value of `count`.

```json
[
  {
    "key": "2021ses_higuchi",
    "count": 4,
    "dates": [
      { "date": "2020-10-10T13:50:40+09:00" },
      ...
    ],
    "addresses": [
      "133.101....",
      ...
    ]
  }
]
```




### `GET /api/downloadcount/:type/:key`

#### Requests

no request body.

#### Response

Get the specified one entry of `/api/downloadcount/:type` with query param `all=true`.

