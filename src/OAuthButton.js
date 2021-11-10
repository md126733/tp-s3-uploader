// file: OAuthButton.js
import { withOAuth } from 'aws-amplify-react';
import { withRouter } from 'react-router-dom';
import React, { Component } from 'react';

class OAuthButton extends React.Component {
  handleClick() {
    // do something meaningful, Promises, if/else, whatever, and then
    window.location.assign('https://transpower-multimedia-poc.auth.ap-southeast-2.amazoncognito.com/oauth2/authorize?identity_provider=AzureAD&redirect_uri=https://https://master.d2dgofbkdzux3y.amplifyapp.com/&response_type=TOKEN&client_id=66o0lshudmriqifkgj7qg9hum4&scope=aws.cognito.signin.user.admin email openid phone profile');
  }

  render() {
    return (
      <div class='login'>
        <button onClick={this.handleClick}>Log back into application with O365</button>
      </div>
    )
  }
}

//export default OAuthButton;
export default withOAuth(OAuthButton);
