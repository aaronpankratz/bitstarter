#!/usr/bin/env node
/*
automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - https://encosia.com/cheerio-faster-windows-friendsly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://thjolowaychuk.com/post/9103188408/commander-js/nodejs/command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSPN
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var sys = require('util'),
    rest = require('./restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://fierce-reaches-1073.herokuapp.com";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1); // http://nodejs.org/api/;process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioUrl = function(urlString) {
    return cheerio.load(urlString);
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var buildfn = function(fileName, checksfile) {
    var response2console = function(result, response) {
	if (result instanceof Error) {
	    console.error('Error: ' + util.format(response.message));
	} else {
	    fs.writeFileSync(fileName, result);
	    var checkedInput = checkHtmlFile("test.html", checksfile);
	    var outJson = JSON.stringify(checkedInput, null, 4);
	    console.log(outJson);
	}
    };
    return response2console;
};

var checkUrl = function(url, checksfile) {
    var response2console = buildfn("test.html", checksfile);
    rest.get(url).on('complete', response2console);
}

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url_file>', 'Path to url', URL_DEFAULT)
	.parse(process.argv);
    var checkedInput;
    if(program.url != undefined) {
	checkUrl(program.url, program.checks);
    }
    else {
	checkedInput = checkHtmlFile(program.file, program.checks);
	var outJson = JSON.stringify(checkedInput, null, 4);
	console.log(outJson);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}

