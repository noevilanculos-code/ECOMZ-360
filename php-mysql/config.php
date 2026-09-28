<?php
/**
 * ECO-MZ 360 - Configuração de Conexão com a Base de Dados MySQL via PDO
 *
 * Este ficheiro gere as configurações de conexão PDO para a base de dados
 * MySQL do ECO-MZ (ecomz_db). Suporta tanto ambiente local (XAMPP, WAMP,
 * Laragon, Docker) quanto servidores de produção (cPanel, Apache, Nginx).
 */

// Configurações do Banco de Dados MySQL (com fallback para variáveis de ambiente)
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_PORT', getenv('DB_PORT') ?: 3306);
define('DB_NAME', getenv('DB_NAME') ?: 'ecomz_db');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') !== false ? getenv('DB_PASS') : '');
define('DB_CHARSET', 'utf8mb4');

// Configuração de cabeçalhos para requisições de API REST
if (!headers_sent()) {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    
    // Tratamento de requisições preflight OPTIONS (CORS)
    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

/**
 * Função responsável por criar e retornar uma instância PDO singleton
 *
 * @return PDO Instância de conexão PDO ativa
 * @throws PDOException Se a conexão falhar
 */
function getDbConnection(): PDO {
    static $pdo = null;

    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=%s',
            DB_HOST,
            DB_PORT,
            DB_NAME,
            DB_CHARSET
        );

        $opcoes = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];

        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $opcoes);
        } catch (PDOException $e) {
            // Em caso de erro, responder com código 500
            if (!headers_sent()) {
                http_response_code(500);
                header('Content-Type: application/json; charset=utf-8');
            }

            echo json_encode([
                'status' => 'erro',
                'mensagem' => 'Falha ao conectar com o banco de dados MySQL do ECO-MZ.',
                'detalhe' => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    return $pdo;
}

// Inicializa a variável global $pdo para compatibilidade direta com scripts existentes
$pdo = getDbConnection();
