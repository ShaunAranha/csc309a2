stage=null;
// SOME GLUE CODE CONNECTING THIS PAGE TO THE STAGE
interval=null;
user=null; //keeps track of user who has logged in for use in other requests

function setupGame(){
  //Build the stage
  stage=new Stage(15,15,"stage");
  stage.initialize();
  console.log('stage built');
}

function setControls(interval){
  if (interval != null){
    console.log('getting input');
    document.onkeypress = function(){keyboardControl(event)};
    document.getElementById('n').onclick = function(){stage.movePlayer(0,-1)};
    document.getElementById('nw').onclick = function(){stage.movePlayer(-1,-1)};
    document.getElementById('ne').onclick = function(){stage.movePlayer(1,-1)};
    document.getElementById('e').onclick = function(){stage.movePlayer(1,0)};
    document.getElementById('w').onclick = function(){stage.movePlayer(-1,0)};
    document.getElementById('s').onclick = function(){stage.movePlayer(0,1)};
    document.getElementById('sw').onclick = function(){stage.movePlayer(-1,1)};
    document.getElementById('se').onclick = function(){stage.movePlayer(1,1)};
  } else {
    console.log('input blocked');
    document.onkeypress = null;
    document.getElementById('n').onclick = null;
    document.getElementById('nw').onclick = null;
    document.getElementById('ne').onclick = null;
    document.getElementById('e').onclick = null;
    document.getElementById('w').onclick = null;
    document.getElementById('s').onclick = null;
    document.getElementById('sw').onclick = null;
    document.getElementById('se').onclick = null;
  }
}

function keyboardControl(event){
    var x = event.charCode || event.keyCode;  // Get the Unicode value
    var y = String.fromCharCode(x);  // Convert the value into a character
    if (y == 'q'){
      stage.movePlayer(-1,-1);
    } else if (y == 'w'){
      stage.movePlayer(0,-1);
    } else if (y == 'e'){
      stage.movePlayer(1,-1);
    } else if (y == 'a'){
      stage.movePlayer(-1,0);
    } else if (y == 'd'){
      stage.movePlayer(1,0);
    } else if (y == 'z'){
      stage.movePlayer(-1,1);
    } else if (y == 'x'){
      stage.movePlayer(0,1);
    } else if (y == 'c'){
      stage.movePlayer(1,1);
    }

}


function startGame(){
  // SET ANIMATION INTERVAL
  if (interval == null){
    interval = setInterval('endGame()', 1000);
  }
  setControls(interval);
  //SET INTERVAL OVER HERE
}
function pauseGame(){
  clearInterval(interval);
  interval = null;
  setControls(interval);
 //stops animation from happening
}

function inputScore(){ //inputs the score when the game is over
  $.ajax({
    method: "PUT",
    url: "/scores/" + user + "/" +$("#time").html() + "/"
  }).done(function(data){
    console.log('score submitted');
    setupGame();
  });
}

function endGame(){
  var isWon = stage.step();
  if (isWon == true){
    $('#win').show();
    //$("pauseGame").hide();
    pauseGame();
    inputScore();
  } else if (isWon == false) {
    $('#lose').show();
    //$("#pauseGame").hide();
    pauseGame();
    inputScore();
  }

}

function highScores(){
  $.ajax({
    method: "GET",
    url: "/highscores/"
  }).done(function(data){
    //console.log(data.status);
    var s = "<table>";
    s += "<tr><th>ID</th><th>Score</th></tr>";
    for (var i = 0; i<data.length; i++){
      s = s + "<tr><td>" + data[i].id + "</td><trd>" + data[i].score +  "</td></tr>";
    }
    s+= "</table>";
    $("#highScores").html(s);
  });
}

//PRE-POPULATE EDITING THE PROFILE
function editProfile(){
  $("#edituser").val(  $("#vuser").html());
  $("#editfname").val(  $("#vfname").html());
  $("#editemail").val(  $("#vemail").html());

}


function confirmProfile(){
  //var oldid = $('#vuser').html();
  var data = $('#profileForm').serializeArray(); // convert form to array
  console.log("Data:" + data);
  data.push({name: "oldid", value: $('#vuser').html()});
  data.push({name: "oldemail", value: $('#vemail').html()});
  //var datastring = $.param(data);
$.ajax({
    method: "POST",
    url: "/confirmprofile/",
    data: $.param(data)
  }).done(function(data){
    console.log(data.error);
    if ("error" in data){
      if (data.error == "Username"){
          console.log("username error");
          $("#edituserError").html("*Username exists");
      } if (data.error == "Email"){
          console.log("email error");
          $("#editemailError").html("*Email exists");
      }
    } else {
      $(".game").show();
      $("#stage").show();
      $("#score").show();
      $("#buttons").show();
      $("#highScoresTitle").hide();
      $("#profileForm").hide();
    }
  });

}
function login(){
    $.ajax({
      method: "GET",
      url: "/login/",
      data: jQuery("#loginForm").serialize()
    }).done(function(data){
      console.log(data.status);
      console.log('function reached');
      if ("error" in data){
        $("#loginError").html("Invalid Login");
      } else {
        user = data.user;
        setupGame();
        console.log(user);
        $("#loginForm").hide();
        $(".game").show();
        $("#stage").show();
        $("#score").show();
        $("#buttons").show();
        $("#highScoresTitle").hide();
        $("#username").val("");
        $("#password").val("");
      }
    });

}

