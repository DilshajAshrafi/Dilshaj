"""
Database Layer for Dilshaj Ashrafi's Portfolio
Handles SQLite database initialization, models, queries, and persistent storage.
"""

import os
import sqlite3
from datetime import datetime

# Database directory and file path
DB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
DB_PATH = os.path.join(DB_DIR, 'portfolio.db')

def get_db_connection():
    """Returns a SQLite database connection with row factory configured."""
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes database tables and default seed records."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Contact Messages Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_read INTEGER DEFAULT 0,
            ip_address TEXT
        )
    ''')

    # 2. Project Likes & Views Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS project_likes (
            project_id TEXT PRIMARY KEY,
            project_name TEXT NOT NULL,
            likes_count INTEGER DEFAULT 0,
            views_count INTEGER DEFAULT 0,
            last_liked_at TIMESTAMP
        )
    ''')

    # 3. Newsletter Subscribers Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # 4. Analytics & Activity Log Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analytics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT NOT NULL,
            metadata TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # 5. Seed initial projects if not present
    default_projects = [
        ('kisaan', 'Kisaan Sathi — Smart Agro AI', 48, 260),
        ('mukund_portfolio', 'Mukund Pratap Srivastav Engineering Platform', 42, 235),
        ('ai_assistant', 'Autonomous AI Assistant & Knowledge Engine', 35, 190),
        ('data_science', 'Data Science & Mathematical Modeling Suite', 29, 145),
        ('c_systems', 'High-Performance C Systems Suite', 22, 110)
    ]

    for proj_id, name, likes, views in default_projects:
        cursor.execute('''
            INSERT OR IGNORE INTO project_likes (project_id, project_name, likes_count, views_count)
            VALUES (?, ?, ?, ?)
        ''', (proj_id, name, likes, views))

    conn.commit()
    conn.close()
    print(f"Database initialized successfully at: {DB_PATH}")

# --- Contact Messages Queries ---

def save_message(name, email, subject, message, ip_address=""):
    """Inserts a new contact form message into the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO messages (name, email, subject, message, ip_address)
        VALUES (?, ?, ?, ?, ?)
    ''', (name, email, subject, message, ip_address))
    msg_id = cursor.lastrowid
    conn.commit()
    conn.close()
    log_event("contact_submission", f"Message #{msg_id} from {email}")
    return msg_id

def get_all_messages():
    """Retrieves all contact messages ordered by creation time descending."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, name, email, subject, message, created_at, is_read, ip_address
        FROM messages
        ORDER BY created_at DESC
    ''')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def mark_message_as_read(msg_id):
    """Marks a message as read."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE messages SET is_read = 1 WHERE id = ?', (msg_id,))
    conn.commit()
    conn.close()
    return True

def delete_message(msg_id):
    """Deletes a message from the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM messages WHERE id = ?', (msg_id,))
    conn.commit()
    conn.close()
    return True

# --- Project Likes & Stats Queries ---

def get_all_project_stats():
    """Returns a dictionary of all project like counts and view counts."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT project_id, project_name, likes_count, views_count FROM project_likes')
    rows = cursor.fetchall()
    conn.close()
    return {row['project_id']: {'name': row['project_name'], 'likes': row['likes_count'], 'views': row['views_count']} for row in rows}

def increment_project_like(project_id):
    """Increments the like count for a specific project and returns the new count."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE project_likes
        SET likes_count = likes_count + 1, last_liked_at = CURRENT_TIMESTAMP
        WHERE project_id = ?
    ''', (project_id,))
    
    cursor.execute('SELECT likes_count FROM project_likes WHERE project_id = ?', (project_id,))
    row = cursor.fetchone()
    conn.commit()
    conn.close()
    
    if row:
        log_event("project_like", f"Project: {project_id}")
        return row['likes_count']
    return 0

# --- Newsletter Subscribers ---

def add_subscriber(email):
    """Adds a new email subscriber."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO subscribers (email) VALUES (?)', (email,))
        conn.commit()
        conn.close()
        log_event("newsletter_signup", f"Subscriber: {email}")
        return True, "Subscribed successfully!"
    except sqlite3.IntegrityError:
        return False, "This email is already subscribed!"
    except Exception as e:
        return False, str(e)

# --- Analytics & Overview ---

def log_event(event_type, metadata=""):
    """Logs an application event for analytics."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO analytics (event_type, metadata) VALUES (?, ?)', (event_type, metadata))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error logging event: {e}")

def get_dashboard_summary():
    """Returns key aggregated metrics for the admin dashboard."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT COUNT(*) as count FROM messages')
    total_messages = cursor.fetchone()['count']

    cursor.execute('SELECT COUNT(*) as count FROM messages WHERE is_read = 0')
    unread_messages = cursor.fetchone()['count']

    cursor.execute('SELECT SUM(likes_count) as total_likes FROM project_likes')
    row_likes = cursor.fetchone()
    total_likes = row_likes['total_likes'] if row_likes and row_likes['total_likes'] else 0

    cursor.execute('SELECT COUNT(*) as count FROM subscribers')
    total_subscribers = cursor.fetchone()['count']

    cursor.execute('SELECT COUNT(*) as count FROM analytics WHERE event_type = "page_view"')
    total_views = cursor.fetchone()['count']

    conn.close()

    return {
        "total_messages": total_messages,
        "unread_messages": unread_messages,
        "total_project_likes": total_likes,
        "total_subscribers": total_subscribers,
        "total_page_views": total_views
    }

if __name__ == '__main__':
    init_db()
