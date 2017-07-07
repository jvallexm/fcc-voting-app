import React from 'react';
import ReactDOM from 'react-dom';
import FacebookLogin from 'react-facebook-login';
import $ from "jquery";

export default class NewPoll extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = 
      {
        name: "",
        options:["",""],
        errors: [],
        submitted: false
      }
    this.handleChange = this.handleChange.bind(this);
    this.handleName = this.handleName.bind(this);
    this.submit = this.submit.bind(this);
    this.addOne = this.addOne.bind(this);
    this.removeOne = this.removeOne.bind(this);
  }
  submit()
  {
    var newErrors=[];
    if(this.state.name=="")
      newErrors.push("Name cannot be empty");
    if(this.state.options.length<2)
      newErrors.push("Polls must have at least two options");
    for(var h=0;h<this.state.options.length;h++)
    {
      for(var g=0;g<this.state.options.length;g++)
      {
        if(g!=h && this.state.options[h]==this.state.options[g])
          newErrors.push("Options cannot be identical");
      }
    }
    for(var i=0;i<this.state.options.length;i++)
    {
       if(this.state.options[i]=="")
       {
          newErrors.push("Option " + (i+1) + " cannot be Empty."); 
       }
    }
    if(newErrors.length > 0)
    {
        this.setState({errors: newErrors});
    }
    else
    {
        console.log(this.state.name);
        console.log(this.state.options);
        var postTo = '/add/' + encodeURIComponent(this.state.name) + "/" + encodeURIComponent(this.props.name) + "/" + encodeURIComponent(this.state.options) + "/" + this.props.userId;  
        $.post(postTo,
         function(){
         console.log("ding");     
        }.bind(this));
        this.setState({submitted: true});
    }
  }
  handleName(e)
  {
    this.setState({name: e.target.value});
  }
  handleChange(e)
  {
    var newOptions = this.state.options;
    var field = e.target.name;
    newOptions[field] = e.target.value;
    this.setState({options: newOptions});
  }
  addOne()
  {
    this.state.options.push("");
    this.setState({});
  }
  removeOne(index)
  {
    var newOptions = [];
    for(var i=0;i<this.state.options.length;i++)
    {
      if(i!=index)
        newOptions.push(this.state.options[i]);
    }
    this.setState({options: newOptions});
  }
  render()
  {
    return(
   
          <div className="text-center middle-text container-fluid">
            <div className="new-poll">
             {this.state.submitted ? 
                 <div>
                    <h1>New Poll Submitted!</h1>
                    <button onClick={()=> this.props.update(-1)}>Go Back</button>
                 </div>
             : 
              <div>
              <button className="submit-button btn btn-inverse x-btn" onClick={this.props.cancel}>X</button>
              <h1>New Poll!</h1>
              <div>
                
                <div className="row">
                  <div className="col-sm-2"><h3>Name: </h3></div>
                  <div className="col-sm-10">
                    <input value={this.state.name}
                           onChange={this.handleName}/>
                  </div>
                </div>  
                {
                  this.state.options.map((d,i)=>
                   <div key={i} className="row"> 
                    <div className="col-sm-10">
                      <input name={i} onChange={this.handleChange}/>
                    </div>
                    <div className="col-sm-2">
                     <button className="btn"
                             value={this.state.options[i]}
                              onClick={()=>this.removeOne(i)}>Trash</button>
                    </div>
                   </div>
                  )
                }  
              </div>
              <div className="row">
                <div className="col-sm-10"
                     onClick={this.addOne} ><h3>Add an Option!</h3></div>
                <div className="col-sm-2">
                  <button className="btn btn-block"
                          onClick={this.addOne}>+</button>
                </div>
              </div>  
              <div>{this.state.errors.map((d)=><p>{d}</p>)}</div>
              <button className="btn" onClick={this.submit}>Submit</button>
              </div>
              }
            </div> 
          </div>    
    ); 
  }  
}
