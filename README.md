# Sistema de Controle de Obrigações Acessórias

API REST e interface web para **cadastro e gestão de obrigações acessórias contábeis e fiscais**.

---

# 📌 Requisitos

Para executar o projeto localmente, você precisa ter instalado:

- **Java 17**
- **Maven 3.8+**
- **Docker Desktop (Para execução do banco PostgreSQL via container)**

---

# ⚙️ Executando o Projeto Localmente

### 1. Subir o banco de dados

O projeto utiliza **PostgreSQL via Docker**.

```bash
docker compose up -d
```

Banco configurado em `application.properties`:

- Host: `localhost`
- Porta: `5432`
- Database: `obrigacoes_db`
- User: `postgres`
- Password: `postgres`

---

### 2. Compilar o projeto

```bash
mvn clean package
```

---

### 3. Executar a aplicação

```bash
mvn spring-boot:run
```

A aplicação estará disponível em:

```
http://localhost:8080
```

---

# 📖 Endpoints da API

Base path:

```
/api/obrigacoes
```

### Listar obrigações

```
GET /api/obrigacoes
```

### Buscar obrigação por ID

```
GET /api/obrigacoes/{id}
```

### Criar obrigação

```
POST /api/obrigacoes
```

Exemplo de payload:

```json
{
  "nome": "EFD-Contribuições",
  "departamento": "FISCAL",
  "periodicidade": "MENSAL",
  "tipoPrazo": "DIA_UTIL",
  "numeroDiaUtil": 10
}
```

### Atualizar obrigação

```
PUT /api/obrigacoes/{id}
```

### Excluir obrigação

```
DELETE /api/obrigacoes/{id}
```

### Regra específica de prazo

- Para `tipoPrazo = ULTIMO_DIA_UTIL`, o sistema exige apenas `mesLimite` (1 a 12).
- Nesse caso, `diaLimite` e `numeroDiaUtil` são ignorados e a periodicidade é tratada como `ANUAL`.

---

# 🗄️ Banco de Dados

O projeto utiliza:

- **PostgreSQL**
- Executado via **Docker Compose**

Ferramentas úteis para acessar o banco:

- DBeaver
- pgAdmin

---

# 🚀 Tecnologias Utilizadas

- **Java 17**
- **Spring Boot**
- **Spring Web MVC**
- **Spring Data JPA**
- **Bean Validation (Jakarta Validation)**
- **PostgreSQL**
- **Docker / Docker Compose**
- **Swagger / OpenAPI**
- **HTML**
- **CSS**
- **JavaScript**
