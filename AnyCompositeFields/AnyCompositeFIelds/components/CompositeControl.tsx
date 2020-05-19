import * as React from 'react';
import { Callout, Stack, TextField, DefaultButton, BaseButton, Button, IStackStyles, ITextFieldStyles, ICalloutContentStyles, DirectionalHint  } from 'office-ui-fabric-react';
import { CompositeValue } from '../EntitiesDefinition';

export interface ICompositeControlProps {
    disabled : boolean;
    visible: boolean;
    compositeValue : CompositeValue;
    doneLabel : string;
    onClickedDone : (compositeValue? : CompositeValue) => void;
}

export interface IBCompositeControlState {
    showCallout: boolean,
    compositeValue : CompositeValue;
}

const stackStyles: Partial<IStackStyles> = { root: { width: "100%" } };
const textFieldStyles: Partial<ITextFieldStyles> = { root: { width: "100%" } };
const calloutStyles: Partial<ICalloutContentStyles> = { root: { width: "300px" } };

export default class CompositeControl extends React.Component<ICompositeControlProps, IBCompositeControlState> {
    constructor(props: ICompositeControlProps) {
        super(props);
        this.state = {
            showCallout : false,
            compositeValue : this.props.compositeValue
        };
    }

    render(){
        return (
            <Stack horizontal id="acf_compositestack" styles={stackStyles}>
                <TextField 
                    value={this.state.compositeValue.fullValue} 
                    readOnly={true}
                    onClick={() => this.setState({ showCallout : true }) }
                    styles={textFieldStyles}
                    id="acf_compositeFullValue"
                />
                {this.state.showCallout && (
                    <Callout
                        target={"#acf_compositeFullValue"}
                        onDismiss={() => this.setState({ showCallout : false }) }
                        styles={calloutStyles}
                    >
                        <Stack style={{margin : "10px"}}>
                          
                            {this.state.compositeValue.fieldValue1.attributes.LogicalName != undefined && <TextField 
                                value={this.state.compositeValue.fieldValue1.raw!} 
                                label={this.state.compositeValue.fieldValue1.attributes.DisplayName}
                                id={"acf_fieldValue1"}
                                onChange={this.onChangeField}
                                disabled={this.props.disabled || this.state.compositeValue.fieldValue1.disabled!}
                                styles={textFieldStyles}
                            />}
                            {this.state.compositeValue.fieldValue2.attributes.LogicalName != undefined && <TextField 
                                value={this.state.compositeValue.fieldValue2.raw!} 
                                label={this.state.compositeValue.fieldValue2.attributes.DisplayName}
                                id={"acf_fieldValue2"}
                                onChange={this.onChangeField}
                                disabled={this.props.disabled || this.state.compositeValue.fieldValue2.disabled!}
                                styles={textFieldStyles}
                            />}
                            {this.state.compositeValue.fieldValue3.attributes.LogicalName != undefined && <TextField 
                                value={this.state.compositeValue.fieldValue3.raw!} 
                                label={this.state.compositeValue.fieldValue3.attributes.DisplayName}
                                id={"acf_fieldValue3"}
                                onChange={this.onChangeField}
                                disabled={this.props.disabled || this.state.compositeValue.fieldValue3.disabled!}
                                styles={textFieldStyles}
                            />}
                            {this.state.compositeValue.fieldValue4.attributes.LogicalName != undefined && <TextField 
                                value={this.state.compositeValue.fieldValue4.raw!} 
                                label={this.state.compositeValue.fieldValue4.attributes.DisplayName}
                                id={"acf_fieldValue4"}
                                onChange={this.onChangeField}
                                disabled={this.props.disabled || this.state.compositeValue.fieldValue4.disabled!}
                                styles={textFieldStyles}
                            />}
                            {this.state.compositeValue.fieldValue5.attributes.LogicalName != undefined && <TextField 
                                value={this.state.compositeValue.fieldValue5.raw!} 
                                label={this.state.compositeValue.fieldValue5.attributes.DisplayName}
                                id={"acf_fieldValue5"}
                                onChange={this.onChangeField}
                                disabled={this.props.disabled || this.state.compositeValue.fieldValue5.disabled!}
                                styles={textFieldStyles}
                            />}
                            {this.state.compositeValue.fieldValue6.attributes.LogicalName != undefined && <TextField 
                                value={this.state.compositeValue.fieldValue6.raw!} 
                                label={this.state.compositeValue.fieldValue6.attributes.DisplayName}
                                id={"acf_fieldValue6"}
                                onChange={this.onChangeField}
                                disabled={this.props.disabled || this.state.compositeValue.fieldValue6.disabled!}
                                styles={textFieldStyles}
                            />}
                            {this.state.compositeValue.fieldValue7.attributes.LogicalName != undefined && <TextField 
                                value={this.state.compositeValue.fieldValue7.raw!} 
                                label={this.state.compositeValue.fieldValue7.attributes.DisplayName}
                                id={"acf_fieldValue7"}
                                onChange={this.onChangeField}
                                disabled={this.props.disabled || this.state.compositeValue.fieldValue7.disabled!}
                                styles={textFieldStyles}
                            />}
                            {this.state.compositeValue.fieldValue8.attributes.LogicalName != undefined && <TextField 
                                value={this.state.compositeValue.fieldValue8.raw!} 
                                label={this.state.compositeValue.fieldValue8.attributes.DisplayName}
                                id={"acf_fieldValue8"}
                                onChange={this.onChangeField}
                                disabled={this.props.disabled || this.state.compositeValue.fieldValue8.disabled!}
                                styles={textFieldStyles}
                            />}

                            <DefaultButton text={this.props.doneLabel} onClick={this.onClick} style={{marginTop:'10px',alignSelf: "flex-end"}}/>
                        </Stack>
                        
                    </Callout>
                )}
            </Stack>
        );
    }

    private onChangeField = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string | undefined) : void => {
        // @ts-ignore
        let target = event.target.id.replace('acf_', '');
        const compositeValue = {...this.state}.compositeValue;
        // @ts-ignore
        compositeValue[target].raw = newValue!;
        this.setState({compositeValue : compositeValue});
    }

    private onClick = (event: React.MouseEvent<HTMLDivElement | HTMLAnchorElement | HTMLButtonElement | BaseButton | Button | HTMLSpanElement, MouseEvent>) : void =>  {
        const compositeValue = {...this.state}.compositeValue;
        this.buildFullValue(compositeValue);
        this.setState({showCallout : false});
        this.props.onClickedDone(this.state.compositeValue);
    }

    private buildFullValue = (compositeValue : CompositeValue) : void => {
        let arrayValues = [];
		
		let i = 1;
		for(i ; i<9; i++){
			// @ts-ignore
			if(compositeValue["fieldValue"+i]!.raw!){
				// @ts-ignore
				arrayValues.push(compositeValue["fieldValue"+i].raw);
			}
		}

        compositeValue.fullValue = arrayValues.join(compositeValue.separator);	
                  
        this.setState({compositeValue : compositeValue});
    }
};

