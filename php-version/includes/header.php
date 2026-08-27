<?php
require_once __DIR__ . '/auth.php';
$pageTitle = $pageTitle ?? 'MediLink';
$me = current_user();
$unread = 0;
if ($me) {
    $s = db()->prepare('SELECT COUNT(*) c FROM notifications WHERE user_id = ? AND is_read = 0');
    $s->execute([$me['id']]);
    $unread = (int) $s->fetch()['c'];
}
$current = basename($_SERVER['PHP_SELF']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($pageTitle) ?> | MediLink</title>
<meta name="description" content="MediLink — book doctor appointments and match organ donors with patients.">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<header class="topbar">
  <a class="brand" href="<?= $me ? 'dashboard.php' : 'index.php' ?>">
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
      <ellipse cx="12" cy="5" rx="8" ry="3"/>
      <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/>
      <path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>
    </svg>
    <span>MediLink</span>
  </a>

  <?php if ($me): ?>
  <nav class="nav">
    <a class="<?= $current === 'dashboard.php' ? 'active' : '' ?>" href="dashboard.php">Dashboard</a>
    <a class="<?= $current === 'doctors.php' ? 'active' : '' ?>" href="doctors.php">Doctors</a>
    <a class="<?= $current === 'appointments.php' ? 'active' : '' ?>" href="appointments.php">Appointments</a>
    <a class="<?= $current === 'donate.php' ? 'active' : '' ?>" href="donate.php">Donate</a>
    <a class="<?= $current === 'matching.php' ? 'active' : '' ?>" href="matching.php">Matching</a>
    <a class="<?= $current === 'notifications.php' ? 'active' : '' ?>" href="notifications.php">
      Notifications<?= $unread ? ' <span class="badge">' . $unread . '</span>' : '' ?>
    </a>
    <?php if (has_role('admin')): ?>
      <a class="<?= $current === 'admin.php' ? 'active' : '' ?>" href="admin.php">Admin</a>
    <?php endif; ?>
  </nav>
  <div class="userbox">
    <span class="who"><?= e($me['full_name']) ?></span>
    <a class="btn btn-ghost" href="logout.php">Log out</a>
  </div>
  <?php else: ?>
  <div class="userbox">
    <a class="btn btn-ghost" href="login.php">Login</a>
    <a class="btn" href="register.php">Register</a>
  </div>
  <?php endif; ?>
</header>
<main class="container">
