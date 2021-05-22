// Box2D lib
var b2Vec2 = Box2D.Common.Math.b2Vec2
    ,   b2AABB = Box2D.Collision.b2AABB
    ,   b2BodyDef = Box2D.Dynamics.b2BodyDef
    ,   b2Body = Box2D.Dynamics.b2Body
    ,   b2FixtureDef = Box2D.Dynamics.b2FixtureDef
    ,   b2Fixture = Box2D.Dynamics.b2Fixture
    ,   b2World = Box2D.Dynamics.b2World
    ,   b2Shape = Box2D.Collision.Shapes.b2Shape
    ,   b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
    ,   b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
    ,   b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
    ,   b2EdgeShape = Box2D.Collision.Shapes.b2EdgeShape
    ,   b2DebugDraw = Box2D.Dynamics.b2DebugDraw
    ,   b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
    ,   b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef
    ,   b2Joint = Box2D.Dynamics.Joints.b2Joint
    ,   b2PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef
    ,   b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef
    ,   b2PulleyJointDef = Box2D.Dynamics.Joints.b2PulleyJointDef
    ,   b2GearJointDef = Box2D.Dynamics.Joints.b2GearJointDef
    ;

var scale = 100; // 1 meter = 100 pixels
var gravity;
var world;
var doSleep = true;

var bodyType = {
    box: 0,
    circle: 1,
    edge: 2
}

// aux function for creating boxes
function CreateBox(world, x, y, width, height, options)
{
    // default values
    options = AsignDefaultValues(options);

    // Fixture: define physics properties (density, friction, restitution)
    let fix_def = CreateFixtureDefinition(options);

    // Shape: 2d geometry (circle or polygon)
    fix_def.shape = new b2PolygonShape();
    fix_def.shape.SetAsBox(width, height);

    // Body: position of the object and its type (dynamic, static o kinetic)
	let body = CreateBody(world, x, y, options, fix_def);

    return body;
}

// aux function for creating balls
function CreateBall(world, x, y, radius, options)
{
    // default values
    options = AsignDefaultValues(options);

    // Fixture: define physics properties (density, friction, restitution)
    let fix_def = CreateFixtureDefinition(options);

    // Shape: 2d geometry (circle or polygon)
    fix_def.shape = new b2CircleShape(radius);

    // Body: position of the object and its type (dynamic, static o kinetic)
    let body = CreateBody(world, x, y, options, fix_def);

    return body;
}

function CreateEdge(world, x, y, p1x, p1y, p2x, p2y, options)
{
    // default values
    options = AsignDefaultValues(options);

    // Fixture: define physics properties (density, friction, restitution)
    let fix_def = CreateFixtureDefinition(options);

    // Shape: 2d geometry
    fix_def.shape = new b2PolygonShape();
    fix_def.shape.SetAsEdge(new b2Vec2(p1x, p1y), new b2Vec2(p2x, p2y));

    // Body: position of the object and its type (dynamic, static o kinetic)
	let body = CreateBody(world, x, y, options, fix_def);

    return body;
}

function CreatePolygon(world, x, y, vertices, options)
{
    // default values
    options = AsignDefaultValues(options);

    // Body: position of the object and its type (dynamic, static o kinetic)
    var body_def = new b2BodyDef();
    body_def.position.Set(x, y);

    body_def.linearDamping = options.linearDamping;
    body_def.angularDamping = options.angularDamping;

    body_def.type = options.type;
    body_def.userData = options.user_data;

    var body = world.CreateBody(body_def);
    
    for (let i = 0; i < vertices.length - 1; i++)
    {
        let fix_def = new b2FixtureDef();
    
        fix_def.density = options.density;
        fix_def.friction = options.friction;
        fix_def.restitution = options.restitution;
    
        // Shape: 2d geometry
        // b2EdgeShape is not implemented in box2d.js
        // https://stackoverflow.com/questions/26335389/box2dweb-b2edgeshape
        fix_def.shape = new b2PolygonShape();
        fix_def.shape.SetAsEdge(vertices[i], vertices[i + 1]);

        body.CreateFixture(fix_def);
    }
    // close the path
    var fix_def = new b2FixtureDef();
    
    fix_def.density = options.density;
    fix_def.friction = options.friction;
    fix_def.restitution = options.restitution;
    
    fix_def.shape = new b2PolygonShape();
    fix_def.shape.SetAsEdge(vertices[vertices.length - 1], vertices[0]);

    body.CreateFixture(fix_def);

    return body;
}

