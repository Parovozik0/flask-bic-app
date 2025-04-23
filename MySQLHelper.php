<?php
class MySQLHelper {
    private $servername = "localhost";
    private $username = "u2731238_admin";
    private $password = "zFYtby542KhJR5U1";
    private $dbname = "u2731238_BIC";
    private $conn;

    public function __construct() {
        // Создание подключения к базе данных
        $this->conn = new mysqli($this->servername, $this->username, $this->password, $this->dbname);
        
        // Проверка подключения
        if ($this->conn->connect_error) {
            die("Connection failed: " . $this->conn->connect_error);
        }

        // Установка кодировки соединения на UTF-8
        if (!$this->conn->set_charset("utf8")) {
            die("Error loading character set utf8: " . $this->conn->error);
        }
    }

    public function __destruct() {
        // Закрытие подключения к базе данных
        $this->conn->close();
    }

    public function fillDataGridView($tableName, $filter) {
    $sql = "";

    switch ($filter) {
        case '40/20':
            $sql = "SELECT Номер FROM $tableName";
            break;
        case '40':
            $sql = "SELECT Номер FROM $tableName";
            //$sql = "SELECT Номер FROM $tableName WHERE Номер LIKE 'RXTU40%'";
            break;
        case '20':
            $sql = "SELECT Номер FROM $tableName WHERE Номер LIKE 'RXTU20%' OR Номер LIKE 'RXTU02%'";
            break;
        default:
            return 3;
    }

    $result = $this->conn->query($sql);

    if (!$result) {
        // Обработка ошибки запроса
        echo "Ошибка запроса: " . $this->conn->error;
        return [];
    }

    $numbers = [];
    while ($row = $result->fetch_assoc()) {
        $numbers[] = $row['Номер'];
    }

    return $numbers;
}

}
?>