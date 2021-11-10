/* ===================================================
  App.js : Core App.JS with Azure AD integrated authentication
  Author: Zenstorm
  Date: 10/05/2019
  Version: 1.00
*/

// ===================================================
// Imports
// from libraries:
import React, { Component } from 'react';
import Amplify, {Auth, Hub} from 'aws-amplify';
import awsmobile from './aws-exports'; // Amplify configuration
import { I18n, ConsoleLogger as Logger } from '@aws-amplify/core';
// from files:
import OAuthButton from './OAuthButton'; // Our login button "aka form" for now
import './App.css'; // Custom Style Sheet

// ===================================================
// setup Amplify and its Auth model
Amplify.configure(awsmobile);
Auth.configure({ awsmobile });  // https://aws-amplify.github.io/amplify-js/api/classes/authclass.html

// ===================================================
// set up logging properly so we can use logger.debug logger.error logger.info etc
const logger = new Logger('AppLog','INFO');

// ===================================================
// Main class for our Application that gets injected into the root in index.html via index.js
class App extends Component {
  // setup props
  constructor(props) {
    super(props);
    this.signOut = this.signOut.bind(this);
  }

  // define vars in state (could be done in props constructor)
  state = {
    authState: 'signIn', // used to check login in render()
    token: null, // used to check if we've got a valid login
    user: null // used to store the user object returned from currentAuthenticatedUser()
  }

  // ====================================================
  // getuserinfo(): custom function to get tokencode
  // getuserinfo function to retrieve via amplify & cognito the currentAuthenticatedUser
  getuserinfo = async () => {
    // call a promise to waith for currentAuthenticatedUser() to return
    const user = await Auth.currentAuthenticatedUser();
    
    // do a debug log entry
    logger.debug(user);

    // setup some variables out of our current user object
    const token = user.signInUserSession.idToken.jwtToken;
    const user_givenname = user.attributes.name;
    const user_email = user.attributes.email;

    // set the variables into the classes state.
    this.setState({ token: token });
    this.setState({ user: user });
    this.setState({ user_givenname: user_givenname });
    this.setState({ user_email: user_email });
  }

  // ====================================================
  // componentDidMount(): react core function
  // is invoked immediately after a component is mounted
  // https://reactjs.org/docs/react-component.html
  componentDidMount() {
    // Setup a hub listenr on the auth events
    // https://aws-amplify.github.io/docs/js/hub
    Hub.listen("auth", ({ payload: { event, data } }) => {
      switch (event) {
        case "signIn":
          this.setState({ authState: 'signedIn'});
          this.getuserinfo();
          break;
        case "signOut":
          this.setState({ authState: 'signIn'});
          this.setState({ user: null });
          break;
      }
    });
  }

  // ====================================================
  // signOut() : used to sign out user
  // custom sign out function; has been bound in constructor(props) as well
  signOut() {
    Auth.signOut()
      .then(() => {
        this.setState({ authState: 'signIn'});
        this.setState({ user: null });
      })
      .catch(err => {
        logger.error(err);
      });
  }

  // ====================================================
  // render(): mandatory react render function
  render() {
    // vars for fun - should be buried in app
    const { authState } = this.state;
    const { token } = this.state;
    const { user_givenname } = this.state;
    const { user_email } = this.state;

    // main return routine
    return (
      <div className="App">
        {
          // if authState is null display loading message.
          authState === null && (<div>loading...</div>)
        }
        {
          // if authState is set to signIn then show the login page with the single button for O365 javascript redirect
          authState === 'signIn' && <OAuthButton/>
        }
        {
          // if authState is signedIn then we've got a logged in user - lets start our app up!
          // or rather lets just show a sign out button for now.. sigh.
          authState === 'signedIn' ? 
          (
            <div class='signout'>
              <button onClick={this.signOut}>Sign out of application {user_givenname} {user_email}</button>
            </div>
          ) : null
        }
      </div>
    );
  }
}

// Export the App.  No Auth Wrapper required for AzureAD as this is undertaken in the OAuthButton.js
export default App;
