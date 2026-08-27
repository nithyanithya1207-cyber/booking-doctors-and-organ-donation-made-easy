<?php
require_once __DIR__ . '/includes/auth.php';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $email = trim($_POST['email'] ?? '');
    $pass  = $_POST['password'] ?? '';

    $stmt = db()->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $row = $stmt->fetch();

    if ($row && password_verify($pass, $row['password_hash'])) {
        session_regenerate_id(true);
        $_SESSION['user_id'] = (int) $row['id'];
        header('Location: dashboard.php');
        exit;
    }
    $error = 'Incorrect email or password.';
}

$pageTitle = 'Login';
require_once __DIR__ . '/includes/header.php';
?>
<div class="auth-wrap card">
  <h1>Welcome back</h1>
  <p class="sub">Log in to manage appointments and donations.</p>
  <?php if ($error): ?><div class="alert error" style="margin-top:14px"><?= e($error) ?></div><?php endif; ?>
  <form method="post">
    <input type="hidden" name="csrf" value="<?= csrf_token() ?>">
    <label for="email">Email</label>
    <input id="email" type="email" name="email" required value="<?= e($_POST['email'] ?? '') ?>">
    <label for="password">Password</label>
    <input id="password" type="password" name="password" required>
    <button class="btn" type="submit">Log in</button>
  </form>
  <p class="sub" style="margin-top:14px">New here? <a href="register.php">Create an account</a></p>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>
