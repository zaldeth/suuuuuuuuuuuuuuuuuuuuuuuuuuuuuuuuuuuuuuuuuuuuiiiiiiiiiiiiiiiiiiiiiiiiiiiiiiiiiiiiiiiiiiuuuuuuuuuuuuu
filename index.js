const BALL_RADIUS = 20,
	WIRE_LENGTH = window.innerHeight/ 2,
	GRAVITY = 0.6;

const canvasWidth = window.innerWidth,
	canvasHeight = window.innerHeight;

// DOM nodes
const svgCanvas = d3.select('svg#canvas')
		.attr('width', canvasWidth)
		.attr('height', canvasHeight),
	wiresG = svgCanvas.append('g'),
	ballsG = svgCanvas.append('g');

svgCanvas.append('rect')
	.attr('x', canvasWidth/2 - 4*BALL_RADIUS - 10)
	.attr('y', canvasHeight*2/3 - WIRE_LENGTH - 5)
	.attr('width', BALL_RADIUS*8 + 20)
	.attr('height', 10)
	.attr('rx', 5)
	.attr('ry', 5)
	.attr('fill', 'slategrey');

const balls = [
		{ id: '0', init: { x: canvasWidth/2 - 4*BALL_RADIUS, y: canvasHeight*2/3 } },
		{ id: '1', init: { x: canvasWidth/2 - 2*BALL_RADIUS, y: canvasHeight*2/3 } },
		{ id: '2', init: { x: canvasWidth/2 - 0*BALL_RADIUS, y: canvasHeight*2/3 } },
		{ id: '3', init: { x: canvasWidth/2 + 2*BALL_RADIUS, y: canvasHeight*2/3 } },
		{ id: '4', init: { x: canvasWidth/2 + 4*BALL_RADIUS, y: canvasHeight*2/3 } }
	],
	anchors = balls.map(ball => ({
		id: 'a' + ball.id,
		fx: ball.init.x,
		fy: ball.init.y - WIRE_LENGTH
	})),
	wires = balls.map(ball => ({
		source: ball.id,
		target: 'a' + ball.id
	}));

	// swing it
	balls[0].init.x -= WIRE_LENGTH;
	balls[0].init.y -= WIRE_LENGTH;

let init = false;

const forceSim = d3.forceSimulation()
	.alphaDecay(0)
	.velocityDecay(0)
	.nodes([...balls, ...anchors])
	.force('gravity', d3.forceConstant()
		.strength(GRAVITY)
		.direction(90)
	)
	.force('wires', d3.forceLink(wires)
		.id(node => node.id)
		.distance(WIRE_LENGTH)
		.strength(0.4)
	)
	.force('bounce', d3.forceBounce()
		.radius(node => BALL_RADIUS)
	)
	.force('init', () => {
		if (!init) {
			balls.forEach((ball) => {
				ball.x = ball.init.x;
				ball.y = ball.init.y;
				ball.vx = 0;
				ball.vy = 0;
			});
			init = true;
		}
	})
	.on('tick', () => { ballDigest(); wireDigest(); });

//

function ballDigest() {
	let ball = ballsG.selectAll('circle.ball').data(balls);

	ball.exit().remove();

	ball.merge(
		ball.enter().append('circle')
			.classed('ball', true)
			.attr('r', BALL_RADIUS)
			.attr('fill', 'url(#sphere-gradient)')
			.call(d3.drag()
				.on("start", d => { d.fx = d.x; d.fy = d.y; })
				.on("drag", d => { d.fx = d3.event.x; d.fy = d3.event.y; })
				.on("end", d => { d.fx = null; d.fy = null; })
			)
	)
		.attr('cx', d => d.x)
		.attr('cy', d => d.y);
}

function wireDigest() {
	let wire = wiresG.selectAll('line.wire').data(wires);

	wire.exit().remove();

	wire.merge(
		wire.enter().append('line')
			.classed('wire', true)
			.attr('stroke', 'slategrey')
			.attr('stroke-width', 1)
	)
		.attr('x1', d => d.source.x)
		.attr('y1', d => d.source.y)
		.attr('x2', d => d.target.x)
		.attr('y2', d => d.target.y);
}
