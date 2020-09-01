import * as React from 'react';
import {MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';


export interface IMessageProps {
    messageType? : MessageBarType;
    messageText? : string;
    showMessageBar : boolean;
  }

export interface IMessageState {
    showMessageBar : boolean;
    messageType? : MessageBarType;
    messageText? : string;
}
  

export default class MessageBarControl extends React.Component<IMessageProps, IMessageState> {
    constructor(props :IMessageProps){
        super(props);
        this.state = {
           showMessageBar: this.props.showMessageBar,
           messageText : this.props.messageText,
           messageType : this.props.messageType
        }
      }

    closeMessageBar = () => {
        this.setState({showMessageBar: false})    
    }

    render(){
        return (
            <div style={{marginTop: "5px"}}>
                {this.state.showMessageBar && 
                <MessageBar 
                    messageBarType={this.state.messageType} 
                    isMultiline={false} 
                    dismissButtonAriaLabel="Close" 
                    truncated={this.state.messageType == MessageBarType.blocked}
                    overflowButtonAriaLabel="See more"
                    onDismiss={()=> this.closeMessageBar()}
                    >
                    {this.state.messageText}
                </MessageBar>}
            </div>
        )
    }
}