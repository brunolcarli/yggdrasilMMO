function send_login_request(){
    var user_email = document.getElementById("email_input").value;
    var pwd = document.getElementById("password_input").value;

    login_mutation(user_email, pwd).then(login_response => {
            if (login_response['data']['logIn']['token']){
                token = login_response['data']['logIn']['token'];
                email = user_email
                user_characters().then(user_characters_response => {
                    username = user_characters_response['username'];
                    user_id = user_characters_response['id'];
                    available_chars = user_characters_response['characters'];

                    // TODO select a character from character selection screen
                    localStorage.setItem('char_id', available_chars[0]['id'])
                    window.location.href = 'index2.html';
    
                    // TODO hardcoded select first character
                    // character_login_mutation(`{id: ${available_chars[0]['id']}}`).then(char_login => {
                    //     char_login['hp'] = char_login['currentHp'];
                    //     char_login['sp'] = char_login['currentSp'];
                    //     char_login['map_area'] = char_login['areaLocation'];
                    //     char_login['x'] = char_login['positionX'];
                    //     char_login['y'] = char_login['positionY'];
                    //     char_login['is_ko'] = char_login['isKo'];
                    //     localStorage.setItem('data', JSON.stringify(char_login));
                    //     logged_char = char_login;
                    //     window.location.href = 'index2.html'
                    // });
                });
            }
        });

    // if (localStorage.getItem('logged') == true){
    //     window.location.href = "pages/character.html";
    // }
}


function send_logout_request(){

    console.log('flag')
    let token = localStorage.getItem('token');
    let char_id = localStorage.getItem('char_id');
    let input_data = `{id: \\\"${char_id}\\\"}`;
    character_logout_mutation(input_data, `JWT ${token}`);
    window.location.href = "../index.html";
}


function sign_up(){
    let newUsername = document.getElementById("newUserName").value;
    let newUserPass = document.getElementById("newUserPassword").value;
    let newUserEmail = document.getElementById("newUserEmail").value;

    if (newUsername == null || newUsername == "", newUserPass == null || newUserPass == "", newUserEmail == null || newUserEmail == "") {
        alert("Please Fill All Required Field");
        return false;
    } else {
        new_user_sign_up(newUsername, newUserPass, newUserEmail).then(data => {
            window.location.href = "../index.html";
        });
    }
}


function send_create_character_request(){
    let token = localStorage.getItem('token');
    let char_name = document.getElementById('char-name-creation').value;
    let char_class = document.getElementById('char-class-select').value;
    let username = localStorage.getItem('username');
    let user_email = localStorage.getItem('email');
    let input_data = `{name: \\\"${char_name}\\\" characterClass: ${char_class} username: \\\"${username}\\\" email: \\\"${user_email}\\\"}`;
    create_char_mutation(input_data, token).then(data => {
        if ('errors' in data){
            alert('An error ocurred');
        } else {
            window.location.href = 'character.html';
        }
    });   
}

function send_attack_request() {
    let token = localStorage.getItem('token');
    let char_name = document.getElementById('char-name-creation').value;
    let username = localStorage.getItem('username');
    let user_email = localStorage.getItem('email');
}