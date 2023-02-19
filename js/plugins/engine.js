

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
      let event_id = class_to_event(data[i]['classType']);
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


async function health_handler(id, class_type, hp, sp){
  const class_type_mapper = {
    'dps': update_character_vital_stats,
    'tanker': update_character_vital_stats,
    'supporter': update_character_vital_stats,
    'enemy': update_enemy_vital_stats,
  };
  await class_type_mapper[class_type](id, hp, sp);
}
