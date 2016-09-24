/**
 * Class representing an form to create an article.
 * @extends React.Component
 * @property {object} article - Object with header, body, id properties.
 * @property {string} submitText - Form submit button text
 * @property {string} cancelText - Cancel edit button text
 * @property {function} handleCancel - Handle on cancel edit mode callback function
 * @property {function} handleSubmit - Handle on submit callback function
 * @property YeYintKoKo <yeyintkoko15@gmail.com>
 */
class ArticleForm extends React.Component{

  componentDidMount(){
    if(this.props.article){
      const {header, body} = this.props.article;
      this.refs["header"].value = header;
      this.refs["body"].value = body;
    }
  }

  renderCancelButton(){
    if(this.props.article){
      const cancelText = this.props.cancelText;
      return (
        <button type="button" className="cancel-button" onClick={()=>this.props.handleCancel()}>{cancelText}</button>
      )
    }
  }

  render(){
    const id = this.props.article? this.props.article.id : null;
    const submitText = this.props.submitText;

    return (
      <div className="article-form-container">
        <form
          className="article-form"
          onSubmit={event=>this.props.handleSubmit(event, id)}
        >
          <div className="header">
            <label>Article Title</label>
            <input
              ref="header"
              type="text"
              name="header"
              className="input-header"
              title="Article Title"
              placeholder="Enter article title"
            />
          </div>
          <div className="body">
            <label>Article Content</label>
            <textarea
              ref="body"
              rows="10"
              name="body"
              title="Article Content"
              placeholder="Enter article content"
            />
          </div>
          <div className="buttons">
            <button type="submit" className="submit-button">{submitText}</button>
            {this.renderCancelButton()}
          </div>
        </form>
      </div>
    )
  }
}

/**
 * Class representing an article.
 * @extends React.Component
 * @property {object} article - Object with { header, body, id } properties.
 * @author YeYintKoKo <yeyintkoko15@gmail.com>
 */
class Article extends React.Component{
  constructor(props){
    super(props);
    this.state = {showMore: false}
  }
  //Make article body shorter if more then 270 characters
  shortenText(text){
    return text.substr(0, 270) + "...";
  }

  showMore(){
    this.setState({showMore: !this.state.showMore});
  }

  render(){
    const { article, handleDelete, handleEdit } = this.props;
    const { id, header, body, date } = article;
    //Check if article length > 270
    let hasMore = body.length > 270;
    //If > 270, shorten the article, but only if it is not in shorten status
    let articleText = body;
    let readMoreText = "Hide";

    if(hasMore && !this.state.showMore){
      articleText = this.shortenText(body);
      readMoreText = "Read More";
    }


    return (
      <div className="article">
        <div className="header">
          <div className="wrapper">
            <div className="title">{header}</div>
            <span className="date">{new Date(date).toLocaleString()}</span>
          </div>
          <div className="buttons">
            <button className="remove-button" onClick={()=>handleDelete(id)}>&times;</button>
            <button className="edit-button" onClick={()=>handleEdit(id)}>Edit</button>
          </div>
        </div>
        <div className="body">
          {articleText}
        </div>
        { hasMore &&
          <div className="footer" >
            <span className="read-more" onClick={()=>this.showMore()}>
              {readMoreText}
            </span>
          </div>
        }
      </div>
    )
  }
}

/**
 * Class representing articles list.
 * @extends React.Component
 * @property {array} articles - List of article objects
 * @property {function} handleEdit - handleEdit callback function
 * @property {function} handleDelete - handleDelete callback function
 * @author YeYintKoKo <yeyintkoko15@gmail.com>
 */
class Articles extends React.Component{
  /**
    * Render the article component item on iterating the articles
    * @param {object} articles - Object with header, body properties.
    * @param {number} index - To set unique key for each item
   */
  renderArticle(article, index){
    return (
      <Article key={index} article={article} handleEdit={this.props.handleEdit} handleDelete={this.props.handleDelete} />
    )
  }
  render() {
    return (
      <div>
        {this.props.articles.map(this.renderArticle.bind(this))}
      </div>
    )
  }
}

/** Class representing a Blog. */
class Blog extends React.Component{
  /** Initialize a state */
  constructor(){
    super();
    this.state = {
      articles: [],   // articles from server will be store
      filteredArticles: [],  // filtered articles will be store
      selectedArticle: null,  // editing article will be store
      error: null
    }
    //Set api urls
    this.getURL = "/apis/getarticles";
    this.postURL = "/apis/createarticle";
    this.putURL = "/apis/updatearticle";
    this.deleteURL = "/apis/deletearticle/";
  }

