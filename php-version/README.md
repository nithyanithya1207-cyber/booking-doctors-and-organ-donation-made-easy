# MediLink — PHP + MySQL + XAMPP Setup Guide

This folder contains a complete XAMPP-ready version of MediLink.

- **Frontend:** HTML + CSS + JavaScript (PHP templates)
- **Backend:** PHP
- **Database:** MySQL
- **Server:** XAMPP
- **Code editor:** VS Code (recommended)

---

## 1. Install the required software

1. **Download and install XAMPP**
   - Go to: https://www.apachefriends.org/
   - Install XAMPP with **Apache** and **MySQL** selected.

2. **Download and install VS Code**
   - Go to: https://code.visualstudio.com/
   - Install the **PHP IntelliSense** or **PHP Intelephense** extension for better code highlighting.

---

## 2. Place the project in XAMPP

1. Open the XAMPP installation folder.
2. Go to `htdocs/`.
3. Copy the `php-version` folder into `htdocs/`.
4. (Optional) Rename `php-version` to `medilink` so the URL is shorter.

Your folder structure should look like:

```
C:/xampp/htdocs/medilink/
├── admin.php
├── appointments.php
├── config/
├── database/
├── includes/
├── index.php
├── login.php
├── register.php
└── ...
```

---

## 3. Create the MySQL database

1. Start **Apache** and **MySQL** in the XAMPP Control Panel.
2. Open your browser and go to: http://localhost/phpmyadmin
3. Click **Databases**.
4. Create a new database named `medilink`.
5. Click on the `medilink` database.
6. Go to the **Import** tab.
7. Click **Choose file** and select:
   ```
   C:/xampp/htdocs/medilink/database/medilink.sql
   ```
8. Click **Go / Import**.

The database will now contain all tables and 8 demo doctors.

---

## 4. Check the database connection

Open:

```
C:/xampp/htdocs/medilink/config/db.php
```

Default XAMPP settings:

```php
define('DB_HOST', '127.0.0.1');
define('DB_PORT', 3306);
define('DB_NAME', 'medilink');
define('DB_USER', 'root');
define('DB_PASS', '');
```

If you set a MySQL root password, update `DB_PASS`.

---

## 5. Open the project in VS Code

1. Open VS Code.
2. Click **File → Open Folder**.
3. Select:
   ```
   C:/xampp/htdocs/medilink
   ```
4. You can now edit any `.php`, `.css`, or `.sql` file.

---

## 6. Run the website

1. Make sure Apache and MySQL are running in XAMPP.
2. Open your browser.
3. Go to:
   ```
   http://localhost/medilink/
   ```

You should see the MediLink home page.

---

## 7. Test login

Use the demo admin account:

- **Email:** `admin@medilink.test`
- **Password:** `admin123`

Or register a new account from the register page.

---

## 8. How data is stored

| User action | Database change |
|-------------|-----------------|
| Register | New row in `users` + `user_roles` |
| Login | Session created in PHP |
| Book appointment | New row in `appointments` |
| Register as donor | New row in `donors` |
| Create organ request | New row in `organ_requests` |
| Admin adds doctor | New row in `doctors` |
| Notification | New row in `notifications` |

You can view all data in phpMyAdmin under the `medilink` database.

---

## 9. Make yourself an admin (if you registered a new account)

1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Click the `medilink` database.
3. Click **SQL**.
4. Run:

```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' FROM users WHERE email = 'your-email@example.com';
```

Replace `your-email@example.com` with the email you registered with.

---

## 10. Troubleshooting

| Problem | Solution |
|---------|----------|
| "Database connection failed" | Start MySQL in XAMPP Control Panel. |
| 404 page not found | Make sure the folder is inside `htdocs` and URL matches the folder name. |
| Admin login fails | The demo admin password is `admin123`. If you changed the SQL, re-import `medilink.sql`. |
| Styles not loading | Check that `assets/css/style.css` exists and the path is correct. |

---

## Summary

1. Install XAMPP and VS Code.
2. Copy `php-version` to `C:/xampp/htdocs/medilink`.
3. Import `database/medilink.sql` into phpMyAdmin.
4. Open the folder in VS Code.
5. Visit http://localhost/medilink/ in your browser.
