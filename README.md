# CBSE 12th Analytics

The project includes a web scraper which can be used to fetch data in JSON format readable by the app given the roll no. range, school no. and centre no.

## Installation
```sh
$ git clone https://github.com/thelehhman/CBSE12thAnalytics
$ npm install
```
## Usage

```sh
$ ./cli <start roll> <end roll> <school no> <centre no>
```
This generates data.json and analytics.json out of which only analytics.json is required by the web page.
A local server can be set up to display the data

```sh
$ python -m SimpleHTTPServer
```

Navigate to http://localhost:8000 and voila!
