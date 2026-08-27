<?php
require_once __DIR__ . '/includes/auth.php';
$me = require_login();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $id = (int) ($_POST['id'] ?? 0);
    // Users may only cancel their own appointments.
    db()->prepare('UPDATE appointments SET status = "cancelled" WHERE id = ? AND patient_id = ?')
        ->execute([$id, $me['id']]);
    notify($me['id'], 'Appointment cancelled', 'Your appointment #' . $id . ' was cancelled.');
    header('Location: appointments.php');
    exit;
}

$stmt = db()->prepare(
    'SELECT a.*, d.name, d.specialization, d.hospital, d.city
     FROM appointments a JOIN doctors d ON d.id = a.doctor_id
     WHERE a.patient_id = ? ORDER BY a.appointment_date DESC, a.id DESC'
);
$stmt->execute([$me['id']]);
$rows = $stmt->fetchAll();

$pageTitle = 'Appointments';
require_once __DIR__ . '/includes/header.php';
?>
<div class="page-head">
  <div><h1>My appointments</h1><p class="sub">Every booking stored in the <code>appointments</code> table.</p></div>
  <a class="btn" href="doctors.php">New appointment</a>
</div>

<?php if ($rows): ?>
<div class="card table-wrap">
  <table>
    <thead><tr><th>Doctor</th><th>Hospital</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($rows as $a): ?>
      <tr>
        <td><?= e($a['name']) ?><br><span class="pill"><?= e($a['specialization']) ?></span></td>
        <td><?= e($a['hospital']) ?><br><small><?= e($a['city']) ?></small></td>
        <td><?= e($a['appointment_date']) ?></td>
        <td><?= e($a['appointment_time']) ?></td>
        <td><?= e($a['reason']) ?: '—' ?></td>
        <td><span class="pill <?= $a['status'] === 'confirmed' ? 'ok' : ($a['status'] === 'cancelled' ? 'bad' : 'warn') ?>"><?= e($a['status']) ?></span></td>
        <td>
          <?php if ($a['status'] === 'pending' || $a['status'] === 'confirmed'): ?>
          <form method="post" class="inline" data-confirm="Cancel this appointment?">
            <input type="hidden" name="csrf" value="<?= csrf_token() ?>">
            <input type="hidden" name="id" value="<?= (int) $a['id'] ?>">
            <button class="btn btn-sm btn-danger" type="submit">Cancel</button>
          </form>
          <?php endif; ?>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>
<?php else: ?>
  <p class="empty">No appointments yet.</p>
<?php endif; ?>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
