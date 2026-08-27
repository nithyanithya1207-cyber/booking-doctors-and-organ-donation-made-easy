<?php
require_once __DIR__ . '/includes/auth.php';
$me = require_login();
$msg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();

    if (($_POST['action'] ?? '') === 'close') {
        db()->prepare('UPDATE organ_requests SET status = "closed" WHERE id = ? AND patient_id = ?')
            ->execute([(int) $_POST['id'], $me['id']]);
        header('Location: matching.php');
        exit;
    }

    $organ  = $_POST['organ'] ?? '';
    $blood  = $_POST['blood_group'] ?? '';
    $city   = trim($_POST['city'] ?? '');
    $urgency = in_array($_POST['urgency'] ?? '', ['low','normal','high','critical'], true) ? $_POST['urgency'] : 'normal';

    if ($organ && $blood && $city !== '') {
        db()->prepare(
            'INSERT INTO organ_requests (patient_id, patient_name, organ, blood_group, city, urgency)
             VALUES (?, ?, ?, ?, ?, ?)'
        )->execute([$me['id'], $me['full_name'], $organ, $blood, $city, $urgency]);
        notify($me['id'], 'Organ request created', "Your request for a $organ in $city is now open.");
        $msg = 'Request created — matching donors are listed below.';
    }
}

$reqStmt = db()->prepare('SELECT * FROM organ_requests WHERE patient_id = ? ORDER BY id DESC');
$reqStmt->execute([$me['id']]);
$requests = $reqStmt->fetchAll();

// Available donors, filtered in PHP by organ + blood compatibility.
$donors = db()->query('SELECT * FROM donors WHERE available = 1')->fetchAll();

function matches_for(array $req, array $donors): array
{
    $out = [];
    foreach ($donors as $d) {
        $organs = array_filter(array_map('trim', explode(',', $d['organs'])));
        if (!in_array($req['organ'], $organs, true)) continue;
        if (!blood_compatible($d['blood_group'], $req['blood_group'])) continue;
        $d['same_city'] = strcasecmp($d['city'], $req['city']) === 0;
        $out[] = $d;
    }
    usort($out, fn($a, $b) => ($b['same_city'] <=> $a['same_city']));
    return $out;
}

$pageTitle = 'Matching';
require_once __DIR__ . '/includes/header.php';
?>
<div class="page-head">
  <div><h1>Organ matching</h1><p class="sub">Requests are matched by organ, blood-group compatibility, then city.</p></div>
</div>

<?php if ($msg): ?><div class="alert success"><?= e($msg) ?></div><?php endif; ?>

<div class="card" style="max-width:760px">
  <h2>New organ request</h2>
  <form method="post">
    <input type="hidden" name="csrf" value="<?= csrf_token() ?>">
    <div class="row">
      <div>
        <label for="organ">Organ needed</label>
        <select id="organ" name="organ" required>
          <?php foreach (ORGANS as $o): ?><option><?= $o ?></option><?php endforeach; ?>
        </select>
      </div>
      <div>
        <label for="blood_group">Your blood group</label>
        <select id="blood_group" name="blood_group" required>
          <?php foreach (BLOOD_GROUPS as $bg): ?>
            <option <?= ($me['blood_group'] === $bg) ? 'selected' : '' ?>><?= $bg ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div>
        <label for="city">City</label>
        <input id="city" name="city" required value="<?= e($me['city']) ?>">
      </div>
      <div>
        <label for="urgency">Urgency</label>
        <select id="urgency" name="urgency">
          <option value="low">Low</option>
          <option value="normal" selected>Normal</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>
    </div>
    <button class="btn" type="submit">Create request</button>
  </form>
</div>

<h2 style="margin-top:28px">My requests &amp; matched donors</h2>
<?php if (!$requests): ?>
  <p class="empty">No organ requests yet.</p>
<?php endif; ?>

<?php foreach ($requests as $r): $found = matches_for($r, $donors); ?>
<div class="card" style="margin-bottom:16px">
  <div class="page-head" style="margin-bottom:10px">
    <div>
      <h3><?= e($r['organ']) ?> &middot; <?= e($r['blood_group']) ?> &middot; <?= e($r['city']) ?></h3>
      <p class="sub">
        <span class="pill <?= in_array($r['urgency'], ['high','critical'], true) ? 'bad' : 'warn' ?>"><?= e($r['urgency']) ?></span>
        <span class="pill <?= $r['status'] === 'open' ? 'ok' : '' ?>"><?= e($r['status']) ?></span>
        <?= count($found) ?> potential donor(s)
      </p>
    </div>
    <?php if ($r['status'] === 'open'): ?>
    <form method="post" class="inline" data-confirm="Close this request?">
      <input type="hidden" name="csrf" value="<?= csrf_token() ?>">
      <input type="hidden" name="action" value="close">
      <input type="hidden" name="id" value="<?= (int) $r['id'] ?>">
      <button class="btn btn-sm btn-ghost" type="submit">Close request</button>
    </form>
    <?php endif; ?>
  </div>

  <?php if ($found): ?>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Donor</th><th>Blood</th><th>City</th><th>Age</th><th>Contact</th></tr></thead>
      <tbody>
      <?php foreach ($found as $d): ?>
        <tr>
          <td><?= e($d['full_name']) ?></td>
          <td><?= e($d['blood_group']) ?></td>
          <td><?= e($d['city']) ?> <?= $d['same_city'] ? '<span class="pill ok">same city</span>' : '' ?></td>
          <td><?= e($d['age']) ?: '—' ?></td>
          <td><?= e($d['phone']) ?: '—' ?></td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </div>
  <?php else: ?>
    <p class="sub">No compatible donors available right now.</p>
  <?php endif; ?>
</div>
<?php endforeach; ?>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
