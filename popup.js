//Get user-highlighted name and create url for json
chrome.tabs.executeScript({
    code: "window.getSelection().toString();"
}, function(selection) { //selection is an array
    var name = selection[0].split(" ");
    var url = "https://cors-anywhere.herokuapp.com/" + "https://search-production.ratemyprofessors.com/solr/rmp/select/?solrformat=true&rows=20&wt=json&q=" + name[0] + "+" + name[name.length - 1] + "+AND+schoolid_s%3A3959&defType=edismax&qf=teacherfirstname_t%5E2000+teacherlastname_t%5E2000+teacherfullname_t%5E2000+autosuggest&bf=pow(total_number_of_ratings_i%2C2.1)&sort=total_number_of_ratings_i+desc&siteName=rmp&rows=20&start=0&fl=pk_id+teacherfirstname_t+teacherlastname_t+total_number_of_ratings_i+averageratingscore_rf+schoolid_s&fq=";
    var req = new XMLHttpRequest();
    req.overrideMimeType("application/json");
    req.open('GET', url, true);
    req.onload = function() {
        var jsonResponse = JSON.parse(req.responseText);

        if (jsonResponse.response.docs[0] == undefined) {
            document.getElementById("prof").textContent = "Professor: " + "N/A";
            document.getElementById("rating").textContent = "Rating: " + "N/A";
            document.getElementById("numOfRatings").textContent = "# of Ratings: " + "N/A";
            document.getElementById("difficulty").textContent = "Level of Difficulty: " + "N/A";
            document.getElementById("takeAgain").textContent = "Would take again: " + "N/A";
            return;
        } else {
            var profId = jsonResponse.response.docs[0].pk_id;
            var avgRating = jsonResponse.response.docs[0].averageratingscore_rf;
            var firstName = jsonResponse.response.docs[0].teacherfirstname_t;
            var lastName = jsonResponse.response.docs[0].teacherlastname_t;
            var numRatings = jsonResponse.response.docs[0].total_number_of_ratings_i;
        }

        //Use id to create scrape url
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            var responseArray = this.responseXML.getElementsByClassName("FeedbackItem__FeedbackNumber-uof32n-1 bGrrmf");

            if (responseArray.length == 1) {
                var wouldTakeAgain = "N/A";
                var difficultyLevel = responseArray[0].innerText;

            } else {
                var wouldTakeAgain = responseArray[0].innerText;
                var difficultyLevel = responseArray[1].innerText;
            }

            var commentsArray = this.responseXML.getElementsByClassName("Comments__StyledComments-dzzyvm-0 dEfjGB");


            for (var x = 0; x < commentsArray.length; x++) {
                if(commentsArray[x] == undefined) document.getElementById("comments").innerHTML += "N/A";
		        document.getElementById("comments").innerHTML += commentsArray[x].innerText;
                if (x < commentsArray.length - 1) document.getElementById("comments").innerHTML += "<br>" + "----------------------------------------------" + "<br>";

            }

            //Update tags
            document.getElementById("prof").textContent = "Professor: " + firstName + " " + lastName;
            document.getElementById("rating").textContent = "Rating: " + avgRating + "/5.0";
            document.getElementById("numOfRatings").textContent = "# of Ratings: " + numRatings;
            document.getElementById("difficulty").textContent = "Level of Difficulty: " + difficultyLevel + "/5.0";
            document.getElementById("takeAgain").textContent = "Would take again: " + wouldTakeAgain;

        }



        xhr.open("GET", "https://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + profId.toString());
        xhr.responseType = "document";
        xhr.send();

    };
    req.send(null);
});