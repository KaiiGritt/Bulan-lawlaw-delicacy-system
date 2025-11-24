SELECT p.id, p.name, p.userId, u.name as userName FROM products p LEFT JOIN users u ON p.userId = u.id;
