

const server_host = "https://yggdrasil.beelzeware.dev/graphql/";


function status(response) {
    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response)
    } else {
        return Promise.reject(new Error(response.statusText))
    }
};

function json(response) {
    return response.json()
};

function get_request_options(payload) {
    return {
        method: 'POST',
        headers: {
            cookie: 'csrftoken=pgrjljBkHdbd9hySxmJaFUlewPM1IdYJ09nZstz9N6bCf8pfuctT4ftl2girhj6t',
            'Content-Type': 'application/json'
        },
        body: payload
    };
};


function login_mutation(email, password) {
    /*
    Request a sign in to the game server. Receives a token to be used
    as session validation on backend requests.
        - Params:
            + email: string;
            + password: string
        - Return: null / undefined
    */
    return fetch(server_host, {
        "method": "POST",
        "headers": {
            "cookie": "csrftoken=9YXcKsPnJSojmIXsjvqlM7TFP0tBfiU8GwVopYDWNKHSQnEUKLnPzJdsCjSb0Cfn",
            "Content-Type": "application/json",
        },
        "body": `
        {\"query\":\"mutation{\\n  logIn(input: {email: \\\"${email}\\\" password: \\\"${password}\\\"}){\\n    token\\n  }\\n}\\n\"}`
    })
        .then(json)
        .then(data => {
            if (data['errors']) {
                alert(data['errors'][0]['message']);
                return
            }
            // localStorage.setItem('logged', true);
            // localStorage.setItem('token', data['data']['logIn']['token']);
            // localStorage.setItem('email', email);
            // window.location.href = "pages/character.html";
            return data;
        })
        .catch(err => {
            console.error(err);
        });
};


function logout_mutation(username) {
    /*
    Request to logout server.
        - Params:
            + username: string;
        - Return: null / undefined
    */
    return fetch(server_host, {
        "method": "POST",
        "headers": {
            "cookie": "csrftoken=9YXcKsPnJSojmIXsjvqlM7TFP0tBfiU8GwVopYDWNKHSQnEUKLnPzJdsCjSb0Cfn",
            "Content-Type": "application/json",
            "Authorization": `JWT ${token}`
        },
        "body": `
        {\"query\":\"mutation{\\n  logOut(input: {username: \\\"${username}\\\"}){\\n    response\\n  }\\n}\\n\"}`
    })
        .then(json)
        .then(data => {
            if (data['data']['logOut']['response']) {
                window.location.href = "../index.html";
            }
        })
        .catch(err => {
            console.error(err);
        });
};


function update_position(player, x, y) {
    /*
    Updates player position on the map.
        - Params:
            + player: string;
            + x: int;            + y: int;
        - Return: null | undefined
    */
    // var token = localStorage.getItem('token');
    var headers = {
        "cookie": "csrftoken=9YXcKsPnJSojmIXsjvqlM7TFP0tBfiU8GwVopYDWNKHSQnEUKLnPzJdsCjSb0Cfn",
        "Content-Type": "application/json",
        // "Authorization": `JWT ${token}`
    };
    return fetch(server_host, {
        "method": "POST",
        "headers": headers,
        "body": `{\"query\":\"mutation { updatePosition(input: { id: \\\"${player}\\\" location: { x: ${x} y: ${y} } }){ character { name positionX positionY } } }\"}`
    })
        .then(json)
        .then(data => {
            return data
        })
        .catch(err => {
            console.error(err);
        });
};


function send_chat_message(player, id, message, chat_zone) {
    /*
    Sends a chat message.
    The chat_zone param on the backend is an enum, so the payload
    of this parameter must be ALL CAPS and without quotation marks
    around ir on the mutation input.
        - Params:
            + player_name: string;
            + message: string;
            + chat_zone: string (ALL CAPS);
        - Return: null | undefined
    */
    var token = localStorage.getItem('token');
    var headers = {
        "cookie": "csrftoken=9YXcKsPnJSojmIXsjvqlM7TFP0tBfiU8GwVopYDWNKHSQnEUKLnPzJdsCjSb0Cfn",
        "Content-Type": "application/json",
        "Authorization": `JWT ${token}`
    };
    return fetch(server_host, {
        "method": "POST",
        "headers": headers,
        "body": `{"query": "mutation SendChatMessage{ sendChatMessage(id: ${id}, text: \\\"${message}\\\", chatroom: \\\"${chat_zone}\\\"){ ok }}"}`
    })
        .then(json)
        .then(data => {
            return data
        })
        .catch(err => {
            console.error(err);
        });
};


