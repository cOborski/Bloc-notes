<?php
session_name('__Secure-notes');
session_start();

if (isset($_SESSION['nom'], $_SESSION['tri'], $_SESSION['key']) === false) {
    http_response_code(403);
    return;
}
if (preg_match('/^[a-zA-ZÀ-ÿ -]+$/', $_SESSION['nom']) === false) {
    http_response_code(403);
    return;
}

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/class/Encryption.php';

$encryption = new Encryption\Encryption();

$nom = $_SESSION['nom'];
$tri = $_SESSION['tri'];
$key = $_SESSION['key'];

if ($tri === 'Date de création') {
    $orderBy = 'ORDER BY id DESC';
} else if ($tri === 'Date de création (Z-A)') {
    $orderBy = 'ORDER BY id';
} else if ($tri === 'Date de modification') {
    $orderBy = 'ORDER BY dateNote DESC, id DESC';
} else {
    $orderBy = 'ORDER BY dateNote, id DESC';
}

try {
    $query = $PDO->prepare("SELECT id,titre,couleur,content,dateNote,hiddenNote,link FROM notes WHERE user=:CurrentUser $orderBy");
    $query->execute([':CurrentUser' => $nom]);
    $items = [];

    while ($row = $query->fetch(PDO::FETCH_ASSOC)) {
        $items[] = [
            'id'      => $row['id'],
            'title'   => $encryption->decryptData($row['titre'], $key),
            'couleur' => $row['couleur'],
            'desc'    => $encryption->decryptData($row['content'], $key),
            'date'    => $row['dateNote'],
            'hidden'  => $row['hiddenNote'],
            'link'    => $row['link'] === null ? '' : $row['link']
        ];
    }
} catch (Exception $e) {
    http_response_code(500);
    return;
}

echo json_encode($items);
$query->closeCursor();
$PDO = null;
