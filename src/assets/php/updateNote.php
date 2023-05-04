<?php
session_name('__Secure-PHPSESSID');
session_start();
if (!isset($_SESSION["nom"], $_SESSION['userId'], $_POST['title'], $_POST['filterDesc'])) {
  header('HTTP/2.0 403 Forbidden');
  exit();
} 
require_once "./config.php";
require_once "./functions.php";
$descriptionConnect = $_POST['filterDesc'];
$descriptionConnect = encrypt_data($descriptionConnect, $_SESSION['key']);
$noteId = $_POST['noteId'];
$titleConnect = $_POST['title'];
$titleConnect = encrypt_data($titleConnect, $_SESSION['key']);
$couleurConnect = $_POST['couleur'];
$dateNote = $_POST['date'];
$hidden = $_POST['hidden'];
$couleursAutorisees = array("Noir", "Blanc", "Rouge", "Orange", "Jaune", "Vert", "Cyan", "BleuCiel", "Bleu", "Violet", "Rose");
if (!in_array($couleurConnect, $couleursAutorisees)) {
  $couleurConnect = "Noir";
}
$query = $PDO->prepare("UPDATE notes SET titre=:Title,content=:FilterDesc,dateNote=:DateNote,couleur=:Couleur,hiddenNote=:HiddenNote WHERE id=:NoteId AND user=:CurrentUser");
$query->execute([
  ':Title' => $titleConnect,
  ':FilterDesc' => $descriptionConnect,
  ':Couleur' => $couleurConnect,
  ':NoteId' => $noteId,
  ':DateNote' => $dateNote,
  ':CurrentUser' => $_SESSION["nom"],
  ':HiddenNote' => $hidden
]);
$query->closeCursor();
$PDO = null;
