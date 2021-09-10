var twilioDemo = twilioDemo || {};

twilioDemo.chat = twilioDemo.chat || {
    username: '',
    client: '',
    selectedConversation: '',
    selectedConvSid: ''
};

twilioDemo.chat.initClient = async () => {
    try {
        twilioDemo.chat.username = localStorage.getItem('twilioChatUsername');
        const token = localStorage.getItem('twilioChatToken');

        if (twilioDemo.chat.username && token) {
            twilioDemo.chat.client = await Twilio.Conversations.Client.create(token);

            let conversations = await twilioDemo.chat.client.getSubscribedConversations();

            let conversationCont, conversationName;

            const sideNav = document.getElementById('side-nav');
            sideNav.removeChild(document.getElementById('loading-msg'));

            for (let conv of conversations.items) {
                conversationCont = document.createElement('button');
                conversationCont.classList.add('conversation');
                conversationCont.id = conv.sid;
                conversationCont.value = conv.sid;
                conversationCont.onclick = async () => {
                    await twilioDemo.chat.setConversation(conv.sid, conv.channelState.friendlyName);
                };

                conversationName = document.createElement('h3');
                conversationName.innerHTML = `💬 ${conv.channelState.friendlyName}`;

                conversationCont.appendChild(conversationName);
                sideNav.appendChild(conversationCont);
            }
        } else {
            throw 'No token or username set';
        }

    }
    catch (err) {
        location.href = '/pages/error.html';
    }
};

twilioDemo.chat.sendMessage = () => {
    let submitBtn = document.getElementById('submitMessage');
    submitBtn.disabled = true;

    let messageForm = document.getElementById('message-input');
    let messageData = new FormData(messageForm);

    const msg = messageData.get('chat-message');

    twilioDemo.chat.selectedConversation.sendMessage(msg)
        .then(() => {
            document.getElementById('chat-message').value = '';
            submitBtn.disabled = false;
        })
        .catch(() => {
            twilioDemo.chat.showError('sending your message');
            submitBtn.disabled = false;
        });
};

twilioDemo.chat.setConversation = async (sid, name) => {
    try {
        twilioDemo.chat.selectedConvSid = sid;

        document.getElementById('chat-title').innerHTML = '+ ' + name;

        document.getElementById('loading-chat').style.display = 'flex';
        document.getElementById('messages').style.display = 'none';

        let submitButton = document.getElementById('submitMessage')
        submitButton.disabled = true;

        let inviteButton = document.getElementById('invite-button')
        inviteButton.disabled = true;

        twilioDemo.chat.selectedConversation = await twilioDemo.chat.client.getConversationBySid(twilioDemo.chat.selectedConvSid);

        const messages = await twilioDemo.chat.selectedConversation.getMessages();

        twilioDemo.chat.addMessagesToChatArea(messages.items, true);

        twilioDemo.chat.selectedConversation.on('messageAdded', msg => twilioDemo.chat.addMessagesToChatArea([msg], false));

        submitButton.disabled = false;
        inviteButton.disabled = false;
    } catch {
        showError('loading the conversation you selected');
    }
};

twilioDemo.chat.addMessagesToChatArea = (messages, clearMessages) => {
    let cont, msgCont, msgAuthor, timestamp;

    const chatArea = document.getElementById('messages');

    if (clearMessages) {
        document.getElementById('loading-chat').style.display = 'none';
        chatArea.style.display = 'flex';
        chatArea.replaceChildren();
    }

    for (const msg of messages) {
        cont = document.createElement('div');
        if (msg.state.author == twilioDemo.chat.username) {
            cont.classList.add('right-message');
        } else {
            cont.classList.add('left-message');
        }

        msgCont = document.createElement('div');
        msgCont.classList.add('message');

        msgAuthor = document.createElement('p');
        msgAuthor.classList.add('username');
        msgAuthor.innerHTML = msg.state.author;

        timestamp = document.createElement('p');
        timestamp.classList.add('timestamp');
        timestamp.innerHTML = msg.state.timestamp;

        msgCont.appendChild(msgAuthor);
        msgCont.innerHTML += msg.state.body;

        cont.appendChild(msgCont);
        cont.appendChild(timestamp);

        chatArea.appendChild(cont);
    }

    chatArea.scrollTop = chatArea.scrollHeight;
};

twilioDemo.chat.inviteFriend = async () => {
    try {
        const link = `http://localhost:3000/pages/login.html?sid=${twilioDemo.chat.selectedConvSid}`;

        await navigator.clipboard.writeText(link);

        alert(`The link below has been copied to your clipboard.\n\n${link}\n\nYou can invite a friend to chat by sending it to them.`);
    } catch {
        twilioDemo.chat.showError('preparing your chat invite');
    }
};

twilioDemo.chat.hideError = () => {
    document.getElementById('error-message').style.display = 'none';
};

twilioDemo.chat.showError = (msg) => {
    document.getElementById('error-message').style.display = 'flex';
    document.getElementById('error-text').innerHTML = `There was a problem ${msg ? msg : 'fulfilling your request'}.`;
};

twilioDemo.chat.initClient();