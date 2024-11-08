function transformString(str) {
    return str.toLowerCase()
        .replace(/ /g, '_')
        .replace(/\d+/g, '-')
        .replace(/[^\w-]/g, '-');
}

let test_string = 'ETL to QE, Update 1, SQLite to Postgres'

function findIndiciesOfCharacter(input_string, character){
    var indices = [];
    for(var i=0; i<input_string.length;i++) {
        console.log("input_string[i]")
        console.log(input_string[i])
        if (input_string[i] === character) indices.push(i);
    }
    return indices
}

function fixIndicies(input_string, character){
    let tmpTransformedString = transformString(input_string)
    let tmpStringIndicies = findIndiciesOfCharacter(test_string, character)
    for(var position = 0; position < tmpStringIndicies.length; position++){
        tmpTransformedString = tmpTransformedString.slice(0, tmpStringIndicies[position]) + character + tmpTransformedString.slice(tmpStringIndicies[position] + 1);
    }
    return tmpTransformedString
}

console.log(transformString(test_string))
console.log(findIndiciesOfCharacter(test_string, ','))
console.log(fixIndicies(test_string, ','))