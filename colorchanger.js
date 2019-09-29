// .circle{background-color: #40E0D0; border-radius: 150px; margin: -150px -150px; position: fixed; left: 50%; top: 50%; transform: scale(1); transition: transform .5s ease-in, background-color .5s linear; width: 300px; height: 300px}
var queue = false;
var currentColor = "#40E0D0";
var bgColors = ["#982015", "#F49B27", "#EFD92D", "#4FC164", "#2A6BCC", "#38F5CC", "#E557C9", "#815893", "#756239", "#FB55D0", "#FFFFFF"];
var bgCircle = document.getElementsByClassName("circle")[0];

function changeBackground(){
     if (queue == true){setTimeout(changeBackground, 60); return}
     queue = true;
     bgCircle.style.transform = "scale(10)";
     setTimeout(function(){document.body.style.backgroundColor = currentColor; bgCircle.style.transform = "scale(1)"; currentColor = bgColors[Math.floor(Math.random() * bgColors.length)]}, 500);
     setTimeout(function(){bgCircle.style.backgroundColor = currentColor}, 1000);
     setTimeout(function(){queue = false}, 2000)
}

$("a").click(changeBackground);