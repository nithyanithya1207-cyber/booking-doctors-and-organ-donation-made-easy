<?php
$pageTitle = 'Home';
require_once __DIR__ . '/includes/header.php';

$counts = [];
foreach (['doctors', 'donors', 'appointments', 'organ_requests'] as $t) {
    $counts[$t] = (int) db()->query("SELECT COUNT(*) c FROM $t")->fetch()['c'];
}
?>
<section class="hero">
  <h1>Healthcare access, organised.</h1>
  <p>MediLink connects patients with doctors and matches verified organ donors to the people who need them — one portal for appointments, donations and updates.</p>
  <?php if (!$me): ?>
    <a class="btn" href="register.php">Create an account</a>
    <a class="btn btn-ghost" href="login.php">I already have one</a>
  <?php else: ?>
    <a class="btn" href="dashboard.php">Go to dashboard</a>
  <?php endif; ?>
</section>

<div class="grid cols-4">
  <div class="card"><p>Doctors listed</p><p class="stat"><?= $counts['doctors'] ?></p></div>
  <div class="card"><p>Registered donors</p><p class="stat"><?= $counts['donors'] ?></p></div>
  <div class="card"><p>Appointments booked</p><p class="stat"><?= $counts['appointments'] ?></p></div>
  <div class="card"><p>Organ requests</p><p class="stat"><?= $counts['organ_requests'] ?></p></div>
</div>

<div class="grid cols-3" style="margin-top:22px">
  <div class="card"><h3>Book appointments</h3><p>Browse doctors by city and specialisation, then book a date and time. Every booking is stored in MySQL.</p></div>
  <div class="card"><h3>Register as a donor</h3><p>Add your blood group, organs and city. Availability can be toggled at any time.</p></div>
  <div class="card"><h3>Smart matching</h3><p>Organ requests are matched to donors by organ, city and blood-group compatibility rules.</p></div>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
