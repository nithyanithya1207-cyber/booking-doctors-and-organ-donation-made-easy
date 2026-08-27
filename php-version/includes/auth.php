<?php
require_once __DIR__ . '/../config/db.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function current_user(): ?array
{
    if (empty($_SESSION['user_id'])) {
        return null;
    }
    static $user = null;
    if ($user === null) {
        $stmt = db()->prepare('SELECT * FROM users WHERE id = ?');
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch() ?: null;
    }
    return $user ?: null;
}

function user_roles(): array
{
    if (empty($_SESSION['user_id'])) {
        return [];
    }
    $stmt = db()->prepare('SELECT role FROM user_roles WHERE user_id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    return array_column($stmt->fetchAll(), 'role');
}

/** Server-side role check — never trust anything from the browser. */
function has_role(string $role): bool
{
    return in_array($role, user_roles(), true);
}

function require_login(): array
{
    $user = current_user();
    if (!$user) {
        header('Location: login.php');
        exit;
    }
    return $user;
}

function require_admin(): array
{
    $user = require_login();
    if (!has_role('admin')) {
        http_response_code(403);
        die('<h2>Admins only</h2><p><a href="dashboard.php">Back to dashboard</a></p>');
    }
    return $user;
}

function notify(int $userId, string $title, string $message): void
{
    $stmt = db()->prepare('INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)');
    $stmt->execute([$userId, $title, $message]);
}

function e(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function csrf_token(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function check_csrf(): void
{
    if (($_POST['csrf'] ?? '') !== ($_SESSION['csrf'] ?? null)) {
        http_response_code(400);
        die('Invalid request token. Please reload the page.');
    }
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const ORGANS = ['Kidney', 'Liver', 'Heart', 'Lung', 'Pancreas', 'Cornea', 'Bone Marrow', 'Skin'];

/** Donor blood group -> recipient groups it can donate to. */
function blood_compatible(string $donor, string $recipient): bool
{
    $map = [
        'O-'  => ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
        'O+'  => ['O+', 'A+', 'B+', 'AB+'],
        'A-'  => ['A-', 'A+', 'AB-', 'AB+'],
        'A+'  => ['A+', 'AB+'],
        'B-'  => ['B-', 'B+', 'AB-', 'AB+'],
        'B+'  => ['B+', 'AB+'],
        'AB-' => ['AB-', 'AB+'],
        'AB+' => ['AB+'],
    ];
    return in_array($recipient, $map[$donor] ?? [], true);
}
