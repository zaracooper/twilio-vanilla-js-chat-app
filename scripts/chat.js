window.twilioChat = {};

async function initClient() {
    try {
        const response = await axios.request({
            url: '/auth/token',
            baseURL: 'http://localhost:8000',
            method: 'get',
            withCredentials: true
        });

        twilioChat.client = await Twilio.Conversations.Client.create(response.data.token);

        let conversations = await twilioChat.client.getSubscribedConversations();

        let button;
        let h3;

        const sideNav = document.getElementById('side-nav');

        for (const conv of conversations.items) {
            button = document.createElement('button');
            button.classList.add('conversation');
            button.id = conv.sid;
            button.value = conv.sid;
            button.onclick = async () => {
                await setConversation(conv.sid, conv.channelState.friendlyName);
            };

            h3 = document.createElement('h3');
            h3.innerHTML = conv.channelState.friendlyName;

            button.appendChild(h3);
            sideNav.appendChild(button);
        }
    }
    catch {
        location.href = '/pages/conversation.html';
    }
};

async function sendMessage() {
    let messageForm = document.getElementById('message-input');
    let messageData = new FormData(messageForm);

    const msg = messageData.get('chat-message') || 'Hello';

    const conv = await getCurrentConversation();
    await conv.sendMessage(msg).then(() => {
        document.getElementById('chat-message').value = '';
    });
};

async function setConversation(sid, name) {
    twilioChat.selectedConvSid = sid;
    document.getElementById('chat-title').innerHTML = name;

    await getMessages();
};

async function getCurrentConversation() {
    return await twilioChat.client.getConversationBySid(twilioChat.selectedConvSid);
}

async function getMessages() {
    const conv = await getCurrentConversation();

    let messages = await conv.getMessages();

    console.log(messages);
};

initClient();
