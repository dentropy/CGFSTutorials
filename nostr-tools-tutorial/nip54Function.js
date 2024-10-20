function convertString(str) {
    return str.toLowerCase().replace(/[^a-z]/g, '-');
}

let test = convertString("Hello123 ?I_was_-here")

console.log(test)