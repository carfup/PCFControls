import * as React from 'react';
import { Toggle,  Stack, Label } from 'office-ui-fabric-react';
import { DataFieldDefinition } from "../EntitiesDefinition";

export interface IToggleProps {
    label : string;
    options : any
    fieldDefinition: DataFieldDefinition;
    onChangeResult? : (dataFieldDefinition? :DataFieldDefinition) => void;
    disabled? : boolean;
    width : number;
  }

export interface IToggleState {
    fieldDefinition : DataFieldDefinition;
}

export default class ToggleControl  extends React.Component<IToggleProps, IToggleState> {

    constructor(props: IToggleProps) {
        super(props);
        this.state = {
            fieldDefinition: this.props.fieldDefinition,
        };
    }

    render () {
        return (
            <Stack horizontal  styles={{root : {
                paddingBottom: "3.5px", paddingTop:"3.5px", borderBottom: "1px solid rgb(216, 216, 216)"
            }}}>
                <Stack.Item styles={{root : { width : '170px' }}} >
                    <Label style={{position: 'absolute',fontWeight: 'normal'}}>{this.props.label}</Label></Stack.Item>
                <Stack.Item grow>
                    <Toggle
                        onText={this.props.options[1].Label}
                        offText={this.props.options[0].Label}
                        defaultChecked={this.state.fieldDefinition.fieldValue}
                        onChange={this.onChange}
                        role="checkbox"
                        disabled={this.props.disabled}
                    />
                </Stack.Item>
            </Stack>
        );
    }

    private onChange = (event: React.MouseEvent<HTMLElement, MouseEvent>, checked?: boolean | undefined) : void => {
        const fieldDefTemp = {...this.state}.fieldDefinition;
        if(fieldDefTemp != undefined){
            fieldDefTemp["fieldValue"] = checked;
            fieldDefTemp["isDirty"] = true;
            this.setState({ fieldDefinition: fieldDefTemp });

            if(this.props.onChangeResult){
                this.props.onChangeResult(this.state.fieldDefinition);
            }
        }
    }
};

