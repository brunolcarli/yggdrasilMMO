

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
    'wolf': 6,
    'poison_snake': 8,
    'killer_fungus': 9,
    'ent': 10,
    'great_fairy': 7,
    'golem': 11,
    'orc': 12,
    'spirit': 13,
    'dagon': 14,
  };
  return enemy2event[enemy_name];
}


function new_player_event_ws(data){
  data['maxHp'] = data.max_hp;
  data['maxSp'] = data.max_sp;
  data['currentHp'] = data.current_hp;
  data['currentSp'] = data.current_sp;

  let event_id = class_to_event(data['classType']);
  try {
    let event = Galv.SPAWN.event(event_id, data['x'], data['y'], false, data);

    event._user.battler.addParam(0, data.max_hp-10);
    event._user.battler.setHp(data.current_hp);
    event._user.battler.addParam(1, data.max_sp);
    event._user.battler.setMp(data.current_sp);
    event._user.battler.addParam(2, data.power);
    event._user.battler.addParam(3, data.resistance);
    event._user.battler.addParam(4, data.power);
    event._user.battler.addParam(5, data.resistance);
    event._user.battler.addParam(6, data.agility);
    event._user.battler.refresh();
  }
  catch(err){
    console.log(err);
  }
}


function new_player_event_api(data){
  let event_id = class_to_event(data['classType']);
  data['x'] = data['positionX'];
  data['y'] = data['positionY'];
  try {
    let event = Galv.SPAWN.event(event_id, data['x'], data['y'], false, data);
    event._user.battler.addParam(0, data.maxHp-10);
    event._user.battler.setHp(data.currentHp);
    event._user.battler.addParam(1, data.maxSp);
    event._user.battler.setMp(data.currentSp);
    event._user.battler.addParam(2, data.power);
    event._user.battler.addParam(3, data.resistance);
    event._user.battler.addParam(4, data.power);
    event._user.battler.addParam(5, data.resistance);
    event._user.battler.addParam(6, data.agility);
    event._user.battler.refresh();
  }
  catch(err){
    console.log(err);
  }
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
    'boss': update_enemy_vital_stats
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


function set_character_equipment(){
  var e = $gamePlayer.data.equipment;
  for (i=1; i<=5; i++){
    $gameParty.leader().changeEquipById(i, e[i-1]._itemId);
  }
  // set learned skills
  for (i in $gamePlayer.data.skills){
    $gameParty.leader().learnSkill($gamePlayer.data.skills[i]);
  }

  // Equip las equipped skill
  if ($gamePlayer.data.equippedSkill){
    $gameParty.leader()._toolSkillId = $gamePlayer.data.equippedSkill;
    $gameParty.leader().setToolSkillID();
  }

  // Equip las equipped item
  if ($gamePlayer.data.equippedItem){
    $gameParty.leader()._toolItemId = $gamePlayer.data.equippedItem;
    $gameParty.leader().setToolItemID();
  }

}


function set_character_items(item_data){
  let items = {};
  let weapons = {};
  let armors = {};
  let data = Object.values(item_data);


  for (i in data){
    if (data[i].data.itypeId != undefined){
      items[data[i].data.id] = data[i].count;
    }
    else if (data[i].data.wtypeId != undefined){
      weapons[data[i].data.id] = data[i].count;
    }
    else if (data[i].data.atypeId != undefined){
      armors[data[i].data.id] = data[i].count;
    }
  }

  $gameParty._items = items;
  $gameParty._weapons = weapons;
  $gameParty._armors = armors;

  set_character_equipment();
}


function skill_acquiring(chosen_skill, ep){
  var skill_acquiring_options = ['Quit shop' ,'Acquire skill'];
  var skill_description = `Description:\n${chosen_skill.description.match(/.{1,55}/g).join('\n')}`;
  var skill_text = `Name: ${chosen_skill.name}\n`;
  skill_text += `SP cost: ${chosen_skill.spCost}\n`;
  skill_text += `EP cost: ${chosen_skill.epCost}\n`;
  skill_text += `EP Available: ${ep}`;
  $gameMessage.add(skill_description);
  $gameMessage.add(skill_text);
  $gameMessage.setChoices(skill_acquiring_options, 0, 0);
  $gameMessage.setChoiceCallback(n => {
    if (n == 1){
      if (ep < chosen_skill.epCost){
        $gameVariables.setValue(64, 1);
      }
      else {
        $gameVariables.setValue(61, 0);
        learn_skill_mutation($gamePlayer.data.id, chosen_skill.skillId).then(data => {
          if (data.errors == undefined){
            $gameVariables.setValue(66, chosen_skill.skillId);
            $gameParty.leader().learnSkill(chosen_skill.skillId);
            $gameVariables.setValue(65, 1);
          }
          else{
            $gameVariables.setValue(61, 0);
            $gameVariables.setValue(62, 0);
            $gameVariables.setValue(63, 0);
            $gameVariables.setValue(64, 0);
            $gameVariables.setValue(65, 0);
          }
        });
      }
    }
    else {
      $gameVariables.setValue(61, 0);
      $gameVariables.setValue(62, 0);
      $gameVariables.setValue(63, 0);
      $gameVariables.setValue(64, 0);
      $gameVariables.setValue(65, 0);
    }
  });
}

function process_skill_shop(){
  query_skill_shop($gamePlayer.data.id).then(data => {
    let char_ep = data['character']['ep'];
    let all_skills = data['skills'];
    let char_skills = [];
    let skill_choices = ['Quit shop'];
    for (let i=0; i<all_skills.length; i++){
      if (all_skills[i].classes.contains($gamePlayer.data.classType)){
        char_skills.push(all_skills[i]);
        skill_choices.push(all_skills[i].name);
      }
    }

    $gameMessage.add('Hello apprentice.\nAre you up to learn some new skill?');
    $gameMessage.add(`Evolution Points (EP): ${char_ep}`);
    $gameMessage.setChoices(skill_choices, 0, 0);
    $gameMessage.setChoiceCallback(n => {
      if (n == 0){return}
      $gameVariables.setValue(61, 1);
      $gameVariables.setValue(62, char_skills[n-1]);
      $gameVariables.setValue(63, char_ep);
    });
  });
}
