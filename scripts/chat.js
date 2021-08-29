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
            conversationName.innerHTML = `💬 ${conv.channelState.friendlyName}`;

            conversationCont.appendChild(conversationName);
            sideNav.appendChild(conversationCont);
        }
    }
    catch {
        location.href = '/pages/conversation.html';
    }
};

function sendMessage() {
    let submitBtn = document.getElementById('submitMessage');
    submitBtn.disabled = true;

    let messageForm = document.getElementById('message-input');
    let messageData = new FormData(messageForm);

    const msg = messageData.get('chat-message');

    window.twilioChat.selectedConversation.sendMessage(msg)
        .then(() => {
            document.getElementById('chat-message').value = '';
            submitBtn.disabled = false;
        })
        .catch(() => {
            showError('sending your message');
            submitBtn.disabled = false;
        });
};

async function setConversation(sid, name) {
    try {
        window.twilioChat.selectedConvSid = sid;

        document.getElementById('chat-title').innerHTML = '+ ' + name;

        document.getElementById('loading-chat').style.display = 'flex';
        document.getElementById('messages').style.display = 'none';

        let submitButton = document.getElementById('submitMessage')
        submitButton.disabled = true;

        let inviteButton = document.getElementById('invite-button')
        inviteButton.disabled = true;

        window.twilioChat.selectedConversation = await window.twilioChat.client.getConversationBySid(window.twilioChat.selectedConvSid);

        const messages = await window.twilioChat.selectedConversation.getMessages();

        addMessagesToChatArea(messages.items, true);

        window.twilioChat.selectedConversation.on('messageAdded', msg => addMessagesToChatArea([msg], false));

        submitButton.disabled = false;
        inviteButton.disabled = false;
    } catch {
        showError('loading the conversation you selected');
    }
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

async function inviteFriend() {
    try {
        const link = `http://localhost:3000/pages/login.html?sid=${window.twilioChat.selectedConvSid}`;

        await navigator.clipboard.writeText(link);

        alert(`The link below has been copied to your clipboard.\n\n${link}\n\nYou can invite a friend to chat by sending it to them.`);
    } catch {
        showError('preparing your chat invite');
    }
}

function logout(logoutButton) {
    logoutButton.disabled = true;
    logoutButton.style.cursor = 'wait';

    axios.request({
        url: '/auth/token',
        baseURL: 'http://localhost:8000',
        method: 'delete',
        withCredentials: true
    })
        .then(() => {
            location.href = '/pages/conversation.html';
        })
        .catch(() => {
            location.href = '/pages/error.html';
        });
}

function hideError() {
    document.getElementById('error-message').style.display = 'none';
}

function showError(msg) {
    document.getElementById('error-message').style.display = 'flex';
    document.getElementById('error-text').innerHTML = `There was a problem ${msg ? msg : 'fulfilling your request'}.`;
}

initClient();
