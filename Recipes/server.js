
var http = require("http");
var fs = require('fs');
var mime = require('mime-types');
var qs = require('querystring');



var DOMAIN = "localhost";
var PORT = 2406;
var FULL_DOMAIN = DOMAIN + ":" + PORT;
const ROOT = "./public_html";


var server = http.createServer(myRequestListener);
server.listen(PORT, DOMAIN);

console.log("The server is running at " + FULL_DOMAIN);

/*
 The myRequestListener is a function which is automatically added to the 'request' event.
 */
function myRequestListener(req, res) {
    //object to be passed "by ref" or modified directly
    var resultObj = {
        code: -1,
        data: ""
    };



    //process the request
    console.log("Request for: " + req.url);
    try {
        var routePath = "";
        if(req.url.indexOf("?") !== -1){
            routePath = req.url.substr(0,req.url.indexOf("?"));
        }
        else{
            routePath = req.url;
        }
        console.log("route path: " + routePath);

        //Each case is a route
        switch (routePath) {
            /*STATIC FILES*/
            case "/":
            case "/home.html":
            case "/form.html":
            case "/style.css":
            case "/scripts.js":
            case "/OK.png":
                console.log("Attempting to fetch file at path: " + routePath);
                getStaticFile(routePath, resultObj);
                console.log(resultObj.code);
                res.writeHead(resultObj.code, {'content-type': mime.lookup(routePath) || 'text/html'});
                // write message and signal communication is complete
                res.end(resultObj.data);
                break;
            /*DYNAMIC FILES OR STATIC FILES THAT DO USE GET OR POST*/
            case "/recipes":
            case "/view":
            case "/submit":
                var body = "";
                req.on("data", function (data) {
                    body += data;
                });

                req.on('end', function () {
                    //can use a loop instead if modules are not allowed
                    var querystrings = qs.parse(body);
                    console.log("POST:");
                    console.log(querystrings);
                    if(req.url.indexOf("?") !== -1){
                        var tempGet = qs.parse(req.url.substr(req.url.indexOf("?") + 1, req.url.length - 1));
                        /*Combining querystring with tempGet (combining get data with post data) */
                        for (var attrname in tempGet) {
                            querystrings[attrname] = tempGet[attrname];
                        }

                        console.log("GET:");
                        console.log(tempGet);

                        tempGet = undefined;

                    }

                    // use querystrings
                    switch (routePath){
                        case "/recipes":
                            routeRecipes(req, resultObj, querystrings);
                            break;
                        case "/view":
                            routeView(req, resultObj, querystrings);
                            break;
                        case "/submit":
                            routeSubmit(req, resultObj, querystrings);
                            break;
                        default:
                            throw "No such path";
                    }

                    console.log(resultObj.code);
                    res.writeHead(resultObj.code, {'content-type': mime.lookup(routePath) || 'text/html'});
                    // write message and signal communication is complete
                    res.end(resultObj.data);
                });

                break;
            default:
                throw "No such path";
            // break; //unreachable line
        }
    }catch (e){
        getStaticFile(ROOT + "/404.html", resultObj);
        res.writeHead(resultObj.code, {'content-type': mime.lookup(ROOT + "/404.html") || 'text/html'});
        // write message and signal communication is complete
        res.end(resultObj.data);
    }
};

//local scope function
function getStaticFile(path, resultObj) {
    path = ROOT + path;
    try {
        if (fs.existsSync(path)) {
            var fileInfo = fs.statSync(path);

            if (fileInfo.isDirectory()) {
                //do not add a '/' in front because it is already there from the directory
                path += "index.html";
                console.log("WAS DIR, looking for index.html at path: " + path);
            }

            if ((resultObj.data = fs.readFileSync(path)) !== -1) {
                console.log("Getting file: " + path);
                resultObj.code = 200;
            }
            else {
                throw "File not found";
            }
        } else {
            throw "File not found";
        }
    }
    catch (ex) {
        console.log(ex);
        resultObj.code = 404;
        resultObj.data = fs.readFileSync(ROOT + "/404.html");
    }
}
/*This route returns a JSON object that contains an array of all recipes found in the recipes
 directory as objects with a name and filename attribute
 */
function routeRecipes(req, resultObj, querystrings){
    var recipes = [];
    var obj = {};
    var filenames = [];
    var recipesPath = ROOT + "/recipes";
    var recipe;
    console.log("querystrings:");
    console.log(querystrings);

    filenames = fs.readdirSync(recipesPath);

    for(var filenameCounter = 0; filenameCounter < filenames.length; filenameCounter++ )
    {
        console.log(recipesPath + "/" + filenames[filenameCounter]);
        recipe = JSON.parse(fs.readFileSync(recipesPath + "/" + filenames[filenameCounter]));

        recipes.push({ name: recipe.name, filename: filenames[filenameCounter]});
    }
    obj.recipes = recipes;
    resultObj.data = JSON.stringify(obj);
    resultObj.code = 200;
}
//responds with a JSON object that is the recipe that was requested by filename
function routeView(req, resultObj, querystrings) {
    console.log("Querystring:");
    console.log(querystrings);
    var recipesPath = ROOT + "/recipes";
    resultObj.data = fs.readFileSync(recipesPath + "/" + querystrings.ddlRecipes);
    resultObj.code = 200;
}
// this function writes the received recipe object to it's appropriate JSON file. It responds with code 200 if OK or 500 if failed
function  routeSubmit(req, resultObj, querystrings){
    console.log("Querystring:");
    console.log(querystrings);
    var recipesPath = ROOT + "/recipes";
    var recipe = JSON.parse(fs.readFileSync(recipesPath + "/" + querystrings.ddlRecipes));
    recipe.duration = querystrings.txtDuration;
    recipe.ingredients = querystrings.txtIngredients;
    recipe.steps = querystrings.txtSteps;
    recipe.notes = querystrings.txtNotes;
    console.log(JSON.stringify(recipe));
    try {
        fs.writeFileSync(recipesPath + "/" + querystrings.ddlRecipes, JSON.stringify(recipe));
        resultObj.data = "";
        resultObj.code = 200;
    }
    catch (e){
        resultObj.data = e;
        resultObj.code = 500;
    }
}