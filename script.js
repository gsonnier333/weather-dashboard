var queryUrl = "https://api.openweathermap.org/data/2.5/weather?q=";
var apiKey = "&appid=d592dcfacf2862a2f02f038fed6d4e51";
var onecallUrl = "https://api.openweathermap.org/data/2.5/onecall?";

$(document).ready(function(){
    
    function showWeather(apiObj){
        $("#todayTemp").text("Temperature: " + apiObj.current.temp + " F");
        $("#todayHum").text("Humidity: " + apiObj.current.humidity + "%");
        $("#todayWind").text("Wind Speed: " + apiObj.current.wind_speed + " MPH");
        $("#uvIndex").text("UV Index: " + apiObj.current.uvi);
    }
    
    function forecast(city){
        var day = new Date(Date.now()).toDateString(); //keep track of the current date to display
        $.ajax({
            url: queryUrl + city + apiKey, //call the api using the city name
            method: "GET"
        }).then(function(response){
            console.log(response);
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
});

