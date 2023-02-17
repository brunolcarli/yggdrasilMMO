function passwordPrompt(text){
    /*creates a password-prompt instead of a normal prompt*/
    /* first the styling - could be made here or in a css-file. looks very silly now but its just a proof of concept so who cares */
    var width=200;
    var height=400;

    var pwprompt = document.createElement("div"); //creates the div to be used as a prompt
    pwprompt.id= "password_prompt"; //gives the prompt an id - not used in my example but good for styling with css-file
    pwprompt.style.position = "fixed"; //make it fixed as we do not want to move it around
    pwprompt.style.left = ((window.innerWidth / 2) - (width / 2)) + "px"; //let it apear in the middle of the page
    pwprompt.style.top = ((window.innerWidth / 2) - (width / 2)) + "px"; //let it apear in the middle of the page
    pwprompt.style.border = "1px solid black"; //give it a border
    pwprompt.style.padding = "16px"; //give it some space
    pwprompt.style.background = "white"; //give it some background so its not transparent
    pwprompt.style.zIndex = 99999; //put it above everything else - just in case

    // var emailprompt = document.createElement("div"); //creates the div to be used as a prompt
    // emailprompt.id= "email_prompt"; //gives the prompt an id - not used in my example but good for styling with css-file
    // emailprompt.style.position = "fixed"; //make it fixed as we do not want to move it around
    // // pwprompt.style.left = ((window.innerWidth / 2) - (width / 2)) + "px"; //let it apear in the middle of the page
    // // pwprompt.style.top = ((window.innerWidth / 2) - (width / 2)) + "px"; //let it apear in the middle of the page
    // emailprompt.style.border = "1px solid black"; //give it a border
    // emailprompt.style.padding = "16px"; //give it some space
    // emailprompt.style.background = "white"; //give it some background so its not transparent
    // emailprompt.style.zIndex = 99999; //put it above everything else - just in case
    

    var emailtext = document.createElement("div");
    emailtext.innerHTML = 'Email';
    pwprompt.appendChild(emailtext);
    var emailinput = document.createElement("input");
    emailinput.id = "email_id";
    emailinput.type="text";
    pwprompt.appendChild(emailinput);

    var pwtext = document.createElement("div"); //create the div for the password-text
    pwtext.innerHTML = text; //put inside the text
    pwprompt.appendChild(pwtext); //append the text-div to the password-prompt
    var pwinput = document.createElement("input"); //creates the password-input
    pwinput.id = "password_id"; //give it some id - not really used in this example...
    pwinput.type="password"; // makes the input of type password to not show plain-text
    pwprompt.appendChild(pwinput); //append it to password-prompt

    var pwokbutton = document.createElement("button"); //the ok button
    pwokbutton.innerHTML = "ok";
    var pwcancelb = document.createElement("button"); //the cancel-button
    pwcancelb.innerHTML = "cancel";
    pwprompt.appendChild(pwcancelb); //append cancel-button first
    pwprompt.appendChild(pwokbutton); //append the ok-button
    // document.body.appendChild(emailprompt);
    document.body.appendChild(pwprompt); //append the password-prompt so it gets visible
    // pwinput.focus(); //focus on the password-input-field so user does not need to click 
    
    /*now comes the magic: create and return a promise*/
    return new Promise(function(resolve, reject) {
        pwprompt.addEventListener('click', function handleButtonClicks(e) { //lets handle the buttons
          if (e.target.tagName !== 'BUTTON') { return; } //nothing to do - user clicked somewhere else
          pwprompt.removeEventListener('click', handleButtonClicks); //removes eventhandler on cancel or ok
          if (e.target === pwokbutton) { //click on ok-button
            // document.body.removeChild(pwprompt);
            resolve(
                {
                    'email': emailinput.value,
                    'password': pwinput.value
                }
            ); //return the value of the inputs
          } else {
            reject(new Error('User cancelled')); //return an error
            
          }
          document.body.removeChild(pwprompt);  //as we are done clean up by removing the password-prompt
          delete pwprompt;
        });
        // pwinput.addEventListener('keyup',function handleEnter(e){ //users dont like to click on buttons
        //     if(e.keyCode == 13){ //if user enters "enter"-key on password-field
        //         resolve(pwinput.value); //return password-value
        //         document.body.removeChild(pwprompt); //clean up by removing the password-prompt
        //     }else if(e.keyCode==27){ //user enters "Escape" on password-field
        //         document.body.removeChild(pwprompt); //clean up the password-prompt
        //         reject(new Error("User cancelled")); //return an error
        //     }
        // });
    });
    }