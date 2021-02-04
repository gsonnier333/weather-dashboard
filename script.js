var queryUrl = "https://api.openweathermap.org/data/2.5/weather?q=";
var apiKey = "&appid=d592dcfacf2862a2f02f038fed6d4e51";
var onecallUrl = "https://api.openweathermap.org/data/2.5/onecall?";
var loading = false; //use this boolean to keep the user from spamming the search button while their previous search loads


$(document).ready(function(){
    var history = localStorage.getItem("history");
    if(history===null){
        localStorage.setItem("history", JSON.stringify([]));
    }
    history = JSON.parse(localStorage.getItem("history"));
    
    function updateHistory(name){
        if(history.includes(name)){ //if this city is in the search history
            history.splice(history.indexOf(name), 1); //remove its previous occurrence to avoid duplicate buttons
            history.unshift(name); //prepend new search to history so it shows as most recent
        }
        else{
            history.unshift(name); //prepend new search to the history array
        }
        console.log(history);
        localStorage.setItem("history", JSON.stringify(history)); //store the updated history into localStorage
        showButtons();
    }
    
    function showButtons(){
        $("#searchHistory").empty();
        $("#searchHistory").text("Search history: ").append($("<br>"));
        history.forEach(function(city){
            var newBtn = $("<button>").text(city).attr("class", "historyBtn");
            newBtn.appendTo($("#searchHistory")); //add buttons for each city in the search history
        });
        $(".historyBtn").click(function(){
            forecast(this.textContent);
        })
    }
    
    function showWeather(apiObj){
        $("#todayTemp").text("Temperature: " + apiObj.current.temp + " F");
        $("#todayHum").text("Humidity: " + apiObj.current.humidity + "%");
        $("#todayWind").text("Wind Speed: " + apiObj.current.wind_speed + " MPH");
        $("#uvIndex").html("UV Index: <span id=\"uvNum\">&nbsp;" + apiObj.current.uvi + "&nbsp;</span>");
        if(apiObj.current.uvi<2){
            $("#uvNum").attr("style", "background-color: green"); //safe
        }
        else if(apiObj.current.uvi<5){
            $("#uvNum").attr("style", "background-color: yellow"); //moderate risk
        }
        else{
            $("#uvNum").attr("style", "background-color: red"); //high risk
        }
        let [month, date, year] = new Date().toLocaleDateString("en-US").split("/");
        for(var i = 1; i < 6; i++){ //populate the 5-day forecast
            var weather = apiObj.daily[i-1].weather[0].main;
            if(weather === "Clear"){
                weather = "☀";
            }
            else if(weather === "Clouds"){
                weather = "☁"
            }
            else if(weather === "Rain"){
                weather = "🌧"
            }
            else if(weather === "Drizzle"){
                weather = "🌦"
            }
            else if(weather === "Thunderstorm"){
                weather = "⛈"
            }
            else if(weather === "Snow"){
                weather = "❄"
            }
            else{
                weather = "❓" //if the weather is none of the above, probably atmosphere
            }
            $("#"+i).text(month + "/" + (parseInt(date) + parseInt(i)) + "/" + year + " " + weather + " Temp: " + apiObj.daily[i-1].temp.day + "F " + "Humid: " + apiObj.daily[i-1].humidity + "%"); //note: this will work poorly near the end of the month, consider a different approach in the future
            
        }
        
        loading = false; //let it know it's done loading
    }
    
    function forecast(city){ //note: if the string given by the user isn't a city recognized by the api, the page will stop functioning. Consider looking into fixes for this in the future.
        console.log(city);
        if(loading){return;} //tell it to stop if it's loading
        if(city===""){return;} //tell it to stop if the user didn't input anything
        loading = true;
        var day = new Date(Date.now()).toDateString(); //keep track of the current date to display
        $.ajax({
            url: queryUrl + city + apiKey, //call the api using the city name
            method: "GET"
        }).then(function(response){
            console.log(response);
            // if(!history.includes(response.name)){ //only do this if this city isn't already in their search history
            //     updateHistory(response.name);
            // }
            updateHistory(response.name);
            console.log("Next, getting onecall forecast");
            var lat = "lat=" + response.coord.lat; //get the city's latitude
            var lon = "&lon=" + response.coord.lon; //get the longitude
            $.ajax({
                url: onecallUrl + lat + lon + "&units=imperial" + apiKey, //call the api again using the newly acquired lat and lon so we can get a 7 day forecast
                method: "GET"
            }).then(function(fullResponse){
                console.log(fullResponse);
                console.log(day);
                $("#cityName").text(response.name);
                $("#date").text(day);
                showWeather(fullResponse);
            });
        });
    }
    
    $("#searchBtn").click(function(){
       var queryCity = $("#cityInput").val();
       forecast(queryCity); 
    });
    
    showButtons();
    if(history.length>0){
        forecast(history[0]); //load the weather forecast for the last city searched when the page reloads
    }
});

