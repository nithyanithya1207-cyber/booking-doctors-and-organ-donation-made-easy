<?php
require_once __DIR__ . '/includes/auth.php';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $name  = trim($_POST['full_name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $pass  = $_POST['password'] ?? '';
    $phone = trim($_POST['phone'] ?? '');
    $city  = trim($_POST['city'] ?? '');
    $blood = $_POST['blood_group'] ?? '';

    if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($pass) < 6) {
        $error = 'Enter a name, a valid email and a password of at least 6 characters.';
    } else {
        $exists = db()->prepare('SELECT id FROM users WHERE email = ?');
        $exists->execute([$email]);
        if ($exists->fetch()) {
            $error = 'That email is already registered.';
        } else {
            $stmt = db()->prepare(
                'INSERT INTO users (email, password_hash, full_name, phone, city, blood_group)
                 VALUES (?, ?, ?, ?, ?, ?)'
            );
            $stmt->execute([$email, password_hash($pass, PASSWORD_DEFAULT), $name, $phone ?: null, $city ?: null, $blood ?: null]);
            $uid = (int) db()->lastInsertId();

            // Default role for every new account.
            db()->prepare('INSERT INTO user_roles (user_id, role) VALUES (?, "patient")')->execute([$uid]);
            notify($uid, 'Welcome to MediLink', 'Your account is ready. Browse doctors or register as a donor.');

            $_SESSION['user_id'] = $uid;
            header('Location: dashboard.php');
            exit;
        }
    }
}

$pageTitle = 'Register';
require_once __DIR__ . '/includes/header.php';
?>
<div class="auth-wrap card">
  <h1>Create your account</h1>
  <p class="sub">Signing up creates rows in <code>users</code> and <code>user_roles</code>.</p>
  <?php if ($error): ?><div class="alert error" style="margin-top:14px"><?= e($error) ?></div><?php endif; ?>
  <form method="post">
    <input type="hidden" name="csrf" value="<?= csrf_token() ?>">
    <label for="full_name">Full name</label>
    <input id="full_name" name="full_name" required value="<?= e($_POST['full_name'] ?? '') ?>">
    <label for="email">Email</label>
    <input id="email" type="email" name="email" required value="<?= e($_POST['email'] ?? '') ?>">
    <label for="password">Password</label>
    <input id="password" type="password" name="password" minlength="6" required>
    <div class="row">
      <div>
        <label for="phone">Phone</label>
        <input id="phone" name="phone" value="<?= e($_POST['phone'] ?? '') ?>">
      </div>
      <div>
        <label for="city">City</label>
        <input id="city" name="city" value="<?= e($_POST['city'] ?? '') ?>">
      </div>
    </div>
    <label for="blood_group">Blood group</label>
    <select id="blood_group" name="blood_group">
      <option value="">Not sure</option>
      <?php foreach (BLOOD_GROUPS as $bg): ?>
        <option <?= (($_POST['blood_group'] ?? '') === $bg) ? 'selected' : '' ?>><?= $bg ?></option>
      <?php endforeach; ?>
    </select>
    <button class="btn" type="submit">Register</button>
  </form>
  <p class="sub" style="margin-top:14px">Already registered? <a href="login.php">Log in</a></p>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
