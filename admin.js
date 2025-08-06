const PASSWORD = "shopzone145";

function login() {
    const input = document.getElementById("admin-password").value;
    if (input === PASSWORD) {
        document.getElementById("login-section").classList.add("hidden");
        document.getElementById("admin-panel").classList.remove("hidden");
        loadMessages();
        startAutoRefresh();
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
    stopAutoRefresh();
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

// Add refresh functionality
function refreshMessages() {
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.textContent = 'Refreshing...';
        refreshBtn.disabled = true;
    }
    
    loadMessages().finally(() => {
        if (refreshBtn) {
            refreshBtn.textContent = 'Refresh Messages';
            refreshBtn.disabled = false;
        }
    });
}

// Auto-refresh messages every 30 seconds
let autoRefreshInterval;

function startAutoRefresh() {
    autoRefreshInterval = setInterval(() => {
        loadMessages();
    }, 30000); // 30 seconds
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
}

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
        
        messages.forEach((msg, index) => {
            const div = document.createElement('div');
            div.className = 'message-item';
            div.innerHTML = `
                <div class="message-header">From: ${msg.name}</div>
                <div class="message-content">${msg.message}</div>
                ${msg.created_at ? `<div class="message-date">Received: ${new Date(msg.created_at).toLocaleString()}</div>` : ''}
                <div class="reply-section">
                    <textarea id="reply-${msg.id}" placeholder="Reply to ${msg.name}..." rows="3">${msg.reply || ""}</textarea>
                    <button class="send-reply-btn" data-message-id="${msg.id}">Send Reply</button>
                    ${msg.reply ? '<div class="existing-reply">✓ Reply sent</div>' : ''}
                </div>
            `;
            container.appendChild(div);
            
            // Add event listener for the reply button
            const replyButton = div.querySelector('.send-reply-btn');
            replyButton.addEventListener('click', function() {
                const textarea = document.getElementById(`reply-${msg.id}`);
                sendReply(msg.id, textarea.value);
            });
        });
    } catch (error) {
        console.error('Error loading messages:', error);
        document.getElementById("messages").innerHTML = '<p class="error-message">Error loading messages. Please check your connection.</p>';
    }
}

async function sendReply(id, reply) {
    if (!reply || !reply.trim()) {
        alert("Please enter a reply message.");
        return;
    }
    
    const replyButton = document.querySelector(`[data-message-id="${id}"]`);
    const textarea = document.getElementById(`reply-${id}`);
    
    if (!replyButton || !textarea) {
        alert("Error: Could not find reply elements.");
        return;
    }
    
    // Show loading state
    const originalText = replyButton.textContent;
    replyButton.disabled = true;
    replyButton.textContent = 'Sending...';
    
    try {
        const res = await fetch('/api/replyMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: parseInt(id), reply: reply.trim() })
        });
        
        const result = await res.json();
        
        if (res.ok && result.success) {
            // Show success feedback
            replyButton.textContent = '✓ Sent';
            replyButton.style.backgroundColor = '#27ae60';
            
            // Add visual indicator
            const existingIndicator = replyButton.parentNode.querySelector('.existing-reply');
            if (!existingIndicator) {
                const indicator = document.createElement('div');
                indicator.className = 'existing-reply';
                indicator.textContent = '✓ Reply sent';
                replyButton.parentNode.appendChild(indicator);
            }
            
            setTimeout(() => {
                replyButton.disabled = false;
                replyButton.textContent = 'Update Reply';
                replyButton.style.backgroundColor = '';
            }, 2000);
        } else {
            throw new Error(result.error || 'Unknown error occurred');
        }
    } catch (error) {
        console.error('Error sending reply:', error);
        alert(`Error sending reply: ${error.message || 'Please check your connection.'}`);
        
        // Reset button state
        replyButton.disabled = false;
        replyButton.textContent = originalText;
    }
}