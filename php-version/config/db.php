<?php
/**
 * MySQL connection for XAMPP.
 * Default XAMPP credentials: user "root", empty password.
 */
define('DB_HOST', '127.0.0.1');
define('DB_PORT', 3306);
define('DB_NAME', 'medilink');
define('DB_USER', 'root');
define('DB_PASS', '');

function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e) {
            die('<h2>Database connection failed</h2><p>Start MySQL in the XAMPP control panel and import <code>database/medilink.sql</code>.</p><pre>'
                . htmlspecialchars($e->getMessage()) . '</pre>');
        }
    }
    return $pdo;
}
