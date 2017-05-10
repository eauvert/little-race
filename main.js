<!DOCTYPE html>
<html>
<body>
<script>
var number = 0;
var links = ["http://i.imgur.com/dylt2xV.jpg", "http://i.imgur.com/EFOpPQd.jpg", "http://i.imgur.com/xa5VlQg.jpg", "http://i.imgur.com/bp5ZaNV.jpg", "http://i.imgur.com/LgHlEzX.jpg", "http://i.imgur.com/hwoJ25n.jpg", "http://i.imgur.com/qcKCdzk.jpg", "http://i.imgur.com/TH6XLPG.jpg", "http://i.imgur.com/AuN0Laf.jpg", "http://i.imgur.com/5eMMS50.jpg", "http://i.imgur.com/g0bXbjj.jpg", "http://i.imgur.com/HJ8PMfa.jpg", "http://i.imgur.com/qEZZmko.jpg", "http://i.imgur.com/R1zeobx.jpg", "http://i.imgur.com/W5feyfQ.jpg", "http://i.imgur.com/H8RlyH2.jpg", "http://i.imgur.com/dOcqSpQ.jpg", "http://i.imgur.com/GWcnaSO.jpg", "http://i.imgur.com/hBbCq52.jpg", "http://i.imgur.com/NqfYjgC.jpg", "http://i.imgur.com/aX14Qqy.jpg", "http://i.imgur.com/8VOBjKx.jpg", "http://i.imgur.com/8QZDg3Z.jpg", "http://i.imgur.com/0T2pSkB.jpg", "http://i.imgur.com/YQU6YA5.jpg", "http://i.imgur.com/0wKnR1Q.jpg", "http://i.imgur.com/Uw4lL3B.jpg", "http://i.imgur.com/Pu9JmqN.jpg", "http://i.imgur.com/mNXIxqB.jpg", "http://i.imgur.com/EIX4kon.jpg", "http://i.imgur.com/OKXyBKP.jpg", "http://i.imgur.com/Iyclhm3.jpg", "http://i.imgur.com/yv1xihA.jpg", "http://i.imgur.com/X68plOR.jpg"];

function animate(){
     document.getElementById("frame").src = links[number];
     number = number + 1;
     if (number >= links.length){number = 0}
}

setInterval(animate, 41);
</script>
</body>
</html>