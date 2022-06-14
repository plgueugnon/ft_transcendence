const enum TypeTarget {
	NOTHING,
	PLAYER,
	BALL,
}

const enum LeftRight {
	LEFT = 0,
	RIGHT = 1,
}

const enum User {
	HOST = 0,
	PLAYER = 1,
	WATCHER = 2,
}

const enum TypeSprite {
	NOTHING = 0,
	FASTBALL = 1,
	HALFPADDLE = 2,
	DOUBLEPADDLE = 3,
	INVERSEMOVE = 4,
}

const enum Status {
	WAITING,
	STARTING,
	FINISH,
}

const enum Size {
	HALF,
	NORMAL,
	DOUBLE,
}

export { TypeTarget };
export { LeftRight };
export { User };
export { TypeSprite };
export { Status };
export { Size };
