const express = require('express');
const db = require('./db');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname + '/public'));

// GET Messages
app.get('/api/getMessages', async (req, res) => {
    db.all('SELECT * FROM messages', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// POST Reply to Message
app.post('/api/replyMessage', async (req, res) => {
    const { id, reply } = req.body;
    db.run('UPDATE messages SET reply = ? WHERE id = ?', [reply, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
    });
});

// POST Add Message
app.post('/api/addMessage', async (req, res) => {
    const { name, message } = req.body;
    if (!name || !message) {
        return res.status(400).json({ error: 'Name and message are required' });
    }
    
    db.run('INSERT INTO messages (name, message) VALUES (?, ?)', [name, message], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, id: this.lastID });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/admin.html`);
});