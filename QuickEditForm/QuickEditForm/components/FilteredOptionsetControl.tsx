import * as React from 'react';
import {Dropdown, IDropdownOption, initializeIcons,  Stack, Label } from 'office-ui-fabric-react';
import { DataFieldDefinition } from "../EntitiesDefinition";

interface IFilteredOptionsetProperties {
    options: IDropdownOption[];
    selectedKey?: number | null;
    onSelectedChanged: (dataFieldDefinition? :DataFieldDefinition) => void;
    label : string;
    fieldDefinition: DataFieldDefinition;
    disabled? : boolean;
    width:number;
}

initializeIcons();

interface IFilteredOptionsetState {
    fieldDefinition? : DataFieldDefinition;
}

export default class FilteredOptionsetControl extends React.Component<IFilteredOptionsetProperties, IFilteredOptionsetState> {

    constructor(props: IFilteredOptionsetProperties) {
        super(props);
        this.state = {
            fieldDefinition: this.props.fieldDefinition,
        };
    }

    render() {
        return (
            <Stack horizontal  styles={{root : {
                paddingBottom: "3.5px", paddingTop:"3.5px", borderBottom: "1px solid rgb(216, 216, 216)"
            }}}>
                <Stack.Item styles={{root : { width : '170px' }}} ><Label style={{position: 'absolute',fontWeight: 'normal'}}>{this.props.label}</Label></Stack.Item>
                <Stack.Item grow>
                    <Dropdown
                    disabled={this.props.disabled!}
                    id={this.props.fieldDefinition.controlId}
                    style={{width:'100%'}}
                    placeHolder="--Select--"
                    options={this.props.options}
                    selectedKey={this.state.fieldDefinition?.fieldValue}
                    onChange={this.onChange}
                    />
                </Stack.Item>
            </Stack>
        );
    }

    private onChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption | undefined, index?: number | undefined) : void => {
        const fieldDefTemp = {...this.state}.fieldDefinition;
        if(fieldDefTemp != undefined){
            fieldDefTemp["fieldValue"] = option?.key;
            fieldDefTemp["isDirty"] = true;
            this.setState({ fieldDefinition: fieldDefTemp });

            if(this.props.onSelectedChanged){
                this.props.onSelectedChanged(this.state.fieldDefinition);
            }
        }
    }
}   

