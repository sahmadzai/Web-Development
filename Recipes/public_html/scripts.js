
// views the selected recipe from the drop down list
function viewRecipe() {
    if(document.getElementById("ddlRecipes").selectedIndex === 0 ) {
        return;
    }
    console.log("view recipe");
    var xhr = new XMLHttpRequest();
    var recipe;
    xhr.open("GET", "/view?ddlRecipes=" +
        document.getElementById("ddlRecipes").options[document.getElementById("ddlRecipes").selectedIndex].value, true);

    xhr.addEventListener('load', function () {
        recipe = JSON.parse(xhr.responseText);
        console.log(recipe);
        document.getElementById("txtDuration").value = recipe.duration;

        document.getElementById("txtIngredients").value = recipe.ingredients;
        document.getElementById("txtSteps").value = recipe.steps;
        document.getElementById("txtNotes").value = recipe.notes;

    });

    xhr.send();
}
// validates and updates the fields of recipe and then requests to have the server update it's records
function editRecipe() {
    if(document.getElementById("ddlRecipes").selectedIndex === 0 ) {
        return;
    }

    var duration= document.getElementById("txtDuration");
    var ingredients = document.getElementById("txtIngredients");
    var steps = document.getElementById("txtSteps");
    if(!validAllFields(duration, ingredients, steps)){
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open("POST","/submit", true);
    xhr.addEventListener('load', function(){
        if(xhr.status === 200)
        {
            var ok = document.createElement("img");
            ok.src = "/OK.png";
            ok.classList = "ok";
            var bodyElement = document.getElementsByTagName("body")[0];
            bodyElement.appendChild(ok);
            setTimeout(function (){bodyElement.removeChild(ok);}, 3000);

        }

    });


    var postParams = "ddlRecipes=" +
        document.getElementById("ddlRecipes").
            options[document.getElementById("ddlRecipes").selectedIndex].value + "&" +
        "txtDuration=" + duration.value + "&" +
        "txtIngredients=" + ingredients .value + "&" +
        "txtSteps=" + steps.value + "&" +
        "txtNotes=" + document.getElementById("txtNotes").value;
    xhr.send(postParams);


}

/**
 OnLoad:The client-side code should populate a drop-down menu with the list of available recipes once the page is loaded.
 */
window.onload = function () {
    var xhr = new XMLHttpRequest();
    var resultObj;
    xhr.open("GET", "/recipes", true);
    xhr.addEventListener('load', function () {

        resultObj = JSON.parse(xhr.responseText);
        console.log(resultObj);
        var ddlRecipes = document.getElementById("ddlRecipes");

        for(var recipeCounter = 0; recipeCounter < resultObj.recipes.length; recipeCounter++){
            var optionElem = document.createElement("option");
            optionElem.text = resultObj.recipes[recipeCounter].name;
            optionElem.value = resultObj.recipes[recipeCounter].filename;
            ddlRecipes.add(optionElem);
        }
    });
    xhr.send();
}
//checks to see if the user entered anything and checks to see if the user entered an empty string or spaces
function  isEmptyString(elementValue, errorSpan) {
    if(elementValue.trim() === "")
    {
        errorSpan.innerHTML = "Empty String not allowed! Try again!";
        return true;
    }
    else
    {
        return false;
    }

}
// validates all of the text fields
function validAllFields(duration, ingredients, steps) {
    var flag = true;
    if(isEmptyString(duration.value, document.getElementById("errorDuration"))) {flag = false;}
    if(isEmptyString(ingredients.value, document.getElementById("errorIngredients"))){flag = false;}
    if(isEmptyString(steps.value, document.getElementById("errorSteps"))) {flag = false;}
    return flag;
}