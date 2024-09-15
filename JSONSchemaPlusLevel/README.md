# JSON Schema Plus LevelDB

## Description

* Here we just want to extend LevelDB to only insert data in when it matches a JSONSChema
* This library works like S3 where you always need to input the bucket name(sublevel), as well as the key of the file you want
* Recursive sublevel's are not supposed, just create a new namespace. This is because each namespace contains metadata sublevels
* TODO Iterator code still need to be written

## Tutorial

``` bash
git clone ssh://git@git.newatlantis.top:222/dentropy/CGFSTutorials.git
cd CGFSTutorials
cd JSONSchemaPlusLevel
npm i

rm -rf db && node test.js

rm -rf db && node testExtended.js

```