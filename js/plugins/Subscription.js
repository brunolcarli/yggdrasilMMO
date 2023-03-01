var webSocket;


///////////////////////////////////////
//         EVENT HANDLER            //
/////////////////////////////////////
function onCharacterEvent(data) {
  /*+++++++++++++++++++++++++++++++++++++++++++++++
  +
  + Receive content related data related
  + to character/enemies events from
  + websocket messages.
  +
  + Each event has a particular handler.
  + This function maps the received data
  + to the respective handler which process
  + the data to update ingame events at THIS
  + specific client.
  +
  + @param [data] -> Object
  +   data content must contains two keys inside a
  +   root path ['onCharacterEvent']['characterEvent']:
  +
  +      - ['eventType']: (String):
  +        • Indicates the event type, this is the
  +          key which the handler will call the 
  +          right function to process the event.
  +
  +      - ['data']: (Object):
  +        • contains the payload data sent by
  +          the server describing the event acton
  +          ocurred from another connected client(s).
  +
  + return type: void
  +
  +++++++++++++++++++++++++++++++++++++++++++++++++++*/
  let valid_events = {
    'character_movement': onCharacterMovement,
    'character_login': onCharacterLogIn,
    // 'character_logout': onCharacterLogout,
    'enemy_spawn': onEnemySpawn,
    'enemy_movement': onEnemyMovement,
    'character_health': onCharacterHealth,
    'enemy_health': onEnemyHealth,
    'area_transfer': onAreaTransfer,
    'use_skill': onUseSkill,
    // 'character_use_skill': onCharacterUseSkill,
    // 'target_damaged': onTargetDamaged,
    // 'target_knockout': onTargetKnockout,
    // 'character_exp_gain': onExpUp

  }
  let event_type = data['onCharacterEvent']['characterEvent']['eventType'];
  let event_data = data['onCharacterEvent']['characterEvent']['data'];
  if (event_type in valid_events) {
    valid_events[event_type](event_data);
  }
}


///////////////////////////////////////
//         PLAYER EVENTS            //
/////////////////////////////////////
function onCharacterHealth(data){
  // TODO
  console.log(data)
}


function onUseSkill(data){
  // Avoid re-rendering self player action and action of players in another map scene
  if (
    data.map_area != $gamePlayer.data.map_area
                  ||
    (data.name == $gamePlayer.data.name && data.id == $gamePlayer.data.id)
  ){return;}

  // Select event that used the skill
  let event;
  for (i in $gameMap._events){
    if ($gameMap._events[i].data == undefined){
      continue;
    }
    if ($gameMap._events[i].data['id'] == data['id'] && $gameMap._events[i].data['name'] == data['name']) {
      event = $gameMap._events[i];
      break;
    }
  }

  if (event == undefined){return;}

  event.setDirection(ata.direction);
  event.act(data.skill_id);

}


function onAreaTransfer(data){
  /*+++++++++++++++++++++++++++++++++++++++++++++++
  +
  + Handles players character scene map area transfer.
  + When a player transfer from a scene to another, the
  + corresponding event sprite should be unspawned from
  + the scene map the character moved from, and rendered
  + in the scene map the character is now registered.
  + 
  +
  + @param [data]: (Object)
  +
  + return type: void
  +
  +++++++++++++++++++++++++++++++++++++++++++++++*/
  // Avoid process self client
  if (data['id'] == logged_char.id){return;}

  // Check if is a new player entering scene
  if (data['to_area'] == $gameMap.displayName()){
    let event_id = class_to_event(data['classType']);
    data['currentHp'] = data['current_hp'];
    data['maxHp'] = data['max_hp'];
    data['map_area'] = data['to_area'];
    Galv.SPAWN.event(event_id, data['x'], data['y'], false, data);
    return;
  }

  let event;
  // Otherwise check if is a player leaving this scene
  if (data['from_map'] == $gameMap.displayName()){
    // Search event
    for (i in $gameMap._events){
      if ($gameMap._events[i].data == undefined){continue;}

      if (
          $gameMap._events[i].data['id'] == data['id']
                            &&
          $gameMap._events[i].data['name'] == data['name']
                            &&
          data['classType'] != 'enemy'
      ) {
        event = $gameMap._events[i];
        break;
      }
    }
  
    // no event found here for this data, so do nothing.
    if (event == undefined){return;}

    // otherwise remove event from scene
    try{
      Galv.SPAWN.unspawn(event);
      delete $gameMap._events[i];
      return;
    }
    catch(err){console.log(err)}

  }

  // Otherwise do nothig because the event is not related to this client
  return;

}


function onCharacterMovement(data){
  /*+++++++++++++++++++++++++++++++++++++++++++++++
  +
  + Handles another player movements on a map scene.
  + The player movement is a xy coordinate update,
  + this function uses the received xy to update 
  + the event xy position corresponding to a player
  + in the current map THIS client is viewing, making
  + the sprite binded to the received event id move
  + around the scene until it reaches the received
  + position
  +
  + @param [data]: (Object)
  +
  + return type: void
  +
  +++++++++++++++++++++++++++++++++++++++++++++++*/
  let event;
  for (i in $gameMap._events){
    if ($gameMap._events[i].data == undefined){
      continue;
    }
    if ($gameMap._events[i].data['id'] == data['id'] && $gameMap._events[i].data['name'] == data['name']) {
      event = $gameMap._events[i];
      break;
    }
  }

  if (event == undefined){
    return;
  }
  for (let i=0; i < 10; i++){
    try{
      setTimeout(() => {
        event.moveStraight(event.findDirectionTo(data['x'], data['y']));
      },  i * 120);
      if (event._x == data['x'] && event._y == data['y']){break;}
    }
    catch(err){break;}
  }
}


