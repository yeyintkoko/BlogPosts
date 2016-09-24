let { createStore } = require('redux');
let fs = require('fs');
/** Static action types declaration */
const actions = { write : 'write' }

/** Create a reducer for state control to read and write the data to data.json */
const dbContext = (state = readData() || [], action) => {
  switch (action.type) {
    case actions.write:
      writeData(action.data);
      state = readData();
      return state
    default:
      return state
  }
}

/** Read data from data.json */
const readData = ()=>{
  let data = fs.readFileSync(__dirname + '/' + 'data.json')
  return JSON.parse(data);
}
/** Write data to data.json */
const writeData = (data)=>{
  fs.writeFileSync(__dirname + '/' +'data.json', JSON.stringify(data, null, 4));
}

/** Create a Redux store holding the state of articles data store. */
let store = createStore(dbContext)

//----------------------------------------------------------------------------------------




/** Get articles
  * @return {object} Json array of article objects
  */
const getAllArticles = ()=>{
  return store.getState();
}

/** Create an article */
const createArticle = ({header, body})=>{

  let article = {
    id: Math.floor(Math.random() * new Date().getTime()),
    header,
    body,
    date: new Date()
  }

  let articles = store.getState();
  articles.push(article);
  // Write to modified data to data.json
  store.dispatch({ type: actions.write, data: articles })
}

/** Update an article */
const updateArticle = ({id, header, body})=>{

  let articles = store.getState();
  let article = articles.filter((art)=>art.id==id)[0];

  if(article){
    article.header = header;
    article.body = body;
    article.date = new Date();
    // Write to modified data to data.json
    store.dispatch({ type: actions.write, data: articles })
  }
}

/** Delete an article */
const deleteArticle = (id)=>{

  let articles = store.getState();
  let article = articles.filter((art)=>art.id==id)[0];

  if(article){
    articles.splice(articles.indexOf(article), 1);
    // Write to modified data to data.json
    store.dispatch({ type: actions.write, data: articles })
  }
}


module.exports = {
  getAllArticles,
  createArticle,
  updateArticle,
  deleteArticle
}
