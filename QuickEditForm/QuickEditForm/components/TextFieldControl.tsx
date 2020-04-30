import * as React from 'react';
import { TextField, ITextFieldProps, initializeIcons, Stack, Label, IStackStyles } from 'office-ui-fabric-react';
import {IInputs} from "../generated/ManifestTypes";
import { DataFieldDefinition } from "../EntitiesDefinition";

interface ITextFieldControlProperties {
    fieldDefinition: DataFieldDefinition;
    icon? : string;
    label : string;
    context?: ComponentFramework.Context<IInputs>;
    onClickResult? : (dataFieldDefinition? :DataFieldDefinition) => void;
    disabled? : boolean;
    width : number;
    targetEntities? : [];
}

interface ITextFieldControlState {
    textValue?: string;
    type?:string;
    recordId?: string;
    fieldDefinition? : DataFieldDefinition;
}

initializeIcons();

export default class TextFieldControl extends React.Component<ITextFieldControlProperties, ITextFieldControlState> {

    constructor(props: ITextFieldControlProperties) {
        super(props);
        this.state = {
            fieldDefinition: this.props.fieldDefinition,
            type: props.icon === "Money" ? "number": "text",
        };
    }

     

    render() {
        return (
            <Stack horizontal  styles={{root : {
                paddingBottom: "3.5px", paddingTop:"3.5px", borderBottom: "1px solid rgb(216, 216, 216)"
            }}}>
                <Stack.Item styles={{root : { width : '170px' }}} ><Label style={{position: 'absolute', fontWeight: 'normal'}}>{this.props.label}</Label></Stack.Item>
                <Stack.Item grow>
                    <TextField 
                        disabled={this.props.disabled!}
                        value={this.grabValueFromFieldDefinition(this.state.fieldDefinition)} 
                        id={this.props.fieldDefinition.controlId} 
                        multiline={(this.props.fieldDefinition?.fieldType == "memo")}
                        autoAdjustHeight={(this.props.fieldDefinition?.fieldType == "memo")}
                        type={this.state.type}
                        iconProps={{ iconName: this.props.icon }} 
                        onClick={this.onClick} 
                        style={{width:"100%"}}
                        onDoubleClick={this.onDoubleClick}
                        onChange={this.onChange}
                        onFocus={(event) => {
                            if(this.props.icon == "Search"){
                                event.target.select();
                            }
                        }}
                    />
                </Stack.Item>
            </Stack>
        );
    }

    private grabValueFromFieldDefinition = (fieldDef : DataFieldDefinition | undefined) : string => {
        if(this.state.fieldDefinition?.fieldValue?.Name !== undefined)
            return this.state.fieldDefinition?.fieldValue?.Name;

        return this.state.fieldDefinition?.fieldValue;
    }

    private onDoubleClick = (event: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement, MouseEvent>) : void => {
        if(this.props.icon == "EditMail"){
            window.open(`mailto:${this.grabValueFromFieldDefinition(this.state.fieldDefinition?.fieldValue)}`);
        }
        else if(this.props.icon == "Globe"){
            window.open(`${this.grabValueFromFieldDefinition(this.state.fieldDefinition?.fieldValue)}`);
        }
    }

    private onChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string | undefined) : void => {
        
        var fieldVal : any;
        if(this.props.icon === "Search"){
            if(newValue === undefined || newValue === "") {
                fieldVal = "";
            }
            else {
                let id = this.props.fieldDefinition.fieldValue.Id.replace('{', '').replace('}','');
                fieldVal = {
                    Name : newValue ? newValue : "",
                    Id : id,
                    EntityName : this.props.fieldDefinition.fieldValue.EntityName
                };
            }
        } else {
            fieldVal =  newValue ? newValue : "";
        }

        const fieldDefTemp = {...this.state}.fieldDefinition;
        if(fieldDefTemp != undefined){
            fieldDefTemp["fieldValue"] = fieldVal;
            fieldDefTemp["isDirty"] = true;
            this.setState({ fieldDefinition: fieldDefTemp });

            if(this.props.onClickResult){
                this.props.onClickResult(this.state.fieldDefinition);
            }
        }
    }

    private onClick = (event: React.MouseEvent<HTMLInputElement>): void => {
        
        if(this.props.icon != "Search" || this.props.context === undefined || this.props.fieldDefinition.fieldValue.EntityName === undefined)
        return;

        let optionsLU = {
            allowMultiSelect: false,
            defaultEntityType : this.props.fieldDefinition.fieldValue.EntityName,
            entityTypes : this.props.targetEntities!,
            defaultViewId : "",
            viewIds: []
        };
        this.props.context.utils.lookupObjects(optionsLU).then(r =>  {
            if(r === undefined || r.length === 0) return;

        let fieldVal =  {
            Name : r[0].name,
            Id : r[0].id.toString().replace('{','').replace('}',''),
            // @ts-ignore
            EntityName : r[0].entityType
        }

        const fieldDefTemp = {...this.state}.fieldDefinition;
        if(fieldDefTemp != undefined){
            fieldDefTemp["fieldValue"] = fieldVal;
            fieldDefTemp["isDirty"] = true;
            this.setState({ fieldDefinition: fieldDefTemp });

            if(this.props.onClickResult){
                this.props.onClickResult(this.state.fieldDefinition);
            }
        }
        });
    }
};

