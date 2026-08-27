<?php
require_once __DIR__ . '/includes/auth.php';
$me = require_login();

$q = function (string $sql, array $args = []) {
    $s = db()->prepare($sql);
    $s->execute($args);
    return $s;
};

$myAppointments = (int) $q('SELECT COUNT(*) c FROM appointments WHERE patient_id = ?', [$me['id']])->fetch()['c'];
$myRequests     = (int) $q('SELECT COUNT(*) c FROM organ_requests WHERE patient_id = ?', [$me['id']])->fetch()['c'];
$myDonor        = $q('SELECT * FROM donors WHERE user_id = ?', [$me['id']])->fetch();
$unreadCount    = (int) $q('SELECT COUNT(*) c FROM notifications WHERE user_id = ? AND is_read = 0', [$me['id']])->fetch()['c'];

$upcoming = $q(
    'SELECT a.*, d.name, d.hospital FROM appointments a
     JOIN doctors d ON d.id = a.doctor_id
     WHERE a.patient_id = ? ORDER BY a.appointment_date ASC LIMIT 5',
    [$me['id']]
)->fetchAll();

$pageTitle = 'Dashboard';
require_once __DIR__ . '/includes/header.php';
?>
<div class="page-head">
  <div>
    <h1>Hello, <?= e($me['full_name']) ?></h1>
    <p class="sub">Roles: <?= e(implode(', ', user_roles()) ?: 'patient') ?></p>
  </div>
  <a class="btn" href="doctors.php">Book an appointment</a>
</div>

<div class="grid cols-4">
  <div class="card"><p>My appointments</p><p class="stat"><?= $myAppointments ?></p></div>
  <div class="card"><p>My organ requests</p><p class="stat"><?= $myRequests ?></p></div>
  <div class="card"><p>Donor profile</p><p class="stat"><?= $myDonor ? 'Yes' : 'No' ?></p></div>
  <div class="card"><p>Unread alerts</p><p class="stat"><?= $unreadCount ?></p></div>
</div>

<h2 style="margin-top:26px">Upcoming appointments</h2>
<?php if ($upcoming): ?>
<div class="card table-wrap">
  <table>
    <thead><tr><th>Doctor</th><th>Hospital</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
    <tbody>
    <?php foreach ($upcoming as $a): ?>
      <tr>
        <td><?= e($a['name']) ?></td>
        <td><?= e($a['hospital']) ?></td>
        <td><?= e($a['appointment_date']) ?></td>
        <td><?= e($a['appointment_time']) ?></td>
        <td><span class="pill <?= $a['status'] === 'confirmed' ? 'ok' : ($a['status'] === 'cancelled' ? 'bad' : 'warn') ?>"><?= e($a['status']) ?></span></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>
<?php else: ?>
  <p class="empty">No appointments yet — <a href="doctors.php">find a doctor</a>.</p>
<?php endif; ?>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
