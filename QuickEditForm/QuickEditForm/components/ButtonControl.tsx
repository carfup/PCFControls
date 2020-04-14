 import * as React from 'react';
import { DefaultButton, Stack, IStackTokens, MessageBarType, Image, ImageFit } from 'office-ui-fabric-react';
import { relative } from 'path';

export interface IButtonProps {
  loadingImage : any;
  onClickedRefresh : () => void;
  onClickedSave : () => void;
  messageType? : MessageBarType;
  messageTyext? : string;
  disabled?: boolean;
  isLoadingVisible : string;
  saveLabel : string;
  refreshLabel: string;
}

export interface IButtonState {
  disabled?: boolean,
  isLoadingVisible : "hidden" | "inherit" | "-moz-initial" | "initial" | "revert" | "unset" | "collapse" | "visible" | undefined
}

// Example formatting
const stackTokens: IStackTokens = { childrenGap: 40 };

export default class ButtonControlHeader extends React.Component<IButtonProps, IButtonState> {
  constructor(props: IButtonProps) {
      super(props);
      this.state = {
        disabled: this.props.disabled,
        isLoadingVisible: this.props.isLoadingVisible == "visible" ? "visible" : "hidden",
      };
  }

  render(){
      return (
        <Stack horizontal id="qef_buttonsstack" >
            <DefaultButton text={this.props.refreshLabel} onClick={this.props.onClickedRefresh} style={{marginRight:'5px'}} />
            <DefaultButton text={this.props.saveLabel} onClick={this.props.onClickedSave} style={{marginRight:'10px'}} disabled={this.state.disabled}/>
            <Image
              imageFit={ImageFit.centerContain}
              src={this.props.loadingImage}
              style={{visibility : this.state.isLoadingVisible, position : "relative"}}
            />
        </Stack>
  );
      }
};

