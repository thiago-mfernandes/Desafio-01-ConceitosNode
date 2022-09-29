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
  /**
   * 1.receber atraves do header o userName
   * 2.procurar com o find() para cada user ser user.name === name e guardar o retorno numa variavel
   * 3. se o usuario nao existir, retornar 400 e um json de erro usuario nao encontrado
   * 4. disponibilizar o usuario encontrado para as rotas
   * 5.return next
   */
  
  const { username } = request.headers;  
  const userVerified = users.find(user => user.username === username);  
  if(!userVerified) return response.status(404).json({ error: "User Not Found!"});  
  request.userVerified = userVerified;
  return next();
}

// - criar usuario
app.post('/users', (request, response) => {
  /**
   * 1. receber name e userName no corpo da requisicao;
   * 2. procurar na lista de usuarios: para cada usuario: username é igual a username recebido na requisicao?
   * 3. se esse usuario ja existe, retorna um erro:
   * 4. senao: construir um usuario
   * 5. colocar no array de usuarios
   * 6. retornar status 201 e json do usuario criado
   */

  const { name, username } = request.body;
  //procurar na lista de usuarios: para cada usuario: username é igual a username recebido na requisicao?
  const userExists = users.find(user => user.username === username);

  //se esse usuario ja existe, retorna um erro:
  if(userExists) return response.status(400).json({ error: "Username Already Exists"})

  //senao: construir um usuario
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  //colocar no array de usuarios
  users.push(user);
  return response.status(201).json(user);

});

// - ler tarefas
app.get('/todos', checksExistsUserAccount, (request, response) => {
  /**
   * 1. receber o usuarioExistente verificado
   * 2. retornar a lista de tarefas deste usuario
   */  

  //1. receber o usuarioExistente verificado
  const { userVerified } = request;
  //2. retornar a lista de tarefas deste usuario  
  return response.json(userVerified.todos);
});

// - criar tarefas - criar tarefa para o usuario
app.post('/todos', checksExistsUserAccount, (request, response) => {
  /**
   * 1. receber o usuario do middleware
   * 2. receber title e deadline pelo req.body
   * 3. tarefa no formato especificado:
   * 4. Coloquei no array de todos a nova todo
   * 5. armazenar no usuario.todos a tarefa
   */

  //1. receber o usuario do middleware
  const { userVerified } = request;
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
  userVerified.todos.push(todo);
  //5. armazenar no usuario.todos a tarefa
  return response.status(201).json(todo);
});

// - atualizar tarefas
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  /**
   * 1. receber o usuario do middleware
   * 2. receber pelo corpo da req title e deadline
   * 3. receber por params o id do todo
   * 4. procurar nas tarefas do userVerified: em cada tarefa: se a tarefa tem o mesmo id recebido no params
   * 5. se a tarefa nao existe, retornar o status com a mensagem de erro
   * 6. se existe, atribuir a esta tarefa os novos valores
   * 7, retornar a tarefa
   */

  const { userVerified } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  //4. procurar nas tarefas do userVerified: em cada tarefa: se a tarefa tem o mesmo id recebido no params
  const updateTodo = userVerified.find(todo => todo.id === id);

  //5. se a tarefa nao existe, retornar o status com a mensagem de erro
  if(!updateTodo) {
    return response.status(404).json({ error: "ToDo Not Found!"})
  }

  //6. se existe, atribuir a esta tarefa os novos valores
  updateTodo.title = title;
  updateTodo.deadline = new Date(deadline);

  //7. retornar a tarefa
  return response.json(updateTodo);
});

// - atualizar se a tarefa foi completada pelo id
app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  /**
   * 1. receber o usuario do middleware
   * 2. receber por params o id do todo
   * 3. procurar nas tarefas do userVerified: em cada tarefa: se a tarefa tem o mesmo id recebido no params
   * 4. se a tarefa nao existe, retornar o status com a mensagem de erro
   * 5. se existe, atribuir a esta tarefa os novos valor true
   * 6. retornar a tarefa
   */

  //1. receber o usuario do middleware
  const { userVerified } = request;
  //2. receber por params o id do todo
  const { id } = request.params;
  //3. procurar nas tarefas do userVerified: em cada tarefa: se a tarefa tem o mesmo id recebido no params
  const updateTodo = userVerified.find(todo => todo.id === id);
  //4. se a tarefa nao existe, retornar o status com a mensagem de erro
  if(!updateTodo) {
    return response.status(404).json({ error: "ToDo Not Found!"})
  }
  //5. se existe, atribuir a esta tarefa os novos valor true
  updateTodo.done = true;
  //6. retornar a tarefa
  return response.json(updateTodo);
});

// - deletar uma tarefa pelo id
app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
   /**
   * 1. receber o usuario do middleware
   * 2. receber por params o id do todo
   * 3. retorna a posicao no array que esse objeto existe
   * 4. se a tarefa nao existe, retornar o status com a mensagem de erro
   * 5. retirar das todos do usuario
   * 6. retornar a tstatus
   */

  //1. receber o usuario do middleware
  const { userVerified } = request;
  //2. receber por params o id do todo
  const { id } = request.params;
  //3. retorna a posicao no array que esse objeto existe
  const updateTodoIndex = userVerified.findIndex(todo => todo.id === id);
  //4. se o retorno for negativo, o Todo nao existe
  if(updateTodoIndex === -1) {
    return response.status(404).json({ error: "ToDo Not Found!"})
  }
  //5. retirar das todos do usuario
  userVerified.todos.splice(updateTodoIndex, 1);
  //6. retornar status
  return response.status(204).json();
});

module.exports = app;