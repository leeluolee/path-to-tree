// build the route via pattern

const { extend  } = require('./util');


// path 

const DEFAULT_CAPTURE_PATTERN = '\\w+'
const ignoredRef = /\((\?\!|\?\:|\?\=)/g;

function Tokenizer(input, option) {

    this.index = 0;
    this.input = input;
    this.length = input.length;
    this.delimiter = option.delimiter || '/';
    this.option = option;
    this.tokens = [];
}

const to = Tokenizer.prototype;


to.tokenize = function() {
    const {length, delimiter, input} = this;
    const tokenStream = [{pattern: false, tokens: []}];

    let tokenObj = tokenStream[0];
    let preIndex;

    if(input[0] === delimiter) this.index = 1;
    let preSlashIndex = this.index;

    // index Or 
    while ( (char = input[this.index]) && this.index < length ) {

        if (this.index === preIndex) throw Error('Circular tokenize')

        preIndex = this.index;
        switch ( char ) {
            case ':':
                tokenObj.tokens.push( this.readNamedCapture() );
                tokenObj.pattern = true;
                break;
            case '(':
                tokenObj.tokens.push( this.readCapture() );
                tokenObj.pattern = true;
                break;
            case delimiter:
                if( tokenObj.pattern ){
                    tokenObj.raw = input.substring( preSlashIndex, this.index )
                }
                this.index++;
                tokenObj = { pattern:false, tokens: [] } ;
                tokenStream.push(tokenObj);
                preSlashIndex = this.index;

                break;
            default:
                tokenObj.tokens.push(this.readAnyOther());

        }
    }
    if( tokenObj.pattern ){
        tokenObj.raw = input.substring( preSlashIndex, this.index )
    }
    return tokenStream;
}



to.char = function(offset) {
    return this.input[this.index + (offset || 0)];
}

to.readNamedCapture = function() {

    this.index++;
    const word = this.readWord();

    let capture

    if( this.char() === '(' ) {

        capture = this.readCapture();

    }else{

        capture = {
            value: DEFAULT_CAPTURE_PATTERN,
            retain: 1
        }
    }
    capture.name = word.value;
    return capture
}

to.readCapture = function(){

    let subCaptrueOpen = subCaptrue = 0;
    this.match('(');
    let start = this.index;
    let char, input = this.input;

    while( char = input[ start ] ){

        if( input[ start - 1 ]  !== '\\' ){

            if( char === '(' ){

                subCaptrueOpen++ ;

            }else if( char === ')' ){

                if( subCaptrueOpen > 0 ){

                    subCaptrueOpen--;
                    subCaptrue++;

                }else{
                    break;
                }

            }
        }
        start++;

    }

    let value = this.input.substring( this.index, start );

    let ignored = 0
    if(subCaptrue){
        let ignoredRet = value.match( ignoredRef );

        if(ignoredRet) ignored = ignoredRet.length;
    }

    let token = {
        type: 'pattern',
        retain: subCaptrue - ignored + 1,
        value
    }


    this.index = start;

    this.match(')');

    return token;


}

to.match = function( char){

   if( !this.eat(char) ) throw Error('expect '+ char + ' got ' + this.char());

}

to.eat = function(char){
    if(this.char() === char){
        this.index++;
        return char
    }
    return false;
}

to.next = function(){
    this.index++;
}

to.readWord = function(){

    let end = this.index + 1;
    let input = this.input;

    while( isAlpha( input[end] ) ){

        end++;

    }

    if(end > this.index){
        let token = {
            type:'word',
            value: this.input.substring(this.index, end)
        }
        this.index = end;

        return token;
    }else{

        throw Error('readAlpha failed')
    }

}

to.readAnyOther = function() {
    const input = this.input;
    let end = this.index;


    let char = input[end];
    while (isAnyOther(char) && char !== this.delimiter) {

        if(char === '?' || char === '+' || char === '*'){
            throw Error('unsupport token ' + char)
        }

        char = input[++end]
    }

    if ( end > this.index) {

        let token = this.input.substring(this.index, end);
        this.index = end;
        return token;

    } else {
        throw Error('readAnyOther failed')
    }

}




function isAlpha( c ){
    return  (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z') ||
            (c >= '0' && c <= '9') ||
            c === '_';
}


function isAnyOther(char) {
    return char && char !== '(' && char !== ':'
}



module.exports = Tokenizer;








