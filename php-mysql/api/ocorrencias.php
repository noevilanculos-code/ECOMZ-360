<?php
require_once __DIR__ . '/../config.php';

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    // Listar ocorrências com filtros opcionais
    $provincia = isset($_GET['provincia']) ? trim($_GET['provincia']) : '';
    $categoria = isset($_GET['categoria']) ? trim($_GET['categoria']) : '';

    $sql = "SELECT * FROM ocorrencias WHERE 1=1";
    $params = [];

    if (!empty($provincia)) {
        $sql .= " AND provincia = :provincia";
        $params[':provincia'] = $provincia;
    }

    if (!empty($categoria)) {
        $sql .= " AND categoria = :categoria";
        $params[':categoria'] = $categoria;
    }

    $sql .= " ORDER BY criado_em DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $ocorrencias = $stmt->fetchAll();

    echo json_encode([
        'status' => 'sucesso',
        'total' => count($ocorrencias),
        'dados' => $ocorrencias
    ]);
    exit;
}

if ($metodo === 'POST') {
    // Cadastrar nova ocorrência
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        $input = $_POST;
    }

    $titulo    = $input['titulo'] ?? '';
    $descricao = $input['descricao'] ?? '';
    $categoria = $input['categoria'] ?? 'Outro';
    $provincia = $input['provincia'] ?? '';
    $distrito  = $input['distrito'] ?? '';
    $latitude  = $input['latitude'] ?? -18.665695;
    $longitude = $input['longitude'] ?? 35.529562;
    $gravidade = $input['gravidade'] ?? 'media';

    if (empty($titulo) || empty($descricao) || empty($provincia)) {
        http_response_code(400);
        echo json_encode([
            'status' => 'erro',
            'mensagem' => 'Título, descrição e província são campos obrigatórios.'
        ]);
        exit;
    }

    $sql = "INSERT INTO ocorrencias (titulo, descricao, categoria, provincia, distrito, latitude, longitude, gravidade, status) 
            VALUES (:titulo, :descricao, :categoria, :provincia, :distrito, :latitude, :longitude, :gravidade, 'pendente')";

    $stmt = $pdo->prepare($sql);
    $sucesso = $stmt->execute([
        ':titulo'    => $titulo,
        ':descricao' => $descricao,
        ':categoria' => $categoria,
        ':provincia' => $provincia,
        ':distrito'  => $distrito,
        ':latitude'  => $latitude,
        ':longitude' => $longitude,
        ':gravidade' => $gravidade
    ]);

    if ($sucesso) {
        http_response_code(201);
        echo json_encode([
            'status' => 'sucesso',
            'mensagem' => 'Ocorrência ambiental cadastrada com sucesso!',
            'id' => $pdo->lastInsertId()
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'status' => 'erro',
            'mensagem' => 'Falha ao salvar ocorrência no banco MySQL.'
        ]);
    }
    exit;
}