function user_characters() {
    // var token = localStorage.getItem('token');
    // let email = localStorage.getItem('email');
    let payload = `{"query":"query {user(email: \\\"${email}\\\"){id username characters{id lv name positionX positionY areaLocation classType} }}"}`;
    return fetch(server_host, {
        "method": "POST",
        "headers": {
            "cookie": "csrftoken=ctJzx1RBM4kTPkPWGpZsBIf3EUY8gr0Td2C4OCeWCsslpyXLYCLpjQGYRlxSfFZP",
            "Content-Type": "application/json",
            // "Authorization": `JWT ${token}`
        },
        "body": payload
    })
        .then(json)
        .then(data => {
            data = data['data']['user'];
            return data;
        })
        .catch(err => {
            console.error(err);
        });
};


function character_login_mutation(input_data, authorization) {
    const query = `characterLogin(input: ${input_data})`;
    const payload = `{"query": "mutation charLogin{${query}{character { id lv name maxHp maxSp currentHp currentSp power resistance agility isKo areaLocation classType positionX positionY skills{ name } }}}"}`;

    var options = get_request_options(payload);
    // options['headers']['Authorization'] = authorization;
    return fetch(server_host, options)
        .then(json)
        .then(data => {
            data = data['data']['characterLogin']['character'];
            return data;
        })
        .catch(err => {
            console.error(err);
        });
};


function character_logout_mutation(input_data, authorization) {
    const query = `characterLogout(input: ${input_data})`;
    const payload = `{"query": "mutation charLogout{${query}{logStatus}}"}`;
    var options = get_request_options(payload);
    options['headers']['Authorization'] = authorization;
    return fetch(server_host, options)
        .then(json)
        .then(response => {
            return response['data'];
        })
        .catch(err => {
            console.error(err);
        });
};


function new_user_sign_up(username, password, email) {
    var payload = `{"query":"mutation{signUp(input: {username: \\\"${username}\\\" password: \\\"${password}\\\" email: \\\"${email}\\\"}){user {username}}}"}`;
    return fetch(server_host, {
        "method": "POST",
        "headers": {
            "cookie": "csrftoken=9YXcKsPnJSojmIXsjvqlM7TFP0tBfiU8GwVopYDWNKHSQnEUKLnPzJdsCjSb0Cfn",
            "Content-Type": "application/json",
        },
        "body": payload
    })
        .then(json)
        .then(data => {
            alert("Username registered!!!");
            return data;
            // window.location.href = "pages/character.html";
        })
        .catch(err => {
            console.error(err);
        });
};


function query_logged_characters(area_location) {
    const payload = `{"query": "query characters{ characters(isLogged: true areaLocation: \\\"${area_location}\\\"){id lv maxHp currentHp maxSp currentSp name positionX positionY isLogged classType isKo  power resistance agility }} "}`;
    var options = get_request_options(payload);
    // options['headers']['Authorization'] = 'JWT ' + localStorage.getItem('token');
    return fetch(server_host, options)
        .then(json)
        .then(response => {
            return response['data']['characters'];
        })
        .catch(err => {
            console.error(err);
        });
};


function create_char_mutation(input_data, token) {
    const payload = `{"query": "mutation create_character{createCharacter(input:${input_data}){character{name}}}"}`;
    var options = get_request_options(payload);
    options['headers']['Authorization'] = 'JWT ' + token;
    return fetch(server_host, options)
        .then(json)
        .then(response => {
            return response['data'];
        })
        .catch(err => {
            console.error(err);
        });
};


function map_area_data_query(area_location) {
    const payload = `{"query": "query map_data{mapArea(name: \\\"${area_location}\\\"){name sizeX sizeY connections}}"}`;
    var options = get_request_options(payload);
    // options['headers']['Authorization'] = 'JWT ' + token;
    return fetch(server_host, options)
        .then(json)
        .then(response => {
            return response['data'];
        })
        .catch(err => {
            console.error(err);
        });
}


function getSkill(id, token) {
    const payload = `{"query": "query{ character(id: ${id}) {skills {name spCost power range effect { duration value condition} description classes}}}"}`;
    var options = get_request_options(payload);
    // options['headers']['Authorization'] = 'JWT' + token;
    return fetch(server_host, options)
        .then(json)
        .then(response => {
            return response['data'];
        })
        .catch(err => {
            console.error(err);
        });
};


function spawned_enemy_query(area_location) {
    const payload = `{"query": "query{enemiesSpawned(areaLocation: \\\"${area_location}\\\") { id lv name maxHp currentHp classType positionX positionY isKo areaLocation }}"}`;
    var options = get_request_options(payload);
    // options['headers']['Authorization'] = 'JWT' + token;
    return fetch(server_host, options)
        .then(json)
        .then(response => {
            return response['data']['enemiesSpawned'];
        })
        .catch(err => {
            console.error(err);
        });
};


function character_use_skill_mutation(input_data){
    const payload = `{"query": "mutation {characterUseSkill(input:{${input_data}}){result}}"}`;
    var options = get_request_options(payload);
    return fetch(server_host, options)
        .then(json)
        .then(response => {
            return response['data'];
        })
        .catch(err => {
            console.error(err);
    });
}


