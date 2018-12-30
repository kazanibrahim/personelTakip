$(document).ready(function(){
  $('#login-button').click(function(){
  
    var usernameInput = document.getElementById('username').value;
    var passwordInput = document.getElementById('password').value;
  
  
    var post = {
      username: usernameInput,
      password: passwordInput
    };
  
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      console.log(xhr.responseText);
      var json = JSON.parse(xhr.responseText);
      if (!json.err) {
        location.href = "/home"
      } else {
        console.log(json.msg);
        alert(json.msg);
      }
    };
    xhr.open("POST", "/login", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(post));
  });
});

$('input[type=text],input[type=password]').on('keydown', function(e) {
  if (e.which == 13) {
    var usernameInput = document.getElementById('username').value;
    var passwordInput = document.getElementById('password').value;
    
    
    var post = {
      username: usernameInput,
      password: passwordInput
    };
    
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      console.log(xhr.responseText);
      var json = JSON.parse(xhr.responseText);
      if (!json.err) {
        location.href = "/home"
      } else {
        console.log(json.msg);
        alert(json.msg);
      }
    };
    xhr.open("POST", "/login", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(post));
    e.preventDefault();
  }
});