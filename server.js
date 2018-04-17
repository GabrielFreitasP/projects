// importando o pacote express
var express = require('express')
// lidando com session
var session = require('express-session')
// cria um objeto express
var app = express()
// importando o pacote body-parse
var bodyParser = require('body-parser')
// importando o pacote cors
var core_use = require('cors');
// importando o pacote do postgresql
var pg = require('pg');

// ----- Sessão -----
app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/front/view');
app.set('view engine', 'html');
// reconhecer rotas
app.use('/assets',express.static(__dirname + '/assets'));
app.use('/front',express.static(__dirname + '/front'));
app.use('/img',express.static(__dirname + '/img'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/pug',express.static(__dirname + '/pug'));
app.use('/scss',express.static(__dirname + '/scss'));
app.use('/vendor',express.static(__dirname + '/vendor'));
// controle de sessão
app.use(session({secret: 'ssshhhhh', resave: true, saveUninitialized: true}));

// ----- Cors -----
// fazendo app para usar CORS
app.use(core_use());

// ----- BodyParser -----
// configurando app para usar body-parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// ----- VARIÁVEIS -----
// JSON de configuração de conexão com banco de dados
var config = {
	user: "postgres",
	database: "PROJECTS",
	password: "1234",
	port: 5432,
	max: 10,
	idleTimeoutMills: 30000
}
// canal de comunicação com o banco de dados
var canal = new pg.Pool(config);
// controle de sessao
var sess;

// CHAMAR TELAS
app.get('/',function(req,res){
	res.render('index.html');
});
app.get('/index',function(req,res){
	res.render('index.html');
});
app.get('/login',function(req,res){   		
	res.render('login.html');    
});

app.get('/cadastro-aluno',function(req,res){ 
	res.render('cadastro-aluno.html');    
});
app.get('/cadastro-empresa',function(req,res){
	res.render('cadastro-empresa.html');    
});
app.get('/cadastros',function(req,res){
	res.render('cadastros.html');    
});

// TELAS PERMITIDAS PARA ÚSUARIOS LOGADOS
app.get('/inicio',function(req,res){    
	sess = req.session;
	if (sess.email)
		res.render('inicio.html');
	else
		res.render('login.html');
});
app.get('/meus-projetos',function(req,res){    
	sess = req.session;
	if (sess.email)
		res.render('meus-projetos.html');
	else 
		res.render('login.html'); 
});
app.get('/projeto-cadastro',function(req,res){    
	sess=req.session;
	if (sess.email)
		res.render('projeto-cadastro.html');
	else
		res.render('login.html'); 
});
app.get('/projeto-consulta',function(req,res){    
	sess=req.session;
	if (sess.email)
		res.render('projeto-consulta.html');
	else
		res.render('login.html');     
});
app.get('/area-cadastro',function(req,res){    
	sess=req.session;
	if (sess.email)		
		if (sess.tp_usuario == 1) {
			res.render('area-cadastro.html');
		} else {
			res.render('inicio.html');	
		}		
	else
		res.render('login.html');
});
app.get('/area-consulta',function(req,res){
	sess=req.session;
	if (sess.email)
		if (sess.tp_usuario == 1) {
			res.render('area-consulta.html');	
		} else {
			res.render('inicio.html');	
		}		
	else
		res.render('login.html'); 
});


// encerra sessao
app.get('/logout',function(req,res){		
	req.session.destroy(function(err){		
		if (err) {			
			console.log(err);		
		}	
	});
	res.redirect('/login');	
});


// PROJETO ----------------------------------------------------------------------------------

// cria rota para consulta em uma tabela do banco de dados
app.get('/consultaProjeto/:id_criador/:tp_usuario', function (req, res){
	// conecta no banco a partir do canal
	canal.connect(function(erro, conexao, feito){
		if (erro){ // ocorreu um erro
			return console.error('Erro ao conectar no banco: \n', erro);
		}
		
		var sql = '\nSELECT p.id_projeto, p.id_criador, p.id_area, p.titulo, p.tema, p.ds_projeto, p.prazo, p.privacidade, ' 
				+ '\n  (CASE p.privacidade WHEN true THEN \'Privado\' ELSE \'Público\' END) AS s_privacidade, '
				+ '\n  a.ds_area, a.cursos '
				+ '\nFROM tb_projeto p '
				+ '\nLEFT JOIN tb_area a ON (p.id_area = a.id_area) '

				if (req.params.tp_usuario == 1) {
					sql	+= 	'\nWHERE (p.privacidade = false '
						+ 	'\n    OR p.id_criador = ' + req.params.id_criador + ') '
				}
				
				sql	+= '\nORDER BY p.id_projeto;';
		console.log(sql);

		conexao.query(sql, function(erro, resultado){
			feito(); // libera a conexão
			if (erro){
				return console.error('Erro seleção dos Projetos', erro);
			}
			
			res.json(resultado.rows); // retorna ao cliente as linhas do select
		});
	});
});

app.get('/getProjeto/:id_projeto', function (req, res){
	// conecta no banco a partir do canal
	canal.connect(function(erro, conexao, feito){
		if (erro){ // ocorreu um erro
			return console.error('Erro ao conectar no banco: \n', erro);
		}
		
		var sql = '\nSELECT p.id_projeto, p.id_criador, p.id_area, p.titulo, p.tema, p.ds_projeto, p.prazo, p.privacidade, ' 
				+ '\n  (CASE p.privacidade WHEN true THEN \'Privado\' ELSE \'Público\' END) AS s_privacidade, '
				+ '\n  a.ds_area, a.cursos '
				+ '\nFROM tb_projeto p '
				+ '\nLEFT JOIN tb_area a ON (p.id_area = a.id_area) '
				+ '\nWHERE p.id_projeto = ' + req.params.id_projeto + '; ';
		console.log(sql);

		conexao.query(sql, function(erro, resultado){
			feito(); // libera a conexão
			if (erro){
				return console.error('Erro seleção dos Projetos', erro);
			}
			
			res.json(resultado.rows[0]); // retorna ao cliente as linhas do select
		});
	});
});

// cria rota para insere em uma tabela do banco de dados
app.post('/insereProjeto', function (req, res){
	// conecta no banco a partir do canal
	canal.connect(function(erro, conexao, feito){
		if (erro){ // ocorreu um erro
			return console.error('Erro ao conectar no banco: \n', erro);
		}

		var prazo = 'NULL';
		if (req.body.prazo != undefined) {
			prazo = '\'' + req.body.prazo + '\'';
		}
		console.log(prazo);

		var select_criador = ""
				+ "(SELECT id_usuario "
				+ " FROM tb_usuario "
				+ " WHERE email = '" + req.session.email + "')";

		var sql = '\nINSERT INTO tb_projeto (id_projeto, id_criador, titulo, prazo, tema, id_area, privacidade, ds_projeto) '
				+ '\nVALUES \n (' 
				+ 'default, '
				+ select_criador + ", "
				+ '\'' + req.body.titulo + '\', ' 
				+ prazo + ', ' 
				+ '\'' + req.body.tema + '\', ' 
				+ req.body.id_area + ', '
				+ req.body.privacidade + ', ' 
				+ '\'' + req.body.ds_projeto + '\' ' 
				+ ')';
		console.log(sql);
		
		conexao.query(sql, function(erro, resultado){
			feito(); // libera a conexão
			if (erro){
				return console.error('Erro na inserção do Projeto: \n', erro);
			}
			res.json(resultado.rows); // retorna ao cliente o resultado da inserção
		});
	});
});

// cria rota para pegar ultimo id inserido na tabela Area
app.get('/lastIdProjeto', function (req, res){
	// conecta no banco a partir do canal
	canal.connect(function(erro, conexao, feito){
		if (erro){ // ocorreu um erro
			return console.error('Erro ao conectar no banco: \n', erro);
		}

		var sql = '\nSELECT last_value as id_projeto'
				+ '\nFROM tb_projeto_id_projeto_seq;';
		console.log(sql);

		conexao.query(sql, function(erro, resultado){
			feito(); // libera a conexão
			if (erro){
				return console.error('Erro seleção id Poejeto: \n', erro);
			}
			res.json(resultado.rows[0].id_projeto); // retorna ao cliente o resultado da inserção
		});
	});
});

// cria rota para consulta em uma tabela do banco de dados
app.delete('/removeProjeto/:id_projeto', function (req, res){
	// conecta no banco a partir do canal
	canal.connect(function(erro, conexao, feito){
		if (erro){ // ocorreu um erro
			return console.error('Erro ao conectar no banco: \n', erro);
		}

		var sql = '\nDELETE FROM tb_projeto '
				+ '\nWHERE id_projeto = ' + req.params.id_projeto;
		console.log(sql);		

		conexao.query(sql, function(erro, resultado){
			feito(); // libera a conexão
			if (erro){
				return console.error('Erro na remoção do Projeto: \n', erro);
			}
			res.json(resultado.rows); // retorna ao cliente o resultado da exclusão
		});
	});
});

// cria rota para consulta em uma tabela do banco de dados
app.put('/atualizaProjeto', function (req, res){
	// conecta no banco a partir do canal
	canal.connect(function(erro, conexao, feito){
		if (erro){ // ocorreu um erro
			return console.error('Erro ao conectar no banco: \n', erro);
		}

		var prazo = 'NULL';
		if (req.body.prazo != undefined) {
			prazo = '\'' + req.body.prazo + '\'';
		}
		console.log(prazo);

		var sql = '\nUPDATE tb_projeto '
				+ '\nSET titulo = \'' + req.body.titulo + '\', '
				+ '\n    prazo = ' + prazo + ', '
				+ '\n    tema = \'' + req.body.tema + '\', '
				+ '\n    id_area = \'' + req.body.id_area + '\', '
				+ '\n    ds_projeto = \'' + req.body.ds_projeto + '\', '
				+ '\n    privacidade = ' + req.body.privacidade + ' '
				+ '\nWHERE id_projeto = ' + req.body.id_projeto;
		console.log(sql);		

		conexao.query(sql, function(erro, resultado){
			feito(); // libera a conexão
			if (erro){
				return console.error('Erro na atualização do Projeto: \n', erro);
			}
			res.json(resultado.rows); // retorna ao cliente o resultado da atualização
		});
	});
});

// MEUS PROJETO ----------------------------------------------------------------------------

// cria rota para insere em uma tabela do banco de dados
app.get('/existeProjeto/:id_projeto/:id_aluno', function (req, res){
	// conecta no banco a partir do canal
	canal.connect(function(erro, conexao, feito){
		if (erro){ // ocorreu um erro
			return console.error('Erro ao conectar no banco: \n', erro);
		}

		var sql = '\nSELECT COUNT(*) AS count'
				+ '\nFROM tb_meus_projetos '
				+ '\nWHERE id_projeto = ' + req.params.id_projeto + ' '
				+ '\nAND id_aluno = ' + req.params.id_aluno + ';';				
		console.log(sql);

		conexao.query(sql, function(erro, resultado){
			feito(); // libera a conexão
			if (erro){
				return console.error('Erro na inserção Meu Projeto: \n', erro);
			}

			res.json(resultado.rows[0].count); // retorna ao cliente o resultado da inserção
		});
	});
});

// cria rota para insere em uma tabela do banco de dados
app.post('/addProjeto', function (req, res){
	// conecta no banco a partir do canal
	canal.connect(function(erro, conexao, feito){
		if (erro){ // ocorreu um erro
			return console.error('Erro ao conectar no banco: \n', erro);
		}

		var sql = '\nINSERT INTO tb_meus_projetos (id_projeto, id_aluno) '
				+ '\nVALUES '
				+ '\n(' + req.body.id_projeto + ', ' + req.body.id_usuario + ');';
				
		console.log(sql);

		conexao.query(sql, function(erro, resultado){
			feito(); // libera a conexão
			if (erro){
				return console.error('Erro na inserção Meu Projeto: \n', erro);
			}
			res.json(resultado.rows); // retorna ao cliente o resultado da inserção
		});
	});
});

// cria rota para insere em uma tabela do banco de dados
app.delete('/removeMeusProjeto/:id_projeto/:id_aluno', function (req, res){
	// conecta no banco a partir do canal
	canal.connect(function(erro, conexao, feito){
		if (erro){ // ocorreu um erro
			return console.error('Erro ao conectar no banco: \n', erro);
		}

		var sql = '\nDELETE FROM tb_meus_projetos '
				+ '\nWHERE id_projeto = ' + req.params.id_projeto + ' '
				+ '\nAND id_aluno = ' + req.params.id_aluno + ' ;';				
		console.log(sql);

		conexao.query(sql, function(erro, resultado){
			feito(); // libera a conexão
			if (erro){
				return console.error('Erro na inserção Meu Projeto: \n', erro);
			}
			res.json(resultado.rows); // retorna ao cliente o resultado da inserção
		});
	});
});

app.get('/consultaMeuProjeto/:tipo/:id', function (req, res){
	// conecta no banco a partir do canal
	canal.connect(function(erro, conexao, feito){
		if (erro){ // ocorreu um erro
			return console.error('Erro ao conectar no banco: \n', erro);
		}

		var sql = ''
		// aluno ou empresa
		if (req.params.tipo == 0){
			sql += 	'\nSELECT P.id_projeto, P.id_criador, P.titulo, P.prazo, P.tema, P.id_area, P.privacidade, P.ds_projeto, E.nome_empresa'
				+  	'\nFROM tb_meus_projetos MP '
				+  	'\nNATURAL JOIN tb_projeto P '
				+  	'\nINNER JOIN tb_empresa E ON (P.id_criador = E.id_usuario) '
				+  	'\nWHERE MP.id_aluno = ' + req.params.id + ' '
		}
		else{
			sql	+= 	'\nSELECT P.id_projeto, P.id_criador, P.id_area, P.titulo, P.tema, P.ds_projeto, P.prazo, P.privacidade, ' 
				+	'\n  (CASE P.privacidade WHEN true THEN \'Privado\' ELSE \'Público\' END) AS s_privacidade'
				+ 	'\nFROM tb_projeto P '
				+ 	'\nWHERE P.id_criador = ' + req.params.id + ' '
		}
		// fim aluno ou empresa

			sql += '\nORDER BY P.id_projeto;';
				
		console.log(sql);

		conexao.query(sql, function(erro, resultado){
			feito(); // libera a conexão
			if (erro){
				return console.error('Erro na inserção Meu Projeto: \n', erro);
			}
			res.json(resultado.rows); // retorna ao cliente o resultado da inserção
		});
	});
});

// AREA ----------------------------------------------------------------------------------

// cria rota para consulta em uma tabela do banco de dados
app.get('/consultaArea', function (req, res){
	// conecta no banco a partir do canal
	canal.connect(function(erro, conexao, feito){
		if (erro){ // ocorreu um erro
			return console.error('Erro ao conectar no banco: \n', erro);
		}
		
		var sql = '\nSELECT * '
				+ '\nFROM tb_area '
				+ '\nORDER BY id_area ';
		console.log(sql);
		
		conexao.query(sql, function(erro, resultado){
			feito(); // libera a conexão
			if (erro){
				return console.error('Erro na seleção Área: \n', erro);
			}
			res.json(resultado.rows); // retorna ao cliente as linhas do select
		});
	});
});

// cria rota para insere em uma tabela do banco de dados
app.post('/insereArea', function (req, res){
	// conecta no banco a partir do canal
	canal.connect(function(erro, conexao, feito){
		if (erro){ // ocorreu um erro
			return console.error('Erro ao conectar no banco: \n', erro);
		}

		var sql = '\nINSERT INTO tb_area (id_area, ds_area, cursos)'
				+ '\nVALUES \n (' 
				+ 'default, '
				+ '\'' + req.body.ds_area + '\', ' 
				+ '\'' + req.body.cursos + '\' ' 
				+ ');';
		console.log(sql);

		conexao.query(sql, function(erro, resultado){
			feito(); // libera a conexão
			if (erro){
				return console.error('Erro na inserção da Área: \n', erro);
			}
			res.json(resultado.rows); // retorna ao cliente o resultado da inserção
		});
	});
});

// cria rota para pegar ultimo id inserido na tabela Area
app.get('/lastIdArea', function (req, res){
	// conecta no banco a partir do canal
	canal.connect(function(erro, conexao, feito){
		if (erro){ // ocorreu um erro
			return console.error('Erro ao conectar no banco: \n', erro);
		}

		var sql = '\nSELECT last_value as id_area'
				+ '\nFROM tb_area_id_area_seq;';
		console.log(sql);

		conexao.query(sql, function(erro, resultado){
			feito(); // libera a conexão
			if (erro){
				return console.error('Erro seleção id Área: \n', erro);
			}
			res.json(resultado.rows[0].id_area); // retorna ao cliente o resultado da inserção
		});
	});
});

// cria rota para consulta em uma tabela do banco de dados
app.delete('/removeArea/:id_area', function (req, res){
	// conecta no banco a partir do canal
	canal.connect(function(erro, conexao, feito){
		if (erro){ // ocorreu um erro
			return console.error('Erro ao conectar no banco: \n', erro);
		}

		var sql = '\nDELETE FROM tb_area '
				+ '\nWHERE id_area = ' + req.params.id_area;
		console.log(sql);		

		conexao.query(sql, function(erro, resultado){
			feito(); // libera a conexão
			if (erro){
				return console.error('Erro na remoção da Área: \n', erro);
			}
			res.json(resultado.rows); // retorna ao cliente o resultado da exclusão
		});
	});
});

// cria rota para consulta em uma tabela do banco de dados
app.put('/atualizaArea', function (req, res){
	// conecta no banco a partir do canal
	canal.connect(function(erro, conexao, feito){
		if (erro){ // ocorreu um erro
			return console.error('Erro ao conectar no banco: \n', erro);
		}

		var sql = '\nUPDATE tb_area '
				+ '\nSET ds_area = \'' + req.body.ds_area + '\', '
				+ '\n    cursos = \'' + req.body.cursos + '\' '
				+ '\nWHERE id_area = ' + req.body.id_area;
		console.log(sql);		

		conexao.query(sql, function(erro, resultado){
			feito(); // libera a conexão
			if (erro){
				return console.error('Erro na atualização Área: \n', erro);
			}
			res.json(resultado.rows); // retorna ao cliente o resultado da atualização
		});
	});
});

// USUARIO ----------------------------------------------------------------------------------

app.post('/logar', function (req, res){
	sess = req.session;
	// conecta no banco a partir do canal
	canal.connect(function(erro, conexao, feito){
		if (erro){ // ocorreu um erro
			return console.error('Erro ao conectar no banco: \n', erro);
		}
		
		var sql = '\nSELECT id_usuario, email, tp_usuario '
				+ '\nFROM tb_usuario '
				+ '\nWHERE email = \'' + req.body.email + '\' '
				+ '\nAND senha = (SELECT md5(\'' + req.body.senha + '\')) ';
		console.log(sql);
		
		conexao.query(sql, function(erro, resultado){
			feito(); // libera a conexão
			if (erro){
				return console.error('Erro ao seleçao de usuário: \n', erro);
			}

			// Se não tiver resultado retorna null
			var usuario = resultado.rows[0];

			if (usuario != null){						
				sess.email = req.body.email;
				sess.tp_usuario = usuario.tp_usuario;
			} 

			res.json(usuario); // retorna ao cliente as linhas do select
		});
	});
});

// cria rota para consulta em uma tabela do banco de dados
app.post('/verificaEmail', function (req, res){
	// conecta no banco a partir do canal
	canal.connect(function(erro, conexao, feito){
		if (erro){ // ocorreu um erro
			return console.error('Erro ao conectar no banco: \n', erro);
		}
		
		var sql = '\nSELECT count(*) AS conta '
				+ '\nFROM tb_usuario '
				+ '\nWHERE email = \'' + req.body.email + '\' ';
		console.log(sql);
		
		conexao.query(sql, function(erro, resultado){
			feito(); // libera a conexão
			if (erro){
				return console.error('Erro verificação (SELECT) de email: \n', erro);
			}
			res.json(resultado.rows[0].conta); // retorna ao cliente as linhas do select
		});
	});
});

// ALUNO ----------------------------------------------------------------------------------

// cria rota para insere em uma tabela do banco de dados
app.post('/insereAluno', function (req, res){
	// conecta no banco a partir do canal
	canal.connect(function(erro, conexao, feito){
		if (erro){ // ocorreu um erro
			return console.error('Erro ao conectar no banco: \n', erro);
		}

		var sql = '\nINSERT INTO tb_usuario (id_usuario, email, senha, tp_usuario) '
				+ '\nVALUES \n('
				+ 'default, '
				+ '\'' + req.body.email + '\', ' 
				+ '\nmd5(\'' + req.body.senha + '\'), ' 
				+ '\n0' //tp_usuario = aluno
				+ ');'
				+ '\n'
				+ '\nINSERT INTO tb_aluno (id_usuario, nome_completo, universidade, cod_matricula) '
				+ '\nVALUES \n( '
				+ '(SELECT id_usuario FROM tb_usuario WHERE email = \'' + req.body.email + '\'), '
				+ '\'' + req.body.nome_completo + '\', ' 
				+ '\'' + req.body.universidade + '\', ' 
				+ '\'' + req.body.cod_matricula + '\' ' 
				+ ');';
				
		console.log(sql);

		conexao.query(sql, function(erro, resultado){
			feito(); // libera a conexão
			if (erro){
				return console.error('Erro na inserção de aluno: \n', erro);
			}
			res.json(resultado.rows); // retorna ao cliente o resultado da inserção
		});
	});
});

// cria rota para insere em uma tabela do banco de dados
app.post('/getAluno', function (req, res){
	// conecta no banco a partir do canal
	canal.connect(function(erro, conexao, feito){
		if (erro){ // ocorreu um erro
			return console.error('Erro ao conectar no banco: \n', erro);
		}

		var sql = '\nSELECT nome_completo AS nome, tp_usuario, id_usuario '
				+ '\nFROM tb_usuario '
				+ '\nNATURAL JOIN tb_aluno '
				+ '\nWHERE id_usuario = ' + req.body.id_usuario + ' '
				+ ';';				
		console.log(sql);

		conexao.query(sql, function(erro, resultado){
			feito(); // libera a conexão
			if (erro){
				return console.error('Erro seleção aluno: \n', erro);
			}
			var aluno = resultado.rows[0];
			res.json(aluno); // retorna ao cliente o resultado da inserção
		});
	});
});

// EMPRESA ----------------------------------------------------------------------------------

// cria rota para insere em uma tabela do banco de dados
app.post('/insereEmpresa', function (req, res){
	// conecta no banco a partir do canal
	canal.connect(function(erro, conexao, feito){
		if (erro){ // ocorreu um erro
			return console.error('Erro ao conectar no banco: \n', erro);
		}

		var sql = '\nINSERT INTO tb_usuario (id_usuario, email, senha, tp_usuario) '
				+ '\nVALUES \n('
				+ 'default, '
				+ '\'' + req.body.email + '\', ' 
				+ '\nmd5(\'' + req.body.senha + '\'), ' 
				+ '\n1' //tp_usuario = empresa
				+ ');'
				+ '\n'
				+ '\nINSERT INTO tb_empresa (id_usuario, nome_usuario, nome_empresa, cnpj) '
				+ '\nVALUES \n( '
				+ '(SELECT id_usuario FROM tb_usuario WHERE email = \'' + req.body.email + '\'), '
				+ '\'' + req.body.nome_usuario + '\', ' 
				+ '\'' + req.body.nome_empresa + '\', ' 
				+ '\'' + req.body.cnpj + '\' ' 
				+ ');';
				
		console.log(sql);

		conexao.query(sql, function(erro, resultado){
			feito(); // libera a conexão
			if (erro){
				return console.error('Erro na inserção de Empresa: \n', erro);
			}
			res.json(resultado.rows); // retorna ao cliente o resultado da inserção
		});
	});
});

// cria rota para insere em uma tabela do banco de dados
app.post('/getEmpresa', function (req, res){
	// conecta no banco a partir do canal
	canal.connect(function(erro, conexao, feito){
		if (erro){ // ocorreu um erro
			return console.error('Erro ao conectar no banco: \n', erro);
		}

		var sql = '\nSELECT nome_usuario AS nome, tp_usuario, id_usuario '
				+ '\nFROM tb_usuario '
				+ '\nNATURAL JOIN tb_empresa '
				+ '\nWHERE id_usuario = ' + req.body.id_usuario + ' '
				+ ';';

		console.log(sql);

		conexao.query(sql, function(erro, resultado){
			feito(); // libera a conexão
			if (erro){
				return console.error('Erro seleção de empresa: \n', erro);
			}
			
			var empresa = resultado.rows[0];
			console.log("1: " + resultado.rows);
			res.json(empresa); // retorna ao cliente o resultado da inserção
		});
	});
});

app.listen(3000, function(){
	console.log("SERVIDOR ON");
})