function query_character(character_id){
    let payload = `{"query": "query { character(id: ${character_id}){ maxHp maxSp currentHp currentSp isKo} }"}`;
    var options = get_request_options(payload);
    return fetch(server_host, options)
        .then(json)
        .then(response => {
            // data = data['data']['character'];
            return response['data'];
        })
        .catch(err => {
            console.error(err);
    });
}


function respawn_mutation(character_id){
    let payload = `{"query": "mutation { characterRespawn(input: {id: ${character_id}}){character {id name isKo maxHp maxSp currentHp currentSp areaLocation classType positionX positionY}} }"}`;
    var options = get_request_options(payload);
    return fetch(server_host, options)
        .then(json)
        .then(response => {
            data = response['data']['characterRespawn']['character'];
            return data
        })
        .catch(err => {
            console.error(err);
    });
}


function character_area_transfer_mutation(input_data){
    let payload = `{"query": "mutation { characterMapAreaTransfer(input: ${input_data}){ character { id areaLocation positionX positionY mapMetadata{ name sizeX sizeY } } } }"}`;
    var options = get_request_options(payload);
    return fetch(server_host, options)
        .then(json)
        .then(response => {
            data = response['data']['characterMapAreaTransfer']['character'];
            return data
        })
        .catch(err => {
            console.error(err);
    });
}


function update_enemy_position(enemy_id, x, y) {
    // var token = localStorage.getItem('token');
    var headers = {
        "cookie": "csrftoken=9YXcKsPnJSojmIXsjvqlM7TFP0tBfiU8GwVopYDWNKHSQnEUKLnPzJdsCjSb0Cfn",
        "Content-Type": "application/json",
        // "Authorization": `JWT ${token}`
    };
    return fetch(server_host, {
        "method": "POST",
        "headers": headers,
        "body": `{\"query\":\"mutation enemy_move { updateEnemyPosition(input:{ id: ${enemy_id} location: { x: ${x} y: ${y} } }){ enemy{ id name positionX positionY} } }\"}`
    })
        .then(json)
        .then(data => {
            return data;
        })
        .catch(err => {
            console.error(err);
        });
};


function update_enemy_vital_stats(enemy_id, hp, sp) {
    // var token = localStorage.getItem('token');
    var headers = {
        "cookie": "csrftoken=9YXcKsPnJSojmIXsjvqlM7TFP0tBfiU8GwVopYDWNKHSQnEUKLnPzJdsCjSb0Cfn",
        "Content-Type": "application/json",
        // "Authorization": `JWT ${token}`
    };
    return fetch(server_host, {
        "method": "POST",
        "headers": headers,
        "body": `{\"query\":\"mutation enemy_health { updateEnemyVitalStats(input:{ id: ${enemy_id} hp: ${hp} sp: ${sp} }){ enemy{ id name maxHp currentHp areaLocation isKo} } }\"}`
    })
        .then(json)
        .then(data => {
            return data;
        })
        .catch(err => {
            console.error(err);
        });
};


function update_character_vital_stats(character_id, hp, sp) {
    // var token = localStorage.getItem('token');
    var headers = {
        "cookie": "csrftoken=9YXcKsPnJSojmIXsjvqlM7TFP0tBfiU8GwVopYDWNKHSQnEUKLnPzJdsCjSb0Cfn",
        "Content-Type": "application/json",
        // "Authorization": `JWT ${token}`
    };
    return fetch(server_host, {
        "method": "POST",
        "headers": headers,
        "body": `{\"query\":\"mutation character_health { updateCharacterVitalStats(input:{ id: ${character_id} hp: ${hp} sp: ${sp} }){ character{ id name maxHp currentHp maxSp currentSp areaLocation isKo} } }\"}`
    })
    .then(json)
    .then(data => {
        return data;
    })
    .catch(err => {
        console.error(err);
    });
};


function set_character_respawn_spot_mutation(character_id, spot_name){
    // var token = localStorage.getItem('token');
    var headers = {
        "cookie": "csrftoken=9YXcKsPnJSojmIXsjvqlM7TFP0tBfiU8GwVopYDWNKHSQnEUKLnPzJdsCjSb0Cfn",
        "Content-Type": "application/json",
        // "Authorization": `JWT ${token}`
    };
    let payload = `{\"query\":\"mutation character_respawn_spot { setCharacterRespawnSpot(input:{ id: ${character_id} spot: \\\"${spot_name}\\\" }){ character{ id name maxHp currentHp maxSp currentSp areaLocation isKo} } }\"}`
    return fetch(server_host, {
        "method": "POST",
        "headers": headers,
        "body": payload
    })
    .then(json)
    .then(data => {
        return data;
    })
    .catch(err => {
        console.error(err);
    });
};

