var MOVE_SPEED = 2;

var update = function (modifier) {
	if (!user) return;

	var direction = controls(modifier);
	var p = user.position;
	//TODO add modifier
	var x = p[0] + MOVE_SPEED * direction[0] ; //*modifier;
	var y = p[1] + MOVE_SPEED * direction[1] ; //*modifier;
	user.position = [parseInt(x),parseInt(y)];

};
