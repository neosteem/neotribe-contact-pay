import React from "react";
import injectSheet from "react-jss";
import PropTypes from "prop-types";
import Chatkit from "@pusher/chatkit";

import { react } from "@nosplatform/api-functions";

import { Button, Container, Label, Icon, Segment, Divider, Header, Statistic, Menu, Image } from 'semantic-ui-react'


const { injectNOS, nosProps } = react.default;


const styles = {

};

const NEO = 'c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b';
const GAS = "602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7";



class Chat extends React.Component {

    constructor() {
        super();
        this.state = {
            error: null,
            isLoaded: false,
            contacts: [],
            owner: '',
            sendAddress: '',
            sendAmount: '',
            recipients: [],
            balance: ''

          };
        this.sendNeo =  this.sendNeo.bind(this);
        this.selectContact = this.selectContact.bind(this);
        this.loadContacts = this.loadContacts.bind(this);
        this.loadBalance = this.loadBalance.bind(this);
        this.isRecipient = this.isRecipient.bind(this);
        this.prepareSend = this.prepareSend.bind(this);

    } 

    setOwnerAddress = async () =>  { 
        this.setState( {'owner' :await this.props.nos.getAddress()});
        this.loadContacts();
    };

    loadBalance = async () => {
        

        this.setState( {'balance' :await this.props.nos.getBalance({ asset: NEO})  });

        console.log('Balance : ' + this.state.balance);


    } 

    prepareSend (amount) {

        if(this.state.balance < amount) {
            alert("Not enough balance!");
            return;
        }

        this.state.recipients.forEach(function(contact,index) { 
           // console.log(this.state.owner + 'Owner'); 
            this.sendNeo(contact.address, amount);
         },this)

    }

    

    sendNeo = async ( recipient, amount ) => {

        const send = {  asset: NEO, receiver: recipient, amount };

        await this.props.nos.send(send)
            .then((txId) => alert(`${amount} ${asset} sent: ${txId} `))
            .catch((err) => alert(`Error: ${err.message}`));


    };

    selectContact (contact ) {

        console.log(contact);
        let recipients = this.state.recipients;

        if(this.state.recipients.indexOf(contact) === -1) {
            recipients.push(contact);
        }else {
            recipients.splice( recipients.indexOf(contact), 1 );

        }

        this.setState({ 'recipients': recipients , 'sendAddress': contact.address, 'sendAmount': contact.amount});
        
        console.log(recipients);
    }

    loadContacts() {

        fetch("https://safe-bayou-14505.herokuapp.com/api/contacts?owner="+this.state.owner)
        .then(res => res.json())
        .then(
          (result) => {

            console.log(result[0]._id);
            this.setState({
              isLoaded: true,
              contacts: result
            });
          },
          (error) => {
            this.setState({
              isLoaded: true,
              error
            });
          }
        )
        
    }

    isRecipient (contact) {

        if(this.state.recipients.indexOf(contact) === -1)
            return false;
        else 
            return true;

    }

  
    componentDidMount() {

        this.setOwnerAddress();
        this.loadBalance();
      
    }
    
    
    render() {
        return (


            <Segment>


            <div className="app">
              <Title owner={this.state.owner}/>
              <br /> <br /> &nbsp;

              <Header as='h3' textAlign='center'>
              <Icon name='user' />
              Add Contact 
              </Header>
              <br /> <br /> &nbsp; 
              <ContactCreateForm owner={this.state.owner}  loadContacts={this.loadContacts} />
              <Divider section />
              <br/> <br/>
              <Header as='h3' textAlign='center'>
              <Icon name='paper plane' />
              Send Neo
              </Header>
              <br /> <br/> {this.state.contacts.length?'Select contact(s) and fill the amount of neo to send':'Add contacts to use the send functionality'}
              <br /> <br />
              <Statistic size='mini'>
                <Statistic.Value>
                    <Icon name='user outline' />
                    {this.state.recipients.length}
                </Statistic.Value>
              <Statistic.Label>Recipients</Statistic.Label>
                </Statistic>
              <br /> &nbsp;
              <RecipientList recipients={this.state.recipients}/>
              <br /> &nbsp;

              <SendNeoForm address={this.state.sendAddress} 
                                       amount={this.state.sendAmount}
                                       sendNeo={this.sendNeo}
                                       prepareSend={this.prepareSend} />
                                                     <br /> &nbsp;

                <ContactList 
                  contacts={this.state.contacts} 
                  selectContact={this.selectContact} 
                  isRecipient= {this.isRecipient}
                   /> 

                  {/*
              <SendMessageForm
                  sendMessage={this.sendMessage} /> */}
            </div>

            </Segment>
        );
    }


}


