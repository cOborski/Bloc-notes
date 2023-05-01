<?php
session_name('__Secure-PHPSESSID');
session_start();
if ($_POST['csrf_token_connect'] !== $_SESSION['csrf_token_connect'] || !isset($_POST['nomConnect'], $_POST['mdpConnect']) || isset($_SESSION["nom"], $_SESSION['userId'])) {
  header('HTTP/2.0 403 Forbidden');
  exit();
}
require_once "./config.php";
$nomConnect = htmlspecialchars($_POST['nomConnect'], ENT_QUOTES);
$mdpConnect = htmlspecialchars($_POST['mdpConnect'], ENT_QUOTES);
$query = $PDO->prepare("SELECT * FROM users WHERE nom=:NomConnect");
$query->execute([':NomConnect' => $nomConnect]);
$row = $query->fetch(PDO::FETCH_ASSOC);
if (!password_verify($mdpConnect, $row['mdp'])) {
  header('HTTP/2.0 403 Forbidden');
  exit();
}
$_SESSION['nom'] = $row['nom'];
$_SESSION['userId'] = $row['id'];
$_SESSION['tri_secure'] = $row['tri'];
$_SESSION['key_secure'] = $row['one_key'];
$query->closeCursor();
$PDO = null;
