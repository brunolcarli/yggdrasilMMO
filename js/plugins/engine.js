

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
            Galv.SPAWN.event(event_id, data[i]['positionX'], data[i]['positionY']);
            $gameMap._events[$gameMap._events.length-1].data = data[i];
        }
        catch(err){
            console.log(err);
            continue;
        }
    }
}

function render_map_players(data){
  console.log(data)
  for (i in data){
      let event_id = class_to_event(data[i]['classType']);
      try{
          Galv.SPAWN.event(event_id, data[i]['positionX'], data[i]['positionY']);
          $gameMap._events[$gameMap._events.length-1].data = data[i];
      }
      catch(err){
          console.log(err);
          continue;
      }
  }
}
