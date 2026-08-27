<?php
require_once __DIR__ . '/includes/auth.php';
$me = require_login();
$msg = '';

$existing = db()->prepare('SELECT * FROM donors WHERE user_id = ?');
$existing->execute([$me['id']]);
$donor = $existing->fetch();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();

    if (($_POST['action'] ?? '') === 'toggle' && $donor) {
        db()->prepare('UPDATE donors SET available = 1 - available WHERE user_id = ?')->execute([$me['id']]);
        header('Location: donate.php');
        exit;
    }

    $name   = trim($_POST['full_name'] ?? '');
    $age    = (int) ($_POST['age'] ?? 0);
    $blood  = $_POST['blood_group'] ?? '';
    $organs = implode(',', array_intersect((array) ($_POST['organs'] ?? []), ORGANS));
    $city   = trim($_POST['city'] ?? '');
    $phone  = trim($_POST['phone'] ?? '');
    $notes  = trim($_POST['medical_notes'] ?? '');

    if ($donor) {
        db()->prepare(
            'UPDATE donors SET full_name=?, age=?, blood_group=?, organs=?, city=?, phone=?, medical_notes=? WHERE user_id=?'
        )->execute([$name, $age ?: null, $blood, $organs, $city, $phone ?: null, $notes ?: null, $me['id']]);
        $msg = 'Donor profile updated.';
    } else {
        db()->prepare(
            'INSERT INTO donors (user_id, full_name, age, blood_group, organs, city, phone, medical_notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        )->execute([$me['id'], $name, $age ?: null, $blood, $organs, $city, $phone ?: null, $notes ?: null]);
        db()->prepare('INSERT IGNORE INTO user_roles (user_id, role) VALUES (?, "donor")')->execute([$me['id']]);
        notify($me['id'], 'Thank you for registering', 'You are now listed as an organ donor on MediLink.');
        $msg = 'You are registered as a donor.';
    }

    $existing->execute([$me['id']]);
    $donor = $existing->fetch();
}

$selected = $donor ? array_filter(explode(',', $donor['organs'])) : [];

$pageTitle = 'Donate';
require_once __DIR__ . '/includes/header.php';
?>
<div class="page-head">
  <div>
    <h1><?= $donor ? 'My donor profile' : 'Become a donor' ?></h1>
    <p class="sub">Stored in the <code>donors</code> table and used by the matching engine.</p>
  </div>
  <?php if ($donor): ?>
  <form method="post" class="inline">
    <input type="hidden" name="csrf" value="<?= csrf_token() ?>">
    <input type="hidden" name="action" value="toggle">
    <button class="btn btn-ghost" type="submit">
      <?= $donor['available'] ? 'Mark unavailable' : 'Mark available' ?>
    </button>
  </form>
  <?php endif; ?>
</div>

<?php if ($msg): ?><div class="alert success"><?= e($msg) ?></div><?php endif; ?>

<div class="card" style="max-width:720px">
  <form method="post">
    <input type="hidden" name="csrf" value="<?= csrf_token() ?>">
    <div class="row">
      <div>
        <label for="full_name">Full name</label>
        <input id="full_name" name="full_name" required value="<?= e($donor['full_name'] ?? $me['full_name']) ?>">
      </div>
      <div>
        <label for="age">Age</label>
        <input id="age" type="number" name="age" min="18" max="90" value="<?= e($donor['age'] ?? '') ?>">
      </div>
    </div>
    <div class="row">
      <div>
        <label for="blood_group">Blood group</label>
        <select id="blood_group" name="blood_group" required>
          <?php foreach (BLOOD_GROUPS as $bg): ?>
            <option <?= (($donor['blood_group'] ?? $me['blood_group']) === $bg) ? 'selected' : '' ?>><?= $bg ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div>
        <label for="city">City</label>
        <input id="city" name="city" required value="<?= e($donor['city'] ?? $me['city']) ?>">
      </div>
      <div>
        <label for="phone">Phone</label>
        <input id="phone" name="phone" value="<?= e($donor['phone'] ?? $me['phone']) ?>">
      </div>
    </div>
    <label>Organs willing to donate</label>
    <div class="checks">
      <?php foreach (ORGANS as $o): ?>
        <label><input type="checkbox" name="organs[]" value="<?= $o ?>" <?= in_array($o, $selected, true) ? 'checked' : '' ?>> <?= $o ?></label>
      <?php endforeach; ?>
    </div>
    <label for="medical_notes">Medical notes</label>
    <textarea id="medical_notes" name="medical_notes"><?= e($donor['medical_notes'] ?? '') ?></textarea>
    <button class="btn" type="submit"><?= $donor ? 'Save changes' : 'Register as donor' ?></button>
  </form>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
