Array.prototype.inside = function (element) {
    if (this.indexOf(element) == -1) {
        return false;
    } else {
        return true;
    }
};

Array.prototype.map = function(fun) {
    var len = this.length;
    var res = new Array(len);
    for (var i = 0; i < len; i++) {
        res[i] = fun(this[i]);
    }
    return res;
};

var DIGITS = "0123456789".split('');
var ASCII_LOWERCASE = "abcdefghijklmnopqrstuvwxyz".split('');
var ASCII_UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
var ASCII_LETTERS = ASCII_LOWERCASE.concat(ASCII_UPPERCASE);
var _SYMBOL_STARTS = '!$%&*/:<=>?@^_~'.split('').concat(ASCII_LETTERS);
var _SYMBOL_INNERS = _SYMBOL_STARTS.concat(DIGITS, '+-.'.split(''));
var _NUMERAL_STARTS = DIGITS.concat('+-.'.split(''));
var _WHITESPACE = ' \t\n\r'.split('');
var _SINGLE_CHAR_TOKENS = "()'".split('');
var _TOKEN_END = _WHITESPACE.concat(_SINGLE_CHAR_TOKENS);
var DELIMITERS = _SINGLE_CHAR_TOKENS.concat(['.']);

function valid_symbol(s) {
    //Returns whether s is not a well-formed value.
    if (s.length == 0 || ! _SYMBOL_STARTS.inside(s.charAt(0)) ) {
        return false;
    }
    for (var i = 1; i < s.length; i++) {
        if (! _SYMBOL_INNERS.inside(s.charAt(i)) ) {
            return false;
        }
    }
    return true;
}

function next_candidate_token(line, k) {
    // A tuple (tok, k'), where tok is the next substring of line at or
    // after position k that could be a token (assuming it passes a validity
    // check), and k' is the position in line following that token.  Returns
    // (None, len(line)) when there are no more tokens.
    while (k < line.length) {
        var c = line[k];

        if (c == ";") {
            return [null, line.length];
        } else if (_WHITESPACE.inside(c)) {
            k += 1;
        } else if (_SINGLE_CHAR_TOKENS.inside(c)) {
            return [c, k + 1];
        } else if (c == '#') { // Boolean values #t and #f
            return [line.slice(k, k+2), Math.min(k+2, line.length)];
        } else {
            var j = k;
            while (j < line.length && (! _TOKEN_END.inside(line[j]))) {
                j += 1;
            }
            return [line.slice(k, j), Math.min(j, line.length)];
        }
    }
    return [null, line.length];
}

function tokenize_line (line) {
    var result = [];
    var nct_result = next_candidate_token(line, 0);
    var text = nct_result[0];
    var i = nct_result[1];
    while (text != null) {
        if (DELIMITERS.inside(text)) {
            result.push(text);
        } else if (text == "+" || text == "-") {
            result.push(text);
        } else if (text == "#t" || text.toLowerCase() == "true") {
            result.push(true);
        } else if (text == "#f" || text.toLowerCase() == "false") {
            result.push(false);
        } else if (text == "nil") {
            result.push(text);
        } else if (_NUMERAL_STARTS.inside(text[0])) {
            var r = parseFloat(text);
            if (r == NaN) {
                throw "ValueError: invalid numeral: " + text;
            } else {
                result.push(r);
            }
        } else if (_SYMBOL_STARTS.inside(text[0]) && valid_symbol(text)) {
            result.push(text);
        } else {
            throw "SyntaxError: invalid token :" + text;
        }
        nct_result = next_candidate_token(line, i);
        text = nct_result[0];
        i = nct_result[1];
    }
    return result;
}

function tokenize_lines(input) {
    // Returns list of lists of tokens, one for each line of the input array
    return input.map(tokenize_line);
}
