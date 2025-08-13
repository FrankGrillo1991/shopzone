const express = require('express');
const path = require('path');
const db = require('./db');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Serve main pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// GET Messages
app.get('/api/getMessages', (req, res) => {
    db.all('SELECT * FROM messages ORDER BY id DESC', [], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// POST Add Message
app.post('/api/addMessage', (req, res) => {
    const { name, message } = req.body;
    if (!name || !message) {
        return res.status(400).json({ error: 'Name and message are required' });
    }
    
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();
    
    if (!trimmedName || !trimmedMessage) {
        return res.status(400).json({ error: 'Name and message cannot be empty' });
    }
    
    db.run('INSERT INTO messages (name, message) VALUES (?, ?)', [trimmedName, trimmedMessage], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, id: this.lastID });
    });
});

// POST /api/contact (alias for /api/addMessage)
app.post('/api/contact', (req, res) => {
    // Accepts name, email (optional), message
    const { name, email, message } = req.body;
    if (!name || !message) {
        return res.status(400).json({ error: 'Name and message are required' });
    }
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();
    if (!trimmedName || !trimmedMessage) {
        return res.status(400).json({ error: 'Name and message cannot be empty' });
    }
    // Optionally store email in the message text
    let fullMessage = trimmedMessage;
    if (email && email.trim()) {
        fullMessage = `Email: ${email.trim()}\n${trimmedMessage}`;
    }
    db.run('INSERT INTO messages (name, message) VALUES (?, ?)', [trimmedName, fullMessage], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, id: this.lastID });
    });
});

// POST Reply to Message
app.post('/api/replyMessage', (req, res) => {
    const { id, reply } = req.body;
    
    if (!id || !reply) {
        return res.status(400).json({ error: 'ID and reply are required' });
    }
    
    const trimmedReply = reply.trim();
    if (!trimmedReply) {
        return res.status(400).json({ error: 'Reply cannot be empty' });
    }
    
    db.run('UPDATE messages SET reply = ? WHERE id = ?', [trimmedReply, id], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }
        res.json({ success: true });
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 ShopZone server running on http://localhost:${PORT}`);
    console.log(`📧 Contact form: http://localhost:${PORT}/contact.html`);
    console.log(`🔐 Admin panel: http://localhost:${PORT}/admin.html`);
});