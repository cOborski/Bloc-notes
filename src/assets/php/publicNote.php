<?php
global $PDO;
session_name('__Secure-notes');
session_start();

if (isset($_SESSION['name'], $_SESSION['userId'], $_POST['noteId'], $_POST['noteLink']) === false) {
    http_response_code(403);
    return;
}
if (is_string($_SESSION['name']) === false || is_int($_SESSION['userId']) === false || is_string($_POST['noteLink']) === false || is_numeric($_POST['noteId']) === false) {
    http_response_code(403);
    return;
}

require_once __DIR__ . '/config/config.php';

$name = $_SESSION['name'];
$noteId = $_POST['noteId'];
$noteLink = $_POST['noteLink'];

try {
    $query = $PDO->prepare("UPDATE notes SET link=:NoteLink WHERE id=:NoteId AND user=:CurrentUser AND link IS NULL");
    $query->execute(
        [
            ':NoteLink'     => $noteLink,
            ':NoteId'       => $noteId,
            ':CurrentUser'  => $name,
        ]
    );
    $query->closeCursor();
    $PDO = null;
    if ($query->rowCount() === 0) {
        http_response_code(403);
        return;
    }
    $directoryPath = realpath(__DIR__ . '/../../share/') . '/' . $noteLink;
    if (is_dir($directoryPath) === false) {
        if (mkdir($directoryPath, 0755, true)) {
            $index = fopen($directoryPath . '/index.html', 'w');
            if ($index === false) {
                http_response_code(500);
                return;
            }
            $indexContent =
            <<<EOT
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="robots" content="noindex, nofollow">
                <title>Bloc-notes &#8211; Léo SEGUIN</title>
                <link rel="shortcut icon" href="/seguinleo-notes/favicon.ico" type="image/x-icon">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <meta name="theme-color" content="#171717">
                <meta name="apple-mobile-web-app-capable" content="yes">
                <meta name="apple-mobile-web-app-status-bar-style" content="#171717">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; connect-src 'self'; font-src 'self' https://cdnjs.cloudflare.com/; form-action 'self'; img-src http:; manifest-src 'self'; script-src 'self'; script-src-attr 'none'; script-src-elem 'self'; style-src 'self' https://cdnjs.cloudflare.com/; style-src-attr 'none'; style-src-elem 'self' https://cdnjs.cloudflare.com/; worker-src 'self'">
                <link rel="stylesheet" href="/seguinleo-notes/share/stylePublic.css">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
            </head>
            <body>
                <main data-link="%s"></main>
                <footer>
                    <a href="/seguinleo-notes/" target="_blank" rel="noreferrer">
                        Bloc-notes &#8211; Léo SEGUIN
                    </a>
                </footer>
                <script src="/seguinleo-notes/assets/js/purify.min.js" defer></script>
                <script src="/seguinleo-notes/assets/js/showdown.min.js" defer></script>
                <script src="/seguinleo-notes/share/scriptPublic.js" defer></script>
            </body>
            </html>
            EOT;
            $indexContent = sprintf($indexContent, $noteLink);
            fwrite($index, $indexContent);
            fclose($index);
        } else {
            http_response_code(403);
            return;
        }
    } else {
        http_response_code(500);
        return;
    }
} catch (Exception $e) {
    http_response_code(500);
    return;
}