function CreatePolygonBody(world, x, y, vertices, options)
{
    // default values
    options = AsignDefaultValues(options);

    // Fixture: define physics properties (density, friction, restitution)
    var fix_def = new b2FixtureDef();

    fix_def.density = options.density;
    fix_def.friction = options.friction;
    fix_def.restitution = options.restitution;

    // Shape: 2d geometry
    fix_def.shape = new b2PolygonShape();

    fix_def.shape.SetAsVector(vertices);

    // Body: position of the object and its type (dynamic, static o kinetic)
    var body_def = new b2BodyDef();
    body_def.position.Set(x, y);

    body_def.linearDamping = options.linearDamping;
    body_def.angularDamping = options.angularDamping;

    body_def.type = options.type; // b2_dynamicBody
    body_def.userData = options.user_data;

    var b = world.CreateBody(body_def);
    var f = b.CreateFixture(fix_def);

    return b;
}

function AsignDefaultValues(options)
{
    // default values
    let defaultOptions = {
    	density : 1.0,
    	friction: 1.0,
    	restitution : 0.5,
    	isSensor: false,
 
    	linearDamping : 0.0,
    	angularDamping: 0.1,
    	fixedRotation : false,
 
    	type : b2Body.b2_dynamicBody
    }
    return Object.assign(defaultOptions, options);
}

function CreateFixtureDefinition(options)
{
    // Fixture: define physics properties (density, friction, restitution)
    let fix_def = new b2FixtureDef();
    
    fix_def.density = options.density;
    fix_def.friction = options.friction;
    fix_def.restitution = options.restitution;
    fix_def.isSensor = options.isSensor;

    return fix_def;
}

function CreateBodyDefinition(options, x, y)
{
    let body_def = new b2BodyDef();
	body_def.position.Set(x, y);
 
	body_def.linearDamping = options.linearDamping;
	body_def.angularDamping = options.angularDamping;
 
	body_def.type = options.type;
    body_def.fixedRotation = options.fixedRotation;
	body_def.userData = options.userData;

    return body_def;
}

function CreateBody(world, x, y, options, fix_def)
{
    // Body: position of the object and its type (dynamic, static o kinetic)
	let body_def = CreateBodyDefinition(options, x, y);

    let body = world.CreateBody(body_def);
    body.CreateFixture(fix_def);

    return body;
}

function CreateWorld(ctx)
{
    gravity = new b2Vec2(0, -10);
    world = new b2World(gravity, doSleep);

    // DebugDraw is used to create the drawing with physics
    let debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(ctx);
    debugDraw.SetDrawScale(scale);
    debugDraw.SetFillAlpha(0.5);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);

    world.SetDebugDraw(debugDraw);

    return world;
}

function DrawWorldDebug(ctx)
{
    // Transform the canvas coordinates to cartesian coordinates
    ctx.save();
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);
    world.DrawDebugData();
    ctx.restore();
}

function SetupPhysics()
{
    // prepare the collision event function
    Box2D.Dynamics.b2ContactListener.prototype.BeginContact = OnContactDetected;
}

function OnContactDetected(contact)
{
    //console.log(contact);
    let userDataA = contact.GetFixtureA().GetBody().GetUserData();
    let userDataB = contact.GetFixtureB().GetBody().GetUserData();

    if (userDataA != null && userDataB != null)
    {
        console.log("collision between " + userDataA + " and " + userDataB);
        if (userDataA === "launcher" && userDataB === "ball" ||
            userDataA === "ball" && userDataB === "launcher")
        {
            game.launchBall = true;
        }
        else if (userDataA === "gutter" && userDataB === "ball" ||
        userDataA === "ball" && userDataB === "gutter")
        {
            game.resetBall = true;
        }
    }
}

function RayCastCollision(fixture, point, outputNormal, fraction)
{
    let body = fixture.GetBody();
    if (body != null)
    {
        let userData = body.GetUserData();
        if (userData != null)
        {
            console.log("Ray collision in " + userData.type +
                ", point: {x:" + point.x + ", y:" + point.y + "}" +
                ", vector: {x:" + outputNormal.x + ", y:" + outputNormal.y + "}");
        }
    }

    return fraction;
}
