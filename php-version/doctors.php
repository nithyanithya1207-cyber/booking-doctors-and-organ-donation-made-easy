<?php
require_once __DIR__ . '/includes/auth.php';
$me = require_login();
$msg = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $doctorId = (int) ($_POST['doctor_id'] ?? 0);
    $date     = $_POST['appointment_date'] ?? '';
    $time     = trim($_POST['appointment_time'] ?? '');
    $reason   = trim($_POST['reason'] ?? '');

    $doc = db()->prepare('SELECT * FROM doctors WHERE id = ?');
    $doc->execute([$doctorId]);
    $doc = $doc->fetch();

    if (!$doc || $date === '' || $time === '') {
        $error = 'Please choose a doctor, a date and a time.';
    } else {
        db()->prepare(
            'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason)
             VALUES (?, ?, ?, ?, ?)'
        )->execute([$me['id'], $doctorId, $date, $time, $reason ?: null]);

        notify($me['id'], 'Appointment requested',
            'Your appointment with ' . $doc['name'] . ' on ' . $date . ' at ' . $time . ' is pending confirmation.');
        $msg = 'Appointment requested with ' . $doc['name'] . '.';
    }
}

$city = trim($_GET['city'] ?? '');
$spec = trim($_GET['spec'] ?? '');
$sql  = 'SELECT * FROM doctors WHERE 1=1';
$args = [];
if ($city !== '') { $sql .= ' AND city = ?'; $args[] = $city; }
if ($spec !== '') { $sql .= ' AND specialization = ?'; $args[] = $spec; }
$sql .= ' ORDER BY name';
$stmt = db()->prepare($sql);
$stmt->execute($args);
$doctors = $stmt->fetchAll();

$cities = array_column(db()->query('SELECT DISTINCT city FROM doctors ORDER BY city')->fetchAll(), 'city');
$specs  = array_column(db()->query('SELECT DISTINCT specialization FROM doctors ORDER BY specialization')->fetchAll(), 'specialization');

$pageTitle = 'Doctors';
require_once __DIR__ . '/includes/header.php';
?>
<div class="page-head">
  <div><h1>Find a doctor</h1><p class="sub"><?= count($doctors) ?> doctors available.</p></div>
</div>

<?php if ($msg): ?><div class="alert success"><?= e($msg) ?></div><?php endif; ?>
<?php if ($error): ?><div class="alert error"><?= e($error) ?></div><?php endif; ?>

<form class="toolbar" method="get">
  <input data-filter-input placeholder="Search name or hospital…">
  <select name="city" onchange="this.form.submit()">
    <option value="">All cities</option>
    <?php foreach ($cities as $c): ?><option <?= $city === $c ? 'selected' : '' ?>><?= e($c) ?></option><?php endforeach; ?>
  </select>
  <select name="spec" onchange="this.form.submit()">
    <option value="">All specialisations</option>
    <?php foreach ($specs as $s): ?><option <?= $spec === $s ? 'selected' : '' ?>><?= e($s) ?></option><?php endforeach; ?>
  </select>
  <noscript><button class="btn" type="submit">Filter</button></noscript>
</form>

<div class="grid cols-3">
  <?php foreach ($doctors as $d): ?>
  <div class="card" data-filter-item>
    <h3><?= e($d['name']) ?></h3>
    <p><span class="pill ok"><?= e($d['specialization']) ?></span></p>
    <p><?= e($d['hospital']) ?> &middot; <?= e($d['city']) ?></p>
    <p>Fee: ₹<?= number_format((float) $d['fee']) ?> &middot; <?= e($d['available_days']) ?></p>
    <p><?= e($d['contact']) ?></p>
    <form method="post" style="margin-top:10px">
      <input type="hidden" name="csrf" value="<?= csrf_token() ?>">
      <input type="hidden" name="doctor_id" value="<?= (int) $d['id'] ?>">
      <div class="row">
        <div>
          <label>Date</label>
          <input type="date" name="appointment_date" min="<?= date('Y-m-d') ?>" required>
        </div>
        <div>
          <label>Time</label>
          <select name="appointment_time" required>
            <?php foreach (['09:00','10:00','11:00','12:00','15:00','16:00','17:00','18:00'] as $t): ?>
              <option><?= $t ?></option>
            <?php endforeach; ?>
          </select>
        </div>
      </div>
      <label>Reason</label>
      <input name="reason" placeholder="Short description (optional)">
      <button class="btn btn-sm" type="submit">Book appointment</button>
    </form>
  </div>
  <?php endforeach; ?>
</div>
<?php if (!$doctors): ?><p class="empty">No doctors match those filters.</p><?php endif; ?>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