function onCharacterLogIn(data){
  /*+++++++++++++++++++++++++++++++++++++++++++++++
  +
  + Handles another player character login.
  + If player event was spawned on the current
  + scenary THIS client is viewing, the spawned
  + player event sprite is rendered on the scene.
  +
  + @param [data]: (Object)
  +
  + return type: void
  +
  +++++++++++++++++++++++++++++++++++++++++++++++*/
  for (i in $gameMap._events){
    try{
      if(
         $gameMap._events[i].data['name'] == data['name']
                          &&
         $gameMap._events[i].data['id'] == data['id']
                          &&
         data['classType'] != 'enemy'
        ){
        // avoid re-rendering an aready logged player
        return;
      }
    }
    catch(err){continue;}
  }
  let event_id = class_to_event(data['classType']);
  data['currentHp'] = data['current_hp'];
  data['maxHp'] = data['max_hp'];
  Galv.SPAWN.event(event_id, data['x'], data['y'], false, data);
}


///////////////////////////////////////
//           ENEMY EVENTS           //
/////////////////////////////////////
function onEnemySpawn(data){
  /*+++++++++++++++++++++++++++++++++++++++++++++++
  +
  + Handles a spawned monster in a map scene.
  + If the scene map area the enemy was spawned
  + corresponds to THIS client current scene, the enemy
  + is rendered in the scene.
  + 
  + The enemy spawning is controlled by the server.
  +
  + @param [data]: (Object)
  +
  + return type: void
  +
  +++++++++++++++++++++++++++++++++++++++++++++++*/
  if (data['area'] != $gamePlayer.data['map_area']){
    return;
  }
  let event_id = enemy_to_event(data['enemy_name']);
  data['currentHp'] = data['current_hp'];
  Galv.SPAWN.event(event_id, data['position_x'], data['position_y'], false, data);
}


function onEnemyMovement(data){
  /*+++++++++++++++++++++++++++++++++++++++++++++++
  +
  + Handles an enemy movement in a scene map.
  + If the scene map corresponds to THIS client
  + current scene map area, the enemy position
  + is updated, making the enemy sprite move to
  + the received xy position.
  +
  + @param [data]: (Object)
  +
  + return type: void
  +
  +++++++++++++++++++++++++++++++++++++++++++++++*/
  if (data['map_area'] != $gamePlayer.data['map_area']){
    return;
  }
  let event;
  for (i in $gameMap._events){
    if ($gameMap._events[i].data == undefined){
      continue;
    }
    if ($gameMap._events[i].data['id'] == data['id'] && $gameMap._events[i].data['name'] == data['name']) {
      event = $gameMap._events[i];
      break;
    }
  }
  if (event == undefined){
    return;
  }

  for (let i=0; i < 10; i++){
    try{
      setTimeout(() => {
        event.moveStraight(event.findDirectionTo(data['x'], data['y']));
      },  i * 120);
      if (event._x == data['x'] && event._y == data['y']){break;}
    }
    catch(err){break;}
  }
}


function onEnemyHealth(data){
  /*+++++++++++++++++++++++++++++++++++++++++++++++
  +
  + Updates the HP of a nemy existing in the current
  + scene map area THIS client is viewing.
  + 
  + This event occurs when another client player causes
  + HP damage to a enemy or when a enemy monster heals
  + himself.
  +
  + This handler is also responsible for the unspaw of
  + the enemy sprite in case the enemy is knockouted.
  +
  + @param [data]: (Object)
  +
  + return type: void
  +
  +++++++++++++++++++++++++++++++++++++++++++++++*/
  let event;
  for (i in $gameMap._events){
    if ($gameMap._events[i].data == undefined){
      continue;
    }
    if ($gameMap._events[i].data['id'] == data['id'] && $gameMap._events[i].data['name'] == data['name']) {
      event = $gameMap._events[i];
      break;
    }
  }
  if (event == undefined){
    return;
  }

  event._user.battler._hp = data['hp'];
  if (data['is_ko'] == true){
    try{
      Galv.SPAWN.unspawn(event);
      delete $gameMap._events[i];
    }
    catch(err){}
  }
  
}


///////////////////////////////////////
//       WEBSOCKET CONNECTION       //
/////////////////////////////////////
function subscribe(){
  const client_id = 'client__' + Math.random().toString(16).substr(2, 8);
  const GQL = {
    CONNECTION_INIT: 'connection_init',
    CONNECTION_ACK: 'connection_ack',
    CONNECTION_ERROR: 'connection_error',
    CONNECTION_KEEP_ALIVE: 'ka',
    START: 'start',
    STOP: 'stop',
    CONNECTION_TERMINATE: 'connection_terminate',
    DATA: 'data',
    ERROR: 'error',
    COMPLETE: 'complete'
  };
  const valid_operations = {
    'onCharacterEvent': onCharacterEvent,
    // 'onNewChatMessage': onNewChatMessage
  };

  console.log('Connecting to broadcaster...');
  webSocket = new WebSocket("wss://yggdrasil.beelzeware.dev/subscriptions/", "graphql-ws");
  webSocket.onmessage = function (event) {
    data = JSON.parse(event.data);
    operation = Object.keys(data['payload']['data'])[0];
    if (operation in valid_operations) {
      valid_operations[operation](data['payload']['data']);
    }
  };

  webSocket.onopen = function () {
    console.log('Connected.');
    // Subscribe to channels
    console.log('Subscribing to channels...');
    webSocket.send(JSON.stringify({
      type: GQL.START,
      id: `${client_id}__character_event`,
      payload: { "query": `subscription chevt{ onCharacterEvent{ characterEvent{ eventType data } }}` }
    }));
    console.log('Subscribed to character events channel');
    console.log('Subscriptions completed!');
  };
}
