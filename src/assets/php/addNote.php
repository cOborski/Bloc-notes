<?php
if (isset($_POST['title'], $_POST['content'], $_POST['date'], $_POST['color'], $_POST['hidden']) === false) {
    throw new Exception('Insert failed');
    return;
}

global $PDO, $name, $key;
require_once __DIR__ . '/getKey.php';
require_once __DIR__ . '/class/Encryption.php';

$encryption = new Encryption\Encryption();
$title = $_POST['title'];
$content = $_POST['content'];
$color = $_POST['color'];
$dateNote = $_POST['date'];
$hidden = $_POST['hidden'];
$category = $_POST['category'];
$allColors = [
    'bg-default',
    'bg-red',
    'bg-orange',
    'bg-yellow',
    'bg-green',
    'bg-cyan',
    'bg-light-blue',
    'bg-blue',
    'bg-purple',
    'bg-pink'
];
$allCategories = ['0','1','2','3','4','5','6'];

if (in_array($color, $allColors) === false) $color = 'Noir';
if (in_array($category, $allCategories) === false) $category = '0';

try {
    $query = $PDO->prepare("INSERT INTO notes (title,content,dateNote,color,hiddenNote,category,user) VALUES (:Title,:Content,:DateNote,:Color,:HiddenNote,:Category,:User)");
    $query->execute(
        [
            ':Title'      => $encryption->encryptData($title, $key),
            ':Content'    => $encryption->encryptData($content, $key),
            ':Color'      => $color,
            ':DateNote'   => $dateNote,
            ':HiddenNote' => $hidden,
            ':Category'   => $category,
            ':User'       => $name
        ]
    );
} catch (Exception $e) {
    throw new Exception('Insert failed');
    return;
}

$query->closeCursor();
$PDO = null;
