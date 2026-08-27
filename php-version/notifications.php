<?php
require_once __DIR__ . '/includes/auth.php';
$me = require_login();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    db()->prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?')->execute([$me['id']]);
    header('Location: notifications.php');
    exit;
}

$stmt = db()->prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC, id DESC');
$stmt->execute([$me['id']]);
$rows = $stmt->fetchAll();

$pageTitle = 'Notifications';
require_once __DIR__ . '/includes/header.php';
?>
<div class="page-head">
  <div><h1>Notifications</h1><p class="sub">Appointment confirmations and donation updates.</p></div>
  <form method="post" class="inline">
    <input type="hidden" name="csrf" value="<?= csrf_token() ?>">
    <button class="btn btn-ghost" type="submit">Mark all as read</button>
  </form>
</div>

<div class="grid">
  <?php foreach ($rows as $n): ?>
    <div class="card" style="<?= $n['is_read'] ? 'opacity:.65' : '' ?>">
      <h3><?= e($n['title']) ?></h3>
      <p><?= e($n['message']) ?></p>
      <p><small><?= e($n['created_at']) ?></small></p>
    </div>
  <?php endforeach; ?>
</div>
<?php if (!$rows): ?><p class="empty">No notifications yet.</p><?php endif; ?>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
