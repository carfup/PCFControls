import * as React from 'react';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import { IDropdownOption, Dropdown } from '@fluentui/react/lib/Dropdown';
import { Label } from '@fluentui/react/lib/Label';
import { Stack } from '@fluentui/react/lib/Stack';
import { DataFieldDefinition } from "../EntitiesDefinition";

interface IFilteredOptionsetProperties {
    options: IDropdownOption[];
    selectedKey?: number | null;
    onSelectedChanged: (dataFieldDefinition? :DataFieldDefinition) => void;
    label : string;
    fieldDefinition: DataFieldDefinition;
    disabled? : boolean;
    isMultiSelect: boolean;
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
                <Stack.Item styles={{root : { width : '170px' }}} >
                    <Label style={{ fontWeight: 'normal'} } required={this.state.fieldDefinition?.isRequired}>{this.props.label}</Label>
                </Stack.Item>
                <Stack.Item grow styles={{root : { alignItems: 'center'  }}}>
                    {!this.props.isMultiSelect && <Dropdown
                    disabled={this.props.disabled!}
                    id={this.props.fieldDefinition.controlId}
                    style={{width:'100%'}}
                    multiSelect={this.props.isMultiSelect}
                    placeHolder="--Select--"
                    options={this.props.options}            
                    selectedKey={(!this.props.isMultiSelect ?
                        this.state.fieldDefinition?.fieldValue?.toString() : 
                        null
                    )}
                    onChange={this.onChange}
                    />}


                    {this.props.isMultiSelect && <Dropdown
                    disabled={this.props.disabled!}
                    id={this.props.fieldDefinition.controlId}
                    style={{width:'100%'}}
                    multiSelect={this.props.isMultiSelect}
                    placeHolder="--Select--"
                    options={this.props.options}

                    defaultSelectedKeys={(this.props.isMultiSelect && typeof(this.state.fieldDefinition?.fieldValue) == "string" ? 
                        this.state.fieldDefinition?.fieldValue.split(',') : 
                        []
                    )}
                    onChange={this.onChange}
                    />}
                </Stack.Item>
            </Stack>
        );
    }

    private onChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption | undefined, index?: number | undefined) : void => {
        const fieldDefTemp = {...this.state}.fieldDefinition;
        if(fieldDefTemp != undefined){

            if(this.props.isMultiSelect){
                let tempArray = fieldDefTemp["fieldValue"]?.split(',');

                if(option?.selected)
                    tempArray.push(option?.key);
                else {
                    tempArray  = tempArray.filter(function(ele: any){
                        return ele != option?.key; 
                   });
                }
                fieldDefTemp["fieldValue"] = tempArray.length == 0 ? null : tempArray.toString();
            }
                
            else 
                fieldDefTemp["fieldValue"] = option?.key;

            fieldDefTemp["isDirty"] = true;
            this.setState({ fieldDefinition: fieldDefTemp });

            if(this.props.onSelectedChanged){
                this.props.onSelectedChanged(this.state.fieldDefinition);
            }
        }
    }
}   

