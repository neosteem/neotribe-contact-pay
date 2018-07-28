import React from "react";
import injectSheet from "react-jss";
import PropTypes from "prop-types";
import Chatkit from "@pusher/chatkit";

import { react } from "@nosplatform/api-functions";

const { injectNOS, nosProps } = react.default;


const styles = {

};



class Chat extends React.Component {

    constructor() {
        super();
        this.state = {
            error: null,
            isLoaded: false,
            contacts: [],
            owner: '',
            sendAddress: '',
            sendAmount: ''
          };
        this.sendNeo =  this.sendNeo.bind(this);
        this.selectContact = this.selectContact.bind(this);
        this.loadContacts = this.loadContacts.bind(this);
        this.loadBalance = this.loadBalance.bind(this);

    } 

    setOwnerAddress = async () =>  { 
        this.setState( {'owner' :await this.props.nos.getAddress()});
        this.loadContacts();
    };

    loadBalance = async () => {

        console.log('#');

    }

    

    sendNeo = async ( recipient, amount ) => {

        const NEO = 'c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b';

        const GAS = "602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7";

        const send = {  asset: NEO, receiver: recipient, amount };

        await this.props.nos.send(send)
            .then((txId) => alert(`${amount} ${asset} sent: ${txId} `))
            .catch((err) => alert(`Error: ${err.message}`));


    };

    selectContact (contact ) {

        console.log(contact);
        this.setState({'sendAddress': contact.address, 'sendAmount': contact.amount});
        
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

  
    componentDidMount() {

        this.setOwnerAddress();
      
    }
    
    
    render() {
        return (
            <div className="app">
              <Title />
              <br /> &nbsp;

              # Add Contact #  
              <br /> &nbsp;
              <ContactCreateForm owner={this.state.owner}  loadContacts={this.loadContacts} />
              <br/>
              # Send Neo #
              <br /> {this.state.contacts.length?'Select a contact and fill the amount of neo to send':'Add contacts to use the send functionality'}
              <br /> &nbsp;
              <SendNeoForm address={this.state.sendAddress} 
                                       amount={this.state.sendAmount}
                                       sendNeo={this.sendNeo} />
                <ContactList 
                  contacts={this.state.contacts} selectContact={this.selectContact} /> 

                  {/*
              <SendMessageForm
                  sendMessage={this.sendMessage} /> */}
            </div>
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
                        <button onClick={()=>this.props.selectContact(contact)}> Select</button>

                        </div>
                      </li>
                    )
                })}
            </ul>
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
                <input
                    
                    name= "name"
                    id= "name"
                    onChange={this.handleChange}
                    value={this.state.contact}
                    placeholder="Name"
                    type="text" required/>
                <input
                    name = "address"
                    id="address"
                    onChange={this.handleChange}
                    value={this.state.contact}
                    placeholder="Neo address"
                    type="text" required/>

                    &nbsp;<button> Add Contact</button>
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

        this.props.sendNeo(data.get('recipient'), data.get('amount'));
        
    }

   
    render() {

        return(

            <form
            onSubmit={this.handleSubmit}
            className="">
           
             {this.props.sendAddress}
              <input
                name = "recipient"
                id="recipient"
                onChange={this.handleChange}
                value={this.props.address}
                placeholder="Neo address"
                type="text" required/>

              <input
                name = "amount"
                id="amount"
                onChange={this.handleChange}
                value={this.props.amount}
                placeholder="Amt.of Neo"
                type="text" required/>    

                
                &nbsp; <button> Send</button>
        </form>

                        
        );

    }


}

function Title() {
  return <p className="title">Contact Pay</p>
}

Chat.propTypes = {
    classes: PropTypes.objectOf(PropTypes.any).isRequired,
    nos: nosProps.isRequired
  };
  
  export default injectNOS(injectSheet(styles)(Chat));
