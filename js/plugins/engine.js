

function class_to_event(class_type){
  const class2event = {
    'dps': 1,
    'tanker': 2,
    'supporter': 3
  };
  return class2event[class_type];
}

function enemy_to_event(enemy_name){
  const enemy2event = {
    'goblin': 4,
    'spider': 5,
    'wolf': 6
  };
  return enemy2event[enemy_name];
}


function new_player_event_ws(data){
  data['maxHp'] = data.max_hp;
  data['maxSp'] = data.max_sp;
  data['currentHp'] = data.current_hp;
  data['currentSp'] = data.current_sp;

  let event_id = class_to_event(data['classType']);
  let event = Galv.SPAWN.event(event_id, data['x'], data['y'], false, data);

  event._user.battler.addParam(0, data.max_hp-100);
  event._user.battler.setHp(data.current_hp);
  event._user.battler.addParam(1, data.max_sp);
  event._user.battler.setMp(data.current_sp);
  event._user.battler.addParam(2, data.power);
  event._user.battler.addParam(3, data.resistance);
  event._user.battler.addParam(4, data.power);
  event._user.battler.addParam(5, data.resistance);
  event._user.battler.addParam(6, data.agility);
  // event._user.battler._characterName = data.name;
  event._user.battler.refresh();
}


function new_player_event_api(data){
  let event_id = class_to_event(data['classType']);
  data['x'] = data['positionX'];
  data['y'] = data['positionY'];
  let event = Galv.SPAWN.event(event_id, data['x'], data['y'], false, data);
  event._user.battler.addParam(0, data.maxHp-100);
  event._user.battler.setHp(data.currentHp);
  event._user.battler.addParam(1, data.maxSp);
  event._user.battler.setMp(data.currentSp);
  event._user.battler.addParam(2, data.power);
  event._user.battler.addParam(3, data.resistance);
  event._user.battler.addParam(4, data.power);
  event._user.battler.addParam(5, data.resistance);
  event._user.battler.addParam(6, data.agility);
  // event._user.battler.enemy().name = data.name;
  event._user.battler.refresh();

}



function render_map_enemies(data){
  for (i in data){
      let event_id = enemy_to_event(data[i]['name']);
      try{
          Galv.SPAWN.event(event_id, data[i]['positionX'], data[i]['positionY'], false, data[i]);
          // $gameMap._events[$gameMap._events.length-1].data = data[i];
      }
      catch(err){
          console.log(err);
          continue;
      }
  }
}


function render_map_players(data){
  for (i in data){
      // Do not render self player character
      if (data[i]['name'] == logged_char['name'] && data[i]['id'] == logged_char['id']){
        continue;
      }
      try{
          new_player_event_api(data[i])
      }
      catch(err){
          console.log(err);
          continue;
      }
  }
}


async function health_handler(id, class_type, hp, sp){
  const class_type_mapper = {
    'dps': update_character_vital_stats,
    'tanker': update_character_vital_stats,
    'supporter': update_character_vital_stats,
    'enemy': update_enemy_vital_stats,
  };
  await class_type_mapper[class_type](id, hp, sp);
}


function to_title(){
  window.location.href = 'index.html';
}


function respawn_player_character(){
  respawn_mutation(logged_char.id).then(data => {
    let map_id;
    for (i in $dataMapInfos){
      if (!$dataMapInfos[i]){continue;}
      if ($dataMapInfos[i].name == data['areaLocation']){
          map_id = $dataMapInfos[i].id;
          break;
      }
    }
    data['hp'] = data['currentHp'];
    data['sp'] = data['currentSp'];
    data['map_area'] = data['areaLocation'];
    data['x'] = data['positionX'];
    data['y'] = data['positionY'];
    data['is_ko'] = data['isKo'];
    localStorage.setItem('data', JSON.stringify(data));
    $gamePlayer.data = data;
    $gamePlayer.reserveTransfer(map_id, $gamePlayer.data.positionX, $gamePlayer.data.positionY, 2, 0);
    $gameVariables.setValue(52, false);
    query_logged_characters($gamePlayer.data.areaLocation).then(chars_data => { render_map_players(chars_data) });
    spawned_enemy_query($gamePlayer.data.areaLocation).then(enemies_data => { render_map_enemies(enemies_data) });
  });
}


function ko_respawn_message(){
  // set a flag to inform game interpreter that this function is being executed already
  $gameVariables.setValue(52, true);
  Game_Interpreter.prototype.setWaitMode('message');
  $gameMessage.setBackground(1);
  $gameMessage.setPositionType(1);
  $gameMessage.add('You have been Knockouted')
  $gameVariables.setValue(50, ['Respawn at Goddess monument', 'Back to title']);
  $gameMessage.setChoices($gameVariables.value(50), 0, -1);
  $gameMessage.setChoiceCallback(value => {
    // store selected value in game variable
    $gameVariables.setValue(51, value);
    // option_handler[value]();
  });
  Game_Interpreter.prototype.setWaitMode('message');
}
