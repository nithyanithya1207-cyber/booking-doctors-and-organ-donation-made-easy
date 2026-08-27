<?php
require_once __DIR__ . '/includes/auth.php';
$me = require_admin();
$msg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $action = $_POST['action'] ?? '';

    if ($action === 'add_doctor') {
        db()->prepare(
            'INSERT INTO doctors (name, specialization, hospital, city, fee, available_days, contact)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        )->execute([
            trim($_POST['name']), trim($_POST['specialization']), trim($_POST['hospital']),
            trim($_POST['city']), (float) $_POST['fee'], trim($_POST['available_days']) ?: 'Mon-Fri',
            trim($_POST['contact']) ?: null,
        ]);
        $msg = 'Doctor added.';
    } elseif ($action === 'delete_doctor') {
        db()->prepare('DELETE FROM doctors WHERE id = ?')->execute([(int) $_POST['id']]);
        $msg = 'Doctor removed.';
    } elseif ($action === 'set_status') {
        $status = in_array($_POST['status'], ['pending','confirmed','completed','cancelled'], true) ? $_POST['status'] : 'pending';
        $id = (int) $_POST['id'];
        db()->prepare('UPDATE appointments SET status = ? WHERE id = ?')->execute([$status, $id]);
        $owner = db()->prepare('SELECT patient_id FROM appointments WHERE id = ?');
        $owner->execute([$id]);
        if ($row = $owner->fetch()) {
            notify((int) $row['patient_id'], 'Appointment ' . $status, 'Appointment #' . $id . ' is now ' . $status . '.');
        }
        $msg = 'Appointment updated.';
    }
}

$doctors = db()->query('SELECT * FROM doctors ORDER BY name')->fetchAll();
$donors  = db()->query('SELECT * FROM donors ORDER BY created_at DESC')->fetchAll();
$appts   = db()->query(
    'SELECT a.*, d.name AS doctor, u.full_name AS patient
     FROM appointments a
     JOIN doctors d ON d.id = a.doctor_id
     JOIN users u ON u.id = a.patient_id
     ORDER BY a.appointment_date DESC, a.id DESC'
)->fetchAll();

$pageTitle = 'Admin';
require_once __DIR__ . '/includes/header.php';
?>
<div class="page-head">
  <div><h1>Admin panel</h1><p class="sub">Manage doctors, donors and appointment statuses.</p></div>
</div>
<?php if ($msg): ?><div class="alert success"><?= e($msg) ?></div><?php endif; ?>

<div class="card" style="margin-bottom:20px">
  <h2>Add a doctor</h2>
  <form method="post">
    <input type="hidden" name="csrf" value="<?= csrf_token() ?>">
    <input type="hidden" name="action" value="add_doctor">
    <div class="row">
      <div><label>Name</label><input name="name" required></div>
      <div><label>Specialisation</label><input name="specialization" required></div>
      <div><label>Hospital</label><input name="hospital" required></div>
    </div>
    <div class="row">
      <div><label>City</label><input name="city" required></div>
      <div><label>Fee (₹)</label><input type="number" name="fee" min="0" step="50" value="500"></div>
      <div><label>Available days</label><input name="available_days" placeholder="Mon-Fri"></div>
      <div><label>Contact</label><input name="contact"></div>
    </div>
    <button class="btn" type="submit">Add doctor</button>
  </form>
</div>

<h2>Doctors (<?= count($doctors) ?>)</h2>
<div class="card table-wrap" style="margin-bottom:20px">
  <table>
    <thead><tr><th>Name</th><th>Specialisation</th><th>Hospital</th><th>City</th><th>Fee</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($doctors as $d): ?>
      <tr>
        <td><?= e($d['name']) ?></td><td><?= e($d['specialization']) ?></td>
        <td><?= e($d['hospital']) ?></td><td><?= e($d['city']) ?></td>
        <td>₹<?= number_format((float) $d['fee']) ?></td>
        <td>
          <form method="post" class="inline" data-confirm="Delete this doctor and their appointments?">
            <input type="hidden" name="csrf" value="<?= csrf_token() ?>">
            <input type="hidden" name="action" value="delete_doctor">
            <input type="hidden" name="id" value="<?= (int) $d['id'] ?>">
            <button class="btn btn-sm btn-danger" type="submit">Delete</button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>

<h2>Appointments (<?= count($appts) ?>)</h2>
<div class="card table-wrap" style="margin-bottom:20px">
  <table>
    <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Change</th></tr></thead>
    <tbody>
    <?php foreach ($appts as $a): ?>
      <tr>
        <td><?= e($a['patient']) ?></td><td><?= e($a['doctor']) ?></td>
        <td><?= e($a['appointment_date']) ?></td><td><?= e($a['appointment_time']) ?></td>
        <td><span class="pill <?= $a['status'] === 'confirmed' ? 'ok' : ($a['status'] === 'cancelled' ? 'bad' : 'warn') ?>"><?= e($a['status']) ?></span></td>
        <td>
          <form method="post" class="inline" style="display:flex;gap:6px">
            <input type="hidden" name="csrf" value="<?= csrf_token() ?>">
            <input type="hidden" name="action" value="set_status">
            <input type="hidden" name="id" value="<?= (int) $a['id'] ?>">
            <select name="status">
              <?php foreach (['pending','confirmed','completed','cancelled'] as $s): ?>
                <option <?= $a['status'] === $s ? 'selected' : '' ?>><?= $s ?></option>
              <?php endforeach; ?>
            </select>
            <button class="btn btn-sm" type="submit">Save</button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>

<h2>Donors (<?= count($donors) ?>)</h2>
<div class="card table-wrap">
  <table>
    <thead><tr><th>Name</th><th>Blood</th><th>Organs</th><th>City</th><th>Phone</th><th>Available</th></tr></thead>
    <tbody>
    <?php foreach ($donors as $d): ?>
      <tr>
        <td><?= e($d['full_name']) ?></td><td><?= e($d['blood_group']) ?></td>
        <td><?= e($d['organs']) ?></td><td><?= e($d['city']) ?></td>
        <td><?= e($d['phone']) ?: '—' ?></td>
        <td><span class="pill <?= $d['available'] ? 'ok' : 'bad' ?>"><?= $d['available'] ? 'yes' : 'no' ?></span></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>
<?php if (!$donors): ?><p class="empty">No donors registered yet.</p><?php endif; ?>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
