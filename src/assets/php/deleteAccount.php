<?php
session_name('__Secure-PHPSESSID');
session_start();
if (!isset($_SESSION["nom"], $_SESSION['userId'])) {
  header('HTTP/2.0 403 Forbidden');
  exit();
}
require_once "./config.php";
$query = $PDO->prepare("DELETE FROM users WHERE nom=:CurrentUser AND id=:UserId");
$query->execute([
  ':CurrentUser' => htmlspecialchars($_SESSION["nom"], ENT_QUOTES),
  ':UserId' => htmlspecialchars($_SESSION["userId"], ENT_QUOTES)
]);
session_unset();
session_destroy();
$query->closeCursor();
$PDO = null;
