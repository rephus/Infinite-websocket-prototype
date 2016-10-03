// Draw everything
var render = function () {
	if (!user) return;

	camera.clear();

	// drawSectors(player.x,player.y);

	//sectors.drawVisibleBackground(player.x,player.y);

	//drawFishes(children, false, false);
	//drawFishes(enemies, true, false);

	//drawFishes(online.all(), false, true);

	drawText(5,5, "Position:"+  user.position);
	drawText(5,25, "Sector:"+  sector.id);

	drawCircle(user.position[0], user.position[1], 5);
	//drawHUD();
	drawSector();
};

var drawSector = function(){
	var SECTOR_SIZE = 100;
	ctx.rect(sector.origin[0], sector.origin[1], SECTOR_SIZE, SECTOR_SIZE);
	ctx.stroke();

};

var drawFishes = function(array, withStats, withName) {
	for (var i in array){
    var fish = array[i];

		//item might be null if you use `delete array[i]`, like eggs or enemies
    if (fish) {
			if (withStats) drawStats(fish);

			if (withName && fish.name) {
				drawText(fish.x, fish.y - 20, fish.name);
			}

			if (fish.stage === 0) drawEgg(fish);
			else drawFish(fish);
		}
  }
};

var drawStats = function(fish) {

	drawArc(fish.x,fish.y -5, {r: 50, color: "green"}, fish.health * 100);
	drawArc(fish.x,fish.y -5, {r: 35, color: "orange"}, fish.food);

	drawArc(fish.x,fish.y +5, {r: 35, color: "red", position: "bottom"}, fish.stats().attack * 100);
	drawArc(fish.x,fish.y +5, {r: 50, color: "gray", position: "bottom"}, fish.stats().defense * 100);
	drawArc(fish.x,fish.y +5, {r: 65, color: "blue", position: "bottom"}, fish.stats().speed * 100);


};

function drawHUD(){
	var o = camera.origin();
	drawText(o.x+50, o.y+20, "Enemies "+enemies.length);
	drawText(o.x+50, o.y+50, "Children "+children.length);
}
