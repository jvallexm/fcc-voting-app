import React from 'react';
import ReactDOM from 'react-dom';
import FacebookLogin from 'react-facebook-login';
import $ from "jquery";
import ShowPolls from './showpolls.js';
import NewPoll from './newpoll.js'

export default class  App extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = 
      {
        shown: -1,
        polls: [],
        user: "none",
        gray: false,
        view: "all",
        mine: [],
        showGraph: -1,
        graphData: [],
        permalink: false,
        permurl: ""
      }
    this.responseFacebook = this.responseFacebook.bind(this);
    this.grayOut = this.grayOut.bind(this);
    this.cancel = this.cancel.bind(this);
    this.update = this.update.bind(this);
    this.swapView = this.swapView.bind(this);
    this.postUpdate = this.postUpdate.bind(this);
    this.updateGraph = this.updateGraph.bind(this);
  }
  componentWillMount()
  {
    var urlHere = window.location.href.split('/');
    //console.log(urlHere);
    var permIndex = urlHere.indexOf('permalink');
    //console.log(permIndex);
    //console.log("dfasdfdasfadsfdfads");
    if(permIndex!=-1)
    {
      var url="/getone";
      for(var i=0;i<2;i++)
      {
        url+= "/" + encodeURIComponent(urlHere[permIndex+i+1]);
      }
     // console.log(url);
      $.getJSON(url,function(data){
        this.setState({polls: data,permalink: true, permurl: url});
      }.bind(this));
    }
    else
    {
    $.getJSON('/getall',function(data){
      $.getJSON('/userip',function(ip){
          //console.log("ip: " + ip.ip);
          this.setState({polls: data, user: ip.ip});
      }.bind(this));
    }.bind(this));
    }
  }
  postUpdate(url,shown)
  {
    console.log("post activating");
    $.ajax({
      type: "GET",
      url: url,
      data: "kittens",
      success: function(data){this.updateGraph(shown);}.bind(this),
      error:   function(jqXHR, textStatus, errorThrown) {
        console.log("Error, status = " + textStatus + ", " +
              "error thrown: " + errorThrown); }.bind(this)
    });
  }
  updateGraph(shown)
  {
    //console.log("update activating");
    if(this.state.permalink)
    {
      $.getJSON(this.state.permurl,function(data){
        this.setState({polls: data,permalink: true});
      }.bind(this));
    }
    else
    {
        var url = '/getmine/' + this.state.user.userID;
        $.getJSON('/getall',function(data){
          var all=data;
          $.getJSON(url,function(data2)
           {
             
            //console.log("update completed");
            this.setState({polls: all , mine: data2, gray:false,shown: shown, showGraph:shown});
           }
          .bind(this));
        }.bind(this));
    }
  }
  update(shown)
  {
    //console.log("update activating");
    var url = '/getmine/' + this.state.user.userID;
    $.getJSON('/getall',function(data){
      var all=data;
      $.getJSON(url,function(data2)
       {
        this.setState({polls: all , mine: data2, gray:false,shown: -1,permalink: false});
       }
      .bind(this));
    }.bind(this));
  }
  swapView(str)
  {
    this.state.view = str;
    this.update(-1);
  }
  responseFacebook(response)
  {
    //console.log(JSON.stringify(response));
    var url = '/getmine/' + response.userID;
    //console.log("userid: " + response.userID);
    $.getJSON(url, function(data){
        this.setState({user: response, mine: data});
    }.bind(this)); 
  }
  grayOut()
  {
      this.setState({gray: true});
  }
  cancel()
  {
      this.setState({gray: false});
  }
  render()
  {
    return(
      <div className="text-center container-fluid">
      {this.state.gray ? <div className="gray-out middle-text text-center container-fluid">
         <NewPoll cancel={this.cancel} name={this.state.user.name} update={this.update} userId={this.state.user.userID}/>
      </div> : ""}
        <h1>Aww Yeah Voting App!</h1>

          {typeof this.state.user== 'string' ? 
          <FacebookLogin 
          cssClass="btn"
          appId="317671765311447"
          autoLoad={true}
          fields="name,picture"
          callback={this.responseFacebook}
          onClick={console.log("sdfadsf")}/> : 
          <div>
          <img src={this.state.user.picture.data.url} />
                {this.state.view=="all" ? <button onClick={()=>this.swapView("mine")} className="btn">My Polls</button> : <button onClick={()=>this.swapView("all")} className="btn">All Polls</button>}
                <button className="btn" onClick={this.grayOut}>New Poll</button>
          </div>
          }
         {this.state.view=="all" 
         ? <ShowPolls 
            updateGraph={this.postUpdate} 
            shownGraph={this.state.showGraph} 
            postUpdate={this.postUpdate} 
            shown={this.state.shown} 
            polls={this.state.polls} 
            view={this.state.view}
            userId={typeof this.state.user == 'string' ? this.state.user : this.state.user.userID} 
            fbUser={typeof this.state.user == 'string' ? false : true}
            update={this.update} 
            fromPermalink={this.state.permalink}/> 
         : <ShowPolls 
            updateGraph={this.postUpdate} 
            shownGraph={this.state.showGraph} 
            postUpdate={this.postUpdate} 
            polls={this.state.mine} 
            view={this.state.view}
            userId={typeof this.state.user == 'string' ? this.state.user : this.state.user.userID} 
            fbUser={typeof this.state.user == 'string' ? false : true}
            shown={this.state.shown} 
            update={this.update}
            fromPermalink={this.state.permalink}/>}
      </div>
    ); 
  }  
}

