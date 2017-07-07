import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
var DoughnutChart = require("react-chartjs").Doughnut;

const colors=["red","orange","yellow","green","blue","purple","indigo","violet","black","brown","gray","beige"];

export default class ShowPolls extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = 
      {
        shown: this.props.shown,
        polls: [],
        error: "",
        shownGraph: this.props.shownGraph,
        graphOptions: [],
        graphData: [],
        toggle: false,
        addingOne: false,
        adding: "",
        areYouSure: false,
        deleting: false,
        view: this.props.view,
        fromPermalink: this.props.fromPermalink,
        showlink: false,
        myPolls: false,
        myGraphData: []
      };
    this.showPoll = this.showPoll.bind(this);
    this.postVote = this.postVote.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.postOption = this.postOption.bind(this);
    this.postDelete = this.postDelete.bind(this);
  }
  componentWillReceiveProps()
  {
    if(this.state.deleting)
      this.setState({deleting:false, areYouSure:false,shown:-1,showlink: false});
  }
  componentWillUpdate()
  {
    if(!this.state.myPolls && this.state.view=="mine")
    {
      console.log("my view");
      this.setState({myPolls:true})
    }
    if(this.state.view!="mine" && this.state.myPolls)
      this.setState({myPolls: false, myGraphData: []});
  }
  handleChange(e)
  {
    this.setState({adding: e.target.value});
  }
  showPoll(num)
  {
    if(num==-1)
    {
      this.setState({shown: -1,graphData:[],toggle:false, addingOne: false, adding: "", areYouSure: false, deleting: false,showlink: false});
    }
    else
    {
        //console.log(this.props.polls[num].options);
        var ffff =[];
        for(var i=0;i<this.props.polls[num].options.length;i++)
        {
          var colori=i;
          while(colori>11)
          {
            colori-=11;
          }
          if(colori<0)
            colori=0;
          ffff.push({
            value: this.props.polls[num].options[i].votes,
            label: this.props.polls[num].options[i].name,
            color: colors[colori]
          });
        }
        
        //console.log(ffff);
             /* {
                  value: 2,
                  color:"#F7464A",
                  highlight: "#FF5A5E",
                  label: "Red"
              }*/
        this.setState({shown: num, error:"", graphData: ffff,toggle:false, addingOne: false, adding: "",areYouSure: false, deleting: false,showlink: false});
    }
  }
  postDelete(obj)
  {
    var url="";
    var url="/delete/" + encodeURIComponent(obj.name) +"/" + encodeURIComponent(obj.userid)
    this.props.updateGraph(url,-1);
    this.setState({deleting:true, showlink: false});
  }
  postOption(obj,opt)
  {
    var ind=-1;
    for(var i=0;i<obj.options.length;i++)
    {
      if(obj.options[i].name == opt)
       ind=i;
    }
    if(ind > -1)
     this.setState({error: "Sorry, no duplicate options"});
    else if(opt=="")
     this.setState({error: "Sorry, options cannot be blank"});
    else
    {
      console.log(JSON.stringify(obj));
      console.log("adding: " + opt);
      ///newopt/:name/:author/:newoption/
      var url="/newopt/" + encodeURIComponent(obj.name) +"/" + encodeURIComponent(obj.userid) + "/" + encodeURIComponent(opt);
      this.props.updateGraph(url,this.state.shown);
      this.setState({adding: "Loading...",showlink: false});
    }
  }
  postVote(obj,opt)
  {
    //console.log(JSON.stringify(obj));
    console.log(opt);
    if(obj["who-voted"].indexOf(this.props.userId)!=-1 /*&& this.props.userId!="10201496319235398"*/)
    { 
      console.log(JSON.stringify(this.state.graphData));
      this.setState({error: "Sorry, you already voted on this one!", toggle:true, addingOne: false, adding: "",showlink: false});
      
    }
    else
    {
      var index = 0;
      for(var j=0;j<obj.options.length;j++)
      {
        if(obj.options[j].name==opt)
          index = j;
        }  
       var ffff =[];
       var num=this.state.shown;
       if(this.state.shown>-1)
       {
          for(var i=0;i<this.props.polls[num].options.length;i++)
          {
            var colori=i;
            while(colori>11)
            {
              colori-=11;
            }
            if(colori<0)
              colori=0;
            var iplus=0;
            if(i==index)
            {
              iplus=1;
            }
            ffff.push({
              value: this.props.polls[num].options[i].votes + iplus,
              label: this.props.polls[num].options[i].name,
              color: colors[colori]
            });
          }
       console.log("setting graph data");
       this.state.graphData=ffff;
      }
      var url="/vote/" + encodeURIComponent(obj.name) +"/" + encodeURIComponent(obj.userid) + "/" + encodeURIComponent(obj.options[index].name) + "/" +this.props.userId;
      console.log(url);
      this.state.toggle=true;
      this.state.showlink = false;
      this.props.updateGraph(url,this.state.shown);
    }
  }
  render()
  {
    return(
      <div id="the-polls" className="text-center container-fluid">
          {this.props.polls.map((d,i)=> 
            <div key={i} className="text-center container-fluid">
            <div className="poll text-center container-fluid" onClick={
               this.state.shown == i 
                ? ()=>this.showPoll(-1)                 
                : ()=>this.showPoll(i)
               }>
               <h2>{d.name}</h2>
               <h5>by {d.author}</h5>
            </div>
               {this.state.deleting && this.state.shown==i 
               ? <h3>Goodbye forever. We'll miss you.</h3>
               :this.state.shown == i && !this.state.toggle 
               ? <div className="options text-center container-fluid ">
                 <div className="error">{this.state.error}</div>
                 {d.options.map((da,i)=>
                   <div key={d.name + i} className="row">
                       <div className="col-sm-9 text-left middle-text">{da.name}</div>
                       <div className="col-sm-3">
                       <button className="btn btn-block" onClick={()=>this.postVote(d,da.name)}>Vote</button>
                       </div>
                  </div>
                 )}
                <div> 
                {!this.props.fbUser ? "" :
                   !this.state.addingOne 
                   ? <div className="row">
                     <div className="col-sm-9">Add an Option</div>
                     <div className="col-sm-3"><button className="btn btn-block" onClick={()=>this.setState({addingOne: true, adding:""})}>+</button></div>
                     </div>
                   : <div className="row">
                     <div className="col-sm-9"><input value={this.state.adding} onChange={this.handleChange}/></div>
                     <div className="col-sm-3"><button className="btn btn-block" onClick={()=>this.postOption(d,this.state.adding)} >Post</button></div> 
                     </div>}
                <div className="text-center container-fluid">
                    <button onClick={()=>{this.setState({toggle: true})}}className="btn">Show Results!</button>
                    {d.userid == this.props.userId && !this.state.areYouSure
                     ? <button className="btn btn-danger" onClick={()=> this.setState({areYouSure: true})}>Delete This Poll</button>
                     : d.userId == this.props.userID && this.state.areYouSure
                     ? <button className="btn btn-danger" onClick={()=> this.postDelete(d)}>Are You Sure? This Can't Be Undone.</button>
                     : ""  
                    }
                    { d.userid == this.props.userId && !this.state.showlink
                      ? <button className="btn btn-primary" onClick={()=>this.setState({showlink: true})}>Share!</button>
                      : d.userid == this.props.userId && this.state.showlink
                      ? <textarea value={"https://" + window.location.hostname + "/permalink/" + d.id +'/' + d.userid} />
                      :""
                    }
                </div>
                </div>                   
               </div> : 
               this.state.toggle&&this.state.shown==i ? 
               <div className="text-center container-fluid">
                  <div className="error">{this.state.error}</div>
                  <div className="row">
                  <div className="col-md-8 ">
                  {this.state.graphData.map((f,i)=>
                   <div className="row">
                      <div style={{"backgroundColor": f.color}} className="col-xs-2 box"></div>
                      <div className="col-xs-10 margin"> {f.label} Votes: {f.value} </div>
                   </div>
                  )}
                  </div>
                  <div className="col-md-4">
                  <DoughnutChart 
                      data={this.state.graphData}
                    />
                  </div>
                  </div>
                  </div> : ""}
            </div>
        )}
        {this.props.fromPermalink ? <button className="btn" onClick={()=>this.props.update(-1)}>Take me to the whole app!</button>: ""}
        </div>  
      
    );
  }
}