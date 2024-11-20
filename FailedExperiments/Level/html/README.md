## browser-level example for static HTML page

**How to build [browser-level]() into single file javascript package that can be loaded using the \<script\> tag**

``` bash

npm install -g browserify

browserify index.js -s PackagedBrowserLevel > PackagedBrowserLevel.js

```

**Running the application**

``` bash

python -m http.server

```

Then go to [http://localhost:8000](http://localhost:8000)


## Using browser-level

**Using the browser's console**

``` javascript

await db.put('paul', { was : "here"})

var myValue = await db.get('paul')

console.log(myValue)

```

**In a new tab**

``` javascript

var myValue = await db.get('paul')

console.log(myValue)

```
