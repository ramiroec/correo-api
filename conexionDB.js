const { createClient } = require('@libsql/client');

const db = createClient({
  url: 'libsql://emails-ramiroec.aws-us-east-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTM3NjAyMDYsImlkIjoiNTMwMzQ1MGItOTA0My00MjY0LTkzZmYtNzc1MjMxNWVlNmI0IiwicmlkIjoiNzg3Mzc2Y2YtYmQ2NS00MmU5LWJlY2YtNDJjY2VkMzQwMzE0In0.tSDJvlaASTx1THL99Mr9vROwLhc56_ioanRSTELI-o5ziQ6Czzeoju0TZ87j3NiPGeEFMzHO8JgbBwDbbLigBw',
  syncUrl: undefined, // 👈 esto evita que cargue sqlite local
});

module.exports = db;
