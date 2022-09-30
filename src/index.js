const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];
/**
 * get - Leitura
 * post - criação
 * put - atualização
 * delete - deleção
 * patch - atualização parcial (atualizar um avatar)
 */

//localhost:3333

function checksExistsUserAccount(request, response, next) {
  //receber atraves do header o userName
  const { username } = request.headers;  
  // para cada user ser user.name === name e guardar o retorno numa variavel
  const user = users.find(user => user.username === username);  
  //se o usuario nao existir, retornar 400 e um json de erro usuario nao encontrado
  if(!user) {
    return response.status(404).json({ error: "User Not Found!"});  
  }
  //disponibilizar o usuario encontrado para as rotas
  request.user = user;
  //retornar
  return next();
}

// - criar usuario
app.post('/users', (request, response) => {
  //receber name e userName no corpo da requisicao;
  const { name, username } = request.body;
  //procurar na lista de usuarios: para cada usuario: username é igual a username recebido na requisicao?
  const userExist = users.some(user => user.username === username);
  //se esse usuario ja existe, retorna um erro:
  if(userExist) return response.status(400).json({ error: "Username Already Exists"});
  //senao: construir um usuario
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  //colocar no array de usuarios
  users.push(newUser);
  //retornar status 201 e json do usuario criado
  return response.status(201).json(newUser);

});

// - ler tarefas
app.get('/todos', checksExistsUserAccount, (request, response) => {

  //1. receber o usuarioExistente verificado
  const { user } = request;
  //2. retornar a lista de tarefas deste usuario  
  return response.json(user.todos);
});

// - criar tarefas - criar tarefa para o usuario
app.post('/todos', checksExistsUserAccount, (request, response) => {
  //1. receber o usuario do middleware
  const { user } = request;
  //2. receber title e deadline pelo req.body
  const { title, deadline } = request.body;
  //3. tarefa no formato especificado:
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  //4. Coloquei no array de todos a nova todo
  user.todos.push(todo);
  //5. armazenar no usuario.todos a tarefa
  return response.status(201).json(todo);
});

// - atualizar tarefas
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  
  //receber o usuario do middleware
  const { user} = request;
  //receber pelo corpo da req title e deadline
  const { title, deadline } = request.body;
  //receber por params o id do todo
  const { id: todoId } = request.params;

  //nao posso trocar o titulo ouo deadline de um todo que nao existe
  // procurar no array de todos o index do todo. Se nao estiver entre 0 e arr.length, entao nao encontrou

  const indexOfTodo = user.todos.findIndex(todo => todo.id === todoId);

  //se a tarefa nao existe, retornar o status com a mensagem de erro
  if(indexOfTodo < 0) {
    return response.status(404).json({ error: "Todo Not Found!"})
  }

  //se existe, pego este todo
  const todoToChange = user.todos[indexOfTodo];

  //se o dado nao for undefined, atribuo o dado, senao, retorno falso
  title ? todoToChange.title = title : false;
  deadline ? todoToChange.deadline = deadline : false;

  //7. retornar a tarefa
  return response.status(201).json(todoToChange);
});

// - atualizar se a tarefa foi completada pelo id
app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  //1. receber o usuario do middleware
  const { user } = request;
  //2. receber por params o id do todo
  const { id: todoId } = request.params;
  //3. procurar nas tarefas do userVerified: em cada tarefa: se a tarefa tem o mesmo id recebido no params
  const indexOfTodo = user.todos.findIndex(todo => todo.id === todoId);
  //4. se a tarefa nao existe, retornar o status com a mensagem de erro
  if(indexOfTodo < 0) {
    return response.status(404).json({ error: "Todo Not Found!"})
  }
  //5. se existe, atribuir a esta tarefa o novos valo true
  user.todos[indexOfTodo].done = true;
  //6. retornar a tarefa
  return response.status(201).json(user.todos[indexOfTodo]);
});

// - deletar uma tarefa pelo id
app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {   
  //1. receber o usuario do middleware
  const { user } = request;
  //2. receber por params o id do todo
  const { id: todoId } = request.params;
  //3. retorna a posicao no array que esse objeto existe
  const indexOfTodo = user.todos.findIndex(todo => todo.id === todoId);
  //4. se o retorno for negativo, o Todo nao existe
  if(indexOfTodo < 0) {
    return response.status(404).json({ error: "Todo Not Found!"})
  }
  //5. retirar das todos do usuario
  user.todos.splice(indexOfTodo, 1);
  //6. retornar status
  return response.status(204).send();
});

module.exports = app;