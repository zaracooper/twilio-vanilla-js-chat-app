const initClient = async function () {
    try {
        const response = await axios.request({
            url: '/auth/token',
            baseURL: 'http://localhost:8000',
            method: 'get',
            withCredentials: true
        });

        window.client = await Twilio.Conversations.Client.create(response.data.token);

        let conversations = await window.client.getSubscribedConversations();

        let button;
        let h3;

        const sideNav = document.getElementById('side-nav');

        for (const conv of conversations.items) {
            button = document.createElement('button');
            button.classList.add('conversation');
            button.value = conv.sid;

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

initClient();
