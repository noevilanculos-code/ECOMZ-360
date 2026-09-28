<?php
require_once __DIR__ . '/../config.php';

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    $stmt = $pdo->query("SELECT * FROM projetos ORDER BY data_inicio DESC");
    $projetos = $stmt->fetchAll();

    echo json_encode([
        'status' => 'sucesso',
        'total' => count($projetos),
        'dados' => $projetos
    ]);
    exit;
}

if ($metodo === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

    $titulo       = $input['titulo'] ?? '';
    $descricao    = $input['descricao'] ?? '';
    $categoria    = $input['categoria'] ?? 'Restauração';
    $provincia    = $input['provincia'] ?? '';
    $meta_arvores = (int)($input['meta_arvores'] ?? 1000);
    $data_inicio  = $input['data_inicio'] ?? date('Y-m-d');

    if (empty($titulo) || empty($provincia)) {
        http_response_code(400);
        echo json_encode([
            'status' => 'erro',
            'mensagem' => 'Título e Província são obrigatórios.'
        ]);
        exit;
    }

    $sql = "INSERT INTO projetos (titulo, descricao, categoria, provincia, meta_arvores, data_inicio) 
            VALUES (:titulo, :descricao, :categoria, :provincia, :meta_arvores, :data_inicio)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':titulo'       => $titulo,
        ':descricao'    => $descricao,
        ':categoria'    => $categoria,
        ':provincia'    => $provincia,
        ':meta_arvores' => $meta_arvores,
        ':data_inicio'  => $data_inicio
    ]);

    echo json_encode([
        'status' => 'sucesso',
        'mensagem' => 'Projeto comunitário criado com sucesso no MySQL!',
        'id' => $pdo->lastInsertId()
    ]);
    exit;
}
