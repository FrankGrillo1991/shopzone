const PASSWORD = "shopzone145";

function login() {
    const input = document.getElementById("admin-password").value;
    if (input === PASSWORD) {
        document.getElementById("login-section").classList.add("hidden");
        document.getElementById("admin-panel").classList.remove("hidden");
        loadMessages();
    } else {
        document.getElementById("login-error").textContent = "Incorrect password.";
    }
}

function logout() {
    document.getElementById("admin-panel").classList.add("hidden");
    document.getElementById("login-section").classList.remove("hidden");
}

async function loadMessages() {
    try {
        const res = await fetch('/api/getMessages');
        const messages = await res.json();
        const container = document.getElementById("messages");
        container.innerHTML = '';
        
        messages.forEach(msg => {
            const div = document.createElement('div');
            div.innerHTML = `
                <p><strong>${msg.name}</strong>: ${msg.message}</p>
                <textarea placeholder="Reply to ${msg.name}...">${msg.reply || ""}</textarea>
                <button onclick="sendReply('${msg.id}', this.previousElementSibling.value)">Send Reply</button>
                <hr>
            `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading messages:', error);
        document.getElementById("messages").innerHTML = '<p>Error loading messages.</p>';
    }
}

async function sendReply(id, reply) {
    try {
        const res = await fetch('/api/replyMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, reply })
        });
        
        if (res.ok) {
            alert("Reply sent!");
            loadMessages(); // Reload messages to show updated replies
        } else {
            alert("Error sending reply.");
        }
    } catch (error) {
        console.error('Error sending reply:', error);
        alert("Error sending reply.");
    }
}