class ContactList extends React.Component {
    render() {
        return (
            <ul className="message-list">
                {this.props.contacts.map((contact, index) => {
                    return (
                      <li  key={contact._id} className="message">
                        <div>{contact.address}</div>
                        <div>{contact.name} &nbsp;
                        <button  onClick={()=>this.props.selectContact(contact)}> {this.props.isRecipient(contact)?'Unselect':'Select'}</button>

                        </div>
                      </li>
                    )
                })}
            </ul>
        )
    }
}
class RecipientList extends React.Component {
    render() {
        return (
            <div>
            
                {this.props.recipients.map((contact, index) => {
                    return ( 

                        <Label>
                            <Icon name='user' /> {contact.name}
                        </Label>
                    
                        
                    )
                })}

            </div>
        )
    }
}


class ContactCreateForm extends React.Component {
    constructor() {
        super()
        this.state = {
            name: '',
            address: ''
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    createContact(data) {

        console.log('Owner' + this.props.owner);

        let contact = {
            'name':data.get('name'),
            'address': data.get('address'),
            'owner': this.props.owner
        };


        fetch('https://safe-bayou-14505.herokuapp.com/api/contacts', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                // "Content-Type": "application/x-www-form-urlencoded",
            },
          
            body: JSON.stringify(contact),
          })
          .then(response => {
              console.log('#');
            this.props.loadContacts();

          })

          

    }
    
    handleChange(e) {
        let name = e.target;
        this.setState({
            [name]: e.target.value
        })
    }
    
    handleSubmit(e) {
        e.preventDefault();

        let data = new FormData(e.target);

        console.log(data.get('name'));

        this.createContact(data);
        
    }
    
    render() {
        return (
            <form
                onSubmit={this.handleSubmit}
                className="">
                <div class='ui input'>
                <input
                    
                    name= "name"
                    id= "name"
                    onChange={this.handleChange}
                    value={this.state.contact}
                    placeholder="Name"
                    type="text" required/>
                </div> &nbsp;
                <div class='ui input'>    
                <input
                    name = "address"
                    id="address"
                    onChange={this.handleChange}
                    value={this.state.contact}
                    placeholder="Neo address"
                    type="text" required/>

                    &nbsp;&nbsp;<button class='ui button'> Add Contact</button>
                </div>    
            </form>
        )
    }
}

class SendNeoForm extends React.Component {

    constructor() {
        super()
        this.state = {
            name: '',
            amount: ''
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleChange(e) {
        let name = e.target;
        this.setState({
            [name]: e.target.value
        })
    }
    
    handleSubmit(e) {
        e.preventDefault();

        let data = new FormData(e.target);

        this.props.prepareSend(data.get('amount'));

       // this.props.sendNeo(data.get('recipient'), data.get('amount'));
        
    }

   
    render() {

        return(

            <form
            onSubmit={this.handleSubmit}
            className="">
           
             {this.props.sendAddress}
              {/* <input
                name = "recipient"
                id="recipient"
                onChange={this.handleChange}
                value={this.props.address}
                placeholder="Neo address"
                type="text" required/> */}
             
             <div class='ui input'>    

              <input
                name = "amount"
                id="amount"
                onChange={this.handleChange}
                value={this.props.amount}
                placeholder="Amt.of Neo"
                type="text" required/>    
             </div>   

                
                &nbsp; <button class='ui button primary'> Send</button>
        </form>

                        
        );

    }


}

class Title extends React.Component {
    render() {
        return (

            <Menu fixed='top' inverted>
            <Container>
              <Menu.Item as='a' header>
                <Image size='mini' src='logo.png'  style={{ marginRight: '1.5em' }} />
                Contact Pay
              </Menu.Item>
              <Menu.Item as='a'>{this.props.owner}</Menu.Item>        
            </Container>
          </Menu>

        )
    }        
}



Chat.propTypes = {
    classes: PropTypes.objectOf(PropTypes.any).isRequired,
    nos: nosProps.isRequired
  };
  
  export default injectNOS(injectSheet(styles)(Chat));
