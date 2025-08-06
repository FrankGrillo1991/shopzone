const PASSWORD = "shopzone145";

function login() {
    const input = document.getElementById("admin-password").value;
    if (input === PASSWORD) {
        document.getElementById("login-section").classList.add("hidden");
        document.getElementById("admin-panel").classList.remove("hidden");
        loadMessages();
        document.getElementById("admin-password").value = '';
        document.getElementById("login-error").textContent = '';
    } else {
        document.getElementById("login-error").textContent = "Incorrect password. Please try again.";
        document.getElementById("admin-password").value = '';
    }
}

function logout() {
    document.getElementById("admin-panel").classList.add("hidden");
    document.getElementById("login-section").classList.remove("hidden");
    document.getElementById("messages").innerHTML = '';
}

// Allow Enter key to login
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById("admin-password");
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                login();
            }
        });
    }
});

async function loadMessages() {
    try {
        const res = await fetch('/api/getMessages');
        const messages = await res.json();
        const container = document.getElementById("messages");
        container.innerHTML = '';
        
        if (messages.length === 0) {
            container.innerHTML = '<p class="no-messages">No messages found.</p>';
            return;
        }
        
        messages.forEach(msg => {
            const div = document.createElement('div');
            div.className = 'message-item';
            div.innerHTML = `
                <div class="message-header">From: ${msg.name}</div>
                <div class="message-content">${msg.message}</div>
                <div class="reply-section">
                    <textarea placeholder="Reply to ${msg.name}..." rows="3">${msg.reply || ""}</textarea>
                    <button class="send-reply-btn" onclick="sendReply('${msg.id}', this.previousElementSibling.value)">Send Reply</button>
                </div>
            `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading messages:', error);
        document.getElementById("messages").innerHTML = '<p class="error-message">Error loading messages. Please check your connection.</p>';
    }
}

async function sendReply(id, reply) {
    if (!reply.trim()) {
        alert("Please enter a reply message.");
        return;
    }
    
    try {
        const res = await fetch('/api/replyMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, reply: reply.trim() })
        });
        
        if (res.ok) {
            alert("Reply sent successfully!");
            loadMessages(); // Reload messages to show updated replies
        } else {
            const errorData = await res.json();
            alert(`Error sending reply: ${errorData.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error sending reply:', error);
        alert("Error sending reply. Please check your connection.");
    }
}