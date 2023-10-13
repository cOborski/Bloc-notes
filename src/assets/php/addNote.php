<?php
session_name('__Secure-notes');
session_start();

if (isset($_POST['csrf_token_note']) === false) {
    http_response_code(403);
    return;
}
if ($_POST['csrf_token_note'] !== $_SESSION['csrf_token_note']) {
    http_response_code(403);
    return;
}
if (isset($_SESSION['nom'], $_SESSION['key'], $_SESSION['userId'], $_POST['title'], $_POST['desc'], $_POST['date'], $_POST['couleur'], $_POST['hidden']) === false) {
    http_response_code(403);
    return;
}

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/class/Encryption.php';

$encryption = new Encryption\Encryption();

$key = $_SESSION['key'];
$desc = $_POST['desc'];
$desc = $encryption->encryptData($desc, $key);
$title = $_POST['title'];
$title = $encryption->encryptData($title, $key);
$couleur = $_POST['couleur'];
$dateNote = $_POST['date'];
$hidden = $_POST['hidden'];
$nom = $_SESSION['nom'];
$couleursAutorisees = [
    "Noir",
    "Blanc",
    "Rouge",
    "Orange",
    "Jaune",
    "Vert",
    "Cyan",
    "BleuCiel",
    "Bleu",
    "Violet",
    "Rose"
];

if (in_array($couleur, $couleursAutorisees) === false) {
    $couleur = 'Noir';
}

try {
    $query = $PDO->prepare("INSERT INTO notes (titre,content,dateNote,couleur,user,hiddenNote) VALUES (:Title,:Descr,:DateNote,:Couleur,:User,:HiddenNote)");
    $query->execute(
        [
            ':Title'      => $title,
            ':Descr'      => $desc,
            ':DateNote'   => $dateNote,
            ':Couleur'    => $couleur,
            ':User'       => $nom,
            ':HiddenNote' => $hidden
        ]
    );
    $query->closeCursor();
    $PDO = null;
} catch (Exception $e) {
    http_response_code(500);
    return;
}
