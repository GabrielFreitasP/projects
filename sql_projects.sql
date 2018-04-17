CREATE DATABASE "PROJECTS"
ENCODING 'WIN1252'
TEMPLATE = template0
CONNECTION LIMIT -1;

CREATE TABLE tb_usuario (
id_usuario	SERIAL,
email		VARCHAR(60) CONSTRAINT u_nn_usuario_email UNIQUE NOT NULL,
senha		VARCHAR(32) CONSTRAINT nn_usuario_senha NOT NULL,
tp_usuario	INTEGER CONSTRAINT nn_usuario_tp_usuario NOT NULL,
CONSTRAINT pk_usuario PRIMARY KEY (id_usuario)
);
--

CREATE TABLE tb_aluno (
id_usuario	INTEGER,
nome_completo	VARCHAR(120) CONSTRAINT nn_aluno_nome_completo NOT NULL,
universidade	VARCHAR(60) CONSTRAINT nn_aluno_universidade NOT NULL,
cod_matricula	VARCHAR(30) CONSTRAINT nn_aluno_cod_matricula NOT NULL,
CONSTRAINT pk_aluno PRIMARY KEY (id_usuario),
CONSTRAINT fk_aluno_id_usuario FOREIGN KEY (id_usuario)
	REFERENCES tb_usuario (id_usuario)
);
--

CREATE TABLE tb_empresa (
id_usuario	INTEGER,
nome_usuario	VARCHAR(30) CONSTRAINT nn_empresa_nome_usuario NOT NULL,
nome_empresa	VARCHAR(60) CONSTRAINT nn_empresa_nome_empresa NOT NULL,
cnpj		VARCHAR(14) CONSTRAINT nn_empresa_cnpj NOT NULL,
CONSTRAINT pk_empresa PRIMARY KEY (id_usuario),
CONSTRAINT fk_empresa_id_usuario FOREIGN KEY (id_usuario)
	REFERENCES tb_usuario (id_usuario)
);
--

CREATE TABLE tb_area (
id_area		SERIAL,
ds_area		VARCHAR(60) CONSTRAINT nn_area_ds_area NOT NULL, --descricao
cursos		VARCHAR(200),
CONSTRAINT pk_area PRIMARY KEY (id_area)
);
--

CREATE TABLE tb_projeto (
id_projeto	SERIAL,
id_criador	INTEGER		CONSTRAINT nn_projeto_id_criador 	NOT NULL,
id_area		INTEGER 	CONSTRAINT nn_projeto_id_area 		NOT NULL,
titulo		VARCHAR(60) 	CONSTRAINT nn_projeto_titulo 		NOT NULL,
tema		VARCHAR(60),
ds_projeto	VARCHAR(200) 	CONSTRAINT nn_projeto_ds_projeto 	NOT NULL, --descricao
prazo		DATE,
privacidade	BOOLEAN		CONSTRAINT nn_projeto_privacidade	NOT NULL,
CONSTRAINT pk_projeto PRIMARY KEY (id_projeto),
CONSTRAINT fk_projeto_id_area FOREIGN KEY (id_area)
	REFERENCES tb_area (id_area),
CONSTRAINT fk_projeto_id_criador FOREIGN KEY (id_criador)
	REFERENCES tb_empresa(id_usuario)
);
--

CREATE TABLE tb_meus_projetos (
id_projeto	INTEGER,
id_aluno	INTEGER,
CONSTRAINT pk_meus_projetos PRIMARY KEY (id_projeto, id_aluno),
CONSTRAINT fk_projetos_id_projeto FOREIGN KEY (id_projeto)
	REFERENCES tb_projeto (id_projeto),
CONSTRAINT fk_projetos_id_aluno FOREIGN KEY (id_aluno)
	REFERENCES tb_aluno (id_usuario)
);
--
