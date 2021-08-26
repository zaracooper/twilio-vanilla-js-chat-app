window.twilioChat = window.twilioChat || {};

async function initClient() {
    try {
        const response = await axios.request({
            url: '/auth/token',
            baseURL: 'http://localhost:8000',
            method: 'get',
            withCredentials: true
        });

        window.twilioChat.username = response.data.username;
        window.twilioChat.client = await Twilio.Conversations.Client.create(response.data.token);

        let conversations = await window.twilioChat.client.getSubscribedConversations();

        let conversationCont, conversationName;

        const sideNav = document.getElementById('side-nav');
        sideNav.removeChild(document.getElementById('loading-msg'));

        for (let conv of conversations.items) {
            conversationCont = document.createElement('button');
            conversationCont.classList.add('conversation');
            conversationCont.id = conv.sid;
            conversationCont.value = conv.sid;
            conversationCont.onclick = async () => {
                await setConversation(conv.sid, conv.channelState.friendlyName);
            };

            conversationName = document.createElement('h3');
            conversationName.innerHTML = conv.channelState.friendlyName;

            conversationCont.appendChild(conversationName);
            sideNav.appendChild(conversationCont);
        }
    }
    catch {
        location.href = '/pages/conversation.html';
    }
};

async function sendMessage() {
    let messageForm = document.getElementById('message-input');
    let messageData = new FormData(messageForm);

    const msg = messageData.get('chat-message');

    await window.twilioChat.selectedConversation.sendMessage(msg).then(() => {
        document.getElementById('chat-message').value = '';
    });
};

async function setConversation(sid, name) {
    window.twilioChat.selectedConvSid = sid;
    document.getElementById('chat-title').innerHTML = '+ ' + name;

    document.getElementById('loading-chat').style.display = 'flex';
    document.getElementById('messages').style.display = 'none';
    document.getElementById('submitMessage').disabled = true;
    document.getElementById('invite-button').disabled = true;

    await getMessages();
};

async function getCurrentConversation() {
    window.twilioChat.selectedConversation = await window.twilioChat.client.getConversationBySid(window.twilioChat.selectedConvSid);

    return window.twilioChat.selectedConversation;
}

async function getMessages() {
    await getCurrentConversation();

    let messages = await window.twilioChat.selectedConversation.getMessages();

    addMessagesToChatArea(messages.items, true);

    window.twilioChat.selectedConversation.on('messageAdded', msg => addMessagesToChatArea([msg], false));

    document.getElementById('submitMessage').disabled = false;
    document.getElementById('invite-button').disabled = false;
};

function addMessagesToChatArea(messages, clearMessages) {
    let cont, msgCont, msgAuthor, timestamp;

    const chatArea = document.getElementById('messages');

    if (clearMessages) {
        document.getElementById('loading-chat').style.display = 'none';
        chatArea.style.display = 'flex';
        chatArea.replaceChildren();
    }

    for (const msg of messages) {
        cont = document.createElement('div');
        if (msg.state.author == window.twilioChat.username) {
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
}

initClient();