//make request to register the user
function registerUser(){
  $.ajax({
    method: "PUT",
    url: "/register/",
    data: jQuery("#registerForm").serialize()
  }).done(function(data){
    if ("error" in data){
      if (data.error = "Username"){
          $("#reguserError").html("*Username exists");
      } else if (data.error = "Email"){
          $("#regemailError").html("*Email exists");
      }
    } else {
      $("#loginForm").show();
      $("#registerForm").hide();
    }
  });

}

function viewProfile(){ //gets the user information to view the profile
  $.ajax({
    method: "GET",
    url: "/viewprofile/",
    data: {user: user}
  }).done(function(data){
    $("#vuser").html(data.user);
    $("#vfname").html(data.name);
    $("#vemail").html(data.email);
    $("#vgender").html(data.gender);
  });
}

//LOGOUT - NEED TO CLEAR COOKIES
function logout(){
  $("#profile").hide();
  $("#loginForm").show();
  $("#registerForm").hide();
  $("#stage").hide();
  $('#win').hide();
  $('#lose').hide();
  $(".game").hide();
  $("#score").hide();
  $("#highScoresTitle").show();
  $("#buttons").hide();
  user = null;
}


// YOUR CODE GOES HERE
$(function(){
  //LOGIN
  $("#loginButton").on('click',function(){
    $("#loginError").html("");
    $("#usernameError").html("");
    $("#passwordError").html("");
    if ($("#username").val() && $("#password").val()){
    login();
  }
    if (!$("#username").val()){
      $("#usernameError").html("*Username not entered");
    }
    if (!$("#password").val()){
    $("#passwordError").html("*Password not entered");
    }
  });

  //SUBMITTING REGISTER FORM
  $("#registerButton").on('click',function(){
    $("#loginError").html("");
    $("#reguserError").html("");
    $("#regpassError").html("");
    $("#regcpassError").html("");
    $("#regemailError").html("");
    $("#genderError").html("");
    $("#regfnameError").html("");

    if ($("#reguser").val() && $("#regpass").val() && $("#regemail").val() && $("#regpass").val() &&
    $("#regfname").val() && ($("#male").is(":checked")
    || $("#female").is(":checked") || $("#other").is(":checked"))){
      registerUser();
      console.log('registering profile');
    }
    if (!$("#reguser").val()){
      $("#reguserError").html("*Username not entered");
    }
    if (!$("#regpass").val()){
    $("#regpassError").html("*Password not entered");
    }
    if (!$("#regemail").val()){
    $("#regemailError").html("*Email not entered");
    }

    if ($("#regpass").val() != $("#regcpass").val()){
      $("#regcpassError").html("*Passwords do not match");
    }

    if (!$("#regfname").val()){
      $("#regfnameError").html("*Name not entered");
    }


    if (!($("#male").is(":checked") || $("#female").is(":checked") || $("#other").is(":checked"))){
      $("#genderError").html("*Choose a Gender");
    }
  });





  //PAUSING GAME
  $("#pauseGame").on('click',function(){
      pauseGame();
      console.log('pausing game');
  });

  //STARTING A GAME
  $("#startGame").on('click',function(){
      $('#win').hide();
      $('#lose').hide();
      startGame();
      console.log('starting game');
  });

  //RESTARTING
  $("#restartGame").on('click',function(){
    setupGame();
    pauseGame();
    console.log('restarting Game');
  });

  //REGISTRATION from LOGIN
  $("#registerAccount").on('click',function(){
    $("#highScoresTitle").hide();
    $("#loginForm").hide();
    $("#registerForm").show();
  });

  //viewing Profile
  $("#viewProfile").on('click',function(){
    $("#stage").hide();
    $("#highScores").hide();
    $(".game").hide();
    $("#profile").show();
    viewProfile();
  });

  //Logging out
  $("#logout").on('click',function(){
    logout();
  });

  //Editing profile page event
  $("#editProfile").on('click',function(){
    $("#profile").hide();
    $("#profileForm").show();
    editProfile();
  });


  //Confirm edit changes
  $("#confirmButton").on('click',function(){
    $("#edituserError").html("");
    $("#editpassError").html("");
    $("#editcpassError").html("");
    $("#editemailError").html("");
    $("#egenderError").html("");
    $("#editfnameError").html("");

    if ($("#edituser").val() && $("#editpass").val() && $("#editemail").val() && $("#editcpass").val() &&
    $("#editfname").val() && ($("#emale").is(":checked")
    || $("#efemale").is(":checked") || $("#eother").is(":checked"))){
      confirmProfile();
      console.log('sending profile for edits');
    }

    if (!$("#edituser").val()){
      $("#edituserError").html("*Username not entered");
    }
    if (!$("#editpass").val()){
    $("#editpassError").html("*Password not entered");
    }
    if (!$("#editemail").val()){
    $("#editemailError").html("*Email not entered");
    }

    if ($("#editpass").val() != $("#editcpass").val()){
      $("#editcpassError").html("*Passwords do not match");
    }

    if (!$("#editfname").val()){
      $("#editfnameError").html("*First name not entered");
    }

    if (!($("#emale").is(":checked") || $("#efemale").is(":checked") || $("#eother").is(":checked"))){
      $("#egenderError").html("*Choose a Gender");
    }

  });

  highScores();
  //winGame();
  $("#profile").hide();
  $("#loginForm").show();
  $("#registerForm").hide();
  $("#stage").hide();
  $('#win').hide();
  $('#lose').hide();
  $(".game").hide();
  $("#score").hide();
  $("#highScores").show();
  $("#buttons").hide();
  $("#profileForm").hide();
});