  /** Fetch articles from server on component mounted*/
  componentDidMount(){
    // track the data from server every half seconds
    setInterval(()=>{

      fetch(this.getURL, { method: "GET" }).then((response)=>{
        return response.json()
      }).then((articles)=>{
        // Assign articles to state
        if(this.refs.filter && this.refs.filter.value){      //If user has filtered the articles, keep the filtered results
          this.setState({ articles });
          this.filterArticles(this.refs.filter.value);
        }else {
          // Else update all articles
          this.setState({
            articles,
            filteredArticles: articles
          });
        }

      });

    }, 500);

  }

  /**
   * Delete an article in server with api call.
   * @param {number} id - Article id to be deleted.
   */
  handleDelete(id){
    // Call delete api with id param
    fetch(this.deleteURL+id , {method: "DELETE"}).
    then(response => {
      if(response.ok){
        console.log('An article (id: ' + id + ') was deleted')
        this.setState({error: null})
      }else {
        let errmsg = 'Sorry, we are unable to remove your article at this moment! [ '+ response.status + ' ]';
        this.setState({error: errmsg})
      }
    })
  }

  /**
   * Swift to edit mode
   * @param {number} id - Article id to be edited
   */
  handleEdit(id){
    let articles = this.state.articles;
    let article = articles.filter((art)=>art.id===id)[0];
    if(article){
      this.setState({selectedArticle: article})
    }
  }

  /** Swift back to non edit mode */
  handleCancel(){
    this.setState({selectedArticle: null})
  }

  /** Validate input */
  validateEntries(form){
    return form.header.value.trim() && form.body.value.trim();
  }

  /**
   * Update an article in server with api call
   * @param {article} id - Article id to be edited
   */
  updateArticle(event, id){
    event.preventDefault();
    let form = event.target;

    //Show error message on empty article header or body
    if(!this.validateEntries(form)){
      let errmsg = 'Article title or content cannot be empty!';
      this.setState({error: errmsg})
      return;
    }

    fetch(this.putURL, {
      method: "PUT",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: id,
        header: form.header.value,
        body: form.body.value
      })
    }).
    then(response => {
      if(response.ok) {
        /** When update went success, clear the form and reset the component states */
        form.reset();
        this.setState({
          error: null,
          selectedArticle: null
        });
      }else {
        let errmsg = 'Sorry, we are unable to update your article at this moment! [ '+ response.status + ' ]';
        this.setState({error: errmsg})
      }
    });

  }

  /**
   * Post an article to server with api call.
   * @param {object} event - Article form submitted event to handle the form and data.
   */
  postArticle(event){
    event.preventDefault();
    let form = event.target;

    //Show error message on empty article header or body
    if(!this.validateEntries(form)){
      let errmsg = 'Article title or content cannot be empty!';
      this.setState({error: errmsg})
      return;
    }

    fetch(this.postURL, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        header: form.header.value,
        body: form.body.value
      })
    }).
    then(response => {
      if(response.ok){
        form.reset();
        this.setState({error: null})
      }
      else {
        let errmsg = 'Sorry, we are unable to store your article at this moment! [ '+ response.status + ' ]';
        this.setState({error: errmsg})
      }
    });
  }

  /**
    * Filter the articles by keywords in both Header and Body textes.
    * Show the article if the filtered keyword is found in the article's header or body text.
    * @param {string} keyword - keyword to filter by
   */
  filterArticles(keyword){
    var articles = this.state.articles;

    if(keyword){
      var reg = new RegExp(keyword,'i');
      var filteredArticles = articles.filter( art => reg.test(art.header) || reg.test(art.body) );
      this.setState({filteredArticles});
    }else {
      this.setState({filteredArticles: articles});
    }

  }

  /** Show error message if an error state is set */
  renderError(){
    if(this.state.error){
      return (
        <div className="error">
          {this.state.error}
        </div>
      )
    }
    return null;
  }

  render(){
    if(this.state.selectedArticle){
      return (
        <div className="container">
          <div className="articleFormTitle">Modify the Article</div>
          {this.renderError()}
          <ArticleForm
            article={this.state.selectedArticle}
            handleCancel={this.handleCancel.bind(this)}
            handleSubmit={this.updateArticle.bind(this)}
            submitText="SAVE"
            cancelText="Cancel"
            error={this.state.error}
          />
        </div>
      )
    }else
    return (
      <div className="container">
        <div className="searchArticle">
          <input
            ref="filter"
            type="search"
            results={5}
            autosave="some_unique_value"
            className="search-input"
            placeholder="Search"
            onChange={(event)=>this.filterArticles.bind(this, event.nativeEvent.target.value)}
          />
        </div>
        <Articles
          articles={this.state.filteredArticles}
          handleEdit={this.handleEdit.bind(this)}
          handleDelete={this.handleDelete.bind(this)}
        />
        <div className="articleFormTitle">Write an Article</div>
        {this.renderError()}
        <ArticleForm
          handleSubmit={this.postArticle.bind(this)}
          submitText="ADD"
          error={this.state.error}
        />
      </div>
    )
  }
}

ReactDOM.render(
  <Blog />,
  document.getElementById('container')
);
